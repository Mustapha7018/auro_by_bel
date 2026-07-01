<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')

watch(
  () => auth.promptOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      name.value = ''
      email.value = ''
      password.value = ''
    }
  },
)

const submit = async () => {
  if (auth.mode === 'register') {
    await auth.register(name.value.trim(), email.value.trim(), password.value)
  } else {
    await auth.login(email.value.trim(), password.value)
  }
}

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
        <h2 class="auth__title">{{ auth.mode === 'register' ? 'Create your account' : 'Sign in to continue' }}</h2>

        <form class="auth__form" @submit.prevent="submit">
          <label v-if="auth.mode === 'register'" class="auth__field">
            <span>Name</span>
            <input v-model="name" type="text" required autocomplete="name" placeholder="First & last" />
          </label>
          <label class="auth__field">
            <span>Email</span>
            <input v-model="email" type="email" required autocomplete="email" placeholder="you@email.com" />
          </label>
          <label class="auth__field">
            <span>Password</span>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              :autocomplete="auth.mode === 'register' ? 'new-password' : 'current-password'"
              placeholder="••••••••"
            />
          </label>

          <p v-if="auth.error" class="auth__error">{{ auth.error }}</p>

          <button class="btn btn--block" type="submit" :disabled="auth.busy">
            {{ auth.busy ? 'Please wait…' : auth.mode === 'register' ? 'Create account' : 'Sign in' }}
          </button>
        </form>

        <p class="auth__switch">
          <template v-if="auth.mode === 'register'">
            Already have an account?
            <button type="button" @click="auth.setMode('login')">Sign in</button>
          </template>
          <template v-else>
            New here?
            <button type="button" @click="auth.setMode('register')">Create an account</button>
          </template>
        </p>
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
  margin: 0.8rem 0 1.4rem;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  text-align: left;
}

.auth__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.auth__field span {
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-faint);
}
.auth__field input {
  font-family: var(--font-body);
  font-size: var(--step-0);
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.7rem 0.85rem;
  transition: border-color var(--dur-fast);
}
.auth__field input:focus {
  outline: none;
  border-color: var(--gold);
}

.auth__error {
  color: var(--rose);
  font-size: var(--step--1);
  margin: -0.2rem 0 0.2rem;
}

.auth__form .btn {
  margin-top: 0.4rem;
}

.auth__switch {
  font-size: var(--step--1);
  color: var(--ink-soft);
  margin-top: 1.1rem;
}
.auth__switch button {
  color: var(--ink);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
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
