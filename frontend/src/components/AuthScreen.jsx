import { useState } from 'react'
import { ArrowRight, BookOpen, Braces, Check, Sparkles } from 'lucide-react'
import { api } from '../api.js'

export default function AuthScreen({ onSignIn }) {
  const [mode, setMode] = useState('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = mode === 'register'
        ? await api.register(email, password)
        : await api.login(email, password)
      onSignIn(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page min-h-screen lg:grid lg:grid-cols-[1fr_1fr]">
      <div className="auth-intro flex flex-col justify-between px-7 py-8 sm:px-12 lg:px-16 lg:py-12">
        <div className="brand"><span className="brand-icon"><Braces size={19} strokeWidth={2.4} /></span><span>alora<span className="brand-dot">.</span></span></div>
        <div className="max-w-xl py-16 lg:py-0">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR C PROGRAMMING COMPANION</div>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#19362d] sm:text-6xl xl:text-7xl">The best way to learn C is to <span className="text-[#579879]">ask.</span></h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[#65776c]">Get unstuck, explore concepts, and grow your confidence one question at a time.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="feature-pill"><Check size={15} /> Clear explanations</span>
            <span className="feature-pill"><Check size={15} /> Real C examples</span>
            <span className="feature-pill"><Check size={15} /> Your pace</span>
          </div>
        </div>
        <p className="text-sm text-[#829287]">A little progress, every day.</p>
      </div>

      <div className="auth-form-side flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[430px]">
          <div className="mb-9 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2ec] text-[#4c8b68]"><BookOpen size={26} /></div>
          <div className="mb-7">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#1d3329]">{mode === 'register' ? 'Start learning today' : 'Welcome back'}</h2>
            <p className="mt-2 text-[#718076]">{mode === 'register' ? 'Create your free classroom account.' : 'Your C tutor is ready when you are.'}</p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <label className="block"><span className="form-label">Email address</span><input className="form-input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label className="block"><span className="form-label">Password</span><input className="form-input" type="password" minLength={8} maxLength={128} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button disabled={busy} className="primary-button w-full" type="submit">{busy ? 'One moment…' : mode === 'register' ? 'Create account' : 'Sign in'}<ArrowRight size={18} /></button>
          </form>
          <p className="mt-7 text-center text-sm text-[#7b887e]">
            {mode === 'register' ? 'Already have an account?' : 'New to Alora?'}{' '}
            <button className="font-semibold text-[#4b8e69] hover:underline" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}>{mode === 'register' ? 'Sign in' : 'Create an account'}</button>
          </p>
          <div className="mt-12 flex items-center gap-3 border-t border-[#e9ece8] pt-7 text-sm text-[#94a098]"><Sparkles size={16} className="text-[#a5bd86]" /> Thoughtful teaching, powered by AI</div>
        </div>
      </div>
    </div>
  )
}
