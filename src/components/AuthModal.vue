<script setup>
import { watch } from 'vue'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()

watch(
  () => auth.promptOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

const onKey = (e) => {
  if (e.key === 'Escape') auth.closePrompt()
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="auth.promptOpen" class="scrim" @click="auth.closePrompt()" @keydown="onKey"></div>
    </transition>

    <transition name="pop">
      <div
        v-if="auth.promptOpen"
        class="auth"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        @keydown="onKey"
      >
        <button class="auth__close" type="button" aria-label="Close" @click="auth.closePrompt()">✕</button>

        <p class="auth__brand">Aura <span>by</span> Bel</p>
        <h2 class="auth__title">Sign in to continue</h2>

        <button class="gbtn" type="button" @click="auth.signInWithGoogle()">
          <svg class="gbtn__g" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94L3.98 7.28C4.68 5.16 6.66 3.58 9 3.58Z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 17, 15, 0.42);
  backdrop-filter: blur(3px);
}

.auth {
  position: fixed;
  z-index: 101;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(25rem, 92vw);
  background: var(--paper);
  border-radius: 6px;
  box-shadow: var(--shadow-lift);
  padding: clamp(1.8rem, 4vw, 2.6rem);
  text-align: center;
}

.auth__close {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  color: var(--ink-soft);
  transition: background var(--dur-fast);
}
.auth__close:hover {
  background: var(--paper-warm);
}

.auth__brand {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.auth__brand span {
  font-weight: 400;
  font-style: italic;
  color: var(--ink-faint);
}

.auth__title {
  font-size: var(--step-1);
  white-space: nowrap;
  margin: 0.8rem 0 1.6rem;
}

.gbtn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.85rem 1rem;
  font-size: var(--step-0);
  font-weight: 500;
  color: var(--ink);
  transition: border-color var(--dur-fast), background var(--dur-fast),
    box-shadow var(--dur-fast);
}
.gbtn:hover {
  border-color: var(--ink-soft);
  box-shadow: var(--shadow-soft);
}
.gbtn__g {
  width: 1.15rem;
  height: 1.15rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-fast) var(--ease-soft);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity var(--dur-fast) var(--ease-soft),
    transform var(--dur-fast) var(--ease);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.96);
}
</style>
