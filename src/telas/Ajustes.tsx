import { useState } from 'react'
import { Cabecalho } from '../componentes/Cabecalho'
import { Icone, NOMES_ICONES } from '../componentes/Icone'
import { brl, hoje, inicioMes, lerValor } from '../lib/datas'
import { ativoNoMes, entradasDoMes, useLoja } from '../lib/loja'
import { supabase } from '../lib/supabase'
import { NOME_GRUPO, type Canteiro, type Entrada, type Grupo } from '../lib/tipos'

const GRUPOS: Grupo[] = ['variavel', 'fixo', 'reserva']

export function Ajustes() {
  const { canteiros, entradas, email, membros } = useLoja()
  const [editando, setEditando] = useState<Partial<Canteiro> | null>(null)
  const mes = inicioMes(hoje())

  const totalEntradas = entradasDoMes(entradas, mes).reduce((s, e) => s + e.valor, 0)
  const totalLimites = canteiros.filter((c) => ativoNoMes(c, mes)).reduce((s, c) => s + c.limite_mensal, 0)

  return (
    <>
      <Cabecalho titulo="Ajustes" subtitulo="Canteiros, limites e entradas" />

      <section className="cartao mb-5 p-4 text-center text-sm">
        Neste mês: entra <b>{brl(totalEntradas)}</b>, limites somam <b>{brl(totalLimites)}</b>.
        <div className="mt-1 font-titulo text-xl font-bold text-folha">Sementes para o sítio: {brl(totalEntradas - totalLimites)}</div>
      </section>

      {GRUPOS.map((g) => (
        <section key={g} className="mb-5">
          <h2 className="mb-2 font-titulo text-lg font-bold text-mata">{NOME_GRUPO[g]}</h2>
          <div className="cartao divide-y divide-palha-escura">
            {canteiros
              .filter((c) => c.grupo === g)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => setEditando(c)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left ${c.ativo ? '' : 'opacity-50'}`}
                >
                  <Icone nome={c.icone} className="h-5 w-5 text-mata" />
                  <span className="flex-1">
                    {c.nome}
                    {c.termina_em && <span className="text-xs text-cacau/60"> · até {c.termina_em.split('-').reverse().join('/')}</span>}
                    {!c.ativo && <span className="text-xs text-cacau/60"> · pausado</span>}
                  </span>
                  <span className="text-right text-sm">
                    {brl(c.limite_mensal)}
                    {c.limite_semanal ? <div className="text-xs text-cacau/60">{brl(c.limite_semanal)}/sem</div> : null}
                  </span>
                </button>
              ))}
            <button
              onClick={() => setEditando({ grupo: g, icone: 'folha', ativo: true, limite_mensal: 0, limite_semanal: null })}
              className="w-full px-4 py-3 text-left text-sm text-folha"
            >
              + Novo canteiro
            </button>
          </div>
        </section>
      ))}

      <Entradas entradas={entradas} />

      <section className="mt-8 mb-4 text-center text-sm text-cacau/70">
        Você entrou como <b>{membros.find((m) => m.email === email)?.nome ?? email}</b>.
        <div>
          <button className="mt-2 text-terra underline" onClick={() => supabase.auth.signOut()}>
            Sair
          </button>
        </div>
      </section>

      {editando && <EditarCanteiro canteiro={editando} aoFechar={() => setEditando(null)} />}
    </>
  )
}

function EditarCanteiro({ canteiro, aoFechar }: { canteiro: Partial<Canteiro>; aoFechar: () => void }) {
  const { atualizar, canteiros } = useLoja()
  const [nome, setNome] = useState(canteiro.nome ?? '')
  const [grupo, setGrupo] = useState<Grupo>(canteiro.grupo ?? 'variavel')
  const [mensal, setMensal] = useState(canteiro.limite_mensal ? String(canteiro.limite_mensal).replace('.', ',') : '')
  const [semanal, setSemanal] = useState(canteiro.limite_semanal ? String(canteiro.limite_semanal).replace('.', ',') : '')
  const [icone, setIcone] = useState(canteiro.icone ?? 'folha')
  const [ativo, setAtivo] = useState(canteiro.ativo ?? true)
  const [termina, setTermina] = useState(canteiro.termina_em ?? '')
  const [erro, setErro] = useState('')

  async function salvar() {
    const limite = lerValor(mensal || '0')
    const semana = semanal.trim() ? lerValor(semanal) : null
    if (!nome.trim() || !(limite >= 0) || (semana !== null && !(semana >= 0))) return setErro('Confere o nome e os valores.')
    const linha = {
      nome: nome.trim(),
      grupo,
      limite_mensal: limite,
      limite_semanal: grupo === 'variavel' ? semana : null,
      icone,
      ativo,
      termina_em: termina || null,
    }
    const { error } = canteiro.id
      ? await supabase.from('canteiros').update(linha).eq('id', canteiro.id)
      : await supabase.from('canteiros').insert({ ...linha, ordem: Math.max(0, ...canteiros.map((c) => c.ordem)) + 10 })
    if (error) return setErro('Não consegui salvar.')
    atualizar()
    aoFechar()
  }

  async function apagar() {
    if (!canteiro.id || !confirm(`Apagar o canteiro "${canteiro.nome}"?`)) return
    const { error } = await supabase.from('canteiros').delete().eq('id', canteiro.id)
    if (error) return setErro('Esse canteiro tem gastos lançados. Em vez de apagar, desmarque "Ativo" para pausar.')
    atualizar()
    aoFechar()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-cacau/40" onClick={aoFechar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-t-3xl bg-palha p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <h2 className="font-titulo text-xl font-bold text-mata">{canteiro.id ? 'Editar canteiro' : 'Novo canteiro'}</h2>
        <input className="campo" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <div className="flex gap-2">
          {GRUPOS.map((g) => (
            <button
              key={g}
              onClick={() => setGrupo(g)}
              className={`flex-1 rounded-full border px-2 py-2 text-xs ${grupo === g ? 'border-mata bg-mata text-palha' : 'border-palha-escura'}`}
            >
              {NOME_GRUPO[g]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-cacau/70">
            Limite do mês (R$)
            <input className="campo mt-1" inputMode="decimal" value={mensal} onChange={(e) => setMensal(e.target.value)} />
          </label>
          {grupo === 'variavel' && (
            <label className="text-xs text-cacau/70">
              Limite da semana (opcional)
              <input className="campo mt-1" inputMode="decimal" value={semanal} onChange={(e) => setSemanal(e.target.value)} />
            </label>
          )}
        </div>
        <div>
          <div className="mb-1 text-xs text-cacau/70">Ícone</div>
          <div className="flex flex-wrap gap-2">
            {NOMES_ICONES.map((n) => (
              <button
                key={n}
                onClick={() => setIcone(n)}
                aria-label={n}
                className={`rounded-xl border p-2 ${icone === n ? 'border-mata bg-mata text-palha' : 'border-palha-escura text-mata'}`}
              >
                <Icone nome={n} />
              </button>
            ))}
          </div>
        </div>
        <label className="block text-xs text-cacau/70">
          Termina em (opcional, ex.: última parcela)
          <input type="date" className="campo mt-1" value={termina} onChange={(e) => setTermina(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-5 w-5 accent-[#5E8C4A]" />
          Ativo
        </label>
        {erro && <p className="text-sm text-terra">{erro}</p>}
        <button className="botao w-full" onClick={salvar}>
          Salvar
        </button>
        {canteiro.id && (
          <button className="w-full py-2 text-sm text-terra" onClick={apagar}>
            Apagar canteiro
          </button>
        )}
      </div>
    </div>
  )
}

function Entradas({ entradas }: { entradas: Entrada[] }) {
  const { atualizar } = useLoja()
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')

  async function adicionar() {
    const v = lerValor(valor)
    if (!descricao.trim() || !(v > 0)) return
    await supabase.from('entradas').insert({ descricao: descricao.trim(), valor: v, mes: null })
    setDescricao('')
    setValor('')
    atualizar()
  }

  async function mudarValor(e: Entrada) {
    const novo = prompt(`Novo valor para "${e.descricao}"`, String(e.valor).replace('.', ','))
    if (novo === null) return
    const v = lerValor(novo)
    if (!(v >= 0)) return
    await supabase.from('entradas').update({ valor: v }).eq('id', e.id)
    atualizar()
  }

  async function apagar(e: Entrada) {
    if (!confirm(`Apagar a entrada "${e.descricao}"?`)) return
    await supabase.from('entradas').delete().eq('id', e.id)
    atualizar()
  }

  return (
    <section>
      <h2 className="mb-2 font-titulo text-lg font-bold text-mata">Entradas de todo mês</h2>
      <div className="cartao divide-y divide-palha-escura">
        {entradas.map((e) => (
          <div key={e.id} className="flex items-center gap-3 px-4 py-3">
            <Icone nome="cacau" className="h-5 w-5 text-mata" />
            <span className="flex-1">
              {e.descricao}
              {e.mes && <span className="text-xs text-cacau/60"> · só em {e.mes.slice(5, 7)}/{e.mes.slice(0, 4)}</span>}
            </span>
            <button onClick={() => mudarValor(e)} className="font-semibold text-mata underline decoration-dotted">
              {brl(e.valor)}
            </button>
            <button onClick={() => apagar(e)} className="px-1 text-cacau/40" aria-label="Apagar">
              ×
            </button>
          </div>
        ))}
        <div className="flex gap-2 p-3">
          <input className="campo flex-1" placeholder="Nova entrada" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <input className="campo w-28" inputMode="decimal" placeholder="R$" value={valor} onChange={(e) => setValor(e.target.value)} />
          <button className="botao px-4" onClick={adicionar}>
            +
          </button>
        </div>
      </div>
    </section>
  )
}
