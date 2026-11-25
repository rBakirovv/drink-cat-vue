async function showPushNotification(data) {
  if (await caches.has('drink-cat-notifications-disabled')) return

  await self.registration.showNotification('Drink Cat', {
    body: data?.text() || 'Тестовое уведомление',
  })
}

self.addEventListener('push', (event) => {
  event.waitUntil(showPushNotification(event.data))
})
