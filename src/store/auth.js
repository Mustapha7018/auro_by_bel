import { defineStore } from 'pinia'

/**
 * Session store.
 *
 * NOTE: sign-in is currently a front-end MOCK — clicking "Continue with
 * Google" creates a local demo session. To make it real, replace
 * `signInWithGoogle()` with a Supabase/Firebase Google OAuth call; the rest
 * of the app (gating, profile, favourites, orders) already works off this
 * store and won't need changes.
 */
const KEY = 'aurabel.user'

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: load(),
    promptOpen: false,
    profileOpen: false,
    pending: null, // action to resume after a successful sign-in
  }),

  getters: {
    isAuthed: (s) => !!s.user,
    initials: (s) =>
      s.user
        ? s.user.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '',
  },

  actions: {
    openPrompt() {
      this.promptOpen = true
    },
    closePrompt() {
      this.promptOpen = false
      this.pending = null
    },
    openProfile() {
      this.profileOpen = true
    },
    closeProfile() {
      this.profileOpen = false
    },

    signInWithGoogle() {
      // --- MOCK: swap for real Google OAuth here ---
      this.user = {
        name: 'Ama Mensah',
        email: 'ama.mensah@gmail.com',
        provider: 'google',
      }
      localStorage.setItem(KEY, JSON.stringify(this.user))
      this.promptOpen = false
      const resume = this.pending
      this.pending = null
      if (typeof resume === 'function') resume()
    },

    signOut() {
      this.user = null
      localStorage.removeItem(KEY)
      this.profileOpen = false
    },

    /**
     * Guard for actions that need a logged-in user. Returns true if signed
     * in; otherwise stashes the action, opens the prompt, and returns false.
     */
    require(action) {
      if (this.user) return true
      this.pending = action || null
      this.openPrompt()
      return false
    },
  },
})
