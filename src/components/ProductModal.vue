<script setup>
import { ref, watch, computed } from 'vue'
import BookingCalendar from './BookingCalendar.vue'
import { useViewStore } from '@/store/view'
import { useCartStore, formatMoney } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { useAccountStore } from '@/store/account'
import { useAvailabilityStore } from '@/store/availability'
import { api } from '@/lib/api'
import { isoDate, formatDate, firstBookableDate } from '@/lib/dates'

const view = useViewStore()
const cart = useCartStore()
const auth = useAuthStore()
const account = useAccountStore()
const availability = useAvailabilityStore()

const isAppointment = computed(() => view.mode === 'appointment')

/* ---- shop state ------------------------------------------------ */
const option = ref(null)
const qty = ref(1)
const imgLoaded = ref(false)
const imgFailed = ref(false)
// A shop product is either buyable now or pre-order — never both.
const isPreorder = computed(() => view.product?.status === 'preorder')

/* ---- appointment state ----------------------------------------- */
const apptDate = ref(null) // a Date chosen in the calendar
const slots = ref([])
const slotsLoading = ref(false)
const selectedTime = ref(null)
const requested = ref(false)
const bookingBusy = ref(false)
const bookingError = ref('')
const phone = ref('')
const needPhone = computed(() => !auth.user?.phone)

const selectedDate = computed(() => (apptDate.value ? formatDate(apptDate.value) : null))
const hasOpenings = computed(() => slots.value.some((s) => s.available))

async function loadSlots() {
  if (!apptDate.value) {
    slots.value = []
    return
  }
  slotsLoading.value = true
  try {
    slots.value = await availability.slots(isoDate(apptDate.value))
  } catch {
    slots.value = []
  } finally {
    slotsLoading.value = false
  }
}

// Reset everything whenever a new product opens.
watch(
  () => view.product,
  (p) => {
    option.value = p?.options?.values?.[0] ?? null
    qty.value = 1
    imgLoaded.value = false
    imgFailed.value = false
    requested.value = false
    selectedTime.value = null
    bookingError.value = ''
    phone.value = auth.user?.phone || ''
    slots.value = []
    if (p && isAppointment.value) {
      apptDate.value = firstBookableDate(availability.workingDays, availability.blockedDates)
      loadSlots()
    } else {
      apptDate.value = null
    }
    document.body.style.overflow = p ? 'hidden' : ''
  },
)

const onDate = (d) => {
  apptDate.value = d
  selectedTime.value = null
  loadSlots()
}

const dec = () => {
  if (qty.value > 1) qty.value -= 1
}
const inc = () => {
  if (qty.value < 20) qty.value += 1
}

const addTo = (mode) => {
  if (!auth.require(() => addTo(mode))) return
  cart.add({ product: view.product, mode, length: option.value, qty: qty.value })
  view.close() // cart drawer opens itself
}

const confirmBooking = async () => {
  if (!selectedTime.value || bookingBusy.value) return
  if (!auth.require(() => confirmBooking())) return
  if (needPhone.value && !phone.value.trim()) {
    bookingError.value = 'Add a phone number so we can confirm.'
    return
  }
  bookingBusy.value = true
  bookingError.value = ''
  try {
    await api.createBooking({
      product_id: view.product.id,
      service: view.product.name,
      date: isoDate(apptDate.value),
      time: selectedTime.value,
      deposit: view.product.deposit,
      phone: phone.value.trim() || undefined,
    })
    if (phone.value.trim() && auth.user) auth.user.phone = phone.value.trim()
    account.refreshBookings()
    requested.value = true
  } catch (e) {
    bookingError.value = e.message || 'Could not book that slot. Try another time.'
    loadSlots() // someone may have taken it
  } finally {
    bookingBusy.value = false
  }
}

const onKey = (e) => {
  if (e.key === 'Escape') view.close()
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="view.isOpen" class="scrim" @click="view.close()" @keydown="onKey"></div>
    </transition>

    <transition name="pop">
      <div
        v-if="view.isOpen"
        class="modal"
        :class="{ 'modal--appt': isAppointment }"
        role="dialog"
        aria-modal="true"
        :aria-label="view.product?.name"
        @keydown="onKey"
      >
        <button class="modal__close" type="button" aria-label="Close" @click="view.close()">✕</button>

        <!-- ============ SHOP: image + buy / pre-order ============ -->
        <template v-if="!isAppointment">
          <div class="modal__media">
            <span v-if="view.product.badge" class="modal__badge">{{ view.product.badge }}</span>
            <img
              v-if="view.product.image && !imgFailed"
              class="modal__img"
              :class="{ 'is-loaded': imgLoaded }"
              :src="view.product.image"
              :alt="view.product.alt"
              @load="imgLoaded = true"
              @error="imgFailed = true"
            />
            <div v-if="!view.product.image || imgFailed" class="modal__ph" aria-hidden="true">
              <span>Aura by Bel</span>
            </div>
          </div>

          <div class="modal__body">
            <p class="modal__variant">{{ view.product.variant }}</p>
            <h2 class="modal__name">{{ view.product.name }}</h2>
            <p class="modal__price">{{ formatMoney(view.product.price) }}</p>
            <p class="modal__desc">{{ view.product.alt }}</p>

            <div v-if="view.product.options" class="modal__field">
              <span class="modal__label">{{ view.product.options.label }}</span>
              <div class="modal__opts">
                <button
                  v-for="v in view.product.options.values"
                  :key="v"
                  type="button"
                  class="modal__opt"
                  :class="{ 'is-active': option === v }"
                  :aria-pressed="option === v"
                  @click="option = v"
                >
                  {{ v }}
                </button>
              </div>
            </div>

            <div class="modal__field">
              <span class="modal__label">Quantity</span>
              <div class="qty">
                <button type="button" aria-label="Decrease quantity" @click="dec" :disabled="qty <= 1">−</button>
                <span>{{ qty }}</span>
                <button type="button" aria-label="Increase quantity" @click="inc">+</button>
              </div>
            </div>

            <div class="modal__actions">
              <button v-if="isPreorder" class="btn btn--block" type="button" @click="addTo('preorder')">
                Pre-order with {{ formatMoney(view.product.deposit * qty) }} deposit
              </button>
              <button v-else class="btn btn--block" type="button" @click="addTo('full')">
                Add to bag · {{ formatMoney(view.product.price * qty) }}
              </button>
            </div>

            <p v-if="isPreorder" class="modal__note">
              Made to order — a one-third deposit secures your place, balance due on completion.
            </p>
          </div>
        </template>

        <!-- ============ APPOINTMENT: pick date + time ============ -->
        <div v-else class="appt">
          <header class="appt__head">
            <div class="appt__thumb">
              <img v-if="view.product.image" :src="view.product.image" :alt="view.product.alt" />
            </div>
            <div class="appt__intro">
              <p class="modal__variant">{{ view.product.variant }}</p>
              <h2 class="modal__name">{{ view.product.name }}</h2>
              <p class="modal__price">
                From {{ formatMoney(view.product.price) }}
                <span class="modal__deposit">· {{ formatMoney(view.product.deposit) }} deposit</span>
              </p>
            </div>
          </header>

          <div v-if="!requested" class="appt__cols">
            <div class="appt__col">
              <span class="modal__label">Choose a date</span>
              <BookingCalendar :model-value="apptDate" @update:model-value="onDate" />
            </div>

            <div class="appt__col appt__col--time">
              <span class="modal__label">
                Available times<template v-if="selectedDate"> · {{ selectedDate.full }}</template>
              </span>
              <div class="times-wrap">
                <p v-if="slotsLoading" class="modal__soldout">Loading times…</p>
                <div v-else-if="hasOpenings" class="times">
                  <button
                    v-for="s in slots"
                    :key="s.time"
                    type="button"
                    class="time"
                    :class="{ 'is-active': selectedTime === s.time }"
                    :disabled="!s.available"
                    @click="selectedTime = s.time"
                  >
                    {{ s.time }}
                  </button>
                </div>
                <p v-else class="modal__soldout">Fully booked this day — try another date.</p>
              </div>

              <div v-if="needPhone" class="appt__phone">
                <span class="modal__label">Phone <em class="req">required</em></span>
                <input
                  v-model="phone"
                  type="tel"
                  class="appt__phone-input"
                  :class="{ 'is-invalid': bookingError && !phone.trim() }"
                  required
                  placeholder="So Bel can confirm your appointment"
                />
              </div>

              <button
                class="btn btn--block appt__cta"
                type="button"
                :disabled="!selectedTime || bookingBusy"
                @click="confirmBooking"
              >
                {{ bookingBusy ? 'Requesting…' : 'Request appointment' }}
              </button>
              <p v-if="bookingError" class="modal__soldout" style="color: var(--rose)">{{ bookingError }}</p>
              <p class="modal__note">Confirmed by message · no payment now.</p>
            </div>
          </div>

          <!-- confirmation -->
          <div v-else class="booked">
            <p class="booked__tick" aria-hidden="true">✓</p>
            <h3 class="booked__h">Appointment requested</h3>
            <p class="booked__detail">
              {{ view.product.name }}<br />
              <strong>{{ selectedDate?.full }} · {{ selectedTime }}</strong>
            </p>
            <p class="booked__note">
              Bel will confirm your slot shortly. A {{ formatMoney(view.product.deposit) }}
              deposit secures it once confirmed.
            </p>
            <button class="btn btn--ghost" type="button" @click="view.close()">Done</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 95;
  background: rgba(20, 17, 15, 0.4);
  backdrop-filter: blur(3px);
}

.modal {
  position: fixed;
  z-index: 96;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(56rem, 94vw);
  max-height: 92dvh;
  overflow-y: auto;
  background: var(--paper);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lift);
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.modal__close {
  position: absolute;
  z-index: 4;
  top: 0.85rem;
  right: 0.85rem;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 999px;
  background: var(--paper);
  box-shadow: var(--shadow-soft);
  font-size: 0.95rem;
  transition: background var(--dur-fast), color var(--dur-fast);
}

.modal__close:hover {
  background: var(--ink);
  color: var(--paper);
}

.modal__media {
  position: relative;
  overflow: hidden;
  min-height: 26rem;
  background: linear-gradient(150deg, #f5f5f4, #e8e8e6 70%);
}

.modal__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s var(--ease);
}

.modal__img.is-loaded {
  opacity: 1;
}

.modal__ph {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--ink-faint);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.modal__badge {
  position: absolute;
  z-index: 3;
  top: 0.9rem;
  left: 0.9rem;
  background: var(--paper);
  color: var(--ink);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.4rem 0.6rem;
  box-shadow: var(--shadow-soft);
}

.modal__body {
  padding: clamp(1.5rem, 3vw, 2.6rem);
  display: flex;
  flex-direction: column;
}

.modal__variant {
  font-size: var(--step--1);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold-deep);
}

.modal__name {
  font-size: clamp(1.35rem, 1.1rem + 1.1vw, 1.85rem);
  line-height: 1.12;
  margin-top: 0.5rem;
}

.modal__price {
  font-size: var(--step-1);
  font-weight: 600;
  margin-top: 0.5rem;
}

.modal__deposit {
  font-size: var(--step--1);
  font-weight: 400;
  color: var(--ink-faint);
}

.modal__desc {
  color: var(--ink-soft);
  font-weight: 300;
  font-size: var(--step-0);
  margin-top: var(--space-sm);
  line-height: 1.6;
}

.modal__field {
  margin-top: var(--space-md);
}

/* ========== appointment layout (no big image) ========== */
.modal--appt {
  display: block;
  grid-template-columns: none;
  width: min(46rem, 94vw);
  padding: clamp(1.4rem, 3vw, 2.4rem);
}

.appt__head {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-right: 2rem; /* clear the close button */
  margin-bottom: clamp(1.2rem, 2.5vw, 1.6rem);
}

.appt__thumb {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(150deg, #f5f5f4, #e8e8e6 70%);
}

.appt__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.appt__intro .modal__name {
  font-size: clamp(1.25rem, 1.1rem + 0.8vw, 1.6rem);
}

.appt__intro .modal__price {
  margin-top: 0.3rem;
}

.appt__cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(1.3rem, 3vw, 2.2rem);
  align-items: stretch;
}

.appt__col--time {
  display: flex;
  flex-direction: column;
}

.times-wrap {
  min-height: 5.2rem; /* reserve space so height doesn't jump per date */
}

.appt__cta {
  margin-top: auto;
}

.appt__phone {
  margin: 0.9rem 0 0.6rem;
}
.appt__phone-input {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--step-0);
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.6rem 0.75rem;
  transition: border-color var(--dur-fast);
}
.appt__phone-input:focus {
  outline: none;
  border-color: var(--gold);
}
.appt__phone-input.is-invalid {
  border-color: var(--rose);
}
.req {
  font-style: normal;
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  color: var(--rose);
  margin-left: 0.4rem;
}

.appt__col--time .modal__note {
  margin-top: 0.7rem;
}

@media (max-width: 620px) {
  .appt__cols {
    grid-template-columns: 1fr;
  }
}

/* ---- appointment: time grid ---- */
.times {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3.3rem, 1fr));
  gap: 0.4rem;
}

.time {
  font-size: 0.8rem;
  line-height: 1;
  white-space: nowrap;
  padding: 0.4rem 0.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: border-color var(--dur-fast), background var(--dur-fast),
    color var(--dur-fast);
}

.time:hover:not(:disabled) {
  border-color: var(--ink);
}

.time.is-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

.time:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  text-decoration: line-through;
}

.modal__soldout {
  font-size: var(--step--1);
  color: var(--ink-faint);
}

/* ---- appointment confirmation ---- */
.booked {
  margin-top: var(--space-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.booked__tick {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font-size: 1.3rem;
}

.booked__h {
  font-size: var(--step-1);
}

.booked__detail {
  color: var(--ink-soft);
  line-height: 1.5;
}

.booked__detail strong {
  color: var(--ink);
}

.booked__note {
  font-size: var(--step--1);
  color: var(--ink-faint);
  max-width: 32ch;
  margin-bottom: 0.4rem;
}

.booked .btn {
  max-width: 14rem;
}

.modal__label {
  display: block;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-bottom: 0.6rem;
}

.modal__opts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.modal__opt {
  font-size: var(--step--1);
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: border-color var(--dur-fast), background var(--dur-fast),
    color var(--dur-fast);
}

.modal__opt.is-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

.qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.qty button {
  width: 2.4rem;
  height: 2.4rem;
  font-size: 1.1rem;
  color: var(--ink-soft);
}

.qty button:disabled {
  opacity: 0.3;
}

.qty span {
  min-width: 2.4rem;
  text-align: center;
  font-weight: 500;
}

.modal__actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: var(--space-lg);
}

.modal__note {
  font-size: 0.7rem;
  color: var(--ink-faint);
  margin-top: var(--space-sm);
  line-height: 1.5;
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
  transform: translate(-50%, -48%) scale(0.97);
}

@media (max-width: 720px) {
  .modal {
    grid-template-columns: 1fr;
    width: 94vw;
  }
  .modal__media {
    min-height: 0;
    aspect-ratio: 4 / 3;
  }
}
</style>
