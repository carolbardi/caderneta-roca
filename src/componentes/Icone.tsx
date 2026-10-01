import type { ReactNode } from 'react'

const DESENHOS: Record<string, ReactNode> = {
  folha: (
    <>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
      <path d="M5 19l8-8" />
    </>
  ),
  broto: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4-3-6-7-6 0 4 3 6 7 6z" />
      <path d="M12 11c0-3 2-5 6-5 0 3-2 5-6 5z" />
    </>
  ),
  cacau: (
    <>
      <path d="M12 3c4 0 6 4 6 9s-2 9-6 9-6-4-6-9 2-9 6-9z" />
      <path d="M12 3v18M8.6 6.5c.9 3 .9 8 0 11M15.4 6.5c-.9 3-.9 8 0 11" />
    </>
  ),
  gota: <path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z" />,
  casa: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v10h12V10M10 20v-5h4v5" />
    </>
  ),
  carro: (
    <>
      <path d="M4 16v-4l2-5h12l2 5v4z" />
      <circle cx="7.5" cy="16.5" r="1.8" />
      <circle cx="16.5" cy="16.5" r="1.8" />
    </>
  ),
  moto: (
    <>
      <circle cx="6" cy="16" r="3" />
      <circle cx="18" cy="16" r="3" />
      <path d="M6 16l4-6h5l3 6M13 10l-1-3h-2" />
    </>
  ),
  pata: (
    <>
      <circle cx="7" cy="10" r="1.6" />
      <circle cx="10.5" cy="6.5" r="1.6" />
      <circle cx="14.5" cy="6.5" r="1.6" />
      <circle cx="18" cy="10" r="1.6" />
      <path d="M12.5 11c-3 0-5.5 3.5-5.5 6 0 2 2 2.5 5.5 2.5S18 19 18 17c0-2.5-2.5-6-5.5-6z" />
    </>
  ),
  cesta: (
    <>
      <path d="M3 10h18l-2 10H5z" />
      <path d="M7 10l5-6 5 6M9 14v3M15 14v3" />
    </>
  ),
  saude: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </>
  ),
  chama: <path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4.5 2.5-7 1.2 1.2 2 2.5 2.3 4 .6-2.6.6-5.3.2-8z" />,
  moeda: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9c-.4-.9-1.3-1.4-2.5-1.4-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.9 2.5 2.1-1 2-2.5 2c-1.2 0-2.2-.5-2.6-1.5M12 6v1.6M12 16.7v1.6" />
    </>
  ),
  raio: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  celular: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  ferramenta: <path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L11 18.8a2 2 0 0 1-2.8-2.8l8.4-8.4a4 4 0 0 0-2.1-2.1z" />,
  papel: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M10 12h5M10 16h5" />
    </>
  ),
}

export const NOMES_ICONES = Object.keys(DESENHOS)

export function Icone({ nome, className = 'h-5 w-5' }: { nome: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {DESENHOS[nome] ?? DESENHOS.folha}
    </svg>
  )
}
