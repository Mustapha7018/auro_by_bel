/**
 * Bel's booking availability.
 *
 * Front-end stand-in for what the dashboard will own later. Working days
 * and opening hours are fixed here; individual slots are marked
 * free/taken deterministically (seeded by the date) so the same day always
 * shows the same openings until a real backend replaces this.
 */

// 0 = Sun … 6 = Sat. Bel works Tue–Sat.
const WORKING_DAYS = [2, 3, 4, 5, 6]
const OPEN_HOUR = 9
const CLOSE_HOUR = 18 // last slot starts at 17:00

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// stable pseudo-random in [0,1) from an integer seed
const seeded = (n) => {
  const x = Math.sin(n) * 10000
  return x - Math.floor(x)
}

export const dateKey = (d) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()

// 0 = Sun … 6 = Sat → which weekdays Bel does NOT work (for the calendar).
export const closedWeekDays = [0, 1] // Sun, Mon

/** A handful of days are fully booked, deterministically. */
export const isFullyBooked = (d) => seeded(dateKey(d)) < 0.12

export const formatDate = (d) => ({
  weekday: WEEKDAY[d.getDay()],
  day: d.getDate(),
  month: MONTH[d.getMonth()],
  iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`,
  full: `${WEEKDAY[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`,
})

/** Next `count` working days, starting tomorrow. */
export function availableDates(count = 14) {
  const out = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  let guard = 0
  while (out.length < count && guard < 90) {
    guard++
    d.setDate(d.getDate() + 1)
    if (WORKING_DAYS.includes(d.getDay())) {
      const key = dateKey(d)
      // a fully-booked day every so often, for realism
      const fullyBooked = seeded(key) < 0.12
      out.push({ date: new Date(d), key, ...formatDate(d), fullyBooked })
    }
  }
  return out
}

/** Hourly slots for a given day key, with free/taken state. */
export function slotsForDate(key) {
  const slots = []
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    const available = seeded(key + h * 7.3) > 0.4
    slots.push({
      time: `${String(h).padStart(2, '0')}:00`,
      label: `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'am' : 'pm'}`,
      available,
    })
  }
  return slots
}
