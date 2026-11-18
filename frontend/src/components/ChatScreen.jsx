import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowUp, BookOpen, Braces, ChevronRight, CircleHelp, LogOut, Menu, MessageSquare, Plus, Sparkles, X } from 'lucide-react'
import { api } from '../api.js'

const PROMPTS = [
  { icon: '01', title: 'Start with the basics', question: 'What is a variable in C? Explain with a simple example.' },
  { icon: '02', title: 'Understand pointers', question: 'Explain pointers in C like I am a beginner.' },
  { icon: '03', title: 'Practice with loops', question: 'Teach me for loops in C and give me a small exercise.' },
]

export default function ChatScreen({ token, user, onSignOut }) {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef(null)
  const activeIdRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    api.conversations(token)
      .then(async (items) => {
        if (cancelled) return
        setConversations(items)
        if (items.length) await openConversation(items[0].id, cancelled)
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  async function openConversation(id, cancelled = false) {
    activeIdRef.current = id
    setActiveId(id)
    setError('')
    setSidebarOpen(false)
    try {
      const conversation = await api.conversation(token, id)
      if (!cancelled && activeIdRef.current === id) setMessages(conversation.messages)
    } catch (err) {
      if (!cancelled) setError(err.message)
    }
  }

  function newConversation() {
    activeIdRef.current = null
    setActiveId(null)
    setMessages([])
    setDraft('')
    setError('')
    setSidebarOpen(false)
  }

  async function send(content = draft) {
    const question = content.trim()
    if (!question || busy) return
    setBusy(true)
    setError('')
    setDraft('')
    try {
      let id = activeIdRef.current
      if (!id) {
        const conversation = await api.newConversation(token)
        id = conversation.id
        activeIdRef.current = id
        setActiveId(id)
        setConversations((items) => [conversation, ...items])
      }
      const optimistic = { id: `pending-${Date.now()}`, role: 'user', content: question }
      setMessages((items) => [...items, optimistic])
      const reply = await api.sendMessage(token, id, question)
      setMessages((items) => [...items.filter((item) => item.id !== optimistic.id), reply.question, reply.answer])
      setConversations((items) => items.map((item) => item.id === id && item.title === 'New conversation' ? { ...item, title: question.slice(0, 100) } : item))
    } catch (err) {
      setMessages((items) => items.filter((item) => !String(item.id).startsWith('pending-')))
      setDraft(question)
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    send()
  }

  return (
    <div className="flex h-screen min-h-[600px] bg-[#f7f8f5] text-[#21362b]">
      {sidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-[#18392c]/30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-[#e7ebe5] bg-white px-4 py-6 transition-transform md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2"><div className="brand"><span className="brand-icon"><Braces size={19} strokeWidth={2.4} /></span><span>alora<span className="brand-dot">.</span></span></div><button className="text-[#718174] md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={21} /></button></div>
        <button className="new-chat mt-10" onClick={newConversation} disabled={busy}><Plus size={18} /> New conversation</button>
        <div className="mt-9 px-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#9daaa0]">Your conversations</div>
        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto" aria-label="Conversations">
          {loading && <p className="px-3 py-3 text-sm text-[#9aa79c]">Loading…</p>}
          {!loading && conversations.length === 0 && <p className="px-3 py-3 text-sm leading-6 text-[#9aa79c]">Your questions will appear here.</p>}
          {conversations.map((conversation) => (
            <button key={conversation.id} onClick={() => openConversation(conversation.id)} disabled={busy} className={`conversation-link ${activeId === conversation.id ? 'conversation-active' : ''}`}><MessageSquare size={16} /><span className="truncate">{conversation.title}</span></button>
          ))}
        </nav>
        <div className="rounded-2xl bg-[#f0f5ed] p-4"><div className="flex items-center gap-2 font-semibold text-[#3b684b]"><BookOpen size={17} /> Your learning space</div><p className="mt-2 text-xs leading-5 text-[#78917d]">Curiosity is the only prerequisite.</p></div>
        <div className="mt-5 flex items-center gap-3 border-t border-[#edf0eb] px-1 pt-5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dfeee3] font-semibold uppercase text-[#457b57]">{user.email[0]}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{user.email}</div><div className="text-xs text-[#96a299]">Student</div></div><button title="Sign out" aria-label="Sign out" onClick={onSignOut} className="rounded-lg p-2 text-[#8b9a8e] hover:bg-[#f0f4ef] hover:text-[#335d42]"><LogOut size={17} /></button></div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e9ede7] bg-white/80 px-5 sm:px-8"><div className="flex items-center gap-3"><button className="mr-1 text-[#5b7562] md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={23} /></button><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf4ea] text-[#60936c]"><Sparkles size={18} /></div><div><div className="font-semibold leading-5">C programming tutor</div><div className="text-xs text-[#93a196]">Ask anything about C</div></div></div><div className="hidden items-center gap-2 rounded-full border border-[#e3eae0] px-3 py-1.5 text-xs font-medium text-[#5c8265] sm:flex"><span className="h-2 w-2 rounded-full bg-[#8fbf84]" /> Ready to help</div></header>

        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8" aria-live="polite">
          <div className="mx-auto max-w-[780px]">
            {messages.length === 0 && !loading ? (
              <div className="pt-7 sm:pt-16"><div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f2e6] text-[#5b9167]"><Sparkles size={25} /></div><div className="eyebrow"><span className="eyebrow-line" /> LEARN ONE QUESTION AT A TIME</div><h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#223d2d] sm:text-5xl">Hello, curious mind<span className="text-[#78ad80]">.</span></h1><p className="mt-4 max-w-xl text-base leading-7 text-[#7b8b7f]">I'm your C programming tutor. No question is too small. Pick a starting point or ask what’s on your mind.</p><div className="mt-12 grid gap-3 sm:grid-cols-3">{PROMPTS.map((prompt) => <button key={prompt.icon} onClick={() => send(prompt.question)} className="prompt-card text-left"><div className="mb-8 text-xs font-semibold text-[#94b399]">{prompt.icon} / EXPLORE</div><div className="font-semibold text-[#36513d]">{prompt.title}</div><div className="mt-2 flex items-center justify-between text-xs text-[#8c9c8f]"><span>Ask Alora</span><ChevronRight size={15} /></div></button>)}</div></div>
            ) : (
              <div className="space-y-8 pb-6">{messages.map((message) => <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>{message.role === 'assistant' && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e3efe3] text-[#4f9065]"><Sparkles size={16} /></div>}<div className={message.role === 'user' ? 'user-bubble' : 'assistant-bubble'}>{message.role === 'assistant' ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}</div></div>)}{busy && <div className="flex gap-4"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e3efe3] text-[#4f9065]"><Sparkles size={16} /></div><div className="text-sm text-[#8fa092]">Thinking through your question…</div></div>}<div ref={bottomRef} /></div>
            )}
          </div>
        </div>

        <div className="shrink-0 px-4 pb-5 pt-3 sm:px-8"><div className="mx-auto max-w-[780px]">{error && <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"><CircleHelp size={17} className="mt-0.5 shrink-0" />{error}</div>}<form onSubmit={submit} className="composer flex items-end gap-3"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder="Ask a question about C…" rows={1} maxLength={4000} className="max-h-40 min-h-7 flex-1 resize-none bg-transparent py-1 outline-none placeholder:text-[#a4b0a5]" aria-label="Your question" /><button disabled={busy || !draft.trim()} aria-label="Send message" className="send-button" type="submit"><ArrowUp size={19} /></button></form><p className="mt-3 text-center text-[11px] text-[#a3aea4]">Alora can make mistakes. Check code before using it in a project.</p></div></div>
      </main>
    </div>
  )
}
