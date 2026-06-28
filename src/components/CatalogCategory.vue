<script setup>
import { ref } from 'vue'
import ProductCard from './ProductCard.vue'
import CategoryFeature from './CategoryFeature.vue'

defineProps({
  category: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const track = ref(null)

const scrollRail = (dir) => {
  const el = track.value
  if (!el) return
  const card = el.querySelector('.rail__item')
  const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8
  el.scrollBy({ left: dir * step * 2, behavior: 'smooth' })
}

const toRail = () => {
  track.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <section :id="category.id" class="cat reveal">
    <CategoryFeature
      :category="category"
      :index="index"
      :flip="index % 2 === 1"
      @cta="toRail"
    />

    <div class="rail-block">
      <div class="rail-block__head shell">
        <h3 class="rail-block__title">All styles</h3>
        <div class="rail-block__arrows">
          <button type="button" aria-label="Scroll left" @click="scrollRail(-1)">‹</button>
          <button type="button" aria-label="Scroll right" @click="scrollRail(1)">›</button>
        </div>
      </div>

      <div ref="track" class="rail shell">
        <div v-for="p in category.products" :key="p.id" class="rail__item">
          <ProductCard :product="p" :mode="category.mode" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cat {
  padding-top: clamp(3rem, 6vw, 5.5rem);
  padding-bottom: clamp(3rem, 6vw, 5rem);
  scroll-margin-top: calc(var(--nav-h) + 1rem);
}

.rail-block {
  margin-top: clamp(2.5rem, 5vw, 4rem);
}

.rail-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.rail-block__title {
  font-size: var(--step-1);
  font-weight: 500;
  color: var(--ink-soft);
}

/* clear, always-visible carousel controls */
.rail-block__arrows {
  display: flex;
  gap: 0.6rem;
  flex: 0 0 auto;
}

.rail-block__arrows button {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: 1.5px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-size: 1.45rem;
  line-height: 1;
  display: grid;
  place-items: center;
  transition: background var(--dur-fast), color var(--dur-fast),
    transform var(--dur-fast) var(--ease);
}

.rail-block__arrows button:hover {
  background: var(--ink);
  color: var(--paper);
}

.rail-block__arrows button:active {
  transform: scale(0.94);
}

.rail {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
}

.rail::-webkit-scrollbar {
  display: none;
}

.rail__item {
  flex: 0 0 auto;
  width: clamp(13rem, 22vw, 15.5rem);
  scroll-snap-align: start;
}

@media (max-width: 560px) {
  .rail__item {
    width: 72vw;
  }
}
</style>
