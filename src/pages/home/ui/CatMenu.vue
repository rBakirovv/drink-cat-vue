<script setup lang="ts">
import { computed, ref } from 'vue'

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
const notificationsEnabled = computed(() => permission.value === 'granted' && !muted.value)
const pending = ref(false)
const error = ref('')

async function refreshSettings(open: boolean) {
  if (!open || !supportsNotifications || pending.value) return

  pending.value = true
  error.value = ''

  try {
    permission.value = Notification.permission
    muted.value = await caches.has(disabledNotificationsCache)
  } catch {
    error.value = 'Не удалось загрузить настройку уведомлений.'
  } finally {
    pending.value = false
  }
}

async function setNotifications(enabled: boolean) {
  if (pending.value || !permission.value || permission.value === 'denied') return

  pending.value = true
  error.value = ''

  try {
    if (enabled && permission.value === 'default') {
      permission.value = await Notification.requestPermission()
    }

    if (permission.value !== 'granted') return

    if (enabled) {
      await caches.delete(disabledNotificationsCache)
    } else {
      await caches.open(disabledNotificationsCache)
    }
    muted.value = !enabled
  } catch {
    error.value = 'Не удалось изменить настройку уведомлений. Попробуй ещё раз.'
  } finally {
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
        :disabled="!permission || permission === 'denied' || pending"
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
      <p v-if="permission === 'denied'" class="px-2 py-1.5 text-xs text-muted-foreground">
        Разрешите уведомления для этого сайта в настройках браузера.
      </p>
      <p v-else-if="!permission" class="px-2 py-1.5 text-xs text-muted-foreground">
        Уведомления в этом браузере недоступны.
      </p>
      <p v-else-if="error" role="status" class="px-2 py-1.5 text-xs text-muted-foreground">
        {{ error }}
      </p>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
