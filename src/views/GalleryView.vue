<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useGalleryStore } from '@/store/gallery'

const gallery = useGalleryStore()

onMounted(() => {
  gallery.load()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Give the grid a bento rhythm so the wall never reads as a plain grid.
const tileClass = (i) => {
  const p = i % 7
  if (p === 0) return 'tile--lg'
  if (p === 2) return 'tile--tall'
  if (p === 5) return 'tile--wide'
  return ''
}

// --- preview lightbox ---
const activeIndex = ref(-1)
const activeItem = computed(() => gallery.items[activeIndex.value] || null)

const open = (i) => {
  activeIndex.value = i
  document.body.style.overflow = 'hidden'
}
const close = () => {
  activeIndex.value = -1
  document.body.style.overflow = ''
}
const step = (dir) => {
  const n = gallery.items.length
  if (!n) return
  activeIndex.value = (activeIndex.value + dir + n) % n
}
const onKey = (e) => {
  if (activeIndex.value < 0) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
</script>

<template>
  <main id="top" class="gallery">
    <header class="gallery__head shell">
      <p class="gallery__eyebrow">Gallery</p>
      <h1 class="gallery__title">View my creations</h1>
      <p class="gallery__sub">A look at recent work from the studio.</p>
    </header>

    <div v-if="gallery.hasItems" class="gallery__grid shell">
      <button
        v-for="(item, i) in gallery.items"
        :key="item.id"
        type="button"
        class="tile"
        :class="tileClass(i)"
        @click="open(i)"
      >
        <video
          v-if="item.kind === 'video'"
          :src="item.url"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
        />
        <img v-else :src="item.url" alt="" loading="lazy" />
      </button>
    </div>

    <p v-else-if="gallery.loaded" class="gallery__empty shell">
      New work is on the way — check back soon.
    </p>
  </main>

  <Teleport to="body">
    <Transition name="lb">
      <div v-if="activeItem" class="lb" @click.self="close">
        <button class="lb__close" aria-label="Close" @click="close">✕</button>
        <button v-if="gallery.items.length > 1" class="lb__nav lb__nav--prev" aria-label="Previous" @click.stop="step(-1)">‹</button>
        <button v-if="gallery.items.length > 1" class="lb__nav lb__nav--next" aria-label="Next" @click.stop="step(1)">›</button>

        <div class="lb__stage">
          <video
            v-if="activeItem.kind === 'video'"
            :src="activeItem.url"
            controls
            autoplay
            playsinline
          />
          <img v-else :src="activeItem.url" alt="" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.gallery {
  padding-top: calc(var(--nav-h) + clamp(0.25rem, 1vw, 0.6rem));
  padding-bottom: clamp(3rem, 8vw, 5rem);
  min-height: 70vh;
}

.gallery__head {
  text-align: center;
  margin-bottom: clamp(2.6rem, 5vw, 3.8rem);
}
.gallery__eyebrow {
  font-size: var(--step--1);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-deep);
}
.gallery__title {
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 600;
  margin-top: 0.3rem;
}
.gallery__sub {
  margin-top: 0.4rem;
  color: var(--ink-faint);
  font-size: var(--step--1);
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: clamp(150px, 15vw, 230px);
  grid-auto-flow: dense;
  gap: 0.7rem;
}

.tile {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius, 14px);
  background: var(--paper-warm, #f3ecdd);
  cursor: pointer;
}
.tile img,
.tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s var(--ease, ease);
}
.tile:hover img,
.tile:hover video {
  transform: scale(1.04);
}
.tile--lg {
  grid-column: span 2;
  grid-row: span 2;
}
.tile--wide {
  grid-column: span 2;
}
.tile--tall {
  grid-row: span 2;
}

.gallery__empty {
  text-align: center;
  color: var(--ink-faint);
  font-size: var(--step-0);
  padding: 2rem 0;
}

/* --- lightbox --- */
.lb {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 3rem);
  background: rgba(20, 16, 14, 0.92);
  backdrop-filter: blur(6px);
}
.lb__stage {
  max-width: min(1100px, 92vw);
  max-height: 88vh;
}
.lb__stage img,
.lb__stage video {
  max-width: min(1100px, 92vw);
  max-height: 88vh;
  width: auto;
  height: auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}
.lb__close {
  position: absolute;
  top: clamp(0.8rem, 2vw, 1.4rem);
  right: clamp(0.8rem, 2vw, 1.4rem);
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 1rem;
  display: grid;
  place-items: center;
  transition: background 0.15s var(--ease);
}
.lb__close:hover {
  background: rgba(255, 255, 255, 0.24);
}
.lb__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 1.6rem;
  line-height: 1;
  display: grid;
  place-items: center;
  transition: background 0.15s var(--ease);
}
.lb__nav:hover {
  background: rgba(255, 255, 255, 0.24);
}
.lb__nav--prev {
  left: clamp(0.5rem, 2vw, 1.4rem);
}
.lb__nav--next {
  right: clamp(0.5rem, 2vw, 1.4rem);
}

.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.22s var(--ease, ease);
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .gallery__grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 44vw;
    gap: 0.5rem;
  }
  .tile--lg {
    grid-column: span 2;
    grid-row: span 2;
  }
  .tile--wide {
    grid-column: span 2;
    grid-row: span 1;
  }
  .tile--tall {
    grid-column: span 1;
    grid-row: span 2;
  }
  .lb__nav {
    width: 2.4rem;
    height: 2.4rem;
    font-size: 1.3rem;
  }
}
</style>
