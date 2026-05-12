export interface Category {
  id: string
  name: string
  created_at?: string
}

export interface Service {
  id: string
  name: string
  category_id: string | null
  duration_minutes: number
  price: number
  created_at?: string
  categories?: Category | null
}

export interface Professional {
  id: string
  name: string
  is_active?: boolean | null
  created_at?: string
}

export interface ProfessionalSchedule {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

export interface Client {
  id: string
  full_name: string
  whatsapp?: string | null
  birth_date?: string | null
  created_at?: string
}

export interface ClientAnamnesis {
  client_id: string
  skin_type?: string | null
  allergies?: string | null
  medications?: string | null
}

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface Appointment {
  id: string
  client_id: string
  professional_id: string
  service_id: string
  appointment_date: string // 'YYYY-MM-DD'
  start_time: string // 'HH:MM:SS'
  end_time: string // 'HH:MM:SS'
  status: AppointmentStatus
  price_charged: number
  clients?: Client | null
  professionals?: Professional | null
  services?: Service | null
}

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
] as const

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

export const APPOINTMENT_STATUS_STYLE: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-accent-50 text-accent-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  COMPLETED: 'bg-brand-50 text-brand-700',
  CANCELLED: 'bg-red-50 text-red-700',
  NO_SHOW: 'bg-amber-50 text-amber-700',
}
