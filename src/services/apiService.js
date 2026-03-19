// ============================================================
//  Auto+ — API Service
//  Todas as chamadas externas centralizadas aqui.
//  Placa usa mock realista (token necessário em produção).
// ============================================================

const BRASIL_API  = 'https://brasilapi.com.br/api'
const FIPE_API    = 'https://parallelum.com.br/fipe/api/v2'

/* ── CEP ──────────────────────────────────────────────────── */
export async function fetchCep(cep) {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) throw new Error('CEP inválido')
  const r = await fetch(`${BRASIL_API}/cep/v1/${clean}`)
  if (!r.ok) throw new Error('CEP não encontrado')
  const d = await r.json()
  return {
    logradouro: d.street      || '',
    bairro:     d.neighborhood|| '',
    cidade:     d.city        || '',
    estado:     d.state       || '',
  }
}

/* ── FIPE — marcas ────────────────────────────────────────── */
export async function fetchMarcas(tipo = 'carros') {
  // tipo: 'carros' | 'motos' | 'caminhoes'
  const r = await fetch(`${BRASIL_API}/fipe/marcas/v1/${tipo}`)
  if (!r.ok) throw new Error('Erro ao buscar marcas')
  return r.json() // [{ nome, valor }]
}

/* ── FIPE — modelos de uma marca ─────────────────────────── */
export async function fetchModelos(tipoVeiculo, codigoMarca) {
  const r = await fetch(`${FIPE_API}/${tipoVeiculo}/brands/${codigoMarca}/models`)
  if (!r.ok) throw new Error('Erro ao buscar modelos')
  const d = await r.json()
  return d.models || []
}

/* ── FIPE — anos de um modelo ────────────────────────────── */
export async function fetchAnos(tipoVeiculo, codigoMarca, codigoModelo) {
  const r = await fetch(`${FIPE_API}/${tipoVeiculo}/brands/${codigoMarca}/models/${codigoModelo}/years`)
  if (!r.ok) throw new Error('Erro ao buscar anos')
  return r.json()
}

/* ── FIPE — preço por código FIPE ────────────────────────── */
export async function fetchPrecoPorCodigoFipe(codigoFipe) {
  const r = await fetch(`${BRASIL_API}/fipe/precio/v1/${codigoFipe}`)
  if (!r.ok) throw new Error('Erro ao buscar preço FIPE')
  const arr = await r.json()
  return arr?.[0] || null
}

/* ── FIPE — busca direta por código FIPE (string "001004-9") ─ */
export async function fetchFipePorCodigo(codigo) {
  const r = await fetch(`${BRASIL_API}/fipe/precio/v1/${codigo}`)
  if (!r.ok) throw new Error('Código FIPE não encontrado')
  const data = await r.json()
  return Array.isArray(data) ? data[0] : data
}

/* ── FIPE — busca de preço por tipo + marca + modelo + ano ── */
export async function fetchPrecoCompleto(tipoVeiculo, codigoMarca, codigoModelo, codigoAno) {
  const r = await fetch(`${FIPE_API}/${tipoVeiculo}/brands/${codigoMarca}/models/${codigoModelo}/years/${codigoAno}`)
  if (!r.ok) throw new Error('Preço não encontrado')
  return r.json()
  // retorna { price, brand, model, modelYear, fuel, codeFipe, ... }
}

/* ── Placa — MOCK realista ────────────────────────────────── */
// Em produção: substituir pela chamada real à fipeapi.com.br
// GET https://api.fipeapi.com.br/veiculo/placa/{placa}
// Headers: Authorization: Bearer {TOKEN_GRATUITO}
const PLACA_MOCK_DB = {
  'BRA2A23':  { marca: 'Fiat', modelo: 'Argo 1.3 Drive Flex AT', anoFab: '2022', anoMod: '2023', cor: 'Branco', combustivel: 'Flex', chassi: '9BD158A67N2001234', municipio: 'Fortaleza', uf: 'CE', codigoFipe: '001516-0' },
  'CEA3B45':  { marca: 'Toyota', modelo: 'Corolla Altis 2.0 Flex Aut.', anoFab: '2020', anoMod: '2020', cor: 'Prata', combustivel: 'Flex', chassi: '9BFZZZ377LT009876', municipio: 'Fortaleza', uf: 'CE', codigoFipe: '005340-6' },
  'FOR4C67':  { marca: 'Honda', modelo: 'Civic EXL 2.0 16V Flex Aut.', anoFab: '2019', anoMod: '2019', cor: 'Preto', combustivel: 'Flex', chassi: '9HGFB2F5XKA001122', municipio: 'Maracanaú', uf: 'CE', codigoFipe: '014187-0' },
  'SAL5D89':  { marca: 'Chevrolet', modelo: 'S10 LTZ 2.8 Diesel CD Aut. 4WD', anoFab: '2021', anoMod: '2021', cor: 'Branco', combustivel: 'Diesel', chassi: '9BGJNFED0MB335566', municipio: 'Fortaleza', uf: 'CE', codigoFipe: '004592-0' },
  'MTC0001':  { marca: 'Honda', modelo: 'CB 300R Twister', anoFab: '2022', anoMod: '2022', cor: 'Azul', combustivel: 'Gasolina', chassi: '9C2NC530XRR012345', municipio: 'Sobral', uf: 'CE', codigoFipe: '810021-4' },
}

export async function fetchPlaca(placa) {
  const clean = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (clean.length < 7) throw new Error('Placa inválida')
  // Simula latência de rede real
  await new Promise(r => setTimeout(r, 800))
  const hit = PLACA_MOCK_DB[clean]
  if (!hit) throw new Error('Placa não encontrada na base')
  return hit
}

/* ── FIPE histórico — últimas referências ────────────────── */
export async function fetchHistoricoFipe(codigoFipe) {
  const r = await fetch(`${BRASIL_API}/fipe/precio/v1/${codigoFipe}`)
  if (!r.ok) throw new Error('Histórico não encontrado')
  const data = await r.json()
  // BrasilAPI retorna array com múltiplas referências ordenadas
  return Array.isArray(data) ? data.slice(0, 6) : [data]
}
