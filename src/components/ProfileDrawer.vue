<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useAccountStore } from '@/store/account'
import { useViewStore } from '@/store/view'
import { useCatalogStore } from '@/store/catalog'
import { formatMoney } from '@/store/cart'

const auth = useAuthStore()
const account = useAccountStore()
const view = useViewStore()
const catalog = useCatalogStore()
const productById = computed(() => catalog.productById)

const tab = ref('orders')
const tabs = [
  { id: 'orders', label: 'Orders' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'favorites', label: 'Favourites' },
]

const favoriteProducts = computed(() =>
  account.favorites.map((id) => productById.value[id]).filter(Boolean),
)

watch(
  () => auth.profileOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const openProduct = (id) => {
  const p = productById.value[id]
  if (!p) return
  auth.closeProfile()
  view.open(p, p.mode)
}

const onKey = (e) => {
  if (e.key === 'Escape') auth.closeProfile()
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="auth.profileOpen" class="scrim" @click="auth.closeProfile()" @keydown="onKey"></div>
    </transition>

    <transition name="slide">
      <aside
        v-if="auth.profileOpen && auth.user"
        class="prof"
        role="dialog"
        aria-modal="true"
        aria-label="Your profile"
        @keydown="onKey"
      >
        <header class="prof__head">
          <div class="prof__id">
            <span class="prof__avatar">{{ auth.initials }}</span>
            <div>
              <p class="prof__name">{{ auth.user.name }}</p>
              <p class="prof__email">{{ auth.user.email }}</p>
            </div>
          </div>
          <button class="prof__close" type="button" aria-label="Close" @click="auth.closeProfile()">✕</button>
        </header>

        <div class="prof__tabs">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            class="prof__tab"
            :class="{ 'is-active': tab === t.id }"
            @click="tab = t.id"
          >
            {{ t.label }}
            <span class="prof__tab-n">{{
              t.id === 'orders' ? account.orders.length
              : t.id === 'appointments' ? account.bookings.length
              : account.favorites.length
            }}</span>
          </button>
        </div>

        <div class="prof__body">
          <!-- ORDERS -->
          <template v-if="tab === 'orders'">
            <p v-if="!account.orders.length" class="prof__empty">No orders yet.</p>
            <article v-for="o in account.orders" :key="o.id" class="ord">
              <div class="ord__top">
                <span class="ord__date">{{ fmtDate(o.createdAt) }}</span>
                <span class="ord__total">{{ formatMoney(o.paid) }} paid</span>
              </div>
              <ul class="ord__items">
                <li v-for="(it, i) in o.items" :key="i">
                  <span>{{ it.qty }}× {{ it.name }}<template v-if="it.length"> · {{ it.length }}</template></span>
                  <span class="ord__tag" :class="it.mode">{{ it.mode === 'preorder' ? 'Pre-order' : 'Purchase' }}</span>
                </li>
              </ul>
              <p v-if="o.balance > 0" class="ord__balance">
                Balance on fulfilment: {{ formatMoney(o.balance) }}
              </p>
            </article>
          </template>

          <!-- APPOINTMENTS -->
          <template v-else-if="tab === 'appointments'">
            <p v-if="!account.bookings.length" class="prof__empty">No appointments yet.</p>
            <article v-for="b in account.bookings" :key="b.id" class="appt">
              <p class="appt__svc">{{ b.service }}</p>
              <p class="appt__when">{{ fmtDate(b.date) }} · {{ b.time }} · <span style="text-transform: capitalize">{{ b.status }}</span></p>
              <p class="appt__meta">{{ formatMoney(b.deposit) }} deposit on confirmation</p>
            </article>
          </template>

          <!-- FAVOURITES -->
          <template v-else>
            <p v-if="!favoriteProducts.length" class="prof__empty">No favourites saved.</p>
            <button
              v-for="p in favoriteProducts"
              :key="p.id"
              type="button"
              class="fav"
              @click="openProduct(p.id)"
            >
              <span class="fav__thumb">
                <img :src="p.image" :alt="p.name" @error="(e) => (e.target.style.visibility = 'hidden')" />
              </span>
              <span class="fav__info">
                <span class="fav__name">{{ p.name }}</span>
                <span class="fav__meta">{{ p.categoryName }} · {{ formatMoney(p.price) }}</span>
              </span>
              <span class="fav__x" @click.stop="account.toggleFavorite(p.id)" aria-label="Remove">✕</span>
            </button>
          </template>
        </div>

        <footer class="prof__foot">
          <button class="btn btn--ghost btn--block btn--sm" type="button" @click="auth.signOut()">
            Sign out
          </button>
        </footer>
      </aside>
    </transition>
  </teleport>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(20, 17, 15, 0.32);
  backdrop-filter: blur(2px);
}

.prof {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 90;
  height: 100dvh;
  width: min(28rem, 92vw);
  background: var(--paper);
  display: flex;
  flex-direction: column;
  box-shadow: -30px 0 80px -40px rgba(20, 17, 15, 0.55);
}

.prof__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--line);
}

.prof__id {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.prof__avatar {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  display: grid;
  place-items: center;
  font-size: 0.9rem;
  font-weight: 600;
}

.prof__name {
  font-weight: 600;
}
.prof__email {
  font-size: var(--step--1);
  color: var(--ink-faint);
}

.prof__close {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 0.9rem;
  transition: background var(--dur-fast), color var(--dur-fast);
}
.prof__close:hover {
  background: var(--ink);
  color: var(--paper);
}

.prof__tabs {
  display: flex;
  gap: 0.4rem;
  padding: 0.8rem var(--space-md);
  border-bottom: 1px solid var(--line);
}

.prof__tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: var(--step--1);
  padding: 0.5rem 0.4rem;
  border-radius: 999px;
  color: var(--ink-soft);
  transition: background var(--dur-fast), color var(--dur-fast);
}
.prof__tab.is-active {
  background: var(--ink);
  color: var(--paper);
}
.prof__tab-n {
  font-size: 0.62rem;
  opacity: 0.6;
}

.prof__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.prof__empty {
  color: var(--ink-faint);
  text-align: center;
  padding: var(--space-xl) 0;
}

/* orders */
.ord {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: var(--space-sm);
}
.ord__top {
  display: flex;
  justify-content: space-between;
  font-size: var(--step--1);
  margin-bottom: 0.5rem;
}
.ord__date {
  color: var(--ink-faint);
}
.ord__total {
  font-weight: 600;
}
.ord__items {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.ord__items li {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  font-size: var(--step--1);
}
.ord__tag {
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ord__tag.preorder {
  color: var(--rose);
}
.ord__tag.full {
  color: var(--gold-deep);
}
.ord__balance {
  font-size: 0.7rem;
  color: var(--ink-faint);
  margin-top: 0.5rem;
}

/* appointments */
.appt {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: var(--space-sm);
}
.appt__svc {
  font-weight: 600;
}
.appt__when {
  color: var(--gold-deep);
  margin-top: 0.2rem;
}
.appt__meta {
  font-size: 0.7rem;
  color: var(--ink-faint);
  margin-top: 0.3rem;
}

/* favourites */
.fav {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  text-align: left;
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background var(--dur-fast);
}
.fav:hover {
  background: var(--paper-warm);
}
.fav__thumb {
  width: 3rem;
  height: 3.4rem;
  border-radius: 6px;
  overflow: hidden;
  background: var(--paper-warm);
  flex: 0 0 auto;
}
.fav__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fav__info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.fav__name {
  font-weight: 500;
}
.fav__meta {
  font-size: var(--step--1);
  color: var(--ink-faint);
}
.fav__x {
  color: var(--ink-faint);
  font-size: 0.8rem;
  padding: 0.4rem;
}
.fav__x:hover {
  color: var(--rose);
}

.prof__foot {
  padding: var(--space-md);
  border-top: 1px solid var(--line);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-fast) var(--ease-soft);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform var(--dur) var(--ease);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
