export type Grupo = 'fixo' | 'variavel' | 'reserva'

export interface Canteiro {
  id: string
  nome: string
  grupo: Grupo
  limite_mensal: number
  limite_semanal: number | null
  icone: string
  ordem: number
  ativo: boolean
  termina_em: string | null
}

export interface Gasto {
  id: string
  data: string
  valor: number
  canteiro_id: string
  quem: string
  obs: string | null
  criado_em: string
}

export interface Entrada {
  id: string
  descricao: string
  valor: number
  mes: string | null
}

export interface Membro {
  email: string
  nome: string
}

export const NOME_GRUPO: Record<Grupo, string> = {
  fixo: 'Contas fixas',
  variavel: 'Canteiros do dia a dia',
  reserva: 'Separar todo mês',
}
