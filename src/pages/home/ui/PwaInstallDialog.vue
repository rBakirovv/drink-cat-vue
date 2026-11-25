<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'

import { getPwaInstallSteps } from '../model/pwaInstallInstruction'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

interface InstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const sessionKey = 'drink-cat-install-dialog-shown'
const manualSteps = getPwaInstallSteps(navigator)
const open = ref(false)
const installPrompt = shallowRef<InstallPromptEvent>()
const installing = ref(false)
let offerHandled = false
let timer: number | undefined

function isStandalone() {
  const iosNavigator: Navigator & { standalone?: boolean } = navigator
  return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true
}

function scheduleDialog() {
  timer = window.setTimeout(() => {
    if (offerHandled || isStandalone()) return

    markOfferHandled()
    open.value = true
  }, 25_000)
}

function markOfferHandled() {
  offerHandled = true
  try {
    sessionStorage.setItem(sessionKey, '1')
  } catch {
    // Keep the state in memory if the browser blocks session storage.
  }
}

function captureInstallPrompt(event: Event) {
  if ((!offerHandled || open.value) && 'prompt' in event && typeof event.prompt === 'function') {
    installPrompt.value = event as InstallPromptEvent
  }
}

function handleInstalled() {
  markOfferHandled()
  installPrompt.value = undefined
  open.value = false
}

async function installApp() {
  const prompt = installPrompt.value
  if (!prompt || installing.value) return

  installing.value = true
  try {
    const { outcome } = await prompt.prompt()
    if (outcome === 'accepted') handleInstalled()
  } catch {
    // The manual instructions remain available if the native prompt fails.
  } finally {
    if (installPrompt.value === prompt) installPrompt.value = undefined
    installing.value = false
  }
}

onMounted(() => {
  try {
    offerHandled = sessionStorage.getItem(sessionKey) === '1'
  } catch {
    // The dialog can still open when the browser blocks session storage.
  }
  if (offerHandled || isStandalone()) return

  window.addEventListener('beforeinstallprompt', captureInstallPrompt)
  window.addEventListener('appinstalled', handleInstalled)

  if (document.readyState === 'complete') {
    scheduleDialog()
  } else {
    window.addEventListener('load', scheduleDialog, { once: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('load', scheduleDialog)
  window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
  window.removeEventListener('appinstalled', handleInstalled)
  window.clearTimeout(timer)
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :show-close-button="false"
      class="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
    >
      <DialogHeader>
        <DialogTitle>Установить Drink Cat</DialogTitle>
        <DialogDescription v-if="installPrompt">
          Добавьте Drink Cat на устройство, чтобы открывать его отдельным приложением.
        </DialogDescription>
        <DialogDescription v-else as-child>
          <ul class="list-disc space-y-1.5 pl-5 text-left">
            <li v-for="step in manualSteps" :key="step">{{ step }}</li>
          </ul>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">Закрыть</Button>
        </DialogClose>
        <Button v-if="installPrompt" type="button" :disabled="installing" @click="installApp">
          Установить
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
