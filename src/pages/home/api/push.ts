const subscriptionsUrl = '/api/push/subscriptions'

export async function fetchPushKey(): Promise<Uint8Array<ArrayBuffer> | null> {
  const response = await fetch('/api/push/public-key', { signal: AbortSignal.timeout(5000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Не удалось получить настройки Web Push')

  const { publicKey } = (await response.json()) as { publicKey: string }
  const base64 = publicKey.replaceAll('-', '+').replaceAll('_', '/')
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

export async function registerPushSubscription(subscription: PushSubscription) {
  const response = await fetch(subscriptionsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error('Не удалось сохранить подписку Web Push')
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
