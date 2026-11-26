<script lang="ts">
let previousFrame: { src: string; time: number } | undefined
</script>

<script setup lang="ts">
import { nextTick, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { isAppleMobile } from '../model/isAppleMobile'

import { drinkViewTransition } from '@/entities/drink'

const router = useRouter()
const videoRef = useTemplateRef('video')
const frameRef = useTemplateRef('frame')
const returnFrame = drinkViewTransition.value?.direction === 'close' ? previousFrame : undefined
const frameSrc = ref(returnFrame?.src)
const showFrame = ref(!!returnFrame)
const showVideo = ref(!returnFrame)

onBeforeRouteLeave(async (to) => {
  const video = videoRef.value
  const frame = frameRef.value

  if (
    to.name !== 'drink-detail' ||
    !document.startViewTransition ||
    !isAppleMobile(navigator) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !video ||
    !frame ||
    video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
    video.getBoundingClientRect().bottom <= 0
  ) {
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  if (!context) return

  try {
    // Give WebKit a decoded image to snapshot before dropping the live video layer.
    const time = video.currentTime
    context.drawImage(video, 0, 0)
    const src = canvas.toDataURL('image/jpeg', 0.92)
    frameSrc.value = src
    await nextTick()
    await frame.decode()
    previousFrame = { src, time }
    showFrame.value = true
    showVideo.value = false
  } catch {
    // Keep the current background if the browser can't decode a still from the video.
  }
})

watch(drinkViewTransition, async (transition, previous) => {
  const video = videoRef.value
  if (!returnFrame || !video || transition || previous?.direction !== 'close') return

  showVideo.value = true
  await nextTick()

  try {
    video.currentTime = returnFrame.time
    await video.play()

    const hideFrame = () => {
      showFrame.value = false
    }

    if (video.requestVideoFrameCallback) {
      video.requestVideoFrameCallback(hideFrame)
    } else {
      requestAnimationFrame(hideFrame)
    }
  } catch {
    // Keep the still if autoplay is blocked.
  }
})

onScopeDispose(
  router.afterEach((_to, _from, failure) => {
    if (!failure) return
    showVideo.value = true
    showFrame.value = false
  }),
)
</script>

<template>
  <video
    v-show="showVideo"
    ref="video"
    class="h-full w-full object-cover"
    src="/videos/drink-cat-coffee.mp4"
    :autoplay="!returnFrame"
    muted
    loop
    playsinline
  ></video>
  <img
    v-show="showFrame"
    ref="frame"
    :src="frameSrc"
    class="absolute inset-0 h-full w-full object-cover"
    alt=""
  />
</template>
