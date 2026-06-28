<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { catalogIndex } from '@/data/catalog'

const active = ref(catalogIndex[0]?.id ?? '')
const track = ref(null)
let observer = null

const go = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Keep the active chip visible inside the (horizontally scrollable) tab bar,
// so on small screens you always see which collection you're in.
const centerActive = () => {
  const t = track.value
  if (!t) return
  const chip = t.querySelector(`[data-id="${active.value}"]`)
  if (!chip) return
  const target = chip.offsetLeft - t.clientWidth / 2 + chip.offsetWidth / 2
  const max = t.scrollWidth - t.clientWidth
  t.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: 'smooth' })
}

watch(active, centerActive)

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) active.value = e.target.id
      })
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )
  catalogIndex.forEach((c) => {
    const el = document.getElementById(c.id)
    if (el) observer.observe(el)
  })
})

onBeforeUnmount(() => observer && observer.disconnect())
</script>

<template>
  <nav class="catnav" aria-label="Collections">
    <div ref="track" class="catnav__track">
      <button
        v-for="c in catalogIndex"
        :key="c.id"
        type="button"
        class="catnav__chip"
        :class="{ 'is-active': active === c.id }"
        :data-id="c.id"
        @click="go(c.id)"
      >
        {{ c.name }}
        <span class="catnav__n">{{ c.count }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.catnav {
  position: sticky;
  top: var(--nav-h);
  z-index: 40;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px) saturate(1.1);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  border-bottom: 1px solid var(--line);
}

.catnav__track {
  display: flex;
  gap: 0.4rem;
  width: var(--shell);
  margin-inline: auto;
  padding-block: 0.7rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.catnav__track::-webkit-scrollbar {
  display: none;
}

.catnav__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
  font-size: var(--step--1);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--ink-soft);
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: color var(--dur-fast), background var(--dur-fast),
    border-color var(--dur-fast);
}

.catnav__chip:hover {
  color: var(--ink);
  border-color: var(--line);
}

.catnav__chip.is-active {
  background: var(--ink);
  color: var(--paper);
}

.catnav__n {
  font-size: 0.62rem;
  opacity: 0.6;
}

.catnav__chip.is-active .catnav__n {
  opacity: 0.7;
}
</style>
