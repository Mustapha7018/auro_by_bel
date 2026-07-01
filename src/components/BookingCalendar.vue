<script setup>
import { ref, computed, watch } from 'vue'
import { useAvailabilityStore } from '@/store/availability'
import { isoDate } from '@/lib/dates'

const availability = useAvailabilityStore()

/**
 * Minimal month calendar matching the studio's design. Lets the customer
 * navigate ahead month-to-month and pick a date; past days, Bel's days off,
 * and fully-booked days are disabled. Emits the chosen Date.
 */
const props = defineProps({
  modelValue: { type: Date, default: null },
})
const emit = defineEmits(['update:modelValue'])

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const today = new Date()
today.setHours(0, 0, 0, 0)

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const view = ref(startOfMonth(props.modelValue || today))

watch(
  () => props.modelValue,
  (d) => {
    if (d) view.value = startOfMonth(d)
  },
)

const title = computed(
  () => `${MONTHS[view.value.getMonth()]} ${view.value.getFullYear()}`,
)

const canPrev = computed(() => view.value > startOfMonth(today))
// don't let people wander years ahead
const maxView = startOfMonth(new Date(today.getFullYear(), today.getMonth() + 11, 1))
const canNext = computed(() => view.value < maxView)

const mk = (date, outside) => {
  const past = date < today
  const closed = !availability.workingDays.includes(date.getDay())
  const blocked = availability.blockedDates.includes(isoDate(date))
  return {
    date,
    day: date.getDate(),
    outside,
    disabled: outside || past || closed || blocked,
    isToday: !outside && sameDay(date, today),
    isSelected: !outside && sameDay(date, props.modelValue),
  }
}

// Always a full 6-row (42-cell) grid so the calendar height never changes.
const cells = computed(() => {
  const y = view.value.getFullYear()
  const m = view.value.getMonth()
  const lead = (new Date(y, m, 1).getDay() + 6) % 7 // Mon-first offset
  const days = new Date(y, m + 1, 0).getDate()
  const prevDays = new Date(y, m, 0).getDate()
  const out = []
  for (let i = lead - 1; i >= 0; i--) out.push(mk(new Date(y, m - 1, prevDays - i), true))
  for (let d = 1; d <= days; d++) out.push(mk(new Date(y, m, d), false))
  let nd = 1
  while (out.length < 42) out.push(mk(new Date(y, m + 1, nd++), true))
  return out
})

const prev = () => {
  if (canPrev.value)
    view.value = new Date(view.value.getFullYear(), view.value.getMonth() - 1, 1)
}
const next = () => {
  if (canNext.value)
    view.value = new Date(view.value.getFullYear(), view.value.getMonth() + 1, 1)
}
const pick = (c) => {
  if (c && !c.disabled) emit('update:modelValue', c.date)
}
</script>

<template>
  <div class="cal">
    <div class="cal__head">
      <button type="button" class="cal__nav" :disabled="!canPrev" aria-label="Previous month" @click="prev">‹</button>
      <span class="cal__title">{{ title }}</span>
      <button type="button" class="cal__nav" :disabled="!canNext" aria-label="Next month" @click="next">›</button>
    </div>

    <div class="cal__grid cal__weekdays">
      <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
    </div>

    <div class="cal__grid">
      <button
        v-for="(c, i) in cells"
        :key="i"
        type="button"
        class="cal__day"
        :class="{ 'is-selected': c.isSelected, 'is-today': c.isToday, 'is-outside': c.outside }"
        :disabled="c.disabled"
        @click="pick(c)"
      >
        {{ c.day }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cal {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.7rem 0.8rem 0.85rem;
}

.cal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.cal__title {
  font-size: var(--step-0);
  font-weight: 600;
}

.cal__nav {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  font-size: 1.2rem;
  line-height: 1;
  color: var(--ink);
  display: grid;
  place-items: center;
  transition: background var(--dur-fast), color var(--dur-fast);
}

.cal__nav:hover:not(:disabled) {
  background: var(--ink);
  color: var(--paper);
}

.cal__nav:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal__weekdays {
  margin-bottom: 0.35rem;
}

.cal__weekdays span {
  text-align: center;
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-faint);
  padding-bottom: 0.2rem;
}

.cal__day {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  font-size: 0.82rem;
  border-radius: 8px;
  color: var(--ink);
  transition: background var(--dur-fast), color var(--dur-fast),
    box-shadow var(--dur-fast);
}

.cal__day:hover:not(:disabled) {
  box-shadow: inset 0 0 0 1.5px var(--ink);
}

.cal__day:disabled {
  color: var(--line);
  cursor: not-allowed;
}

.cal__day.is-outside {
  visibility: hidden;
}

.cal__day.is-today:not(.is-selected) {
  box-shadow: inset 0 0 0 1px var(--gold);
}

.cal__day.is-selected {
  background: var(--ink);
  color: var(--paper);
  font-weight: 600;
}
</style>
