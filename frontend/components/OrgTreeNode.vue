<template>
  <div>
    <!-- Node -->
    <div class="flex items-center gap-2 py-1 rounded hover:bg-navy-800/40 px-2 transition-colors"
         :style="`padding-left: ${depth * 20 + 8}px`">
      <!-- Garis hierarki -->
      <span v-if="depth > 0" class="text-gray-600 text-xs select-none">
        {{ depth > 1 ? '└─' : '└─' }}
      </span>
      <!-- Icon -->
      <i :class="[
        'fa-solid text-xs w-3.5 text-center',
        children.length ? 'fa-sitemap text-primary-500' : 'fa-circle-dot text-gray-600'
      ]" />
      <!-- Kode -->
      <span class="font-mono text-xs text-primary-300 bg-navy-800 px-1.5 py-0.5 rounded">
        {{ node.kode }}
      </span>
      <!-- Nama -->
      <span class="text-gray-200 font-medium">{{ node.nama }}</span>
      <!-- Head -->
      <span v-if="node.head" class="text-xs text-gray-500 flex items-center gap-1 ml-1">
        <i class="fa-solid fa-user-tie text-[10px]" />{{ node.head }}
      </span>
      <!-- Status -->
      <span v-if="!node.is_active"
            class="text-[10px] text-gray-500 border border-gray-700 rounded px-1">non-aktif</span>
    </div>

    <!-- Rekursif untuk anak -->
    <OrgTreeNode
      v-for="child in children"
      :key="child.id"
      :node="child"
      :all="all"
      :depth="depth + 1" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  node:  any
  all:   any[]
  depth: number
}>()

const children = computed(() =>
  props.all.filter((o: any) => o.parent_id === props.node.id)
)
</script>
