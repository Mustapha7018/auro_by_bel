<script setup>
import { computed } from 'vue'
import MediaFrame from './MediaFrame.vue'
import { useViewStore } from '@/store/view'
import { useAuthStore } from '@/store/auth'
import { useAccountStore } from '@/store/account'
import { formatMoney } from '@/store/cart'

const props = defineProps({
  product: { type: Object, required: true },
  mode: { type: String, default: 'shop' }, // 'shop' | 'appointment'
})

const view = useViewStore()
const auth = useAuthStore()
const account = useAccountStore()

const open = () => view.open(props.product, props.mode)

const onSale = computed(
  () => props.product.compareAt && props.product.compareAt > props.product.price,
)

const faved = computed(() => account.isFavorite(props.product.id))
const toggleFav = () => {
  if (!auth.require(() => account.toggleFavorite(props.product.id))) return
  account.toggleFavorite(props.product.id)
}
</script>

<template>
  <article class="card">
    <button
      class="card__fav"
      :class="{ 'is-active': faved }"
      type="button"
      :aria-pressed="faved"
      :aria-label="faved ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`"
      @click="toggleFav"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>

    <button class="card__hit" type="button" @click="open" :aria-label="`View ${product.name}`">
      <div class="card__media">
        <span v-if="product.badge" class="card__badge">{{ product.badge }}</span>
        <MediaFrame
          :src="product.image"
          :alt="product.alt"
          :label="product.name"
          accent="gold"
          :tilt="0"
          ratio="4 / 5"
          :show-tag="false"
        />
        <span class="card__view">{{ mode === 'appointment' ? 'Book' : 'View' }}</span>
      </div>

      <div class="card__info">
        <h3 class="card__name">{{ product.name }}</h3>
        <p class="card__price">
          <span v-if="onSale" class="card__price-old">{{ formatMoney(product.compareAt) }}</span>
          <span :class="{ 'card__price-sale': onSale }">{{ formatMoney(product.price) }}</span>
        </p>
      </div>
    </button>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  height: 100%;
}

.card__fav {
  position: absolute;
  z-index: 4;
  top: 0.55rem;
  right: 0.55rem;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-soft);
  transition: transform var(--dur-fast) var(--ease), background var(--dur-fast);
}

.card__fav svg {
  width: 1.05rem;
  height: 1.05rem;
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.8;
  stroke-linejoin: round;
  stroke-linecap: round;
  transition: fill var(--dur-fast), stroke var(--dur-fast);
}

.card__fav:hover {
  transform: scale(1.08);
}

.card__fav.is-active svg {
  fill: var(--rose);
  stroke: var(--rose);
}

.card__hit {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  text-align: left;
}

.card__media {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-img);
}

.card__badge {
  position: absolute;
  z-index: 3;
  top: 0.7rem;
  left: 0.7rem;
  background: var(--paper);
  color: var(--ink);
  font-size: 0.56rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.35rem 0.55rem;
  box-shadow: var(--shadow-soft);
}

/* "View" pill fades in on hover */
.card__view {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 0.85rem;
  transform: translate(-50%, 0.6rem);
  background: var(--ink);
  color: var(--paper);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-soft),
    transform var(--dur-fast) var(--ease);
}

.card__hit:hover .card__view,
.card__hit:focus-visible .card__view {
  opacity: 1;
  transform: translate(-50%, 0);
}

.card__info {
  padding-top: 0.85rem;
}

.card__name {
  font-size: var(--step-0);
  font-weight: 500;
  line-height: 1.3;
  /* keep card heights even regardless of 1- or 2-line names */
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__price {
  font-size: var(--step-0);
  font-weight: 600;
  color: var(--ink);
  margin-top: 0.25rem;
}
.card__price-old {
  font-weight: 400;
  color: var(--ink-faint);
  text-decoration: line-through;
  margin-right: 0.35rem;
}
.card__price-sale {
  color: var(--sale);
}
</style>
