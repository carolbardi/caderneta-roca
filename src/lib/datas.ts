const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function deIso(s: string): Date {
  const [a, m, d] = s.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function hoje(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function somarDias(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export function somarMeses(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

/** Semana de segunda a domingo. */
export function inicioSemana(d: Date): Date {
  return somarDias(d, -((d.getDay() + 6) % 7))
}

export function fimSemana(d: Date): Date {
  return somarDias(inicioSemana(d), 6)
}

export function inicioMes(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function fimMes(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export function nomeMes(d: Date): string {
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function rotuloSemana(d: Date): string {
  const a = inicioSemana(d)
  const b = fimSemana(d)
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} a ${b.getDate()} de ${MESES_CURTOS[b.getMonth()]}`
  return `${a.getDate()} ${MESES_CURTOS[a.getMonth()]} a ${b.getDate()} ${MESES_CURTOS[b.getMonth()]}`
}

export function rotuloDia(s: string): string {
  const d = deIso(s)
  const h = hoje()
  if (iso(d) === iso(h)) return 'Hoje'
  if (iso(d) === iso(somarDias(h, -1))) return 'Ontem'
  const t = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Semanas (segunda a domingo) que tocam o mês. */
export function semanasDoMes(d: Date): Date[] {
  const semanas: Date[] = []
  let s = inicioSemana(inicioMes(d))
  const fim = fimMes(d)
  while (s <= fim) {
    semanas.push(s)
    s = somarDias(s, 7)
  }
  return semanas
}

export function brl(v: number): string {
  const inteiro = Math.abs(v - Math.round(v)) < 0.005
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: inteiro ? 0 : 2,
    maximumFractionDigits: inteiro ? 0 : 2,
  })
}

export function lerValor(s: string): number {
  const limpo = s.replace(/[^\d,.-]/g, '')
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  const n = Number(normal)
  return Number.isFinite(n) ? n : NaN
}
