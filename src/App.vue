<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useReveal } from '@/composables/useReveal'
import { useCatalogStore } from '@/store/catalog'
import { useAvailabilityStore } from '@/store/availability'
import { useAuthStore } from '@/store/auth'

import SiteNav from '@/components/SiteNav.vue'
import CategoryNav from '@/components/CategoryNav.vue'
import CatalogCategory from '@/components/CatalogCategory.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import ProductModal from '@/components/ProductModal.vue'
import ScrollTop from '@/components/ScrollTop.vue'
import AuthModal from '@/components/AuthModal.vue'
import ProfileDrawer from '@/components/ProfileDrawer.vue'

const catalog = useCatalogStore()
const availability = useAvailabilityStore()
const auth = useAuthStore()
const { scan } = useReveal()

onMounted(() => {
  catalog.load()
  availability.load()
  auth.init()
})

// reveal the collections once they've rendered from the API
watch(
  () => catalog.loaded,
  async (ok) => {
    if (ok) {
      await nextTick()
      scan()
    }
  },
)
</script>

<template>
  <SiteNav />

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
    <SiteFooter />
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

  <ProductModal />
  <CartDrawer />
  <ProfileDrawer />
  <AuthModal />
  <ScrollTop />
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
