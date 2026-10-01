import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { iso } from './datas'
import { supabase } from './supabase'
import type { Canteiro, Entrada, Gasto, Membro } from './tipos'

interface Loja {
  session: Session
  email: string
  canteiros: Canteiro[]
  entradas: Entrada[]
  membros: Membro[]
  carregado: boolean
  versao: number
  atualizar: () => void
}

const Contexto = createContext<Loja | null>(null)

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v))

function lerCanteiro(r: Record<string, unknown>): Canteiro {
  return {
    ...(r as unknown as Canteiro),
    limite_mensal: Number(r.limite_mensal),
    limite_semanal: num(r.limite_semanal),
  }
}

export function LojaProvider({ session, children }: { session: Session; children: ReactNode }) {
  const [canteiros, setCanteiros] = useState<Canteiro[]>([])
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
  const [carregado, setCarregado] = useState(false)
  const [versao, setVersao] = useState(0)

  const atualizar = useCallback(() => setVersao((v) => v + 1), [])

  useEffect(() => {
    let vivo = true
    Promise.all([
      supabase.from('canteiros').select('*').order('ordem').order('nome'),
      supabase.from('entradas').select('*').order('criado_em'),
      supabase.from('membros').select('*'),
    ]).then(([c, e, m]) => {
      if (!vivo) return
      setCanteiros((c.data ?? []).map(lerCanteiro))
      setEntradas((e.data ?? []).map((r) => ({ ...(r as Entrada), valor: Number(r.valor) })))
      setMembros((m.data ?? []) as Membro[])
      setCarregado(true)
    })
    return () => {
      vivo = false
    }
  }, [versao])

  useEffect(() => {
    const canal = supabase
      .channel('caderneta')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, atualizar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canteiros' }, atualizar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entradas' }, atualizar)
      .subscribe()
    const aoVoltar = () => document.visibilityState === 'visible' && atualizar()
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      supabase.removeChannel(canal)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [atualizar])

  const email = (session.user.email ?? '').toLowerCase()

  return (
    <Contexto.Provider value={{ session, email, canteiros, entradas, membros, carregado, versao, atualizar }}>
      {children}
    </Contexto.Provider>
  )
}

export function useLoja(): Loja {
  const l = useContext(Contexto)
  if (!l) throw new Error('useLoja fora do LojaProvider')
  return l
}

export function useGastos(de: Date, ate: Date) {
  const { versao } = useLoja()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [carregando, setCarregando] = useState(true)
  const a = iso(de)
  const b = iso(ate)

  useEffect(() => {
    let vivo = true
    setCarregando(true)
    supabase
      .from('gastos')
      .select('*')
      .gte('data', a)
      .lte('data', b)
      .order('data', { ascending: false })
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        if (!vivo) return
        setGastos((data ?? []).map((r) => ({ ...(r as Gasto), valor: Number(r.valor) })))
        setCarregando(false)
      })
    return () => {
      vivo = false
    }
  }, [a, b, versao])

  return { gastos, carregando }
}

/** Canteiro vale para o mês se está ativo e ainda não terminou. */
export function ativoNoMes(c: Canteiro, inicioDoMes: Date): boolean {
  return c.ativo && (!c.termina_em || c.termina_em >= iso(inicioDoMes))
}

export function entradasDoMes(entradas: Entrada[], inicioDoMes: Date): Entrada[] {
  const m = iso(inicioDoMes)
  return entradas.filter((e) => e.mes === null || e.mes === m)
}

export function somaPorCanteiro(gastos: Gasto[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const g of gastos) m.set(g.canteiro_id, (m.get(g.canteiro_id) ?? 0) + g.valor)
  return m
}

export function nomeDe(membros: Membro[], email: string): string {
  return membros.find((m) => m.email === email)?.nome ?? email.split('@')[0]
}
