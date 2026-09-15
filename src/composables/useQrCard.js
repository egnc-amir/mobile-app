import { ref } from 'vue'

export function useQrCard() {
  const isShowingQR = ref(false)
  const qrImageSrc = ref('')
  const generating = ref(false)

  const toggleQR = async () => {
    if (isShowingQR.value) {
      isShowingQR.value = false
      return
    }

    generating.value = true
    isShowingQR.value = true
    generating.value = false
  }

  return {
    isShowingQR,
    qrImageSrc,
    generating,
    toggleQR,
  }
}
