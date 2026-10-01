import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { Arvore } from './componentes/Arvore'
import { Icone } from './componentes/Icone'
import { LancarGasto } from './componentes/LancarGasto'
import { LojaProvider, useLoja } from './lib/loja'
import { configurado, supabase } from './lib/supabase'
import type { Gasto } from './lib/tipos'
import { Ajustes } from './telas/Ajustes'
import { Entrar } from './telas/Entrar'
import { Historico } from './telas/Historico'
import { Mes } from './telas/Mes'
import { Previa } from './telas/Previa'
import { Semana } from './telas/Semana'

type Aba = 'semana' | 'mes' | 'historico' | 'ajustes'

const ABAS: { id: Aba; nome: string; icone: string }[] = [
  { id: 'semana', nome: 'Semana', icone: 'broto' },
  { id: 'mes', nome: 'Mês', icone: 'folha' },
  { id: 'historico', nome: 'Histórico', icone: 'cesta' },
  { id: 'ajustes', nome: 'Ajustes', icone: 'ferramenta' },
]

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    if (!configurado) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (import.meta.env.DEV && window.location.search.includes('previa')) return <Previa />

  if (!configurado) {
    return (
      <Aviso titulo="Falta configurar">
        Crie o arquivo <code>.env.local</code> com <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
      </Aviso>
    )
  }
  if (session === undefined) return <Carregando />
  if (!session) return <Entrar />

  return (
    <LojaProvider session={session}>
      <Casca />
    </LojaProvider>
  )
}

function Casca() {
  const { membros, email, carregado } = useLoja()
  const [aba, setAba] = useState<Aba>('semana')
  const [lancando, setLancando] = useState(false)
  const [editando, setEditando] = useState<Gasto | null>(null)

  if (!carregado) return <Carregando />
  if (!membros.some((m) => m.email === email)) {
    return (
      <Aviso titulo="Esse e-mail não tem acesso">
        <p>
          Você entrou como <b>{email}</b>, mas essa caderneta é só da Carol e da Laura.
        </p>
        <button className="botao mt-6" onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </Aviso>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg pb-32">
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {aba === 'semana' && <Semana />}
        {aba === 'mes' && <Mes />}
        {aba === 'historico' && <Historico aoEditar={setEditando} />}
        {aba === 'ajustes' && <Ajustes />}
      </div>

      <button
        aria-label="Lançar gasto"
        onClick={() => setLancando(true)}
        className="fixed right-5 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex h-16 w-16 items-center justify-center rounded-full bg-acafrao text-4xl font-light text-cacau shadow-lg active:scale-95"
      >
        +
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-palha-escura bg-palha/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-lg">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                aba === a.id ? 'font-semibold text-mata' : 'text-cacau/60'
              }`}
            >
              <Icone nome={a.icone} className="h-6 w-6" />
              {a.nome}
            </button>
          ))}
        </div>
      </nav>

      {(lancando || editando) && (
        <LancarGasto
          gasto={editando}
          aoFechar={() => {
            setLancando(false)
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}

function Carregando() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <Arvore pct={0.3} tamanho={96} />
      </div>
    </div>
  )
}

function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <Arvore pct={1.2} tamanho={120} />
      <h1 className="mt-4 font-titulo text-2xl font-bold text-mata">{titulo}</h1>
      <div className="mt-2 text-cacau/80">{children}</div>
    </main>
  )
}
