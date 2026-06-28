import { defineStore } from 'pinia'

/**
 * Holds the product open in the quick-view modal, plus its collection
 * `mode` ('shop' → cart actions, 'appointment' → date/time booking).
 */
export const useViewStore = defineStore('view', {
  state: () => ({
    product: null,
    mode: 'shop',
  }),
  getters: {
    isOpen: (state) => state.product !== null,
  },
  actions: {
    open(product, mode = 'shop') {
      this.product = product
      this.mode = mode
    },
    close() {
      this.product = null
    },
  },
})
