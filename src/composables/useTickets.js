import { ref } from 'vue'
import { supabase } from './useSupabase'
import { useOfflineStore } from '../stores/offlineStore'

export function useTickets() {
  const loading = ref(false)
  const error = ref(null)

  // Получить билет по ID (из QR-кода)
  async function getTicketById(ticketId) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()
      
      if (err) throw err
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Поиск билетов по ФИО или телефону
  async function searchTickets(query, eventId = null) {
    loading.value = true
    error.value = null
    
    try {
      let request = supabase
        .from('tickets')
        .select('*')
      
      // Фильтр по мероприятию
      if (eventId) {
        request = request.eq('id_event', eventId)
      }
      
      // Поиск по фамилии, имени или телефону
      const searchQuery = query.trim()
      request = request.or(`lastname.ilike.%${searchQuery}%,firtsname.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
      
      const { data, error: err } = await request.limit(20).order('lastname', { ascending: true })
      
      if (err) throw err
      return data || []
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Отметить проход гостей
  async function checkIn(ticketId, personsCount = 1, userId = null) {
    loading.value = true
    error.value = null
    
    try {
      // Получаем текущие данные билета
      const ticket = await getTicketById(ticketId)
      
      if (!ticket) {
        throw new Error('Билет не найден')
      }
      
      const currentInHall = ticket.inhall || 0
      const maxPersons = ticket.len || 1
      const newInHall = currentInHall + personsCount
      
      // Проверяем лимит
      if (newInHall > maxPersons) {
        throw new Error(`Превышен лимит! Максимум: ${maxPersons}, уже в зале: ${currentInHall}, пытаются войти: ${personsCount}`)
      }
      
      // Обновляем билет
      const { data, error: updateErr } = await supabase
        .from('tickets')
        .update({ inhall: newInHall })
        .eq('id', ticketId)
        .select()
        .single()
      
      if (updateErr) throw updateErr
      
      // Логируем сканирование
      await logScan(ticketId, personsCount, userId, ticket.id_event, true)
      
      return {
        success: true,
        ticket: data,
        message: `Проход: ${personsCount} чел. В зале: ${newInHall}/${maxPersons}`
      }
    } catch (e) {
      error.value = e.message
      
      // Логируем неудачную попытку
      await logScan(ticketId, personsCount, userId, null, false, e.message)
      
      return {
        success: false,
        message: e.message
      }
    } finally {
      loading.value = false
    }
  }

  // Логирование сканирования
  async function logScan(ticketId, personsEntered, userId, eventId, success, errorMessage = null) {
    try {
      const offlineStore = useOfflineStore()
      
      const logEntry = {
        ticket_id: ticketId,
        persons_entered: personsEntered,
        scanner_user_id: userId,
        event_id: eventId,
        success,
        error_message: errorMessage,
        device_info: navigator.userAgent,
        is_synced: navigator.onLine
      }
      
      if (navigator.onLine) {
        await supabase.from('scan_logs').insert(logEntry)
      } else {
        // Сохраняем в офлайн очередь
        offlineStore.addToQueue({
          type: 'scan_log',
          data: logEntry,
          timestamp: new Date().toISOString()
        })
      }
    } catch (e) {
      console.error('Failed to log scan:', e)
    }
  }

  // Получить список мероприятий
  async function getEvents() {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('id_event, event')
        .not('id_event', 'is', null)
        .not('event', 'is', null)
      
      // Уникальные мероприятия
      const unique = [...new Map((data || []).map(item => [item.id_event, item])).values()]
      return unique
    } catch (e) {
      console.error('Failed to get events:', e)
      return []
    }
  }

  // Статистика по мероприятию
  async function getEventStats(eventId = null) {
    try {
      let request = supabase
        .from('tickets')
        .select('len, inhall')
      
      if (eventId) {
        request = request.eq('id_event', eventId)
      }
      
      const { data } = await request
      
      if (!data) return { total: 0, inHall: 0, remaining: 0, ticketsCount: 0 }
      
      const total = data.reduce((sum, t) => sum + (t.len || 0), 0)
      const inHall = data.reduce((sum, t) => sum + (t.inhall || 0), 0)
      
      return {
        total,
        inHall,
        remaining: total - inHall,
        ticketsCount: data.length
      }
    } catch (e) {
      console.error('Failed to get stats:', e)
      return { total: 0, inHall: 0, remaining: 0, ticketsCount: 0 }
    }
  }

  return {
    loading,
    error,
    getTicketById,
    searchTickets,
    checkIn,
    getEvents,
    getEventStats
  }
}

