import { brl } from '../lib/datas'
import { Arvore, estadoDaArvore } from './Arvore'
import { Icone } from './Icone'

interface Props {
  nome: string
  icone: string
  gasto: number
  limite: number
  periodo?: string
  tamanhoArvore?: number
}

/** Árvore à esquerda, valores sempre ao lado. */
export function CartaoCanteiro({ nome, icone, gasto, limite, periodo, tamanhoArvore = 76 }: Props) {
  const pct = limite > 0 ? gasto / limite : gasto > 0 ? 2 : 0
  const estado = estadoDaArvore(pct)
  const sobra = limite - gasto

  return (
    <div className="cartao flex items-center gap-3 p-3">
      <Arvore pct={pct} tamanho={tamanhoArvore} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-mata">
          <Icone nome={icone} className="h-4 w-4 shrink-0" />
          <span className="truncate">{nome}</span>
          {periodo && <span className="ml-auto shrink-0 text-xs font-normal text-cacau/50">{periodo}</span>}
        </div>
        {estado === 'seca' ? (
          <div className="font-titulo text-2xl font-bold text-terra">passou {brl(-sobra)}</div>
        ) : (
          <div className={`font-titulo text-2xl font-bold ${estado === 'amarelando' ? 'text-acafrao' : 'text-folha'}`}>
            sobra {brl(sobra)}
          </div>
        )}
        <div className="text-xs text-cacau/70">
          gastou {brl(gasto)} de {brl(limite)}
        </div>
      </div>
    </div>
  )
}
