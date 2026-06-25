<template>
  <div>
    <div class="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{{ label }}</div>
    <div class="text-sm text-gray-200">
      <slot>{{ val || '—' }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; val?: string | number | null }>()
</script>
