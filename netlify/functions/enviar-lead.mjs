// Função serverless do Netlify (v2).
// Recebe o lead da calculadora e repassa ao backend do CRM (VEXOR) no Render.
// Roda no servidor → sem CORS e sem expor o endereço do CRM no código do site.
//
// Também avisa o Cal no WhatsApp a cada lead novo, se houver chave configurada
// nas variáveis de ambiente do Netlify (o aviso fica desligado sem a chave):
//   CALLMEBOT_APIKEY  → usa o CallMeBot (grátis, uso pessoal)
//   TEXTMEBOT_APIKEY  → usa o TextMeBot (pago, alternativa quando o CallMeBot lota)
//   AVISO_WHATSAPP_TELEFONE (opcional) → número que recebe o aviso, com DDI

const CRM_ENDPOINT = 'https://vexor-crm.onrender.com/api/leads';
const VEXOR_URL = 'https://vexor-crm.netlify.app';
const TELEFONE_PADRAO = '+5547999001754';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ erro: 'Metodo nao permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let lead;
  try {
    lead = await req.json();
  } catch {
    return new Response(JSON.stringify({ erro: 'JSON invalido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!lead || !lead.nome || !lead.telefone) {
    return new Response(JSON.stringify({ erro: 'nome e telefone sao obrigatorios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Repassa apenas os campos esperados pelo CRM.
  const payload = {
    nome: lead.nome,
    telefone: lead.telefone,
    origem: lead.origem || 'Calculadora de Financiamento',
    tipoInteresse: lead.tipoInteresse || null,
    orcamento: lead.orcamento || 0,
    funil: lead.funil || 'Novo Lead',
    temperatura: lead.temperatura || 'Morno',
    observacoes: lead.observacoes || null,
  };

  try {
    const resp = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await resp.text();

    // Só avisa quando o lead realmente entrou no CRM. Falha no aviso nunca
    // atrapalha o cliente nem o registro do lead.
    if (resp.ok) {
      await avisarNoWhatsApp(payload);
    }

    return new Response(body, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ erro: 'Falha ao enviar ao CRM', detalhe: String(e) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Monta uma mensagem curta: só o necessário para o Cal retornar o contato.
// O diagnóstico completo continua no VEXOR (LGPD: mínimo de dados no aviso).
export function montarAviso(lead) {
  const primeiroNome = String(lead.nome).trim().split(/\s+/)[0];
  const valor = Number(lead.orcamento) > 0
    ? 'R$ ' + Number(lead.orcamento).toLocaleString('pt-BR')
    : 'não informado';
  return [
    'Novo lead CALc',
    `Nome: ${primeiroNome}`,
    `WhatsApp: ${lead.telefone}`,
    `Origem: ${lead.origem}${lead.tipoInteresse ? ' · ' + lead.tipoInteresse : ''}`,
    `Imóvel: ${valor}`,
    `Temperatura: ${lead.temperatura}`,
    `Detalhes no VEXOR: ${VEXOR_URL}`,
  ].join('\n');
}

async function avisarNoWhatsApp(lead) {
  const env = (k) => (globalThis.Netlify?.env?.get?.(k)) ?? process.env[k];
  const telefone = env('AVISO_WHATSAPP_TELEFONE') || TELEFONE_PADRAO;
  const texto = encodeURIComponent(montarAviso(lead));

  let url = null;
  const callmebot = env('CALLMEBOT_APIKEY');
  const textmebot = env('TEXTMEBOT_APIKEY');
  if (callmebot) {
    url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(telefone)}` +
          `&text=${texto}&apikey=${encodeURIComponent(callmebot)}`;
  } else if (textmebot) {
    url = `https://api.textmebot.com/send.php?recipient=${encodeURIComponent(telefone)}` +
          `&apikey=${encodeURIComponent(textmebot)}&text=${texto}`;
  }
  if (!url) return; // sem chave configurada: aviso desligado

  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 6000);
  try {
    await fetch(url, { signal: controle.signal });
  } catch {
    // silencioso: o lead já está salvo no CRM
  } finally {
    clearTimeout(limite);
  }
}
