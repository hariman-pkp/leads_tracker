<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const auth  = useAuthStore()
const theme = useTheme()
auth.init()
theme.init()
</script>
