<template>
  <div class="min-h-screen bg-navy-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo card -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-5">
          <img src="/Logo Untuk Background Gelap.png" alt="PKP" class="h-16 w-auto" />
        </div>
        <h1 class="text-3xl font-black text-white tracking-wide">APEX</h1>
        <p class="text-xs text-primary-400 font-medium mt-1 tracking-widest uppercase">
          Achievement &amp; Performance Execution Platform
        </p>
      </div>

      <!-- Login form -->
      <div class="card">
        <h2 class="text-base font-semibold text-white mb-5">Masuk ke Akun</h2>

        <form @submit.prevent="doLogin" class="space-y-4">
          <div>
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="nama@pkp.co.id"
              required
              autocomplete="username"
            />
          </div>

          <div>
            <label class="form-label">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                class="form-input pr-10"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                @click="showPw = !showPw"
              >
                <i :class="`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm`" />
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5 text-sm text-red-300">
            <i class="fa-solid fa-circle-exclamation" />
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            class="btn-primary w-full justify-center py-2.5"
            :disabled="loading"
          >
            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin" />
            <i v-else class="fa-solid fa-right-to-bracket" />
            {{ loading ? 'Masuk...' : 'Masuk' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-gray-600 mt-6">
        APEX v2.0 — PT. PKP
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const auth    = useAuthStore()
const config  = useRuntimeConfig()
const route   = useRoute()

const form    = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg= ref('')
const showPw  = ref(false)

// Redirect jika sudah login — hormati ?redirect= jika ada
if (auth.isLoggedIn) {
  const redirect = useRoute().query.redirect as string | undefined
  await navigateTo(redirect || '/')
}

async function doLogin() {
  loading.value  = true
  errorMsg.value = ''
  try {
    const data = await $fetch<any>(`${config.public.apiBase}/v1/auth/login`, {
      method: 'POST',
      body: { email: form.email, password: form.password },
    })
    // allowed_menus sudah ada di data.user, disimpan via setAuth ke localStorage
    auth.setAuth(data.access_token, data.user)

    const redirect = route.query.redirect as string || '/'
    await navigateTo(redirect)
  } catch (err: any) {
    errorMsg.value = err?.data?.detail || 'Email atau password salah.'
  } finally {
    loading.value = false
  }
}
</script>
