import { useState, type FormEvent } from 'react'
import { hoje, inicioMes, iso, lerValor } from '../lib/datas'
import { ativoNoMes, useLoja } from '../lib/loja'
import { supabase } from '../lib/supabase'
import { NOME_GRUPO, type Gasto, type Grupo } from '../lib/tipos'
import { Icone } from './Icone'

const ORDEM_GRUPOS: Grupo[] = ['variavel', 'fixo', 'reserva']

export function LancarGasto({ gasto, aoFechar }: { gasto: Gasto | null; aoFechar: () => void }) {
  const { canteiros, atualizar } = useLoja()
  const [valor, setValor] = useState(gasto ? String(gasto.valor).replace('.', ',') : '')
  const [canteiroId, setCanteiroId] = useState(gasto?.canteiro_id ?? '')
  const [data, setData] = useState(gasto?.data ?? iso(hoje()))
  const [obs, setObs] = useState(gasto?.obs ?? '')
  const [detalhes, setDetalhes] = useState(Boolean(gasto))
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  const mesRef = inicioMes(hoje())
  const disponiveis = canteiros.filter((c) => ativoNoMes(c, mesRef) || c.id === gasto?.canteiro_id)
  const numero = lerValor(valor)
  const podeSalvar = numero > 0 && canteiroId !== '' && !ocupado

  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (!podeSalvar) return
    setOcupado(true)
    setErro('')
    const linha = { valor: Math.round(numero * 100) / 100, canteiro_id: canteiroId, data, obs: obs.trim() || null }
    const { error } = gasto
      ? await supabase.from('gastos').update(linha).eq('id', gasto.id)
      : await supabase.from('gastos').insert(linha)
    setOcupado(false)
    if (error) return setErro('Não consegui salvar. Confere a internet e tenta de novo.')
    atualizar()
    aoFechar()
  }

  async function apagar() {
    if (!gasto || !confirm('Apagar esse gasto?')) return
    setOcupado(true)
    const { error } = await supabase.from('gastos').delete().eq('id', gasto.id)
    setOcupado(false)
    if (error) return setErro('Não consegui apagar.')
    atualizar()
    aoFechar()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-cacau/40" onClick={aoFechar}>
      <form
        onSubmit={salvar}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-palha p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-titulo text-xl font-bold text-mata">{gasto ? 'Editar gasto' : 'Lançar gasto'}</h2>
          <button type="button" onClick={aoFechar} className="px-2 text-2xl text-cacau/60" aria-label="Fechar">
            ×
          </button>
        </div>

        <label className="flex items-baseline gap-2 border-b-2 border-mata/30 pb-1">
          <span className="font-titulo text-2xl text-cacau/60">R$</span>
          <input
            autoFocus={!gasto}
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full bg-transparent font-titulo text-5xl font-bold text-mata outline-none placeholder:text-cacau/25"
          />
        </label>

        {ORDEM_GRUPOS.map((g) => {
          const lista = disponiveis.filter((c) => c.grupo === g)
          if (!lista.length) return null
          return (
            <div key={g} className="mt-4">
              <div className="mb-1.5 text-xs font-medium tracking-wide text-cacau/60 uppercase">{NOME_GRUPO[g]}</div>
              <div className="flex flex-wrap gap-2">
                {lista.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCanteiroId(c.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm ${
                      canteiroId === c.id
                        ? 'border-mata bg-mata text-palha'
                        : 'border-palha-escura bg-[#fffcf4] text-cacau'
                    }`}
                  >
                    <Icone nome={c.icone} className="h-4 w-4" />
                    {c.nome}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {detalhes ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <label className="text-xs text-cacau/70">
              Data
              <input type="date" className="campo mt-1" value={data} onChange={(e) => setData(e.target.value)} />
            </label>
            <label className="text-xs text-cacau/70">
              Observação
              <input className="campo mt-1" placeholder="opcional" value={obs} onChange={(e) => setObs(e.target.value)} />
            </label>
          </div>
        ) : (
          <button type="button" onClick={() => setDetalhes(true)} className="mt-4 text-sm text-folha underline">
            Mudar data ou escrever observação
          </button>
        )}

        {erro && <p className="mt-3 text-sm text-terra">{erro}</p>}

        <button className="botao mt-5 w-full py-4 text-lg" disabled={!podeSalvar}>
          {ocupado ? 'Salvando…' : 'Salvar'}
        </button>
        {gasto && (
          <button type="button" onClick={apagar} className="mt-3 w-full py-2 text-sm text-terra">
            Apagar gasto
          </button>
        )}
      </form>
    </div>
  )
}
