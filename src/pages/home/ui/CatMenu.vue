<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  fetchPushKey,
  registerPushSubscription,
  removePushSubscription,
  subscribeToPush,
} from '../api/push'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Switch } from '@/shared/ui/switch'

const logoUrl = `${import.meta.env.BASE_URL}icons/drink-cat-mark.svg`
const disabledNotificationsCache = 'drink-cat-notifications-disabled'
const supportsNotifications = 'Notification' in window && 'caches' in window
const permission = ref(supportsNotifications ? Notification.permission : null)
const muted = ref(false)
const ready = ref(false)
const registered = ref(false)
const pushConfigured = ref(false)
const notificationsEnabled = computed(
  () =>
    permission.value === 'granted' && !muted.value && (!pushConfigured.value || registered.value),
)
const pending = ref(false)
const error = ref('')
let push: { manager: PushManager; key: Uint8Array<ArrayBuffer> } | undefined
let subscription: PushSubscription | null = null

async function refreshSettings(open: boolean) {
  if (!open || !supportsNotifications || pending.value) return

  pending.value = true
  ready.value = false
  error.value = ''

  try {
    permission.value = Notification.permission
    muted.value = await caches.has(disabledNotificationsCache)
    registered.value = false

    const key = await fetchPushKey()
    pushConfigured.value = key !== null
    push = undefined
    subscription = null
    if (key && permission.value !== 'denied') {
      const registration = await navigator.serviceWorker?.getRegistration()
      if (!registration?.active || !registration.pushManager) {
        throw new Error('Service worker ещё недоступен')
      }
      push = { manager: registration.pushManager, key }
      subscription = await push.manager.getSubscription()

      if (subscription && !muted.value) {
        await registerPushSubscription(subscription)
        registered.value = true
      }
    }

    ready.value = true
  } catch (cause) {
    ready.value = push !== undefined
    error.value =
      push && cause instanceof Error ? cause.message : 'Не удалось загрузить настройку уведомлений.'
  } finally {
    pending.value = false
  }
}

async function setNotifications(enabled: boolean) {
  if (!ready.value || pending.value || !permission.value || permission.value === 'denied') return

  pending.value = true
  error.value = ''

  try {
    if (enabled) {
      if (push) {
        subscription ??= await subscribeToPush(push.manager, push.key)
        await registerPushSubscription(subscription)
        registered.value = true
      } else if (permission.value === 'default') {
        permission.value = await Notification.requestPermission()
        if (permission.value !== 'granted') return
      }

      await caches.delete(disabledNotificationsCache)
      muted.value = false
    } else {
      await caches.open(disabledNotificationsCache)
      muted.value = true
      registered.value = false
      if (subscription) {
        const { endpoint } = subscription
        await subscription.unsubscribe()
        subscription = null
        await removePushSubscription(endpoint)
      }
    }
  } catch (cause) {
    error.value =
      push && cause instanceof Error
        ? cause.message
        : 'Не удалось изменить настройку уведомлений. Попробуй ещё раз.'
  } finally {
    permission.value = Notification.permission
    pending.value = false
  }
}
</script>

<template>
  <DropdownMenu @update:open="refreshSettings">
    <DropdownMenuTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Открыть меню Drink Cat"
        class="pointer-events-auto size-11 rounded-full bg-white hover:bg-neutral-100 dark:hover:bg-neutral-100"
      >
        <img :src="logoUrl" alt="" width="32" height="17" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="start" :side-offset="8" class="w-56">
      <DropdownMenuCheckboxItem
        class="justify-between pl-2 [&>span:first-child]:hidden"
        :model-value="notificationsEnabled"
        :disabled="!ready || !permission || permission === 'denied' || pending"
        @select.prevent
        @update:model-value="setNotifications"
      >
        Уведомления
        <Switch
          as="span"
          class="pointer-events-none"
          tabindex="-1"
          aria-hidden="true"
          :model-value="notificationsEnabled"
        />
      </DropdownMenuCheckboxItem>
      <p v-if="error" role="status" class="px-2 py-1.5 text-xs text-muted-foreground">
        {{ error }}
      </p>
      <p v-else-if="permission === 'denied'" class="px-2 py-1.5 text-xs text-muted-foreground">
        Разрешите уведомления для этого сайта в настройках браузера.
      </p>
      <p v-else-if="!permission" class="px-2 py-1.5 text-xs text-muted-foreground">
        Уведомления в этом браузере недоступны.
      </p>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
