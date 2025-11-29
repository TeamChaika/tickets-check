<template>
  <div class="scan-view">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <button @click="showEventSelector = true" class="btn-event">
          <span class="event-icon">🎭</span>
          <span class="event-name">{{ selectedEvent?.event || 'Все мероприятия' }}</span>
          <span class="chevron">▼</span>
        </button>
      </div>
      <div class="header-right">
        <div 
          class="online-status"
          :class="{ online: offlineStore.isOnline }"
          :title="offlineStore.isOnline ? 'Онлайн' : 'Офлайн'"
        >
          <span class="status-dot"></span>
          <span v-if="offlineStore.queue.length > 0" class="queue-badge">
            {{ offlineStore.queue.length }}
          </span>
        </div>
        <button @click="loadStats" class="btn-icon" title="Статистика">
          📊
        </button>
        <button @click="handleLogout" class="btn-icon" title="Выйти">
          🚪
        </button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'scan' }"
        @click="activeTab = 'scan'"
      >
        <span class="tab-icon">📷</span>
        <span class="tab-text">Сканер</span>
      </button>
      <button 
        class="tab"
        :class="{ active: activeTab === 'search' }"
        @click="activeTab = 'search'"
      >
        <span class="tab-icon">🔍</span>
        <span class="tab-text">Поиск</span>
      </button>
    </div>

    <!-- Scanner Tab -->
    <div v-show="activeTab === 'scan'" class="tab-content">
      <QRScanner ref="scannerRef" @scanned="handleScan" />
      
      <Transition name="slide-up">
        <div v-if="scannedTicket" class="scanned-result">
          <TicketCard 
            :ticket="scannedTicket"
            :loading="checkingIn"
            @check-in="handleCheckIn"
          />
          <button class="btn-clear" @click="clearScanned">
            ✕ Закрыть
          </button>
        </div>
      </Transition>
      
      <Transition name="fade">
        <div v-if="scanError" class="scan-error">
          <span class="error-icon">❌</span>
          <span>{{ scanError }}</span>
          <button class="btn-dismiss" @click="scanError = null">✕</button>
        </div>
      </Transition>
    </div>

    <!-- Search Tab -->
    <div v-show="activeTab === 'search'" class="tab-content">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Фамилия или телефон..."
          @input="debouncedSearch"
          class="search-input"
        />
        <button 
          v-if="searchQuery" 
          class="btn-clear-search"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>
      
      <div v-if="searching" class="loading-state">
        <div class="spinner"></div>
        <span>Поиск...</span>
      </div>
      
      <div v-else-if="searchResults.length > 0" class="search-results">
        <div class="results-count">
          Найдено: {{ searchResults.length }}
        </div>
        <TransitionGroup name="list" tag="div" class="results-list">
          <TicketCard
            v-for="ticket in searchResults"
            :key="ticket.id"
            :ticket="ticket"
            :loading="checkingIn && checkingTicketId === ticket.id"
            @check-in="handleCheckIn"
            class="result-card"
          />
        </TransitionGroup>
      </div>
      
      <div v-else-if="searchQuery.length >= 2 && !searching" class="empty-state">
        <span class="empty-icon">🔎</span>
        <p>Билеты не найдены</p>
        <span class="empty-hint">Попробуйте другой запрос</span>
      </div>
      
      <div v-else class="empty-state hint">
        <span class="empty-icon">✍️</span>
        <p>Введите фамилию или телефон</p>
        <span class="empty-hint">Минимум 2 символа</span>
      </div>
    </div>

    <!-- Event Selector Modal -->
    <Transition name="modal">
      <div v-if="showEventSelector" class="modal-overlay" @click="showEventSelector = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>Выберите мероприятие</h3>
            <button class="btn-close-modal" @click="showEventSelector = false">✕</button>
          </div>
          <div class="event-list">
            <button 
              class="event-item"
              :class="{ active: !selectedEvent }"
              @click="selectEvent(null)"
            >
              <span class="event-item-icon">🌐</span>
              <span class="event-item-name">Все мероприятия</span>
              <span v-if="!selectedEvent" class="check-icon">✓</span>
            </button>
            <button
              v-for="event in events"
              :key="event.id_event"
              class="event-item"
              :class="{ active: selectedEvent?.id_event === event.id_event }"
              @click="selectEvent(event)"
            >
              <span class="event-item-icon">🎭</span>
              <span class="event-item-name">{{ event.event }}</span>
              <span v-if="selectedEvent?.id_event === event.id_event" class="check-icon">✓</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Stats Modal -->
    <Transition name="modal">
      <div v-if="showStats" class="modal-overlay" @click="showStats = false">
        <div class="modal stats-modal" @click.stop>
          <div class="modal-header">
            <h3>📊 Статистика</h3>
            <button class="btn-close-modal" @click="showStats = false">✕</button>
          </div>
          <div class="stats-event-name">
            {{ selectedEvent?.event || 'Все мероприятия' }}
          </div>
          <div v-if="stats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ stats.ticketsCount }}</div>
              <div class="stat-label">Билетов</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Всего гостей</div>
            </div>
            <div class="stat-card highlight green">
              <div class="stat-value">{{ stats.inHall }}</div>
              <div class="stat-label">В зале</div>
            </div>
            <div class="stat-card highlight blue">
              <div class="stat-value">{{ stats.remaining }}</div>
              <div class="stat-label">Ожидается</div>
            </div>
          </div>
          <div class="stats-progress">
            <div class="progress-header">
              <span>Заполненность</span>
              <span>{{ progressPercent }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
          <button @click="showStats = false" class="btn-close">Закрыть</button>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { useTickets } from '../composables/useTickets'
import { useAuth } from '../composables/useAuth'
import { useOfflineStore } from '../stores/offlineStore'
import QRScanner from '../components/QRScanner.vue'
import TicketCard from '../components/TicketCard.vue'

const router = useRouter()
const { user, logout } = useAuth()
const offlineStore = useOfflineStore()
const { 
  getTicketById, 
  searchTickets, 
  checkIn, 
  getEvents, 
  getEventStats
} = useTickets()

// Refs
const activeTab = ref('scan')
const scannerRef = ref(null)
const searchInputRef = ref(null)

// Scanner state
const scannedTicket = ref(null)
const scanError = ref(null)
const checkingIn = ref(false)
const checkingTicketId = ref(null)

// Search state
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)

// Events & Stats
const events = ref([])
const selectedEvent = ref(null)
const showEventSelector = ref(false)
const showStats = ref(false)
const stats = ref(null)

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Computed
const progressPercent = computed(() => {
  if (!stats.value || stats.value.total === 0) return 0
  return Math.round((stats.value.inHall / stats.value.total) * 100)
})

// Methods
async function handleScan(qrCode) {
  scanError.value = null
  scannedTicket.value = null
  
  const ticketId = qrCode.trim()
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(ticketId)) {
    scanError.value = 'Неверный формат QR-кода'
    return
  }
  
  try {
    const ticket = await getTicketById(ticketId)
    
    if (ticket) {
      // Check event filter
      if (selectedEvent.value && ticket.id_event !== selectedEvent.value.id_event) {
        scanError.value = `Билет на другое мероприятие: ${ticket.event || 'Неизвестно'}`
        return
      }
      scannedTicket.value = ticket
    } else {
      scanError.value = 'Билет не найден в базе данных'
    }
  } catch (e) {
    scanError.value = 'Ошибка при проверке билета'
    console.error('Scan error:', e)
  }
}

function clearScanned() {
  scannedTicket.value = null
  scannerRef.value?.resume()
}

async function handleCheckIn({ ticketId, persons }) {
  checkingIn.value = true
  checkingTicketId.value = ticketId
  
  try {
    const result = await checkIn(ticketId, persons, user.value?.id)
    
    if (result.success) {
      showToast(result.message, 'success')
      
      // Update scanned ticket
      if (scannedTicket.value?.id === ticketId) {
        scannedTicket.value = result.ticket
      }
      
      // Update search results
      const idx = searchResults.value.findIndex(t => t.id === ticketId)
      if (idx !== -1) {
        searchResults.value[idx] = result.ticket
      }
    } else {
      showToast(result.message, 'error')
    }
  } catch (e) {
    showToast('Ошибка при проходе', 'error')
  } finally {
    checkingIn.value = false
    checkingTicketId.value = null
  }
}

const debouncedSearch = useDebounceFn(async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searching.value = true
  try {
    searchResults.value = await searchTickets(
      searchQuery.value, 
      selectedEvent.value?.id_event
    )
  } catch (e) {
    console.error('Search error:', e)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}, 300)

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  searchInputRef.value?.focus()
}

function selectEvent(event) {
  selectedEvent.value = event
  showEventSelector.value = false
  
  // Refresh search if active
  if (searchQuery.value.length >= 2) {
    debouncedSearch()
  }
  
  // Clear scanned ticket if from different event
  if (scannedTicket.value && event && scannedTicket.value.id_event !== event.id_event) {
    clearScanned()
  }
}

async function loadStats() {
  stats.value = await getEventStats(selectedEvent.value?.id_event)
  showStats.value = true
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

async function handleLogout() {
  try {
    await logout()
    router.push('/login')
  } catch (e) {
    showToast('Ошибка выхода', 'error')
  }
}

// Lifecycle
onMounted(async () => {
  offlineStore.init()
  events.value = await getEvents()
})

// Focus search input when switching to search tab
watch(activeTab, (tab) => {
  if (tab === 'search') {
    setTimeout(() => searchInputRef.value?.focus(), 100)
  }
})
</script>

<style scoped>
.scan-view {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%);
  color: white;
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-event {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 200px;
}

.btn-event:hover {
  background: rgba(255, 255, 255, 0.12);
}

.event-icon {
  font-size: 1.1rem;
}

.event-name {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  font-size: 0.7rem;
  opacity: 0.6;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.online-status {
  position: relative;
  padding: 8px;
}

.status-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  transition: background 0.3s;
}

.online-status.online .status-dot {
  background: #10b981;
}

.queue-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #f59e0b;
  color: #000;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Tabs */
.tabs {
  display: flex;
  padding: 16px;
  gap: 10px;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: #9ca3af;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.tab-icon {
  font-size: 1.2rem;
}

/* Tab Content */
.tab-content {
  padding: 0 16px 16px;
}

/* Scanner Results */
.scanned-result {
  margin-top: 20px;
}

.btn-clear {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #9ca3af;
  border-radius: 12px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.scan-error {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 14px;
  color: #fca5a5;
}

.scan-error .error-icon {
  font-size: 1.2rem;
}

.scan-error span {
  flex: 1;
}

.btn-dismiss {
  background: none;
  border: none;
  color: #fca5a5;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-dismiss:hover {
  opacity: 1;
}

/* Search */
.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 16px 48px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.search-input::placeholder {
  color: #6b7280;
}

.btn-clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-clear-search:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Search Results */
.results-count {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 12px;
  padding-left: 4px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Loading & Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #9ca3af;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state.hint {
  opacity: 0.7;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state p {
  color: #e2e8f0;
  font-size: 1.1rem;
  margin: 0 0 8px;
}

.empty-hint {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

@media (min-height: 600px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal {
  background: #1e293b;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
}

@media (min-height: 600px) {
  .modal {
    border-radius: 24px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Event List */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: white;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.event-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.event-item.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

.event-item-icon {
  font-size: 1.25rem;
}

.event-item-name {
  flex: 1;
}

.check-icon {
  color: #6366f1;
  font-weight: bold;
}

/* Stats Modal */
.stats-modal {
  text-align: center;
}

.stats-event-name {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card.highlight.green {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.stat-card.highlight.green .stat-value {
  color: #34d399;
}

.stat-card.highlight.blue {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.stat-card.highlight.blue .stat-value {
  color: #818cf8;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-progress {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.btn-close {
  width: 100%;
  padding: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Toast */
.toast {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  border-radius: 14px;
  font-weight: 500;
  z-index: 200;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  max-width: calc(100% - 32px);
}

.toast.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-message {
  flex: 1;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(100px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>

