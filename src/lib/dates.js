const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n) => String(n).padStart(2, '0')

export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const formatDate = (d) => ({
  weekday: WD[d.getDay()],
  day: d.getDate(),
  month: MO[d.getMonth()],
  full: `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`,
})

/** Next bookable working day (from tomorrow), given Bel's schedule. */
export function firstBookableDate(workingDays, blockedDates = []) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < 90; i++) {
    d.setDate(d.getDate() + 1)
    if (workingDays.includes(d.getDay()) && !blockedDates.includes(isoDate(d))) {
      return new Date(d)
    }
  }
  return null
}
