import { WebPlugin } from '@capacitor/core'

export class HceBridgeWeb extends WebPlugin {
  constructor() {
    super({
      name: 'HceBridge',
      platforms: ['web'],
    })
    this.payload = null
  }

  async setCardPayload(options) {
    this.payload = options || null
    return { ok: true }
  }

  async enableHce() {
    throw this.unimplemented('HCE is only available on Android native builds.')
  }

  async disableHce() {
    return { ok: true }
  }
}
