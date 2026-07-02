<script setup>
import { onMounted } from 'vue'
import { useCatalogStore } from '@/store/catalog'
import { useAvailabilityStore } from '@/store/availability'
import { useAuthStore } from '@/store/auth'
import { useGalleryStore } from '@/store/gallery'

import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import ProductModal from '@/components/ProductModal.vue'
import ScrollTop from '@/components/ScrollTop.vue'
import AuthModal from '@/components/AuthModal.vue'
import ProfileDrawer from '@/components/ProfileDrawer.vue'

const catalog = useCatalogStore()
const availability = useAvailabilityStore()
const auth = useAuthStore()
const gallery = useGalleryStore()

onMounted(() => {
  catalog.load()
  availability.load()
  auth.init()
  gallery.load()
})
</script>

<template>
  <SiteNav />

  <RouterView />

  <SiteFooter />

  <ProductModal />
  <CartDrawer />
  <ProfileDrawer />
  <AuthModal />
  <ScrollTop />
</template>
