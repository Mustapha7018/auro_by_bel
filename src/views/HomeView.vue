<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useReveal } from '@/composables/useReveal'
import { useCatalogStore } from '@/store/catalog'

import CategoryNav from '@/components/CategoryNav.vue'
import CatalogCategory from '@/components/CatalogCategory.vue'

const catalog = useCatalogStore()
const { scan } = useReveal()

const runScan = async () => {
  await nextTick()
  scan()
}

// reveal collections once they've rendered — on first load and on every return
// to the home page (elements remount without the is-visible class)
onMounted(() => {
  if (catalog.loaded) runScan()
})
watch(
  () => catalog.loaded,
  (ok) => {
    if (ok) runScan()
  },
)
</script>

<template>
  <template v-if="catalog.loaded">
    <CategoryNav />
    <main id="top">
      <CatalogCategory
        v-for="(category, i) in catalog.categories"
        :key="category.id"
        :category="category"
        :index="i"
      />
    </main>
  </template>

  <div v-else class="boot" id="top">
    <div class="boot__inner">
      <p class="boot__mark">Aura <span>by</span> Bel</p>
      <p v-if="catalog.error" class="boot__msg">
        {{ catalog.error }}
        <button class="link-underline" type="button" @click="catalog.reload()">Try again</button>
      </p>
      <p v-else class="boot__msg boot__msg--loading">Preparing the studio…</p>
    </div>
  </div>
</template>

<style scoped>
.boot {
  min-height: 80vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}
.boot__inner {
  text-align: center;
}
.boot__mark {
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 600;
}
.boot__mark span {
  font-style: italic;
  font-weight: 400;
  color: var(--ink-faint);
}
.boot__msg {
  margin-top: 0.8rem;
  color: var(--ink-faint);
  font-size: var(--step-0);
}
.boot__msg--loading {
  animation: pulse 1.4s var(--ease) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
