import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cachedDeviceId: string | null = null

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId
  }

  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cachedDeviceId = result.visitorId
    return cachedDeviceId
  } catch (error) {
    // Fallback to random ID stored in localStorage
    const storageKey = 'fc_device_id'
    let deviceId = localStorage.getItem(storageKey)
    
    if (!deviceId) {
      deviceId = 'fc_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem(storageKey, deviceId)
    }
    
    cachedDeviceId = deviceId
    return deviceId
  }
}
