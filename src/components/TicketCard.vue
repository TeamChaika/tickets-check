<template>
  <div 
    class="ticket-card"
    :class="{ 
      'ticket-full': isFull && isPaid,
      'ticket-partial': isPartial && isPaid,
      'ticket-empty': isEmpty && isPaid,
      'ticket-unpaid': !isPaid
    }"
  >
    <!-- Header -->
    <div class="ticket-header">
      <div class="ticket-name">
        {{ ticket.lastname }} {{ ticket.firtsname }}
      </div>
      <div class="ticket-status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>
    
    <!-- Info Grid -->
    <div class="ticket-info">
      <div class="info-row" v-if="ticket.phone">
        <span class="label">📱</span>
        <span class="value">{{ ticket.phone }}</span>
      </div>
      <div class="info-row" v-if="ticket.event">
        <span class="label">🎭</span>
        <span class="value">{{ ticket.event }}</span>
      </div>
      <div class="info-row" v-if="ticket.table">
        <span class="label">🪑</span>
        <span class="value">Стол {{ ticket.table }}</span>
      </div>
      <div class="info-row" v-if="ticket.pay">
        <span class="label">💳</span>
        <span class="value pay-status" :class="payStatusClass">{{ ticket.pay }}</span>
      </div>
      <div class="info-row comment" v-if="ticket.comment">
        <span class="label">💬</span>
        <span class="value">{{ ticket.comment }}</span>
      </div>
    </div>
    
    <!-- Counter -->
    <div class="ticket-counter">
      <div class="counter-label">В зале / Всего гостей</div>
      <div class="counter-value">
        <span class="current">{{ inHall }}</span>
        <span class="separator">/</span>
        <span class="total">{{ maxPersons }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="remaining" v-if="!isFull">
        Ожидается ещё: <strong>{{ remaining }}</strong> чел.
      </div>
    </div>
    
    <!-- Unpaid Warning -->
    <div v-if="!isPaid" class="ticket-unpaid-message">
      <div class="unpaid-icon">⚠️</div>
      <span>Билет не оплачен</span>
    </div>

    <!-- Actions -->
    <div v-else-if="!isFull" class="ticket-actions">
      <div class="person-selector">
        <button 
          class="btn-counter minus"
          @click="decreaseCount"
          :disabled="personsToEnter <= 1"
        >
          <span>−</span>
        </button>
        <div class="persons-display">
          <span class="persons-count">{{ personsToEnter }}</span>
          <span class="persons-label">чел.</span>
        </div>
        <button 
          class="btn-counter plus"
          @click="increaseCount"
          :disabled="personsToEnter >= remaining"
        >
          <span>+</span>
        </button>
      </div>
      
      <button 
        class="btn-checkin"
        @click="handleCheckIn"
        :disabled="loading"
      >
        <span v-if="loading" class="spinner"></span>
        <span v-else>✓ Пропустить {{ personsToEnter }} {{ personWord }}</span>
      </button>
    </div>
    
    <!-- Full Message -->
    <div v-else class="ticket-full-message">
      <div class="checkmark">✓</div>
      <span>Все гости уже в зале</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['check-in'])

const personsToEnter = ref(1)

const maxPersons = computed(() => props.ticket.len || 1)
const inHall = computed(() => props.ticket.inhall || 0)
const remaining = computed(() => Math.max(0, maxPersons.value - inHall.value))
const progressPercent = computed(() => Math.min(100, (inHall.value / maxPersons.value) * 100))

// Проверка оплаты: status = "5" или "paid"
const isPaid = computed(() => {
  const status = String(props.ticket.status || '').toLowerCase().trim()
  return status === '5' || status === 'paid'
})

const isFull = computed(() => remaining.value <= 0)
const isPartial = computed(() => inHall.value > 0 && !isFull.value)
const isEmpty = computed(() => inHall.value === 0)

// Можно ли пропустить гостей
const canCheckIn = computed(() => isPaid.value && !isFull.value)

const statusClass = computed(() => ({
  'status-full': isFull.value,
  'status-partial': isPartial.value,
  'status-empty': isEmpty.value,
  'status-unpaid': !isPaid.value
}))

const statusText = computed(() => {
  if (!isPaid.value) return 'Не оплачен'
  if (isFull.value) return 'Все в зале'
  if (isPartial.value) return `${inHall.value} из ${maxPersons.value}`
  return 'Ожидает'
})

const payStatusClass = computed(() => {
  const pay = props.ticket.pay?.toLowerCase() || ''
  if (pay.includes('оплач') || pay.includes('paid')) return 'paid'
  if (pay.includes('ожид') || pay.includes('pending')) return 'pending'
  return ''
})

const personWord = computed(() => {
  const n = personsToEnter.value
  if (n === 1) return 'гостя'
  if (n >= 2 && n <= 4) return 'гостей'
  return 'гостей'
})

function increaseCount() {
  if (personsToEnter.value < remaining.value) {
    personsToEnter.value++
  }
}

function decreaseCount() {
  if (personsToEnter.value > 1) {
    personsToEnter.value--
  }
}

function handleCheckIn() {
  emit('check-in', {
    ticketId: props.ticket.id,
    persons: personsToEnter.value
  })
}

// Reset counter when ticket changes
function resetCounter() {
  personsToEnter.value = Math.min(1, remaining.value)
}

defineExpose({ resetCounter })
</script>

<style scoped>
.ticket-card {
  background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 20px;
  color: white;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.ticket-card.ticket-full {
  border-color: rgba(16, 185, 129, 0.5);
  background: linear-gradient(145deg, #064e3b 0%, #022c22 100%);
}

.ticket-card.ticket-partial {
  border-color: rgba(245, 158, 11, 0.5);
}

.ticket-card.ticket-unpaid {
  border-color: rgba(239, 68, 68, 0.5);
  background: linear-gradient(145deg, #450a0a 0%, #1c0a0a 100%);
}

/* Header */
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ticket-name {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
  margin-right: 12px;
}

.ticket-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-empty { 
  background: rgba(107, 114, 128, 0.3);
  color: #d1d5db;
}

.status-partial { 
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.status-full { 
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-unpaid {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Info */
.ticket-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 0.9rem;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row .label {
  font-size: 1rem;
  width: 24px;
  text-align: center;
}

.info-row .value {
  color: #e2e8f0;
  flex: 1;
}

.info-row.comment .value {
  color: #94a3b8;
  font-style: italic;
}

.pay-status.paid {
  color: #34d399;
}

.pay-status.pending {
  color: #fbbf24;
}

/* Counter */
.ticket-counter {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  margin-bottom: 20px;
}

.counter-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.counter-value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 12px;
}

.counter-value .current { 
  color: #10b981;
}

.counter-value .separator { 
  color: #4b5563;
  margin: 0 4px;
}

.counter-value .total { 
  color: #f1f5f9;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.remaining {
  color: #94a3b8;
  font-size: 0.9rem;
}

.remaining strong {
  color: #f1f5f9;
}

/* Actions */
.ticket-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.person-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.btn-counter {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #6366f1;
  background: transparent;
  color: #6366f1;
  font-size: 1.75rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-counter:hover:not(:disabled) {
  background: #6366f1;
  color: white;
  transform: scale(1.05);
}

.btn-counter:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-counter:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.persons-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.persons-count {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: #f1f5f9;
}

.persons-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-checkin {
  width: 100%;
  padding: 18px 24px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-checkin:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
}

.btn-checkin:active:not(:disabled) {
  transform: translateY(0);
}

.btn-checkin:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Full Message */
.ticket-full-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #34d399;
}

.ticket-full-message .checkmark {
  width: 32px;
  height: 32px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

/* Unpaid ticket message */
.ticket-unpaid-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.ticket-unpaid-message .unpaid-icon {
  font-size: 1.5rem;
}
</style>

