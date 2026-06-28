import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Adds `is-visible` to any element carrying the `.reveal` class once it
 * scrolls into view, then stops observing it. One shared observer for the
 * whole document keeps it cheap. Respects prefers-reduced-motion by
 * revealing everything immediately.
 */
export function useReveal() {
  let observer = null

  onMounted(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }

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

    els.forEach((el) => observer.observe(el))
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
  })
}
