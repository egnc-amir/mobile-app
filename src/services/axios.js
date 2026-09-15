import axios from 'axios'

const REMOTE_API_BASE = 'https://preprod-katalyst.egc.gov.bn/business-card/api'

const isCapacitorRuntime =
  typeof window !== 'undefined' &&
  (Boolean(window.Capacitor) || window.location?.protocol === 'capacitor:')

const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim()
const baseURL = configuredBaseUrl || (isCapacitorRuntime ? REMOTE_API_BASE : '/business-card/api')

export default axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
