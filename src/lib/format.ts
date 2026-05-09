export const formatCurrency = (value: number | null | undefined): string => {
  const v = Number(value ?? 0)
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (iso: string | null | undefined): string => {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export const formatTimeStr = (t: string | null | undefined): string => {
  if (!t) return '-'
  const [h = '00', m = '00'] = t.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

export const formatDateStr = (d: string | null | undefined): string => {
  if (!d) return '-'
  const [y, mo, da] = d.split('-')
  if (!y || !mo || !da) return d
  return `${da}/${mo}/${y}`
}

export const formatDateTimeFromParts = (
  date: string | null | undefined,
  time: string | null | undefined,
): string => `${formatDateStr(date)} ${formatTimeStr(time)}`

export const dateToYmd = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}

export const ymdToDate = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export const addMinutesToTime = (time: string, minutes: number): string => {
  const [h = 0, m = 0] = time.split(':').map(Number)
  let total = (h * 60 + m + minutes) % (24 * 60)
  if (total < 0) total += 24 * 60
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export const toSqlTime = (t: string): string => {
  if (!t) return t
  const parts = t.split(':')
  const h = (parts[0] ?? '00').padStart(2, '0')
  const m = (parts[1] ?? '00').padStart(2, '0')
  const s = (parts[2] ?? '00').padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const timeStrToMinutes = (t: string | null | undefined): number => {
  if (!t) return 0
  const [h = 0, m = 0] = t.split(':').map(Number)
  return h * 60 + m
}

export const toLocalDateInput = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const toLocalDateTimeInput = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}
