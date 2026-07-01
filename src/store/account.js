import { defineStore } from 'pinia'
import { api } from '@/lib/api'

/**
 * The signed-in customer's data, backed by the API:
 * favourites (product ids), bookings, and orders.
 */
export const useAccountStore = defineStore('account', {
  state: () => ({
    favorites: [], // product ids
    bookings: [],
    orders: [],
    loaded: false,
  }),

  getters: {
    isFavorite: (s) => (id) => s.favorites.includes(id),
    favoriteCount: (s) => s.favorites.length,
  },

  actions: {
    async loadAll() {
      try {
        const [favs, bookings, orders] = await Promise.all([
          api.favorites(),
          api.myBookings(),
          api.myOrders(),
        ])
        this.favorites = favs.map((p) => p.id)
        this.bookings = bookings
        this.orders = orders
        this.loaded = true
      } catch {
        /* not signed in / offline */
      }
    },

    async toggleFavorite(id) {
      const has = this.favorites.includes(id)
      // optimistic update
      if (has) this.favorites = this.favorites.filter((x) => x !== id)
      else this.favorites = [id, ...this.favorites]
      try {
        if (has) await api.removeFavorite(id)
        else await api.addFavorite(id)
      } catch {
        // revert on failure
        if (has) this.favorites = [id, ...this.favorites]
        else this.favorites = this.favorites.filter((x) => x !== id)
      }
    },

    async refreshOrders() {
      try {
        this.orders = await api.myOrders()
      } catch {
        /* ignore */
      }
    },
    async refreshBookings() {
      try {
        this.bookings = await api.myBookings()
      } catch {
        /* ignore */
      }
    },

    async checkout(items, phone) {
      const order = await api.checkout(items, phone)
      await this.refreshOrders()
      return order
    },

    clear() {
      this.favorites = []
      this.bookings = []
      this.orders = []
      this.loaded = false
    },
  },
})
