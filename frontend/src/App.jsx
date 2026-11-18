import { useEffect, useState } from 'react'
import { api } from './api.js'
import AuthScreen from './components/AuthScreen.jsx'
import ChatScreen from './components/ChatScreen.jsx'

const SESSION_KEY = 'alora_access_token'

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_KEY))
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(Boolean(token))

  useEffect(() => {
    if (!token) return
    api.me(token)
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY)
        setToken(null)
      })
      .finally(() => setChecking(false))
  }, [token])

  function signIn(result) {
    sessionStorage.setItem(SESSION_KEY, result.access_token)
    setUser(result.user)
    setToken(result.access_token)
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
    setToken(null)
  }

  if (checking) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Loading your classroom…</div>
  }

  return token && user
    ? <ChatScreen token={token} user={user} onSignOut={signOut} />
    : <AuthScreen onSignIn={signIn} />
}
