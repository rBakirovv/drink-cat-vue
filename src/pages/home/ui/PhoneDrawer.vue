<script setup lang="ts">
import { UserRoundPlus, X } from '@lucide/vue'
import { ref, useTemplateRef } from 'vue'

import { Button } from '@/shared/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer'
import { Input } from '@/shared/ui/input'

const phone = ref('+7')
const completePhone = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
const showCodeStatus = ref(false)
const phoneInput = useTemplateRef('phoneInput')

function handlePhoneInput(event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return

  const raw = input.value
  const digits = raw.replace(/\D/g, '')
  const hasPrefix = /^\s*\+7/.test(raw) || (digits.length > 10 && /^[78]/.test(digits))
  const national = digits.slice(hasPrefix ? 1 : 0, hasPrefix ? 11 : 10)
  const digitsBeforeCaret = raw.slice(0, input.selectionStart ?? raw.length).replace(/\D/g, '')
  let caretDigits = Math.max(0, digitsBeforeCaret.length - Number(hasPrefix))

  let formatted = '+7'
  if (national.length > 0) formatted += ` (${national.slice(0, 3)}`
  if (national.length > 3) formatted += `) ${national.slice(3, 6)}`
  if (national.length > 6) formatted += `-${national.slice(6, 8)}`
  if (national.length > 8) formatted += `-${national.slice(8, 10)}`

  let caret = 2
  while (caret < formatted.length && caretDigits > 0) {
    if (/\d/.test(formatted[caret] ?? '')) caretDigits--
    caret++
  }

  phone.value = formatted
  input.value = formatted
  input.setSelectionRange(caret, caret)
  showCodeStatus.value = false
}

function focusPhone(event: Event) {
  const input = phoneInput.value?.$el

  if (!(input instanceof HTMLInputElement)) return

  event.preventDefault()
  input.focus({ preventScroll: true })
  input.setSelectionRange(input.value.length, input.value.length)
}
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button
        type="button"
        size="icon-lg"
        aria-label="Войти по номеру телефона"
        class="size-11 rounded-full bg-white text-black hover:bg-neutral-100 [&_svg]:size-5"
      >
        <UserRoundPlus aria-hidden="true" />
      </Button>
    </DrawerTrigger>

    <DrawerContent
      class="h-[90dvh] data-[swipe-direction=down]:mt-0 data-[swipe-direction=down]:max-h-none data-[swipe-direction=down]:rounded-t-3xl"
      @open-auto-focus="focusPhone"
    >
      <DrawerHeader class="mx-auto w-full max-w-md pr-16">
        <DrawerTitle class="text-xl">Номер телефона</DrawerTitle>
      </DrawerHeader>

      <form
        class="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-6 overflow-y-auto px-4"
        @submit.prevent="showCodeStatus = completePhone.test(phone)"
      >
        <Input
          ref="phoneInput"
          :model-value="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          aria-label="Номер телефона"
          class="h-12 shrink-0 focus-visible:ring-0 md:text-base"
          @input="handlePhoneInput"
        />

        <Button type="submit" class="h-12 w-full" :disabled="!completePhone.test(phone)">
          Получить код
        </Button>
      </form>

      <DrawerClose as-child>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          class="absolute top-6 right-4 rounded-full"
          aria-label="Закрыть"
        >
          <X aria-hidden="true" />
        </Button>
      </DrawerClose>
    </DrawerContent>
  </Drawer>
</template>
