<template>
  <!-- LOADING -->
  <div v-if="loading" class="loading-overlay">
    <div class="spinner-border"></div>
  </div>

  <!-- INVALID TOKEN -->
  <div v-else-if="invalidToken" class="invalid-card">
    <h5>Invalid or expired card</h5>
  </div>

  <!-- CARD -->
  <div v-else :class="['official-card', { 'dark-theme': isDarkTheme }]">
    <!-- LEFT -->
    <div class="card-left">
      <div class="image-wrapper">
        <!-- Emblem on top of image -->
        <img src="/Emblem_of_Brunei.png" alt="Emblem" class="emblem-overlay" />

        <!-- Profile or QR -->
        <img
          :src="isShowingQR ? externalQrImageSrc : profileSrc"
          :class="isShowingQR ? 'qr-image' : 'profile-image'"
          @error="setDefaultImage"
        />
      </div>

      <!-- USER INFO -->
      <h1 class="user-name">{{ user.edit_name }}</h1>

      <p class="user-role">
        <strong>{{ user.job_position }}</strong>
      </p>

      <!-- ACTIONS -->
      <div class="actions">
        <button class="btn btn-light btn-sm" @click="toggleQR(cardUrl)">
          {{ isShowingQR ? 'Show Photo' : 'Show QR' }}
        </button>

        <a
          :href="downloadVcardUrl"
          class="btn btn-secondary btn-sm"
        >
          Save Contact
        </a>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="card-right">
      <div class="right-contacts">
        <a v-if="user.email" :href="`mailto:${user.email}`" class="right-row right-contact">
          <span class="right-icon" aria-hidden="true">📧</span>
          <span>{{ user.email }}</span>
        </a>

        <a
          v-if="user.phone_number"
          :href="`https://wa.me/${user.phone_number}`"
          class="right-row right-contact"
        >
          <span class="right-icon" aria-hidden="true">💬</span>
          <span>{{ user.phone_number }}</span>
        </a>

        <a v-if="user.office_number" :href="`tel:${user.office_number}`" class="right-row right-contact">
          <span class="right-icon" aria-hidden="true">☎️</span>
          <span>{{ user.office_number }}</span>
        </a>

        <a
          v-if="user.website"
          :href="user.website.startsWith('http') ? user.website : `https://${user.website}`"
          target="_blank"
          class="right-row right-contact"
        >
          <span class="right-icon" aria-hidden="true">🌐</span>
          <span>{{ user.website }}</span>
        </a>
      </div>

      <div class="right-organization">
        <p v-if="user.ministry" class="right-row right-ministry">
          <span class="right-icon" aria-hidden="true">🏛️</span>
          <strong>{{ user.ministry }}</strong>
        </p>

        <p v-if="user.agency" class="right-row right-agency">
          <span class="right-icon" aria-hidden="true">🏢</span>
          <strong>{{ user.agency }}</strong>
        </p>

        <a
          v-if="addressText"
          class="right-row right-address"
          :href="mapAddressUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="right-icon" aria-hidden="true">📍</span>
          <span class="right-address-text">{{ addressText }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/axios'
import { useUserStore } from '@/stores/userStores'
import { useQrCard } from '@/composables/useQrCard'

const route = useRoute()
const store = useUserStore()

const user = computed(() => store.user)
const loading = ref(true)
const invalidToken = ref(false)

// 🔥 USE YOUR QR COMPOSABLE
const { isShowingQR, toggleQR } = useQrCard()

const publicCardUrl = computed(() => {
  const token = user.value?.token || route.params.token || ''
  return `https://preprod-katalyst.egc.gov.bn/business-card/${token}`
})

const externalQrImageSrc = computed(
  () =>
    `https://api.katalyst.gov.bn/qr/v1/codes?text=${encodeURIComponent(publicCardUrl.value)}`,
)

const apiBaseUrl = computed(() => {
  const rawBase = String(api.defaults.baseURL || '/business-card/api').trim()
  const normalizedBase = rawBase.replace(/\/+$/, '')

  if (/^https?:\/\//i.test(normalizedBase)) {
    return normalizedBase
  }

  const origin = typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : ''
  const prefixedBase = normalizedBase.startsWith('/') ? normalizedBase : `/${normalizedBase}`

  return `${origin}${prefixedBase}`
})

const downloadVcardUrl = computed(() => {
  const token = user.value?.token || route.params.token || ''
  return `${apiBaseUrl.value}/download-vcard/${encodeURIComponent(String(token))}`
})

// ✅ IMPORTANT:
// If picture exists in DB -> use Laravel proxy endpoint (it adds Bearer token to FileShare)
// If empty -> fallback to /your-photo.png (vue/public)
const profileSrc = computed(() => {
  const token = user.value?.token || route.params.token

  // if DB has picture (filename), show from API proxy
  if (user.value?.picture && String(user.value.picture).trim() !== '') {
    return `${apiBaseUrl.value}/profile-picture/${encodeURIComponent(String(token || ''))}?t=${Date.now()}`
  }

  // fallback from Vue public/
  return '/your-photo.png'
})

const addressText = computed(() => {
  const rawAddress =
    user.value?.address || user.value?.login_address || user.value?.full_address || ''
  return String(rawAddress).replace(/\r\n/g, '\n').trim()
})

const mapAddressUrl = computed(
  () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText.value)}`,
)

const getValue = (obj, keys) => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') {
      return obj[key]
    }
  }
  return ''
}

const normalizeUserPayload = (payload) => {
  const source = Array.isArray(payload) ? payload[0] : payload
  if (!source || typeof source !== 'object') return null

  const normalized = {
    ...store.user,
    ...source,
    id: getValue(source, ['id', 'ID']) || store.user.id,
    token: getValue(source, ['token', 'TOKEN']) || String(route.params.token || ''),
    edit_name: getValue(source, ['edit_name', 'EDIT_NAME', 'NAME', 'name']),
    email: getValue(source, ['email', 'EMAIL']),
    phone_number: getValue(source, ['phone_number', 'PHONE_NUMBER']),
    office_number: getValue(source, ['office_number', 'OFFICE_NUMBER']),
    job_position: getValue(source, ['job_position', 'JOB_POSITION', 'login_job_position']),
    agency: getValue(source, ['agency', 'AGENCY', 'login_agency']),
    ministry: getValue(source, ['ministry', 'MINISTRY', 'login_ministry']),
    address: getValue(source, ['address', 'ADDRESS']),
    login_address: getValue(source, ['login_address', 'LOGIN_ADDRESS']),
    website: getValue(source, ['website', 'WEBSITE']),
    picture: getValue(source, ['picture', 'PICTURE']) || store.user.picture,
  }

  return normalized
}

const fetchUser = async () => {
  try {
    const token = route.params.token
    const res = await api.get('/get_user', { params: { token } })
    const normalized = normalizeUserPayload(res.data)
    if (!normalized) {
      throw new Error('Empty user payload')
    }
    store.login(normalized)
  } catch {
    invalidToken.value = true
  } finally {
    loading.value = false
  }
}

const setDefaultImage = (e) => {
  e.target.src = '/your-photo.png'
}

onMounted(fetchUser)

const cardUrl = publicCardUrl

const isDarkTheme = ref(false)
let themeObserver = null

const syncThemeState = () => {
  const html = document.documentElement
  const theme =
    html.getAttribute('data-bs-theme') ||
    html.getAttribute('data-theme') ||
    localStorage.getItem('phoenixTheme') ||
    'light'

  isDarkTheme.value = theme === 'dark' || html.classList.contains('dark')
}

onMounted(() => {
  syncThemeState()
  themeObserver = new MutationObserver(syncThemeState)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme', 'data-theme', 'class'],
  })
})

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>

<style scoped>
/* Light mode defaults live on the component root for scoped-CSS reliability */
.official-card {
  --card-max-width: 1040px;
  --card-radius: 18px;
  --left-panel-bg: linear-gradient(145deg, #253549, #1f2d40);
  --right-panel-bg: var(--phoenix-body-highlight-bg, #ffffff);
  --right-text-color: var(--phoenix-emphasis-color, #24364a);
  --card-shadow: 0 14px 36px rgba(15, 33, 56, 0.14);
  --chip-bg: rgba(33, 37, 41, 0.04);
  --chip-bg-hover: rgba(33, 37, 41, 0.08);
  --card-border: var(--phoenix-border-color-translucent, #d7e3f1);
  --link-color: var(--phoenix-emphasis-color, #24364a);
  --link-hover: var(--phoenix-primary, #3874ff);
}

/* Container around the profile/QR */
.image-wrapper {
  position: relative;
  display: inline-block;
}

/* 🔥 This is the key part */
.emblem-overlay {
  position: absolute;

  /* Adjust to match your screenshot */
  top: -20px;
  left: -60px;

  width: 34px; /* tweak: 30–40px to taste */
  height: auto;

  z-index: 5;
  pointer-events: none; /* click passes to QR/photo */
}

/* keep existing sizes */
.profile-image,
.qr-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 50%;
  background: #fff;
  margin-bottom: 16px;
}
/* OVERLAY */
.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 999;
}

.invalid-card {
  text-align: center;
  padding: 3rem;
}

/* CARD */
.official-card {
  width: min(92vw, var(--card-max-width));
  margin: clamp(20px, 4vh, 40px) auto;
  background: var(--right-panel-bg);
  border-radius: var(--card-radius);
  border: 1px solid var(--card-border);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
}

/* LEFT */
.card-left {
  background: var(--left-panel-bg);
  color: #ffffff;
  padding: clamp(28px, 3vw, 42px) clamp(20px, 2.5vw, 30px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* RIGHT */
.card-right {
  background: var(--right-panel-bg);
  color: var(--right-text-color);
  padding: clamp(24px, 3vw, 38px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  font-size: clamp(15px, 1.1vw, 17px);
  line-height: 1.55;
}

.qr-image {
  border-radius: 12px;
  padding: 10px;
}

.title {
  font-weight: 600;
  margin-bottom: 4px;
}

.org {
  font-size: 13px;
  opacity: 0.9;
}

.user-name {
  font-size: clamp(1.2rem, 1.9vw, 1.6rem);
  font-weight: 700;
  margin-top: 12px;
  margin-bottom: 4px;
  color: #fff;
  text-align: center;
}

.user-role {
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  margin-bottom: 6px;
  color: #f1f1f1;
  text-align: center;
}

.right-row {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.4;
}

.right-contact,
.right-agency,
.right-ministry {
  font-size: clamp(0.9rem, 1.05vw, 1rem);
  color: var(--right-text-color);
}

.right-address {
  width: 100%;
  max-width: 100%;
  font-size: clamp(0.85rem, 1vw, 0.95rem);
  line-height: 1.45;
  color: var(--right-text-color);
  opacity: 0.9;
}

.right-address-text {
  display: block;
  white-space: pre-line;
}

.right-icon {
  flex: 0 0 1.1rem;
  width: 1.1rem;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.4;
  opacity: 0.85;
}

.right-contacts,
.right-organization {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.right-contacts {
  gap: 6px;
}

.right-organization {
  margin-top: 6px;
  padding-top: 15px;
  border-top: 1px solid color-mix(in srgb, var(--card-border) 72%, transparent);
  gap: 6px;
}

/* =========================
   THEME AWARE
========================= */

/* 🌙 DARK MODE */
:global([data-bs-theme='dark']) .official-card,
:global(html[data-bs-theme='dark']) .official-card,
:global(body[data-bs-theme='dark']) .official-card {
  --left-panel-bg: linear-gradient(145deg, #1a2433, #15202f);
  --right-panel-bg: #121d2c;
  --right-text-color: #edf4ff;
  --card-shadow: 0 14px 36px rgba(0, 0, 0, 0.62);
  --chip-bg: rgba(255, 255, 255, 0.08);
  --chip-bg-hover: rgba(255, 255, 255, 0.14);
  --card-border: #2b415f;
  --link-color: #edf4ff;
  --link-hover: #9fc1ff;
}

.official-card.dark-theme {
  --left-panel-bg: linear-gradient(145deg, #1a2433, #15202f);
  --right-panel-bg: #121d2c;
  --right-text-color: #ffffff;
  --card-shadow: 0 14px 36px rgba(0, 0, 0, 0.62);
  --card-border: #2b415f;
  --link-color: #ffffff;
  --link-hover: #9fc1ff;
}

:global([data-bs-theme='dark']) .card-left,
:global(html[data-bs-theme='dark']) .card-left,
:global(body[data-bs-theme='dark']) .card-left {
  background: linear-gradient(145deg, #1a2433, #15202f);
  color: #f1f1f1;
}

/* ACTIONS */
.actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.card-right a {
  text-decoration: none;
  color: var(--link-color);
  transition: color 0.2s ease, opacity 0.2s ease;
}

.card-right a:hover {
  color: var(--link-hover);
  opacity: 1;
}

.right-contact {
  width: 100%;
  max-width: 100%;
}

.right-address:hover {
  color: var(--link-hover);
}

/* DESKTOP */
@media (min-width: 768px) {
  .official-card {
    flex-direction: row;
  }

  .card-left {
    width: 41%;
  }

  .card-right {
    width: 59%;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (min-width: 1280px) {
  .official-card {
    width: min(88vw, 1160px);
  }

  .profile-image,
  .qr-image {
    width: 176px;
    height: 176px;
  }
}

/* MOBILE: FULL HEIGHT CARD */
@media (max-width: 767px) {
  /* ✅ remove the page side padding that makes it look narrow */
  .container,
  .container-fluid {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* ✅ ensure wrapper is full width */
  .profile-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  /* ✅ force the card to span the viewport */
  .official-card {
    width: 100vw; /* 👈 this is the big one */
    max-width: 100vw;
    min-height: 100vh;
    margin: 0 !important;
    border-radius: 0;
  }

  .card-left,
  .card-right {
    width: 100%;
  }

  /* ✅ stretch left panel */
  .card-left {
    min-height: 64vh;
    padding: 24px 16px;
  }

  .profile-image,
  .qr-image {
    width: clamp(190px, 56vw, 230px);
    height: clamp(190px, 56vw, 230px);
  }

  .card-right {
    padding: 12px 14px 14px;
    font-size: 14px;
    gap: 10px;
    justify-content: flex-start;
  }

  .card-right a {
    width: 100%;
    justify-content: flex-start;
  }

  .right-contact,
  .right-agency,
  .right-ministry,
  .right-address {
    font-size: 0.92rem;
    line-height: 1.35;
  }

  .emblem-overlay {
    display: none !important;
  }
}
</style>
