import { useState, type FormEvent } from 'react'
import { Arvore } from '../componentes/Arvore'
import { supabase } from '../lib/supabase'

export function Entrar() {
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setErro('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    setOcupado(false)
    if (error) setErro('Não consegui mandar o e-mail. Confere o endereço e tenta de novo.')
    else setEtapa('codigo')
  }

  async function confirmar(e: FormEvent) {
    e.preventDefault()
    setOcupado(true)
    setErro('')
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: codigo.trim(),
      type: 'email',
    })
    setOcupado(false)
    if (error) setErro('Código inválido ou vencido. Pede um novo.')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <Arvore pct={0.2} tamanho={140} />
      <h1 className="mt-2 font-titulo text-4xl font-bold text-mata">Caderneta Roça</h1>
      <p className="mt-2 text-cacau/80">O orçamento da Carol e da Laura, canteiro por canteiro.</p>

      {etapa === 'email' ? (
        <form onSubmit={enviar} className="mt-8 w-full space-y-3">
          <input
            className="campo text-center"
            type="email"
            required
            autoComplete="email"
            placeholder="seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="botao w-full" disabled={ocupado}>
            {ocupado ? 'Enviando…' : 'Receber código de entrada'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmar} className="mt-8 w-full space-y-3">
          <p className="text-sm text-cacau/80">
            Mandamos um e-mail para <b>{email}</b>. Digite o código que chegou, ou toque no link do e-mail.
          </p>
          <input
            className="campo text-center text-2xl tracking-[0.4em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            placeholder="código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
          />
          <button className="botao w-full" disabled={ocupado || codigo.length < 6}>
            {ocupado ? 'Entrando…' : 'Entrar'}
          </button>
          <button type="button" className="text-sm text-folha underline" onClick={() => setEtapa('email')}>
            Usar outro e-mail
          </button>
        </form>
      )}

      {erro && <p className="mt-4 text-sm text-terra">{erro}</p>}
    </main>
  )
}
