<script setup>
import MediaFrame from './MediaFrame.vue'
import { useViewStore } from '@/store/view'
import { formatMoney } from '@/store/cart'

const props = defineProps({
  product: { type: Object, required: true },
  mode: { type: String, default: 'shop' }, // 'shop' | 'appointment'
})

const view = useViewStore()
const open = () => view.open(props.product, props.mode)
</script>

<template>
  <article class="card">
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
        <p class="card__meta">
          <span class="card__price">{{ formatMoney(product.price) }}</span>
          <span class="card__variant">{{ product.variant }}</span>
        </p>
      </div>
    </button>
  </article>
</template>

<style scoped>
.card {
  height: 100%;
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

.card__meta {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.card__price {
  font-size: var(--step-0);
  font-weight: 600;
}

.card__variant {
  font-size: var(--step--1);
  color: var(--ink-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
