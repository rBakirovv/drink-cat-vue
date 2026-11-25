self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Drink Cat', {
      body: event.data?.text() || 'Тестовое уведомление',
    }),
  )
})
