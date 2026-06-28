<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)

const onScroll = () => {
  visible.value = window.scrollY > 600
}

const toTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <transition name="pop">
    <button
      v-if="visible"
      class="scrolltop"
      type="button"
      aria-label="Back to top"
      @click="toTop"
    >
      <span aria-hidden="true">↑</span>
    </button>
  </transition>
</template>

<style scoped>
.scrolltop {
  position: fixed;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1rem, 3vw, 2rem);
  z-index: 60;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font-size: 1.2rem;
  line-height: 1;
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-lift);
  transition: background var(--dur-fast), transform var(--dur-fast) var(--ease);
}

.scrolltop:hover {
  background: var(--gold-deep);
}

.scrolltop:active {
  transform: translateY(1px);
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity var(--dur-fast) var(--ease-soft),
    transform var(--dur-fast) var(--ease);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(8px);
}
</style>
