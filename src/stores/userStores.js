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

  // Restore auth user
  if (localStorage.getItem('authUser')) {
    user.value = JSON.parse(localStorage.getItem('authUser'))
    isAuthenticated.value = true
  }

  const login = (userData) => {
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('authUser', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = {
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
    }
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
