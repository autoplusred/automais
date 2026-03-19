/* ── BrasilAPI / CEP ─────────────────────────────────────── */
export async function fetchCep(cep) {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) throw new Error('CEP inválido')
  const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`)
  if (!res.ok) throw new Error('CEP não encontrado')
  return res.json()
}

/* ── BrasilAPI FIPE — Marcas ─────────────────────────────── */
export async function fetchFipeMarcas(tipo = 'carros') {
  const res = await fetch(`https://brasilapi.com.br/api/fipe/marcas/v1/${tipo}`)
  if (!res.ok) throw new Error('Erro ao buscar marcas')
  return res.json()
}

/* ── FIPE Parallelum — Modelos por marca ─────────────────── */
export async function fetchFipeModelos(tipo, codigoMarca) {
  const tipoMap = { carros: 'cars', motos: 'motorcycles', caminhoes: 'trucks' }
  const t = tipoMap[tipo] || 'cars'
  const res = await fetch(`https://parallelum.com.br/fipe/api/v2/${t}/brands/${codigoMarca}/models`)
  if (!res.ok) throw new Error('Erro ao buscar modelos')
  return res.json()
}

/* ── FIPE Parallelum — Anos por modelo ───────────────────── */
export async function fetchFipeAnos(tipo, codigoMarca, codigoModelo) {
  const tipoMap = { carros: 'cars', motos: 'motorcycles', caminhoes: 'trucks' }
  const t = tipoMap[tipo] || 'cars'
  const res = await fetch(`https://parallelum.com.br/fipe/api/v2/${t}/brands/${codigoMarca}/models/${codigoModelo}/years`)
  if (!res.ok) throw new Error('Erro ao buscar anos')
  return res.json()
}

/* ── FIPE Parallelum — Preço ─────────────────────────────── */
export async function fetchFipePreco(tipo, codigoMarca, codigoModelo, codigoAno) {
  const tipoMap = { carros: 'cars', motos: 'motorcycles', caminhoes: 'trucks' }
  const t = tipoMap[tipo] || 'cars'
  const res = await fetch(`https://parallelum.com.br/fipe/api/v2/${t}/brands/${codigoMarca}/models/${codigoModelo}/years/${codigoAno}`)
  if (!res.ok) throw new Error('Erro ao buscar preço')
  return res.json()
}

/* ── Consulta Placa (fipeapi.com.br) ─────────────────────── */
export async function fetchPlaca(placa, token) {
  if (!token) throw new Error('Token não configurado')
  const clean = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (clean.length < 7) throw new Error('Placa inválida')
  const res = await fetch(`https://fipeapi.com.br/api/v1/placa/${clean}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Placa não encontrada ou token inválido')
  return res.json()
}
