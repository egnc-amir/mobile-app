import axios from 'axios'

export default axios.create({
  baseURL: '/business-card/api', // ✅ Laravel
  timeout: 10000,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
