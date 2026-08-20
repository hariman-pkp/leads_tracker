<template>
  <component
    :is="isMore ? 'button' : NuxtLink"
    v-bind="isMore ? {} : { to: props.to }"
    @click="emit('click')"
    class="relative flex flex-col items-center gap-1 px-3 py-1 min-w-0 flex-1"
    :class="active ? 'text-primary-400' : 'text-apex-muted'"
  >
    <i :class="`fa-solid ${icon} text-lg`" />
    <span class="text-[10px] font-medium truncate">{{ label }}</span>
    <div v-if="active && !isMore" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-400 rounded-full" />
  </component>
</template>

<script setup lang="ts">
const props = defineProps<{
  to?: string
  icon: string
  label: string
  isMore?: boolean
}>()
const emit = defineEmits(['click'])
const route = useRoute()
const NuxtLink = resolveComponent('NuxtLink')
const active = computed(() => {
  if (props.isMore) return false
  if (props.to === '/') return route.path === '/'
  return route.path.startsWith(props.to || '')
})
</script>
