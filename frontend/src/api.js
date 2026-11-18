const API_ROOT = '/api'

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body.detail
    const message = typeof detail === 'string' ? detail : 'Something went wrong. Please try again.'
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return body
}

export const api = {
  register: (email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token) => request('/auth/me', { token }),
  conversations: (token) => request('/conversations', { token }),
  newConversation: (token) => request('/conversations', { token, method: 'POST' }),
  conversation: (token, id) => request(`/conversations/${id}`, { token }),
  sendMessage: (token, id, content) => request(`/conversations/${id}/messages`, {
    token,
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
}
