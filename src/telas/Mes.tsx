import { useState } from 'react'
import { Arvore } from '../componentes/Arvore'
import { Cabecalho } from '../componentes/Cabecalho'
import { CartaoCanteiro } from '../componentes/CartaoCanteiro'
import { Icone } from '../componentes/Icone'
import { brl, fimMes, hoje, inicioMes, iso, nomeMes, somarMeses } from '../lib/datas'
import { ativoNoMes, entradasDoMes, somaPorCanteiro, useGastos, useLoja } from '../lib/loja'
import { supabase } from '../lib/supabase'
import { NOME_GRUPO, type Canteiro } from '../lib/tipos'

export function Mes() {
  const { canteiros, entradas, atualizar } = useLoja()
  const [ref, setRef] = useState(inicioMes(hoje()))
  const [ocupado, setOcupado] = useState<string | null>(null)

  const iniM = inicioMes(ref)
  const fimM = fimMes(ref)
  const { gastos } = useGastos(iniM, fimM)
  const porCanteiro = somaPorCanteiro(gastos)

  const ativos = canteiros.filter((c) => ativoNoMes(c, iniM))
  const totalEntradas = entradasDoMes(entradas, iniM).reduce((s, e) => s + e.valor, 0)
  const totalLimites = ativos.reduce((s, c) => s + c.limite_mensal, 0)
  const gastoTotal = gastos.reduce((s, g) => s + g.valor, 0)
  const previsto = ativos.reduce((s, c) => s + Math.max(c.limite_mensal, porCanteiro.get(c.id) ?? 0), 0)

  const meta = totalEntradas - totalLimites
  const colheitaAgora = totalEntradas - gastoTotal
  const colheitaPrevista = totalEntradas - previsto

  // Florida se a colheita prevista bate a meta, amarela se fica entre a meta e zero, seca se fica negativa.
  const saudeDoMes =
    colheitaPrevista >= meta
      ? 0.5
      : colheitaPrevista >= 0 && meta > 0
        ? 0.7 + (0.3 * (meta - colheitaPrevista)) / meta
        : 1.2

  async function alternarPago(c: Canteiro) {
    setOcupado(c.id)
    if (porCanteiro.has(c.id)) {
      if (confirm(`Desmarcar "${c.nome}"? Os lançamentos dele neste mês serão apagados.`)) {
        await supabase.from('gastos').delete().eq('canteiro_id', c.id).gte('data', iso(iniM)).lte('data', iso(fimM))
      }
    } else {
      const h = hoje()
      const data = h >= iniM && h <= fimM ? iso(h) : iso(iniM)
      await supabase.from('gastos').insert({ canteiro_id: c.id, valor: c.limite_mensal, data })
    }
    setOcupado(null)
    atualizar()
  }

  const grupo = (g: Canteiro['grupo']) => ativos.filter((c) => c.grupo === g)

  return (
    <>
      <Cabecalho
        titulo={nomeMes(ref)}
        aoVoltar={() => setRef(somarMeses(ref, -1))}
        aoAvancar={() => setRef(somarMeses(ref, 1))}
      />

      <section className="cartao flex flex-col items-center p-5 text-center">
        <Arvore pct={saudeDoMes} tamanho={150} />
        <div className="text-xs tracking-wide text-cacau/60 uppercase">Colheita prevista do mês</div>
        <div className={`font-titulo text-4xl font-bold ${colheitaPrevista < meta ? 'text-terra' : 'text-folha'}`}>
          {brl(colheitaPrevista)}
        </div>
        <div className="mt-1 text-sm text-cacau/80">
          Sementes para o sítio (meta): <b>{brl(meta)}</b>
        </div>
        <div className="mt-4 grid w-full grid-cols-3 gap-2 text-sm">
          <Numero rotulo="Entrou" valor={totalEntradas} />
          <Numero rotulo="Gasto até agora" valor={gastoTotal} />
          <Numero rotulo="Sobra até agora" valor={colheitaAgora} />
        </div>
      </section>

      <ListaConta
        titulo={NOME_GRUPO.fixo}
        canteiros={grupo('fixo')}
        porCanteiro={porCanteiro}
        rotuloFeito="pago"
        ocupado={ocupado}
        aoAlternar={alternarPago}
      />
      <ListaConta
        titulo={NOME_GRUPO.reserva}
        canteiros={grupo('reserva')}
        porCanteiro={porCanteiro}
        rotuloFeito="separado"
        ocupado={ocupado}
        aoAlternar={alternarPago}
      />

      <h2 className="mt-6 mb-2 font-titulo text-lg font-bold text-mata">{NOME_GRUPO.variavel}</h2>
      <div className="space-y-3">
        {grupo('variavel').map((c) => (
          <CartaoCanteiro
            key={c.id}
            nome={c.nome}
            icone={c.icone}
            gasto={porCanteiro.get(c.id) ?? 0}
            limite={c.limite_mensal}
            periodo="mês"
            tamanhoArvore={60}
          />
        ))}
      </div>
    </>
  )
}

function Numero({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="rounded-xl bg-palha/70 p-2">
      <div className="text-[11px] text-cacau/60">{rotulo}</div>
      <div className={`font-semibold ${valor < 0 ? 'text-terra' : 'text-mata'}`}>{brl(valor)}</div>
    </div>
  )
}

function ListaConta({
  titulo,
  canteiros,
  porCanteiro,
  rotuloFeito,
  ocupado,
  aoAlternar,
}: {
  titulo: string
  canteiros: Canteiro[]
  porCanteiro: Map<string, number>
  rotuloFeito: string
  ocupado: string | null
  aoAlternar: (c: Canteiro) => void
}) {
  if (!canteiros.length) return null
  const feitos = canteiros.filter((c) => porCanteiro.has(c.id)).length
  return (
    <>
      <h2 className="mt-6 mb-2 flex items-baseline justify-between font-titulo text-lg font-bold text-mata">
        {titulo}
        <span className="font-sans text-xs font-normal text-cacau/60">
          {feitos} de {canteiros.length} {rotuloFeito}s
        </span>
      </h2>
      <div className="cartao divide-y divide-palha-escura">
        {canteiros.map((c) => {
          const valor = porCanteiro.get(c.id)
          const feito = valor !== undefined
          return (
            <button
              key={c.id}
              disabled={ocupado === c.id}
              onClick={() => aoAlternar(c)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                  feito ? 'border-folha bg-folha text-palha' : 'border-seca'
                }`}
              >
                {feito && '✓'}
              </span>
              <Icone nome={c.icone} className="h-4 w-4 text-mata" />
              <span className={`flex-1 ${feito ? 'text-cacau/60 line-through' : ''}`}>{c.nome}</span>
              <span className="text-sm">
                {feito && valor !== c.limite_mensal ? (
                  <>
                    <b className={valor > c.limite_mensal ? 'text-terra' : 'text-folha'}>{brl(valor)}</b>
                    <span className="text-cacau/50"> / {brl(c.limite_mensal)}</span>
                  </>
                ) : (
                  brl(c.limite_mensal)
                )}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
