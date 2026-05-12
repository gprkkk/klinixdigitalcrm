import { FormEvent, useMemo, useState } from 'react'
import {
  Bot,
  Check,
  CheckCheck,
  MessageCircle,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'

type Channel = 'patients' | 'team'

interface Message {
  id: string
  author: 'them' | 'me' | 'ai'
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: string
  name: string
  initials: string
  channel: Channel
  role: string
  lastMessage: string
  lastTime: string
  unread: number
  online: boolean
  paletteIndex: number
  messages: Message[]
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Mariana Souza',
    initials: 'MS',
    channel: 'patients',
    role: 'WhatsApp Business',
    lastMessage: 'Perfeito, confirmo a sessão de quinta-feira!',
    lastTime: '09:42',
    unread: 2,
    online: true,
    paletteIndex: 0,
    messages: [
      { id: 'm1', author: 'them', text: 'Oi! Gostaria de remarcar minha limpeza de pele.', time: '09:31' },
      {
        id: 'm2',
        author: 'ai',
        text: 'Olá Mariana! Sou a IA da Klinix. Posso te ajudar a remarcar. Que tal quinta-feira às 14h00?',
        time: '09:32',
        status: 'read',
      },
      { id: 'm3', author: 'them', text: 'Quinta às 14h fica perfeito ✨', time: '09:40' },
      {
        id: 'm4',
        author: 'me',
        text: 'Reservado, Mariana! Você receberá um lembrete no dia anterior 💌',
        time: '09:41',
        status: 'read',
      },
      { id: 'm5', author: 'them', text: 'Perfeito, confirmo a sessão de quinta-feira!', time: '09:42' },
    ],
  },
  {
    id: 'c2',
    name: 'Camila Ribeiro',
    initials: 'CR',
    channel: 'patients',
    role: 'WhatsApp Business',
    lastMessage: 'Quanto custa a harmonização facial?',
    lastTime: '08:18',
    unread: 1,
    online: false,
    paletteIndex: 1,
    messages: [
      { id: 'm1', author: 'them', text: 'Bom dia! Vocês fazem harmonização facial?', time: '08:17' },
      { id: 'm2', author: 'them', text: 'Quanto custa a harmonização facial?', time: '08:18' },
    ],
  },
  {
    id: 'c3',
    name: 'Júlia Albuquerque',
    initials: 'JA',
    channel: 'patients',
    role: 'WhatsApp Business',
    lastMessage: 'Agendamento confirmado para amanhã às 10h',
    lastTime: 'Ontem',
    unread: 0,
    online: false,
    paletteIndex: 2,
    messages: [
      {
        id: 'm1',
        author: 'ai',
        text: 'Oi Júlia! Tudo certo para sua sessão de drenagem amanhã às 10h?',
        time: 'Ontem',
        status: 'read',
      },
      { id: 'm2', author: 'them', text: 'Tudo certo, obrigada!', time: 'Ontem' },
      {
        id: 'm3',
        author: 'me',
        text: 'Agendamento confirmado para amanhã às 10h 💖',
        time: 'Ontem',
        status: 'read',
      },
    ],
  },
  {
    id: 'c4',
    name: 'Rafaela Mendes',
    initials: 'RM',
    channel: 'patients',
    role: 'Instagram Direct',
    lastMessage: 'Vou pensar e te aviso 💕',
    lastTime: 'Seg',
    unread: 0,
    online: false,
    paletteIndex: 3,
    messages: [
      { id: 'm1', author: 'them', text: 'Vi o post sobre laser CO2. Tem promoção?', time: 'Seg' },
      {
        id: 'm2',
        author: 'me',
        text: 'Sim! Estamos com 15% off no pacote de 3 sessões neste mês.',
        time: 'Seg',
        status: 'read',
      },
      { id: 'm3', author: 'them', text: 'Vou pensar e te aviso 💕', time: 'Seg' },
    ],
  },
  {
    id: 'c5',
    name: 'Dra. Letícia Andrade',
    initials: 'LA',
    channel: 'team',
    role: 'Dermatologista',
    lastMessage: 'Já revisei a anamnese da Mariana, pode liberar.',
    lastTime: '10:02',
    unread: 0,
    online: true,
    paletteIndex: 0,
    messages: [
      { id: 'm1', author: 'me', text: 'Letícia, consegue revisar a anamnese da Mariana?', time: '09:55', status: 'read' },
      {
        id: 'm2',
        author: 'them',
        text: 'Já revisei a anamnese da Mariana, pode liberar.',
        time: '10:02',
      },
    ],
  },
  {
    id: 'c6',
    name: 'Recepção · Karen',
    initials: 'KR',
    channel: 'team',
    role: 'Recepção',
    lastMessage: 'Reabastecer ácido hialurônico amanhã 💧',
    lastTime: '08:50',
    unread: 3,
    online: true,
    paletteIndex: 1,
    messages: [
      { id: 'm1', author: 'them', text: 'Bom dia! Estoque do ácido hialurônico está acabando.', time: '08:48' },
      { id: 'm2', author: 'them', text: 'Vou abrir o pedido com o fornecedor.', time: '08:49' },
      { id: 'm3', author: 'them', text: 'Reabastecer ácido hialurônico amanhã 💧', time: '08:50' },
    ],
  },
]

const PALETTES = ['avatar-blue', 'avatar-pink', 'avatar-cyan', 'avatar-mint', 'avatar-lavender']

const StatusIcon = ({ status }: { status?: Message['status'] }) => {
  if (!status) return null
  if (status === 'sent') return <Check size={12} className="text-white/70" />
  if (status === 'delivered') return <CheckCheck size={12} className="text-white/70" />
  return <CheckCheck size={12} className="text-cyan-300" />
}

export default function Messages() {
  const [channel, setChannel] = useState<Channel>('patients')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string>('c1')
  const [draft, setDraft] = useState('')

  const conversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    return CONVERSATIONS.filter(
      (c) =>
        c.channel === channel &&
        (q === '' ||
          c.name.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)),
    )
  }, [channel, search])

  const selected = useMemo(
    () => CONVERSATIONS.find((c) => c.id === selectedId) ?? conversations[0] ?? null,
    [selectedId, conversations],
  )

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDraft('')
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:mb-7 md:flex-row md:flex-wrap md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
            Mensagens
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Central única para conversas com pacientes e equipe
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white p-1 shadow-card dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setChannel('patients')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
              channel === 'patients'
                ? 'bg-gradient-cta text-white shadow-chic'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={12} /> Pacientes
          </button>
          <button
            type="button"
            onClick={() => setChannel('team')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
              channel === 'team'
                ? 'bg-gradient-pink text-white shadow-chic'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles size={12} /> Equipe
          </button>
        </div>
      </div>

      <div className="card grid grid-cols-1 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-slate-100 xl:border-b-0 xl:border-r dark:border-slate-800">
          <div className="px-5 py-5">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar conversa"
                className="input pl-10 !py-2.5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ul className="space-y-1 px-3 pb-5">
            {conversations.length === 0 ? (
              <li className="px-3 py-8 text-center text-xs text-slate-400">
                Sem conversas neste canal.
              </li>
            ) : (
              conversations.map((c) => {
                const palette = PALETTES[c.paletteIndex % PALETTES.length]
                const isActive = selected?.id === c.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className={`avatar ${palette} h-11 w-11`}>{c.initials}</div>
                        {c.online && (
                          <span
                            aria-hidden
                            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                            {c.name}
                          </div>
                          <div className="shrink-0 text-[10px] font-medium text-slate-400">
                            {c.lastTime}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {c.lastMessage}
                          </div>
                          {c.unread > 0 && (
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </aside>

        {selected ? (
          <section className="flex h-[70vh] min-h-[480px] flex-col md:h-[640px]">
            <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 md:px-6 dark:border-slate-800">
              <div className="relative">
                <div className={`avatar ${PALETTES[selected.paletteIndex % PALETTES.length]} h-11 w-11`}>
                  {selected.initials}
                </div>
                {selected.online && (
                  <span
                    aria-hidden
                    className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selected.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {selected.online ? 'Online agora' : 'Visto recentemente'} · {selected.role}
                </div>
              </div>
              <button type="button" className="icon-btn" aria-label="Ligar">
                <Phone size={14} />
              </button>
              <button type="button" className="icon-btn-blue" aria-label="Vídeo">
                <Video size={14} />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-4 py-5 md:px-6 md:py-6 dark:bg-slate-950/40">
              {selected.messages.map((m) => {
                const isOutgoing = m.author === 'me' || m.author === 'ai'
                const bubble =
                  m.author === 'ai'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-400 text-white'
                    : m.author === 'me'
                      ? 'bg-gradient-to-br from-brand-500 to-cyan-500 text-white'
                      : 'bg-white text-slate-800 shadow-card dark:bg-slate-800 dark:text-slate-100'
                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${isOutgoing ? 'flex-row-reverse' : ''}`}
                  >
                    {m.author === 'ai' && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Bot size={12} />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${bubble} ${
                        isOutgoing ? 'rounded-br-md' : 'rounded-bl-md'
                      }`}
                    >
                      {m.author === 'ai' && (
                        <div className="mb-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
                          <Sparkles size={9} /> Klinix IA
                        </div>
                      )}
                      <div>{m.text}</div>
                      <div
                        className={`mt-1 flex items-center gap-1 text-[10px] ${
                          isOutgoing ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        <span>{m.time}</span>
                        {isOutgoing && <StatusIcon status={m.status} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-slate-100 px-3 py-3 md:px-6 md:py-4 dark:border-slate-800"
            >
              <button type="button" className="icon-btn" aria-label="Anexar">
                <Paperclip size={14} />
              </button>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="input !py-3"
              />
              <button type="button" className="icon-btn" aria-label="Emoji">
                <Smile size={14} />
              </button>
              <button type="submit" className="btn-primary !px-5 !py-2.5" aria-label="Enviar">
                <Send size={14} />
              </button>
            </form>
          </section>
        ) : (
          <section className="flex h-[60vh] min-h-[320px] flex-col items-center justify-center gap-3 text-center md:h-[640px]">
            <MessageCircle size={36} className="text-slate-300" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Selecione uma conversa
            </div>
            <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
              Clique em qualquer conversa à esquerda para visualizar as mensagens.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
