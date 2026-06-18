// Função serverless do Netlify (v2).
// Recebe o lead da calculadora e repassa ao backend do CRM (VEXOR) no Render.
// Roda no servidor → sem CORS e sem expor o endereço do CRM no código do site.

const CRM_ENDPOINT = 'https://vexor-crm.onrender.com/api/leads';

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
