import { registerPlugin } from '@capacitor/core'

const HceBridgePlugin = registerPlugin('HceBridge', {
  web: () => import('./hceBridge.web').then((m) => new m.HceBridgeWeb()),
})

export const HceBridge = {
  async setCardPayload(options) {
    return HceBridgePlugin.setCardPayload(options)
  },
  async enableHce() {
    return HceBridgePlugin.enableHce()
  },
  async disableHce() {
    return HceBridgePlugin.disableHce()
  },
}
