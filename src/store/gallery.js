import { defineStore } from 'pinia'
import { api } from '@/lib/api'

/** Loads Bel's creations (images + videos) shown on the gallery. */
export const useGalleryStore = defineStore('gallery', {
  state: () => ({
    items: [],
    loaded: false,
    loading: false,
  }),

  getters: {
    hasItems: (s) => s.items.length > 0,
  },

  actions: {
    async load() {
      if (this.loaded || this.loading) return
      this.loading = true
      try {
        this.items = await api.gallery()
        this.loaded = true
      } catch {
        /* gallery is non-critical — fail quietly and leave it empty */
      } finally {
        this.loading = false
      }
    },
  },
})
