import { useState } from 'react'
import { Cabecalho } from '../componentes/Cabecalho'
import { CartaoCanteiro } from '../componentes/CartaoCanteiro'
import { brl, fimMes, fimSemana, hoje, inicioMes, inicioSemana, iso, nomeMes, rotuloSemana, somarDias } from '../lib/datas'
import { ativoNoMes, somaPorCanteiro, useGastos, useLoja } from '../lib/loja'

export function Semana() {
  const { canteiros } = useLoja()
  const [ref, setRef] = useState(hoje())

  const iniS = inicioSemana(ref)
  const fimS = fimSemana(ref)
  const iniM = inicioMes(ref)
  const fimM = fimMes(ref)
  const de = iniS < iniM ? iniS : iniM
  const ate = fimS > fimM ? fimS : fimM
  const { gastos } = useGastos(de, ate)

  const daSemana = somaPorCanteiro(gastos.filter((g) => g.data >= iso(iniS) && g.data <= iso(fimS)))
  const doMes = somaPorCanteiro(gastos.filter((g) => g.data >= iso(iniM) && g.data <= iso(fimM)))

  const variaveis = canteiros.filter((c) => c.grupo === 'variavel' && ativoNoMes(c, iniM))
  const semanais = variaveis.filter((c) => c.limite_semanal)
  const mensais = variaveis.filter((c) => !c.limite_semanal)

  const limiteSemana = semanais.reduce((s, c) => s + (c.limite_semanal ?? 0), 0)
  const gastoSemana = semanais.reduce((s, c) => s + (daSemana.get(c.id) ?? 0), 0)
  const ehEstaSemana = iso(iniS) === iso(inicioSemana(hoje()))

  return (
    <>
      <Cabecalho
        titulo={ehEstaSemana ? 'Esta semana' : 'Semana'}
        subtitulo={rotuloSemana(ref)}
        aoVoltar={() => setRef(somarDias(ref, -7))}
        aoAvancar={() => setRef(somarDias(ref, 7))}
      />

      {semanais.length > 0 && (
        <p className="mb-3 text-center text-sm text-cacau/80">
          Nos canteiros da semana: sobra{' '}
          <b className={gastoSemana > limiteSemana ? 'text-terra' : 'text-folha'}>{brl(limiteSemana - gastoSemana)}</b> de{' '}
          {brl(limiteSemana)}
        </p>
      )}

      <div className="space-y-3">
        {semanais.map((c) => (
          <CartaoCanteiro
            key={c.id}
            nome={c.nome}
            icone={c.icone}
            gasto={daSemana.get(c.id) ?? 0}
            limite={c.limite_semanal ?? 0}
            periodo="semana"
          />
        ))}
      </div>

      {mensais.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 font-titulo text-lg font-bold text-mata">Canteiros de {nomeMes(ref).split(' ')[0].toLowerCase()}</h2>
          <div className="space-y-3">
            {mensais.map((c) => (
              <CartaoCanteiro
                key={c.id}
                nome={c.nome}
                icone={c.icone}
                gasto={doMes.get(c.id) ?? 0}
                limite={c.limite_mensal}
                periodo="mês"
                tamanhoArvore={60}
              />
            ))}
          </div>
        </>
      )}

      {variaveis.length === 0 && (
        <p className="cartao p-6 text-center text-cacau/70">
          Ainda não tem canteiros. Crie em <b>Ajustes</b>.
        </p>
      )}
    </>
  )
}
