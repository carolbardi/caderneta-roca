import { useState } from 'react'
import { Cabecalho } from '../componentes/Cabecalho'
import { Icone } from '../componentes/Icone'
import { brl, fimMes, fimSemana, hoje, inicioMes, iso, nomeMes, rotuloDia, rotuloSemana, semanasDoMes, somarMeses } from '../lib/datas'
import { nomeDe, useGastos, useLoja } from '../lib/loja'
import type { Gasto } from '../lib/tipos'

export function Historico({ aoEditar }: { aoEditar: (g: Gasto) => void }) {
  const { canteiros, membros } = useLoja()
  const [ref, setRef] = useState(inicioMes(hoje()))
  const [semana, setSemana] = useState('')
  const [canteiro, setCanteiro] = useState('')
  const [quem, setQuem] = useState('')

  const { gastos, carregando } = useGastos(inicioMes(ref), fimMes(ref))
  const semanas = semanasDoMes(ref)

  const filtrados = gastos.filter((g) => {
    if (canteiro && g.canteiro_id !== canteiro) return false
    if (quem && g.quem !== quem) return false
    if (semana) {
      const fim = iso(fimSemana(new Date(semana + 'T00:00')))
      if (g.data < semana || g.data > fim) return false
    }
    return true
  })
  const total = filtrados.reduce((s, g) => s + g.valor, 0)

  const porDia = new Map<string, Gasto[]>()
  for (const g of filtrados) porDia.set(g.data, [...(porDia.get(g.data) ?? []), g])
  const nomeCanteiro = (id: string) => canteiros.find((c) => c.id === id)

  function trocarMes(n: number) {
    setRef(somarMeses(ref, n))
    setSemana('')
  }

  return (
    <>
      <Cabecalho titulo="Histórico" subtitulo={nomeMes(ref)} aoVoltar={() => trocarMes(-1)} aoAvancar={() => trocarMes(1)} />

      <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
        <select className="campo" value={semana} onChange={(e) => setSemana(e.target.value)}>
          <option value="">Mês todo</option>
          {semanas.map((s) => (
            <option key={iso(s)} value={iso(s)}>
              {rotuloSemana(s)}
            </option>
          ))}
        </select>
        <select className="campo" value={canteiro} onChange={(e) => setCanteiro(e.target.value)}>
          <option value="">Canteiros</option>
          {canteiros.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <select className="campo" value={quem} onChange={(e) => setQuem(e.target.value)}>
          <option value="">Nós duas</option>
          {membros.map((m) => (
            <option key={m.email} value={m.email}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-center text-sm text-cacau/80">
        {filtrados.length} {filtrados.length === 1 ? 'gasto' : 'gastos'}, total <b className="text-mata">{brl(total)}</b>
      </p>

      {carregando && <p className="text-center text-cacau/60">Carregando…</p>}
      {!carregando && filtrados.length === 0 && (
        <p className="cartao p-6 text-center text-cacau/70">Nada lançado por aqui.</p>
      )}

      <div className="space-y-4">
        {[...porDia.entries()].map(([dia, lista]) => (
          <section key={dia}>
            <h3 className="mb-1 text-xs font-medium tracking-wide text-cacau/60 uppercase">{rotuloDia(dia)}</h3>
            <div className="cartao divide-y divide-palha-escura">
              {lista.map((g) => {
                const c = nomeCanteiro(g.canteiro_id)
                return (
                  <button key={g.id} onClick={() => aoEditar(g)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <Icone nome={c?.icone ?? 'folha'} className="h-5 w-5 shrink-0 text-mata" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{c?.nome ?? 'Canteiro apagado'}</div>
                      <div className="truncate text-xs text-cacau/60">
                        {nomeDe(membros, g.quem)}
                        {g.obs ? ` · ${g.obs}` : ''}
                      </div>
                    </div>
                    <div className="font-semibold text-mata">{brl(g.valor)}</div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
