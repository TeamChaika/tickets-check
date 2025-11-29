import { ref, computed } from 'vue'
import { supabase } from './useSupabase'

const user = ref(null)
const loading = ref(true)
const initialized = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (initialized.value) return
    
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
      })
      
      initialized.value = true
    } catch (error) {
      console.error('Auth init error:', error)
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    user.value = data.user
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return {
    user,
    loading,
    isAuthenticated,
    init,
    login,
    logout
  }
}

