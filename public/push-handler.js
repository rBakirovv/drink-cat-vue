async function showPushNotification(data) {
  if (await caches.has('drink-cat-notifications-disabled')) return

  await self.registration.showNotification('Тестовое уведомление', {
    body: data?.text() ?? '',
  })
}

self.addEventListener('push', (event) => {
  event.waitUntil(showPushNotification(event.data))
})
