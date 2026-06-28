<script setup>
const year = new Date().getFullYear()
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <footer class="footer">
    <div class="shell footer__inner">
      <div class="footer__lead">
        <button class="footer__brand" type="button" @click="toTop">Aura by Bel</button>
        <p class="footer__contact">
          By appointment · Tue–Sat, 9–7 ·
          <a class="link-underline" href="#">Instagram</a> ·
          <a class="link-underline" href="#">WhatsApp</a>
        </p>
      </div>
      <p class="footer__copy">© {{ year }} Aura by Bel</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--paper);
  border-top: 1px solid var(--line);
  padding-block: var(--space-lg);
}

.footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.footer__brand {
  font-size: var(--step-1);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.footer__contact {
  font-size: var(--step--1);
  color: var(--ink-soft);
  margin-top: 0.4rem;
}

.footer__copy {
  font-size: var(--step--1);
  color: var(--ink-faint);
}
</style>
