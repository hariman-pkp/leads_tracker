<template>
  <div>
    <div v-if="!leads?.length" class="empty-state py-8">
      <i class="fa-solid fa-check-circle empty-icon text-green-500" />
      <div class="empty-text">{{ emptyMsg }}</div>
    </div>
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="l in leads"
        :key="l.lead_id"
        :to="`/pipeline/${l.lead_id}`"
        class="flex items-center gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800 border border-navy-700/50 hover:border-navy-600 transition-all"
      >
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-200 truncate">{{ l.nama_company }}</div>
          <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span :class="fmt.priorityClass(l.prioritas)" class="text-xs">{{ l.prioritas }}</span>
            <span :class="fmt.stageClass(l.stage)" class="text-xs">{{ l.stage }}</span>
            <span v-if="showStale && l.stale_flag && l.stale_flag !== 'OK'" :class="fmt.staleClass(l.stale_flag)" class="text-xs">
              {{ l.stale_flag }}
            </span>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-xs font-medium text-primary-300">{{ fmt.rupiah(l.propose_value) }}</div>
          <div v-if="l.days_late !== undefined" class="text-xs text-red-400 mt-0.5">{{ l.days_late }}h terlambat</div>
          <div v-else-if="l.days_until !== undefined" class="text-xs text-blue-400 mt-0.5">{{ l.days_until }}h lagi</div>
          <div v-else-if="l.days_without_fu !== undefined" class="text-xs text-orange-400 mt-0.5">{{ l.days_without_fu }}h tanpa FU</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  leads?: any[]
  emptyMsg?: string
  showStale?: boolean
}>()
const fmt = useFormat()
</script>
