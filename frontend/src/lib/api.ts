const API_BASE = '/api/v1'

export async function checkClaim(claim: string, language: string, deviceId: string) {
  const response = await fetch(`${API_BASE}/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ claim, language }),
  })

  if (!response.ok) {
    const data = await response.json()
    // Handle both string and object error details
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || 'Request failed'
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function getTrialStatus(deviceId: string) {
  const response = await fetch(`${API_BASE}/trial-status`, {
    headers: {
      'X-Device-Id': deviceId,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get trial status')
  }

  return response.json()
}

export async function getTokenBalance(deviceId: string) {
  const response = await fetch(`${API_BASE}/tokens/balance`, {
    headers: {
      'X-Device-Id': deviceId,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get token balance')
  }

  return response.json()
}

export async function createCheckout(
  productId: string,
  deviceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const response = await fetch(`${API_BASE}/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      device_id: deviceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || 'Checkout failed'
    throw new Error(errorMessage)
  }

  return response.json()
}
