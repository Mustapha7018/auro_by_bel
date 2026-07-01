import { defineStore } from 'pinia'
import { api } from '@/lib/api'

/** Bel's booking availability (working days, hours, blocked dates). */
export const useAvailabilityStore = defineStore('availability', {
  state: () => ({
    workingDays: [2, 3, 4, 5, 6],
    blockedDates: [],
    openHour: 9,
    closeHour: 18,
    loaded: false,
  }),

  actions: {
    async load() {
      if (this.loaded) return
      try {
        const a = await api.availability()
        this.workingDays = a.workingDays
        this.blockedDates = a.blockedDates
        this.openHour = a.openHour
        this.closeHour = a.closeHour
        this.loaded = true
      } catch {
        /* keep sensible defaults if the API is unreachable */
      }
    },
    // returns a promise of [{ time, available }] for the given ISO date
    slots(dateIso) {
      return api.slots(dateIso)
    },
  },
})
