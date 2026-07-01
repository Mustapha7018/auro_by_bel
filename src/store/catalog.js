import { defineStore } from 'pinia'
import { api } from '@/lib/api'

/** Loads the catalogue (categories → products) from the API. */
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    categories: [],
    loading: false,
    loaded: false,
    error: '',
  }),

  getters: {
    index: (s) =>
      s.categories.map((c) => ({ id: c.id, name: c.name, count: c.products.length })),
    productById: (s) => {
      const map = {}
      s.categories.forEach((c) =>
        c.products.forEach((p) => {
          map[p.id] = { ...p, mode: p.mode || c.mode, categoryName: c.name }
        }),
      )
      return map
    },
  },

  actions: {
    async load() {
      if (this.loaded || this.loading) return
      this.loading = true
      this.error = ''
      try {
        this.categories = await api.catalog()
        this.loaded = true
      } catch (e) {
        this.error = e.message || 'Could not load the catalogue.'
      } finally {
        this.loading = false
      }
    },
    async reload() {
      this.loaded = false
      await this.load()
    },
  },
})
