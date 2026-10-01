import { useMemo } from 'react'

/** pct = gasto / limite. Até 0,7 florida; de 0,7 a 1 amarelando; acima de 1 seca. */
export type EstadoArvore = 'florida' | 'amarelando' | 'seca'

export function estadoDaArvore(pct: number): EstadoArvore {
  if (pct > 1) return 'seca'
  if (pct > 0.7) return 'amarelando'
  return 'florida'
}

function sorteador(semente: number) {
  let s = semente
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Folha {
  x: number
  y: number
  giro: number
}

function gerarFolhas(qtd: number, semente: number): Folha[] {
  const r = sorteador(semente)
  const folhas: Folha[] = []
  while (folhas.length < qtd) {
    const x = (r() * 2 - 1) * 31
    const y = (r() * 2 - 1) * 23
    if ((x * x) / (31 * 31) + (y * y) / (23 * 23) > 1) continue
    folhas.push({ x: 50 + x, y: 40 + y, giro: r() * 180 })
  }
  return folhas
}

const FOLHAS = gerarFolhas(40, 7)
const FLORES = gerarFolhas(9, 23)
const CAIDAS = [
  { x: 30, y: 91, giro: 20 },
  { x: 68, y: 92, giro: -30 },
  { x: 38, y: 93, giro: 70 },
  { x: 61, y: 90, giro: 10 },
  { x: 74, y: 93, giro: 50 },
  { x: 25, y: 92, giro: -60 },
]

function misturar(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`
}

const TRANSICAO = { transition: 'opacity 700ms ease, fill 700ms ease' }

export function Arvore({ pct, tamanho = 72 }: { pct: number; tamanho?: number }) {
  const p = Number.isFinite(pct) ? Math.max(0, pct) : 0
  const estado = estadoDaArvore(p)

  const desenho = useMemo(() => {
    const t = estado === 'amarelando' ? (p - 0.7) / 0.3 : estado === 'seca' ? 1 : 0
    const fracFolhas = estado === 'florida' ? 1 : estado === 'amarelando' ? 1 - t * 0.8 : 0
    const fracFlores = p <= 0.4 ? 1 : p <= 0.7 ? 1 - (p - 0.4) / 0.3 : 0
    const corFolha = t < 0.5 ? misturar('#5E8C4A', '#C9A043', t * 2) : misturar('#C9A043', '#A87A3D', (t - 0.5) * 2)
    const corCopa = misturar('#4A7A3C', '#B08D45', t)
    const caidas = estado === 'florida' ? 0 : estado === 'seca' ? CAIDAS.length : Math.round(t * CAIDAS.length)
    return {
      nFolhas: Math.round(FOLHAS.length * fracFolhas),
      nFlores: Math.round(FLORES.length * fracFlores),
      corFolha,
      corCopa,
      opCopa: fracFolhas * fracFolhas * 0.9,
      caidas,
    }
  }, [p, estado])

  const seca = estado === 'seca'
  const tronco = seca ? '#8A7B66' : '#6B4A32'
  const rotulo =
    estado === 'florida' ? 'Árvore viva e florida' : estado === 'amarelando' ? 'Árvore amarelando' : 'Árvore seca'

  return (
    <svg viewBox="0 0 100 100" width={tamanho} height={tamanho} role="img" aria-label={rotulo}>
      <ellipse cx="50" cy="92" rx="32" ry="4.5" fill={seca ? '#CDBB9A' : '#D9CBA8'} style={TRANSICAO} />
      {seca && (
        <g stroke="#A8957A" strokeWidth="0.8" fill="none" strokeLinecap="round">
          <path d="M28 92 l4 -1.5 l3 1.5" />
          <path d="M60 93 l3 -1 l2 1.2 l3 -1" />
        </g>
      )}

      <ellipse cx="50" cy="42" rx="27" ry="20" fill={desenho.corCopa} opacity={desenho.opCopa} style={TRANSICAO} />

      <path d="M46.5 92 C47 80 46 70 48 57 L52 57 C54 70 53 80 53.5 92 Z" fill={tronco} style={TRANSICAO} />
      <g stroke={tronco} strokeWidth="2.6" fill="none" strokeLinecap="round" style={TRANSICAO}>
        <path d="M49 63 C44 56 38 51 30 46" />
        <path d="M51 61 C56 53 62 49 70 43" />
        <path d="M50 58 C50 48 50 38 50 24" />
        <path d="M50 49 C45 43 42 37 39 29" />
        <path d="M50 46 C55 41 58 35 61 28" />
        <path d="M36 49 C33 45 31 41 30 37" strokeWidth="1.6" />
        <path d="M65 46 C68 42 70 39 72 35" strokeWidth="1.6" />
      </g>

      {FOLHAS.map((f, i) => (
        <ellipse
          key={i}
          cx={f.x}
          cy={f.y}
          rx="5.2"
          ry="3.1"
          transform={`rotate(${f.giro} ${f.x} ${f.y})`}
          fill={desenho.corFolha}
          opacity={i < desenho.nFolhas ? 1 : 0}
          style={TRANSICAO}
        />
      ))}

      {FLORES.map((f, i) => (
        <g key={i} opacity={i < desenho.nFlores ? 1 : 0} style={TRANSICAO}>
          <circle cx={f.x} cy={f.y} r="2.6" fill="#F3C6CF" />
          <circle cx={f.x} cy={f.y} r="1" fill="#D9A33B" />
        </g>
      ))}

      {CAIDAS.map((f, i) => (
        <ellipse
          key={i}
          cx={f.x}
          cy={f.y}
          rx="3.2"
          ry="1.6"
          transform={`rotate(${f.giro} ${f.x} ${f.y})`}
          fill={seca ? '#9C8C74' : '#B98A3E'}
          opacity={i < desenho.caidas ? 0.9 : 0}
          style={TRANSICAO}
        />
      ))}
    </svg>
  )
}
