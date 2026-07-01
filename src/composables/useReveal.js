import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Adds `is-visible` to any element carrying the `.reveal` class once it
 * scrolls into view, then stops observing it. Returns a `scan()` you can call
 * after async content mounts so new `.reveal` elements get picked up too.
 * Respects prefers-reduced-motion by revealing everything immediately.
 */
export function useReveal() {
  let observer = null
  let reduced = false

  const scan = () => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.is-visible)'))
    if (reduced || !observer) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    els.forEach((el) => observer.observe(el))
  }

  onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!reduced && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
      )
    }
    scan()
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
  })

  return { scan }
}
