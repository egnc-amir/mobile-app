<template>
  <div class="page-wrapper">
    <GovBanner />

    <div class="container-fluid card-container py-3">
      <div class="card-holder">
        <OfficialCard v-if="currentToken" :key="currentToken" />
        <div v-else class="empty-state">
          Enter your token above to load your business card.
        </div>
      </div>
    </div>

    <div class="top-shell">
      <p class="shell-title">Share Your Card</p>
      <div class="top-row">
        <input
          v-model="tokenDraft"
          class="token-input"
          placeholder="Enter card token"
          autocomplete="off"
          @keyup.enter="openCard"
        />
        <button class="btn btn-primary" @click="openCard">Open Card</button>
        <button class="btn btn-success" :disabled="!canShare" @click="shareCard">Share</button>
      </div>

      <div class="nfc-row">
        <button class="btn btn-outline-primary" :disabled="!canShare" @click="enableNfcCard">
          Enable NFC Card
        </button>
        <button class="btn btn-outline-secondary" :disabled="!nfcEnabled" @click="disableNfcCard">
          Disable NFC Card
        </button>
      </div>

      <p class="nfc-help">{{ nfcStatus }}</p>

      <a
        v-if="canShare"
        :href="fullCardUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="share-link"
      >
        {{ fullCardUrl }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import OfficialCard from '@/components/BusinessCard/OfficialCard.vue'
import GovBanner from '@/components/GovBanner.vue'
import { HceBridge } from '@/plugins/hceBridge'

const route = useRoute()
const router = useRouter()

const tokenDraft = ref(String(route.params.token || ''))

watch(
  () => route.params.token,
  (token) => {
    tokenDraft.value = String(token || '')
  },
)

const currentToken = computed(() => String(route.params.token || '').trim())
const canShare = computed(() => currentToken.value.length > 0)
const fullCardUrl = computed(
  () => `https://preprod-katalyst.egc.gov.bn/business-card/${encodeURIComponent(currentToken.value)}`,
)
const nfcEnabled = ref(false)
const nfcStatus = ref('Enable NFC Card to let another device tap and receive your business card link.')

const openCard = async () => {
  const token = String(tokenDraft.value || '').trim()
  if (!token) return
  if (token === currentToken.value) return

  await router.push({ name: 'business-card', params: { token } })
}

const shareCard = async () => {
  if (!canShare.value) return

  try {
    await Share.share({
      title: 'Business Card',
      text: 'Open my business card',
      url: fullCardUrl.value,
      dialogTitle: 'Share business card',
    })
  } catch (error) {
    console.error('Share failed', error)
  }
}

const enableNfcCard = async () => {
  if (!canShare.value) return

  if (Capacitor.getPlatform() !== 'android') {
    nfcStatus.value = 'NFC card emulation is available only on Android.'
    return
  }

  try {
    await HceBridge.setCardPayload({ url: fullCardUrl.value })
    await HceBridge.enableHce()
    nfcEnabled.value = true
    nfcStatus.value = 'NFC card enabled. Keep this screen open, then tap with another NFC-enabled phone.'
  } catch (error) {
    nfcEnabled.value = false
    nfcStatus.value =
      'NFC setup is incomplete in the Android native project. Build and sync the app after adding HCE files.'
    console.error('Enable NFC card failed', error)
  }
}

const disableNfcCard = async () => {
  try {
    await HceBridge.disableHce()
  } catch (error) {
    console.error('Disable NFC card failed', error)
  } finally {
    nfcEnabled.value = false
    nfcStatus.value = 'NFC card is disabled.'
  }
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% -8%, rgba(57, 127, 230, 0.2), transparent 38%),
    radial-gradient(circle at 88% 4%, rgba(28, 186, 137, 0.16), transparent 34%),
    #eef3fb;
}

.top-shell {
  margin: 0 12px 16px;
  padding: 14px;
  background: color-mix(in srgb, #ffffff 90%, #f3f8ff 10%);
  border: 1px solid var(--phoenix-border-color-translucent, #dbe3ee);
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(16, 32, 52, 0.1);
}

.shell-title {
  margin: 0 0 10px;
  font-weight: 700;
  color: #24364a;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.token-input {
  border: 1px solid var(--phoenix-border-color-translucent, #dbe3ee);
  border-radius: 12px;
  padding: 11px 12px;
  background: #ffffff;
}

.token-input:focus {
  outline: none;
  border-color: #3a7be0;
  box-shadow: 0 0 0 3px rgba(58, 123, 224, 0.15);
}

.share-link {
  display: block;
  margin-top: 10px;
  color: var(--phoenix-link-color, #3874ff);
  font-weight: 600;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.nfc-row {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.nfc-help {
  margin: 10px 0 0;
  color: #5d6f83;
  font-size: 0.9rem;
}

.card-container {
  min-height: auto;
  overflow-x: hidden;
  padding-top: 10px !important;
}

.card-holder {
  display: flex;
  justify-content: center;
  width: 100%;
}

.official-card {
  width: 100%;
  max-width: 820px;
}

.empty-state {
  width: min(94vw, 620px);
  margin: 6px auto 10px;
  background: var(--phoenix-body-highlight-bg, #fff);
  border: 1px solid var(--phoenix-border-color-translucent, #dbe3ee);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  color: var(--phoenix-secondary-color, #6c7b8a);
}

.btn {
  border-radius: 12px;
  font-weight: 700;
}

.btn-success {
  background: linear-gradient(135deg, #0f9f56, #18ba72);
  border-color: transparent;
}

@media (min-width: 680px) {
  .top-row {
    grid-template-columns: 1fr auto auto;
  }

  .nfc-row {
    grid-template-columns: auto auto;
    justify-content: flex-start;
  }

  .top-shell {
    margin: 0 auto 20px;
    width: min(94vw, 860px);
  }
}

@media (max-width: 767px) {
  .card-container {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .official-card {
    width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
  }

  .card-holder {
    justify-content: flex-start;
  }

  .top-shell {
    margin: 8px 10px 14px;
    border-radius: 14px;
  }
}
</style>
