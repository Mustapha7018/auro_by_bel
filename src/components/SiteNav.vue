<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCartStore } from '@/store/cart'

const cart = useCartStore()

const scrolled = ref(false)
const onScroll = () => {
  scrolled.value = window.scrollY > 24
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <header class="nav" :class="{ 'is-scrolled': scrolled }">
    <div class="nav__inner shell">
      <button class="nav__brand" type="button" @click="toTop">
        Aura <span class="nav__brand-by">by</span> Bel
      </button>

      <button
        class="nav__cart"
        type="button"
        @click="cart.open()"
        :aria-label="`Open bag, ${cart.count} item${cart.count === 1 ? '' : 's'}`"
      >
        <span>Bag</span>
        <span class="nav__cart-count" :class="{ 'is-active': cart.count > 0 }">{{
          cart.count
        }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  transition: background var(--dur-fast) var(--ease-soft),
    border-color var(--dur-fast) var(--ease-soft);
  border-bottom: 1px solid transparent;
}

.nav.is-scrolled {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(14px) saturate(1.1);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  border-bottom-color: var(--line);
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav__brand {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.nav__brand-by {
  font-weight: 400;
  font-style: italic;
  color: var(--ink-faint);
  margin: 0 0.1em;
}

.nav__cart {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--step--1);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.nav__cart-count {
  display: inline-grid;
  place-items: center;
  min-width: 1.4rem;
  height: 1.4rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 0.66rem;
  letter-spacing: 0;
  transition: background var(--dur-fast), color var(--dur-fast),
    border-color var(--dur-fast);
}

.nav__cart-count.is-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}
</style>
