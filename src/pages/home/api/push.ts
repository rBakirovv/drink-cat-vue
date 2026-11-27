const subscriptionsUrl = '/api/push/subscriptions'

export async function fetchPushKey(): Promise<Uint8Array<ArrayBuffer> | null> {
  const response = await fetch('/api/push/public-key', { signal: AbortSignal.timeout(5000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Не удалось получить настройки Web Push')

  const { publicKey } = (await response.json()) as { publicKey: string }
  const base64 = publicKey.replaceAll('-', '+').replaceAll('_', '/')
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

export async function subscribeToPush(manager: PushManager, key: Uint8Array<ArrayBuffer>) {
  try {
    return await manager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
  } catch (cause) {
    const reason = cause instanceof DOMException && cause.message ? `: ${cause.message}` : ''
    throw new Error(`Браузер не создал push-подписку${reason}`, { cause })
  }
}

export async function registerPushSubscription(subscription: PushSubscription) {
  const response = await fetch(subscriptionsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
    signal: AbortSignal.timeout(5000),
  }).catch((cause) => {
    throw new Error('Не удалось связаться с сервером для регистрации push-подписки.', { cause })
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: unknown } | null
    const reason = typeof body?.message === 'string' ? `: ${body.message}` : ''
    throw new Error(`Сервер отклонил push-подписку (HTTP ${response.status})${reason}`)
  }
}

export async function removePushSubscription(endpoint: string) {
  const response = await fetch(subscriptionsUrl, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok && response.status !== 404) {
    throw new Error('Не удалось удалить подписку Web Push')
  }
}
