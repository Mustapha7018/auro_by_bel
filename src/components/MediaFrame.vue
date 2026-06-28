<script setup>
import { ref } from 'vue'

/**
 * MediaFrame — the studio's signature device.
 *
 * Photography rests gently *tilted* inside a generous frame and rotates
 * upright (with a sweeping gold rule) when it enters focus, echoing the
 * "different angled shots" brief. When the real image is missing it falls
 * back to a refined typographic placeholder — so dropping a JPG at the
 * given path later just lights it up, no markup change.
 */
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  label: { type: String, default: '' }, // shown on the placeholder + caption tag
  accent: { type: String, default: 'gold' }, // 'gold' | 'rose'
  tilt: { type: Number, default: -3 }, // resting rotation in degrees
  ratio: { type: String, default: '4 / 5' },
  index: { type: String, default: '' },
  showTag: { type: Boolean, default: true }, // hover caption tag
  radius: { type: String, default: '' }, // override corner radius
})

const loaded = ref(false)
const failed = ref(false)
</script>

<template>
  <figure
    class="frame"
    :class="[`frame--${accent}`, { 'is-tilted': !failed }]"
    :style="{
      '--tilt': `${tilt}deg`,
      '--ratio': ratio,
      '--frame-radius': radius || 'var(--radius-img)',
    }"
  >
    <div class="frame__plate">
      <img
        v-if="src && !failed"
        class="frame__img"
        :class="{ 'is-loaded': loaded }"
        :src="src"
        :alt="alt"
        loading="lazy"
        decoding="async"
        @load="loaded = true"
        @error="failed = true"
      />

      <!-- Shown only when an image is genuinely missing or fails to load -->
      <div v-if="!src || failed" class="frame__ph" aria-hidden="true">
        <span class="frame__ph-mark">Aura by Bel</span>
        <span class="frame__ph-label">{{ label }}</span>
      </div>

      <span v-if="index" class="frame__index">{{ index }}</span>
      <span v-if="label && showTag" class="frame__tag">{{ label }}</span>
    </div>
  </figure>
</template>

<style scoped>
.frame {
  --tilt: -3deg;
  --ratio: 4 / 5;
  margin: 0;
  position: relative;
}

.frame__plate {
  position: relative;
  aspect-ratio: var(--ratio);
  overflow: hidden;
  border-radius: var(--frame-radius, var(--radius-img));
  background: linear-gradient(150deg, #f5f5f4, #e8e8e6 70%);
  box-shadow: var(--shadow-soft);
  transform: rotate(var(--tilt));
  transition: transform var(--dur) var(--ease), box-shadow var(--dur)
      var(--ease);
}

/* Straighten + lift when the surrounding card is focused/hovered.
   Driven by .frame.is-tilted being inside a hoverable parent. */
.frame.is-tilted:hover .frame__plate,
:hover > .frame.is-tilted .frame__plate,
.media-hover:hover .frame.is-tilted .frame__plate {
  transform: rotate(0deg) translateY(-6px);
  box-shadow: var(--shadow-lift);
}

.frame__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 0.8s var(--ease), transform 1.2s var(--ease);
}

.frame__img.is-loaded {
  opacity: 1;
  transform: scale(1);
}

.media-hover:hover .frame__img.is-loaded,
.frame:hover .frame__img.is-loaded {
  transform: scale(1.04);
}

/* Placeholder -------------------------------------------------- */
.frame__ph {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  color: var(--ink-faint);
  background: radial-gradient(
    120% 90% at 30% 20%,
    #f7f7f6 0%,
    #ededeb 55%,
    #e4e4e1 100%
  );
}

.frame--rose .frame__ph {
  background: radial-gradient(
    120% 90% at 30% 20%,
    #f7f7f6 0%,
    #eceae9 55%,
    #e2e0de 100%
  );
}

.frame__ph-mark {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 1rem + 1.6vw, 2.2rem);
  font-weight: 600;
  color: var(--ink);
  opacity: 0.38;
  letter-spacing: 0.04em;
}

.frame__ph-label {
  font-family: var(--font-body);
  font-size: var(--step--1);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.frame__ph-note {
  font-size: 0.66rem;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  opacity: 0.6;
}

/* Index numeral + caption tag --------------------------------- */
.frame__index {
  position: absolute;
  top: 0.85rem;
  left: 1rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--step-1);
  color: var(--paper);
  mix-blend-mode: difference;
  z-index: 2;
}

.frame__tag {
  position: absolute;
  left: 0;
  bottom: 1.1rem;
  transform: translateX(-32%);
  background: var(--paper);
  color: var(--ink);
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.5rem 0.9rem;
  box-shadow: var(--shadow-soft);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-soft),
    transform var(--dur) var(--ease);
  z-index: 2;
}

.frame__tag::before {
  content: '';
  display: inline-block;
  width: 0.9rem;
  height: 1px;
  margin-right: 0.5rem;
  vertical-align: middle;
  background: var(--gold);
}

.frame--rose .frame__tag::before {
  background: var(--rose);
}

.media-hover:hover .frame__tag,
.frame:hover .frame__tag {
  opacity: 1;
  transform: translateX(-18%);
}

@media (prefers-reduced-motion: reduce) {
  .frame__plate {
    transform: none;
  }
  .frame__img {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 640px) {
  .frame__plate {
    transform: rotate(calc(var(--tilt) * 0.5));
  }
  .frame__tag {
    transform: translateX(-12%);
    opacity: 1;
  }
}
</style>
