import { defineStore } from 'pinia'
import { currency } from '@/data/catalog'

/**
 * Cart store.
 *
 * A line item is keyed by `${productId}::${mode}::${length}` so the same
 * wig can sit in the bag once as a deposit pre-order and once paid in
 * full, or in two different lengths, without collapsing together.
 *
 * mode: 'preorder' → customer pays `deposit` now, balance on fulfilment
 *       'full'     → customer pays `price` now
 */
const fmt = new Intl.NumberFormat('en-GH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// e.g. ₵2,400
export const formatMoney = (value) => `${currency.symbol}${fmt.format(value)}`

const lineKey = (productId, mode, length) =>
  `${productId}::${mode}::${length || 'one-size'}`

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: {}, // keyed map of line items
    isOpen: false,
  }),

  getters: {
    lines: (state) => Object.values(state.items),
    count: (state) =>
      Object.values(state.items).reduce((n, l) => n + l.qty, 0),
    isEmpty: (state) => Object.keys(state.items).length === 0,

    /** What the customer pays today (deposits for pre-orders). */
    dueToday: (state) =>
      Object.values(state.items).reduce(
        (sum, l) =>
          sum + l.qty * (l.mode === 'preorder' ? l.deposit : l.price),
        0,
      ),

    /** Remaining balance held on pre-orders, settled on fulfilment. */
    balanceLater: (state) =>
      Object.values(state.items).reduce(
        (sum, l) =>
          sum + (l.mode === 'preorder' ? l.qty * (l.price - l.deposit) : 0),
        0,
      ),
  },

  actions: {
    add({ product, mode = 'full', length = null, qty = 1 }) {
      const key = lineKey(product.id, mode, length)
      const existing = this.items[key]
      if (existing) {
        existing.qty += qty
      } else {
        this.items[key] = {
          key,
          productId: product.id,
          name: product.name,
          image: product.image,
          mode,
          length,
          price: product.price,
          deposit: product.deposit,
          qty,
        }
      }
      this.isOpen = true
    },

    increment(key) {
      if (this.items[key]) this.items[key].qty += 1
    },

    decrement(key) {
      const line = this.items[key]
      if (!line) return
      line.qty -= 1
      if (line.qty <= 0) this.remove(key)
    },

    remove(key) {
      delete this.items[key]
    },

    clear() {
      this.items = {}
    },

    open() {
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
    toggle() {
      this.isOpen = !this.isOpen
    },
  },
})
