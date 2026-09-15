// src/stores/userStores.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    id: '',
    token: '',
    edit_name: '',
    email: '',
    phone_number: '',
    office_number: '',
    job_position: '',
    agency: '',
    ministry: '',
    address: '',
    login_address: '',
    website: '',
    picture: 'card_bn/uploads/your-photo.png',
  })

  const isAuthenticated = ref(false)
  const loading = ref(false)

  const defaultUser = () => ({
    id: '',
    token: '',
    edit_name: '',
    email: '',
    phone_number: '',
    office_number: '',
    job_position: '',
    agency: '',
    ministry: '',
    address: '',
    login_address: '',
    website: '',
    picture: 'card_bn/uploads/your-photo.png',
  })

  // Restore auth user
  if (localStorage.getItem('authUser')) {
    try {
      const restored = JSON.parse(localStorage.getItem('authUser'))
      if (restored && typeof restored === 'object' && !Array.isArray(restored)) {
        user.value = { ...defaultUser(), ...restored }
        isAuthenticated.value = true
      } else {
        localStorage.removeItem('authUser')
      }
    } catch {
      localStorage.removeItem('authUser')
    }
  }

  const login = (userData) => {
    user.value = { ...defaultUser(), ...(userData || {}) }
    isAuthenticated.value = true
    localStorage.setItem('authUser', JSON.stringify(user.value))
  }

  const logout = () => {
    user.value = defaultUser()
    isAuthenticated.value = false
    localStorage.removeItem('authUser')
  }

  // 🔥 ADD THIS (CARD FETCH)
  const fetchUserByToken = async (token) => {
    loading.value = true
    try {
      const res = await fetch(`http://localhost:8000/api/get_user?token=${token}`)
      const data = await res.json()
      user.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    fetchUserByToken,
  }
})
