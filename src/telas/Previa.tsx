import { CartaoCanteiro } from '../componentes/CartaoCanteiro'

const EXEMPLOS = [
  { nome: 'Mercado', icone: 'cesta', gasto: 90, limite: 375 },
  { nome: 'Diesel', icone: 'gota', gasto: 60, limite: 100 },
  { nome: 'Lazer / extras', icone: 'sol', gasto: 62, limite: 70 },
  { nome: 'Farmácia / miúdos', icone: 'saude', gasto: 25, limite: 25 },
  { nome: 'Pets', icone: 'pata', gasto: 410, limite: 350 },
]

/** Só no modo de desenvolvimento: /caderneta-roca/?previa */
export function Previa() {
  return (
    <div className="mx-auto max-w-lg space-y-3 p-4">
      <h1 className="text-center font-titulo text-2xl font-bold text-mata">Prévia das árvores</h1>
      {EXEMPLOS.map((e) => (
        <CartaoCanteiro key={e.nome} {...e} periodo="semana" />
      ))}
    </div>
  )
}
