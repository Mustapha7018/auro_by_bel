import { defineStore } from 'pinia'

/**
 * The signed-in customer's saved data: favourites, appointment requests,
 * and placed orders. Persisted locally for now; a backend can hydrate this
 * the same shape later.
 */
const KEY = 'aurabel.account'

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

const saved = load()

export const useAccountStore = defineStore('account', {
  state: () => ({
    favorites: saved.favorites || [], // product ids
    bookings: saved.bookings || [], // appointment requests
    orders: saved.orders || [], // placed cart orders
  }),

  getters: {
    isFavorite: (s) => (id) => s.favorites.includes(id),
    favoriteCount: (s) => s.favorites.length,
  },

  actions: {
    _save() {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          favorites: this.favorites,
          bookings: this.bookings,
          orders: this.orders,
        }),
      )
    },

    toggleFavorite(id) {
      const i = this.favorites.indexOf(id)
      if (i >= 0) this.favorites.splice(i, 1)
      else this.favorites.unshift(id)
      this._save()
    },

    addBooking(booking) {
      this.bookings.unshift({ id: `bk_${Date.now()}`, ts: Date.now(), ...booking })
      this._save()
    },

    placeOrder(order) {
      this.orders.unshift({ id: `or_${Date.now()}`, ts: Date.now(), ...order })
      this._save()
    },
  },
})
