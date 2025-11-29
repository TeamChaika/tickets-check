<template>
  <div class="ticket-view">
    <div class="ticket-bg">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка билета...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">😕</div>
      <h2>Билет не найден</h2>
      <p>{{ error }}</p>
    </div>

    <!-- Ticket -->
    <div v-else-if="ticket" class="ticket-container">
      <div class="ticket-paper" :class="{ 'ticket-paid': isPaid, 'ticket-unpaid': !isPaid }">
        <!-- Header -->
        <div class="ticket-header">
          <div class="event-badge">🎭 {{ ticket.event || 'Мероприятие' }}</div>
          <div class="ticket-status" :class="isPaid ? 'paid' : 'unpaid'">
            {{ isPaid ? '✓ Оплачен' : '⚠ Не оплачен' }}
          </div>
        </div>

        <!-- QR Code -->
        <div class="qr-section">
          <div class="qr-code">
            <canvas ref="qrCanvas"></canvas>
          </div>
          <p class="qr-hint">Покажите QR-код на входе</p>
        </div>

        <!-- Divider -->
        <div class="ticket-divider">
          <div class="divider-circle left"></div>
          <div class="divider-line"></div>
          <div class="divider-circle right"></div>
        </div>

        <!-- Info -->
        <div class="ticket-info">
          <div class="info-row main">
            <span class="label">👤 Гость</span>
            <span class="value">{{ ticket.lastname }} {{ ticket.firtsname }}</span>
          </div>
          
          <div class="info-row" v-if="ticket.phone">
            <span class="label">📱 Телефон</span>
            <span class="value">{{ formatPhone(ticket.phone) }}</span>
          </div>

          <div class="info-row">
            <span class="label">🎫 Количество</span>
            <span class="value">{{ ticket.len || 1 }} {{ personWord(ticket.len || 1) }}</span>
          </div>

          <div class="info-row" v-if="ticket.table">
            <span class="label">🪑 Стол</span>
            <span class="value">{{ ticket.table }}</span>
          </div>

          <div class="info-row" v-if="ticket.comment">
            <span class="label">💬 Комментарий</span>
            <span class="value comment">{{ ticket.comment }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="ticket-footer">
          <div class="ticket-id">
            ID: {{ ticketId.slice(0, 8) }}...
          </div>
          <div class="chaika-logo">
            🎪 Chaika Team
          </div>
        </div>
      </div>

      <!-- Add to Wallet hint -->
      <div class="wallet-hint">
        <p>📲 Сделайте скриншот или добавьте страницу в закладки</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../composables/useSupabase'
import QRCode from 'qrcode'

const route = useRoute()

const ticket = ref(null)
const loading = ref(true)
const error = ref(null)
const qrCanvas = ref(null)

const ticketId = computed(() => route.params.uuid || '')

const isPaid = computed(() => {
  if (!ticket.value) return false
  const status = String(ticket.value.status || '').toLowerCase().trim()
  return status === '5' || status === 'paid'
})

function personWord(n) {
  if (n === 1) return 'гость'
  if (n >= 2 && n <= 4) return 'гостя'
  return 'гостей'
}

function formatPhone(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`
  }
  return phone
}

async function loadTicket() {
  loading.value = true
  error.value = null

  try {
    const uuid = ticketId.value
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(uuid)) {
      throw new Error('Неверный формат билета')
    }

    const { data, error: err } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', uuid)
      .single()

    if (err) throw err
    if (!data) throw new Error('Билет не найден')

    ticket.value = data
    
    // Generate QR code after ticket loads
    await nextTick()
    generateQRCode(uuid)
  } catch (e) {
    console.error('Load ticket error:', e)
    error.value = e.message || 'Не удалось загрузить билет'
  } finally {
    loading.value = false
  }
}

async function generateQRCode(text) {
  if (!qrCanvas.value) return

  try {
    await QRCode.toCanvas(qrCanvas.value, text, {
      width: 250,
      margin: 3,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
    
    // Убедимся что canvas виден
    qrCanvas.value.style.display = 'block'
  } catch (err) {
    console.error('QR generation error:', err)
  }
}

onMounted(() => {
  loadTicket()
})
</script>

<style scoped>
.ticket-view {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.ticket-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
    linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%);
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* Loading & Error */
.loading-state,
.error-state {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #9ca3af;
  font-size: 1rem;
}

.error-state .error-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.error-state h2 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.error-state p {
  color: #9ca3af;
}

/* Ticket Container */
.ticket-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
}

.ticket-paper {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.ticket-paper.ticket-paid {
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.ticket-paper.ticket-unpaid {
  background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
}

/* Header */
.ticket-header {
  padding: 20px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.event-badge {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  flex: 1;
}

.ticket-status {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.ticket-status.paid {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.ticket-status.unpaid {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

/* QR Section */
.qr-section {
  padding: 20px;
  text-align: center;
}

.qr-code {
  display: inline-block;
  padding: 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
}

.qr-code canvas {
  display: block !important;
  width: 220px !important;
  height: 220px !important;
  image-rendering: pixelated;
}

.qr-hint {
  margin-top: 12px;
  color: #6b7280;
  font-size: 0.85rem;
}

/* Divider */
.ticket-divider {
  position: relative;
  height: 24px;
  margin: 0 -8px;
}

.divider-circle {
  position: absolute;
  width: 24px;
  height: 24px;
  background: #1a1a2e;
  border-radius: 50%;
  top: 0;
}

.divider-circle.left {
  left: 0;
  transform: translateX(-50%);
}

.divider-circle.right {
  right: 0;
  transform: translateX(50%);
}

.divider-line {
  position: absolute;
  left: 20px;
  right: 20px;
  top: 50%;
  border-top: 2px dashed #e5e7eb;
}

/* Info */
.ticket-info {
  padding: 16px 20px 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.main {
  padding-bottom: 14px;
  margin-bottom: 4px;
  border-bottom: 2px solid #e5e7eb;
}

.info-row .label {
  color: #6b7280;
  font-size: 0.85rem;
}

.info-row .value {
  color: #1f2937;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.info-row.main .value {
  font-size: 1.1rem;
}

.info-row .value.comment {
  font-weight: 400;
  font-style: italic;
  color: #6b7280;
}

/* Footer */
.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.ticket-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: #9ca3af;
}

.chaika-logo {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

/* Wallet Hint */
.wallet-hint {
  margin-top: 20px;
  text-align: center;
}

.wallet-hint p {
  color: #9ca3af;
  font-size: 0.85rem;
}
</style>

