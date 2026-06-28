<script setup>
import { computed } from 'vue'
import MediaFrame from './MediaFrame.vue'

const props = defineProps({
  category: { type: Object, required: true },
  index: { type: Number, default: 0 },
  flip: { type: Boolean, default: false }, // image on the right when true
})

const emit = defineEmits(['cta'])

const eyebrow = computed(() => {
  if (props.category.mode === 'appointment') return 'In-studio · by appointment'
  return props.category.id === 'retail'
    ? 'Retail · shipped worldwide'
    : 'Made to order · shipped'
})

const ctaLabel = computed(() =>
  props.category.mode === 'shop' ? 'Shop the collection' : 'View treatments',
)
</script>

<template>
  <div class="feature shell" :class="{ 'feature--flip': flip }">
    <div class="feature__media media-hover">
      <MediaFrame
        :src="category.banner"
        :alt="`${category.name} at Aura by Bel`"
        :label="category.name"
        accent="gold"
        :tilt="0"
        ratio="5 / 4"
        radius="clamp(20px, 2.6vw, 34px)"
        :show-tag="false"
      />
    </div>

    <div class="feature__text">
      <p class="feature__eyebrow">{{ eyebrow }}</p>
      <h2 class="feature__name">{{ category.name }}</h2>
      <p v-if="category.blurb" class="feature__blurb">{{ category.blurb }}</p>
      <button class="btn" type="button" @click="emit('cta')">
        {{ ctaLabel }}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.feature {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(2rem, 6vw, 6rem);
  align-items: center;
}

.feature--flip .feature__media {
  order: 2;
}

.feature__media {
  position: relative;
}

/* soft tinted shape layered behind the image for depth */
.feature__media::before {
  content: '';
  position: absolute;
  inset: auto -0.6rem -1.1rem auto;
  width: 60%;
  height: 60%;
  border-radius: clamp(20px, 2.6vw, 34px);
  background: var(--gold-soft);
  z-index: -1;
}

.feature--flip .feature__media::before {
  inset: auto auto -1.1rem -0.6rem;
  background: var(--rose-soft);
}

.feature__eyebrow {
  font-size: var(--step--1);
  font-weight: 500;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--gold-deep);
  display: inline-flex;
  align-items: center;
  gap: 0.7em;
}

.feature__eyebrow::before {
  content: '';
  width: 1.8rem;
  height: 1px;
  background: var(--gold);
}

.feature__name {
  font-size: clamp(2.4rem, 5vw, 4.2rem);
  line-height: 1.02;
  margin-top: var(--space-sm);
}

.feature__blurb {
  color: var(--ink-soft);
  font-weight: 300;
  font-size: var(--step-1);
  line-height: 1.6;
  max-width: 42ch;
  margin: var(--space-md) 0 var(--space-lg);
}

.btn span {
  transition: transform var(--dur-fast) var(--ease);
}

.btn:hover span {
  transform: translateX(3px);
}

@media (max-width: 860px) {
  .feature {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .feature--flip .feature__media {
    order: 0;
  }
  .feature__media {
    max-width: 30rem;
  }
}
</style>
