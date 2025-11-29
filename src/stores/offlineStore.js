import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../composables/useSupabase'

export const useOfflineStore = defineStore('offline', () => {
  const queue = ref([])
  const isOnline = ref(navigator.onLine)
  const isSyncing = ref(false)
  const lastSyncTime = ref(null)

  // Загружаем очередь из localStorage
  function loadQueue() {
    try {
      const saved = localStorage.getItem('offline_queue')
      if (saved) {
        queue.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load offline queue:', e)
      queue.value = []
    }
  }

  // Сохраняем очередь в localStorage
  function saveQueue() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(queue.value))
    } catch (e) {
      console.error('Failed to save offline queue:', e)
    }
  }

  // Добавить в очередь
  function addToQueue(item) {
    queue.value.push({
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString()
    })
    saveQueue()
  }

  // Удалить из очереди
  function removeFromQueue(itemId) {
    queue.value = queue.value.filter(item => item.id !== itemId)
    saveQueue()
  }

  // Синхронизация при восстановлении связи
  async function syncQueue() {
    if (!isOnline.value || isSyncing.value || queue.value.length === 0) return
    
    isSyncing.value = true
    const failedItems = []
    
    for (const item of queue.value) {
      try {
        if (item.type === 'scan_log') {
          const { error } = await supabase.from('scan_logs').insert({
            ...item.data,
            is_synced: true
          })
          if (error) throw error
        } else if (item.type === 'check_in') {
          // Офлайн check-in
          const { data: currentTicket } = await supabase
            .from('tickets')
            .select('inhall, len')
            .eq('id', item.data.ticket_id)
            .single()
          
          if (currentTicket) {
            const newInHall = Math.min(
              (currentTicket.inhall || 0) + item.data.persons,
              currentTicket.len || 1
            )
            
            await supabase
              .from('tickets')
              .update({ inhall: newInHall })
              .eq('id', item.data.ticket_id)
          }
        }
      } catch (e) {
        console.error('Sync failed for item:', item, e)
        failedItems.push(item)
      }
    }
    
    queue.value = failedItems
    saveQueue()
    lastSyncTime.value = new Date().toISOString()
    isSyncing.value = false
    
    return failedItems.length === 0
  }

  // Инициализация - слушаем изменения онлайн статуса
  function init() {
    loadQueue()
    
    window.addEventListener('online', () => {
      isOnline.value = true
      syncQueue()
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
    
    // Пробуем синхронизировать при старте
    if (isOnline.value && queue.value.length > 0) {
      syncQueue()
    }
  }

  // Очистить очередь
  function clearQueue() {
    queue.value = []
    saveQueue()
  }

  return {
    queue,
    isOnline,
    isSyncing,
    lastSyncTime,
    addToQueue,
    removeFromQueue,
    syncQueue,
    init,
    clearQueue
  }
})

