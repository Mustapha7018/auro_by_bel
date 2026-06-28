<script setup>
import { ref, watch } from 'vue'
import { useCartStore, formatMoney } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { useAccountStore } from '@/store/account'

const cart = useCartStore()
const auth = useAuthStore()
const account = useAccountStore()

const placed = ref(false)

// Lock body scroll while the drawer is open; reset the confirmation each open.
watch(
  () => cart.isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) placed.value = false
  },
)

const checkout = () => {
  if (cart.isEmpty) return
  if (!auth.require(() => checkout())) return
  account.placeOrder({
    items: cart.lines.map((l) => ({
      name: l.name,
      mode: l.mode,
      length: l.length,
      qty: l.qty,
      price: l.price,
      deposit: l.deposit,
    })),
    dueToday: cart.dueToday,
    balanceLater: cart.balanceLater,
  })
  cart.clear()
  placed.value = true
}

const onKey = (e) => {
  if (e.key === 'Escape') cart.close()
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="cart.isOpen"
        class="scrim"
        @click="cart.close()"
        @keydown="onKey"
      ></div>
    </transition>

    <transition name="slide">
      <aside
        v-if="cart.isOpen"
        class="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        @keydown="onKey"
      >
        <header class="drawer__head">
          <div>
            <p class="eyebrow">Your bag</p>
            <h2 class="drawer__title">{{ cart.count }} item{{ cart.count === 1 ? '' : 's' }}</h2>
          </div>
          <button class="drawer__close" type="button" aria-label="Close bag" @click="cart.close()">
            ✕
          </button>
        </header>

        <div v-if="placed" class="drawer__empty">
          <p class="drawer__empty-mark">✓</p>
          <p>Order placed.</p>
          <p class="drawer__empty-sub">
            Thank you — it's saved to your profile, and we'll confirm by message.
          </p>
          <button class="btn btn--ghost btn--sm" type="button" @click="cart.close()">
            Continue browsing
          </button>
        </div>

        <div v-else-if="cart.isEmpty" class="drawer__empty">
          <p class="drawer__empty-mark">A · B</p>
          <p>Your bag is empty.</p>
          <p class="drawer__empty-sub">
            Add a unit or reserve a service to begin.
          </p>
          <button class="btn btn--ghost btn--sm" type="button" @click="cart.close()">
            Continue browsing
          </button>
        </div>

        <ul v-else class="drawer__list">
          <li v-for="line in cart.lines" :key="line.key" class="line">
            <div class="line__thumb">
              <img
                v-if="line.image"
                :src="line.image"
                :alt="line.name"
                @error="(e) => (e.target.style.display = 'none')"
              />
              <span class="line__thumb-mark">A · B</span>
            </div>
            <div class="line__info">
              <div class="line__top">
                <p class="line__name">{{ line.name }}</p>
                <button class="line__remove" type="button" aria-label="Remove" @click="cart.remove(line.key)">
                  Remove
                </button>
              </div>
              <p class="line__meta">
                <span class="line__mode" :class="line.mode">{{
                  line.mode === 'preorder' ? 'Pre-order' : 'Pay in full'
                }}</span>
                <span v-if="line.length"> · {{ line.length }}</span>
              </p>
              <div class="line__bottom">
                <div class="qty">
                  <button type="button" aria-label="Decrease" @click="cart.decrement(line.key)">−</button>
                  <span>{{ line.qty }}</span>
                  <button type="button" aria-label="Increase" @click="cart.increment(line.key)">+</button>
                </div>
                <p class="line__price">
                  {{ formatMoney((line.mode === 'preorder' ? line.deposit : line.price) * line.qty) }}
                  <em v-if="line.mode === 'preorder'">deposit</em>
                </p>
              </div>
            </div>
          </li>
        </ul>

        <footer v-if="!cart.isEmpty" class="drawer__foot">
          <div class="drawer__totals">
            <div class="drawer__row">
              <span>Due today</span>
              <strong>{{ formatMoney(cart.dueToday) }}</strong>
            </div>
            <div v-if="cart.balanceLater > 0" class="drawer__row drawer__row--muted">
              <span>Balance on fulfilment</span>
              <span>{{ formatMoney(cart.balanceLater) }}</span>
            </div>
          </div>
          <button class="btn btn--block" type="button" @click="checkout">
            Checkout — {{ formatMoney(cart.dueToday) }}
          </button>
          <p class="drawer__fineprint">
            Secure payment connects to your store once the backend is live.
          </p>
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

.drawer {
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

.drawer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--line);
}

.drawer__title {
  font-size: var(--step-2);
  margin-top: 0.4rem;
}

.drawer__close {
  font-size: 1rem;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  transition: background var(--dur-fast), color var(--dur-fast);
}

.drawer__close:hover {
  background: var(--ink);
  color: var(--paper);
}

.drawer__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  padding: var(--space-md);
  color: var(--ink-soft);
}

.drawer__empty-mark {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--step-3);
  color: var(--line);
}

.drawer__empty-sub {
  font-size: var(--step--1);
  color: var(--ink-faint);
  margin-bottom: var(--space-sm);
}

.drawer__list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.line {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: var(--space-sm);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--line);
}

.line__thumb {
  position: relative;
  aspect-ratio: 4 / 5;
  background: var(--paper-warm);
  overflow: hidden;
  border-radius: var(--radius-img);
  display: grid;
  place-items: center;
}

.line__thumb img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.line__thumb-mark {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--ink-faint);
  font-size: 0.72rem;
}

.line__top {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.line__name {
  font-weight: 500;
  line-height: 1.2;
}

.line__remove {
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.line__remove:hover {
  color: var(--rose);
}

.line__meta {
  font-size: var(--step--1);
  color: var(--ink-soft);
  margin-top: 0.2rem;
}

.line__mode {
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.62rem;
}

.line__mode.preorder {
  color: var(--rose);
}
.line__mode.full {
  color: var(--gold-deep);
}

.line__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
}

.qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.qty button {
  width: 1.9rem;
  height: 1.9rem;
  font-size: 1rem;
  color: var(--ink-soft);
}

.qty span {
  min-width: 1.6rem;
  text-align: center;
  font-size: var(--step--1);
}

.line__price {
  font-family: var(--font-display);
  font-size: var(--step-0);
}

.line__price em {
  font-style: normal;
  font-family: var(--font-body);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-left: 0.3rem;
}

.drawer__foot {
  padding: var(--space-md);
  border-top: 1px solid var(--line);
}

.drawer__totals {
  margin-bottom: var(--space-sm);
}

.drawer__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.3rem 0;
}

.drawer__row strong {
  font-family: var(--font-display);
  font-size: var(--step-2);
}

.drawer__row--muted {
  color: var(--ink-faint);
  font-size: var(--step--1);
}

.drawer__fineprint {
  font-size: 0.66rem;
  color: var(--ink-faint);
  text-align: center;
  margin-top: 0.7rem;
}

/* transitions */
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
