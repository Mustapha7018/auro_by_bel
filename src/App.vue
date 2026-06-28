<script setup>
import { useReveal } from '@/composables/useReveal'
import { catalog } from '@/data/catalog'

import SiteNav from '@/components/SiteNav.vue'
import CategoryNav from '@/components/CategoryNav.vue'
import CatalogCategory from '@/components/CatalogCategory.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import ProductModal from '@/components/ProductModal.vue'
import ScrollTop from '@/components/ScrollTop.vue'
import AuthModal from '@/components/AuthModal.vue'
import ProfileDrawer from '@/components/ProfileDrawer.vue'

useReveal()
</script>

<template>
  <SiteNav />
  <CategoryNav />

  <main id="top">
    <CatalogCategory
      v-for="(category, i) in catalog"
      :key="category.id"
      :category="category"
      :index="i"
    />
  </main>

  <SiteFooter />
  <ProductModal />
  <CartDrawer />
  <ProfileDrawer />
  <AuthModal />
  <ScrollTop />
</template>
