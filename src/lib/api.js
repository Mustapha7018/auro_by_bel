/**
 * API client for the Aura by Bel backend.
 * Base URL: VITE_API_BASE (http://localhost:8000 in dev, api.aurabybel.shop in prod).
 */
const BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '')
const TOKEN_KEY = 'aurabel.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let detail = `Something went wrong (${res.status}).`
    try {
      const d = await res.json()
      if (d && d.detail) detail = typeof d.detail === 'string' ? d.detail : detail
    } catch {
      /* non-JSON error */
    }
    const err = new Error(detail)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  base: BASE,

  // public
  catalog: () => request('/catalog'),
  gallery: () => request('/gallery'),
  availability: () => request('/availability'),
  slots: (dateIso) => request(`/bookings/slots?date=${dateIso}`),

  // auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  google: (credential) => request('/auth/google', { method: 'POST', body: { credential } }),
  me: () => request('/auth/me', { auth: true }),
  updateMe: (body) => request('/me', { method: 'PATCH', body, auth: true }),

  // customer account
  favorites: () => request('/me/favorites', { auth: true }),
  addFavorite: (id) => request(`/me/favorites/${id}`, { method: 'PUT', auth: true }),
  removeFavorite: (id) => request(`/me/favorites/${id}`, { method: 'DELETE', auth: true }),
  myBookings: () => request('/me/bookings', { auth: true }),
  createBooking: (body) => request('/me/bookings', { method: 'POST', body, auth: true }),
  myOrders: () => request('/me/orders', { auth: true }),
  checkout: (items, phone) => request('/me/orders', { method: 'POST', body: { items, phone }, auth: true }),
}
