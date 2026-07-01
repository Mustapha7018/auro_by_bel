import { defineStore } from 'pinia'
import { api, getToken, setToken } from '@/lib/api'
import { useAccountStore } from './account'

/**
 * Session store — real email/password auth against the backend.
 * (Google OAuth can be added later; it would just issue the same JWT.)
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: getToken(),
    promptOpen: false,
    profileOpen: false,
    pending: null, // action to resume after sign-in
    mode: 'login', // 'login' | 'register'
    error: '',
    busy: false,
  }),

  getters: {
    isAuthed: (s) => !!s.user,
    initials: (s) =>
      s.user
        ? s.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
        : '',
  },

  actions: {
    /** Restore a session on page load if a token exists. */
    async init() {
      if (this.token && !this.user) {
        try {
          this.user = await api.me()
          useAccountStore().loadAll()
        } catch {
          this.signOut()
        }
      }
    },

    openPrompt(mode = 'login') {
      this.mode = mode
      this.error = ''
      this.promptOpen = true
    },
    closePrompt() {
      this.promptOpen = false
      this.pending = null
      this.error = ''
    },
    openProfile() {
      this.profileOpen = true
    },
    closeProfile() {
      this.profileOpen = false
    },
    setMode(mode) {
      this.mode = mode
      this.error = ''
    },

    async login(email, password) {
      return this._authenticate(() => api.login({ email, password }))
    },
    async register(name, email, password) {
      return this._authenticate(() => api.register({ name, email, password }))
    },
    async loginWithGoogle(credential) {
      return this._authenticate(() => api.google(credential))
    },

    async updateProfile(patch) {
      this.user = await api.updateMe(patch)
      return this.user
    },

    async _authenticate(call) {
      this.busy = true
      this.error = ''
      try {
        const { access_token, user } = await call()
        setToken(access_token)
        this.token = access_token
        this.user = user
        this.promptOpen = false
        await useAccountStore().loadAll()
        const resume = this.pending
        this.pending = null
        if (typeof resume === 'function') resume()
        return true
      } catch (e) {
        this.error = e.message || 'Something went wrong.'
        return false
      } finally {
        this.busy = false
      }
    },

    signOut() {
      setToken(null)
      this.token = null
      this.user = null
      this.profileOpen = false
      useAccountStore().clear()
    },

    /** Guard: run `action` if signed in, else stash it and open the prompt. */
    require(action) {
      if (this.user) return true
      this.pending = action || null
      this.openPrompt('login')
      return false
    },
  },
})
