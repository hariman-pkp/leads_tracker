<template>
  <div class="flex h-screen overflow-hidden bg-apex-bg transition-theme duration-200">
    <!-- Sidebar -->
    <aside
      class="flex flex-col w-64 flex-shrink-0 bg-apex-surface border-r border-apex-border transition-all duration-200"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-64 absolute z-40 h-full'"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-apex-border">
        <div class="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/40">
          <span class="text-white font-black text-xs tracking-tight">APEX</span>
        </div>
        <div>
          <div class="text-sm font-bold text-apex-text leading-tight tracking-wide">APEX</div>
          <div class="text-[10px] text-apex-faint leading-tight">Achievement & Performance</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-2 px-2">
        <ClientOnly>
          <div v-for="group in navGroups" :key="group.name" class="mb-1">
            <!-- Group header -->
            <button
              class="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors select-none group/gh"
              :class="openGroups.has(group.name)
                ? 'text-apex-text'
                : 'text-apex-muted hover:text-apex-text'"
              @click="toggleGroup(group.name)"
            >
              <span class="text-[11px] font-semibold uppercase tracking-widest"
                    :class="groupHasActive(group) ? 'text-primary-400' : ''">
                {{ group.name }}
              </span>
              <i class="fa-solid fa-chevron-down text-[9px] transition-transform duration-200 text-apex-faint group-hover/gh:text-apex-muted"
                 :class="openGroups.has(group.name) ? '' : '-rotate-90'" />
            </button>

            <!-- Menu items (collapsible) -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out overflow-hidden"
              leave-active-class="transition-all duration-150 ease-in overflow-hidden"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-96 opacity-100"
              leave-from-class="max-h-96 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-if="openGroups.has(group.name)" class="mt-0.5 space-y-0.5 pl-1">
                <NuxtLink
                  v-for="m in group.menus"
                  :key="m.key"
                  :to="m.url"
                  class="nav-item"
                  :class="{ active: isActive(m.url) }"
                  @click="closeSidebarOnMobile"
                >
                  <i :class="`fa-solid ${m.icon} w-4 text-center text-sm`" />
                  <span>{{ m.label }}</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <template #fallback>
            <div class="px-3 py-8 text-center">
              <i class="fa-solid fa-circle-notch fa-spin text-apex-faint" />
            </div>
          </template>
        </ClientOnly>
      </nav>

      <!-- User footer -->
      <div class="border-t border-apex-border p-3">
        <ClientOnly>
          <div ref="avatarRowRef"
               class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-apex-card cursor-pointer transition-colors select-none"
               @click.stop="toggleUserMenu">
            <div class="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {{ auth.user?.nama?.charAt(0) || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-apex-text truncate">{{ auth.user?.nama }}</div>
              <div class="text-xs text-apex-muted truncate">{{ auth.user?.role_nama }}</div>
            </div>
            <i class="fa-solid fa-chevron-up text-apex-faint text-xs transition-transform duration-200"
               :class="userMenuOpen ? '' : 'rotate-180'" />
          </div>
        </ClientOnly>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="flex items-center gap-3 px-4 py-3 border-b border-apex-border bg-apex-surface/80 backdrop-blur-sm flex-shrink-0">
        <!-- Desktop: sidebar toggle -->
        <button class="hidden md:flex btn-ghost btn-sm rounded-lg" @click="sidebarOpen = !sidebarOpen">
          <i class="fa-solid fa-bars text-apex-muted" />
        </button>

        <!-- Mobile: APEX logo + drawer toggle -->
        <div class="flex md:hidden items-center gap-2">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="relative p-1.5 -ml-1 rounded-lg text-apex-muted hover:text-apex-text">
            <i class="fa-solid fa-grid-2 text-lg" />
            <span v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>
          <div class="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center shadow shadow-primary-600/40">
            <span class="text-white font-black text-[8px] tracking-tight">APEX</span>
          </div>
          <span class="text-sm font-bold text-apex-text tracking-wide">APEX CRM</span>
        </div>

        <div class="flex-1" />

        <div class="text-xs text-apex-faint hidden sm:block">
          <i class="fa-regular fa-calendar mr-1.5" />
          {{ todayStr }}
        </div>

        <!-- Theme Toggle -->
        <ClientOnly>
          <button
            class="btn-ghost btn-sm rounded-lg"
            :title="isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'"
            @click="toggleTheme"
          >
            <i :class="isDark ? 'fa-regular fa-sun text-yellow-400' : 'fa-regular fa-moon text-apex-muted'" />
          </button>
        </ClientOnly>

        <!-- Notification Bell -->
        <div class="relative" ref="bellRef">
          <button class="btn-ghost btn-sm rounded-lg relative" @click.stop="toggleNotif" title="Notifikasi">
            <i class="fa-regular fa-bell text-apex-muted" />
            <span v-if="unreadCount > 0"
                  class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-5 pb-20 md:pb-5">
        <slot />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 bg-black/60 z-30"
      @click="sidebarOpen = false"
    />

    <!-- Mobile Bottom Navigation -->
    <nav v-if="auth.user" class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-apex-surface border-t border-apex-border" style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="flex items-center justify-around px-1 pt-1 pb-2">
        <MobileNavItem v-for="item in bottomNavItems" :key="item.key"
          :to="item.url" :icon="item.icon" :label="item.label" />
        <button @click="mobileMenuOpen = true"
                class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-apex-muted hover:text-apex-text transition-colors">
          <i class="fa-solid fa-ellipsis text-xl" />
          <span class="text-[10px] font-medium leading-tight">Lainnya</span>
        </button>
      </div>
    </nav>

    <!-- Mobile drawer "Lainnya" -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 z-[9999]">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="mobileMenuOpen = false" />
          <div class="absolute bottom-0 left-0 right-0 bg-apex-surface rounded-t-3xl border-t border-apex-border overflow-hidden" style="max-height:85vh">

            <!-- Handle bar -->
            <div class="flex justify-center pt-3 pb-1">
              <div class="w-10 h-1 rounded-full bg-apex-border" />
            </div>

            <!-- Header: user info + notif -->
            <div class="flex items-center gap-3 px-5 py-3 border-b border-apex-border">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                :style="{ background: auth.user?.avatar_color || '#2563eb' }">
                {{ auth.user?.nama?.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-apex-text font-semibold text-sm truncate">{{ auth.user?.nama }}</div>
                <div class="text-apex-muted text-xs">{{ auth.user?.role_nama }}</div>
              </div>
              <!-- Notif bell -->
              <button @click="mobileMenuOpen = false; toggleNotif()"
                class="relative p-2 rounded-xl bg-apex-card text-apex-muted hover:text-apex-text">
                <i class="fa-regular fa-bell text-lg" />
                <span v-if="unreadCount > 0"
                  class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {{ unreadCount > 99 ? '99+' : unreadCount }}
                </span>
              </button>
            </div>

            <!-- Scrollable menu content -->
            <div class="overflow-y-auto" style="max-height:calc(85vh - 140px)">
              <div v-for="group in drawerMenuGroups" :key="group.name" class="px-4 pt-4 pb-2">
                <div class="text-[10px] font-bold uppercase tracking-widest text-apex-faint mb-2 px-1">{{ group.name }}</div>
                <div class="grid grid-cols-4 gap-2">
                  <NuxtLink
                    v-for="m in group.menus"
                    :key="m.key"
                    :to="m.url"
                    @click="mobileMenuOpen = false"
                    class="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-colors text-center"
                    :class="isActive(m.url) ? 'bg-primary-700/30 text-primary-300' : 'bg-apex-card text-apex-muted hover:bg-apex-border hover:text-apex-text'"
                  >
                    <i :class="`fa-solid ${m.icon} text-xl`"
                       :style="isActive(m.url) ? '' : 'color: inherit'" />
                    <span class="text-[10px] font-medium leading-tight">{{ m.shortLabel || m.label }}</span>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Logout -->
            <div class="px-4 py-3 border-t border-apex-border" style="padding-bottom: calc(env(safe-area-inset-bottom) + 12px)">
              <button @click="auth.logout()" class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-900/30 text-red-400 text-sm font-semibold">
                <i class="fa-solid fa-right-from-bracket" /> Logout
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Tutup notif dropdown jika klik di luar -->
    <div v-if="notifOpen" class="fixed inset-0 z-[9980]" @click="notifOpen = false" />

    <!-- Notification Dropdown -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="notifOpen"
             class="fixed z-[9985] w-80 rounded-xl shadow-2xl border overflow-hidden"
             :class="isDark ? 'bg-apex-surface border-apex-border' : 'bg-white border-slate-200'"
             :style="notifDropdownStyle">

          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-apex-border">
            <div class="flex items-center gap-2">
              <i class="fa-regular fa-bell text-primary-400" />
              <span class="font-semibold text-sm text-apex-text">Notifikasi</span>
              <span v-if="unreadCount > 0"
                    class="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                {{ unreadCount }}
              </span>
            </div>
            <button v-if="unreadCount > 0"
                    @click="markAllRead"
                    class="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Tandai semua dibaca
            </button>
          </div>

          <!-- List -->
          <div class="overflow-y-auto max-h-[420px]">
            <div v-if="notifLoading" class="py-10 text-center text-apex-faint text-sm">
              <i class="fa-solid fa-circle-notch fa-spin mr-2" />Memuat...
            </div>

            <div v-else-if="notifications.length === 0"
                 class="py-10 text-center text-apex-faint text-sm">
              <i class="fa-regular fa-bell-slash text-2xl block mb-2 opacity-40" />
              Tidak ada notifikasi
            </div>

            <div v-else>
              <div v-for="n in notifications" :key="n.id"
                   @click="handleNotifClick(n)"
                   class="flex gap-3 px-4 py-3 border-b border-apex-border/50 cursor-pointer transition-colors hover:bg-apex-card/60 last:border-0"
                   :class="!n.read_at ? 'bg-primary-900/10' : ''">

                <!-- Icon -->
                <div class="flex-shrink-0 mt-0.5">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                       :class="notifIconBg(n.type)">
                    <i :class="notifIcon(n.type)" />
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-apex-text leading-snug"
                       :class="!n.read_at ? 'text-apex-text' : 'text-apex-muted'">
                    {{ n.title }}
                  </div>
                  <div class="text-xs text-apex-muted mt-0.5 leading-relaxed line-clamp-2">
                    {{ n.body }}
                  </div>
                  <div class="text-[10px] text-apex-faint mt-1">
                    {{ timeAgo(n.created_at) }}
                  </div>
                </div>

                <!-- Unread dot -->
                <div v-if="!n.read_at" class="flex-shrink-0 mt-1.5">
                  <div class="w-2 h-2 rounded-full bg-primary-500" />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-4 py-2.5 border-t border-apex-border text-center">
            <button @click="refreshNotifs"
                    class="text-xs text-apex-faint hover:text-apex-text transition-colors">
              <i class="fa-solid fa-rotate-right mr-1" />Refresh
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Tutup dropdown jika klik di luar -->
    <div v-if="userMenuOpen" class="fixed inset-0 z-[9990]" @click="userMenuOpen = false" />

    <!-- Dropdown user menu -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="userMenuOpen"
             class="fixed rounded-xl shadow-2xl overflow-hidden z-[9995] w-56 border-2"
             :class="isDark
               ? 'bg-apex-surface border-apex-border'
               : 'bg-white border-[#3d4f66]'"
             :style="dropdownStyle">
          <button @click="openChangePassword"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-apex-text hover:bg-apex-card transition-colors">
            <i class="fa-solid fa-key text-primary-400 w-4 text-center" />
            Ubah Password
          </button>
          <!-- Theme option in dropdown -->
          <button @click="toggleTheme"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-apex-text hover:bg-apex-card transition-colors">
            <i :class="isDark ? 'fa-regular fa-sun text-yellow-400' : 'fa-regular fa-moon text-indigo-400'" class="w-4 text-center" />
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </button>
          <div class="h-px bg-apex-border" />
          <button @click="auth.logout()"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors">
            <i class="fa-solid fa-right-from-bracket w-4 text-center" />
            Logout
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Ubah Password -->
    <div v-if="showChangePwd" class="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div class="bg-apex-surface border border-apex-border rounded-xl w-full max-w-sm shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-apex-border">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary-900/50 flex items-center justify-center">
              <i class="fa-solid fa-key text-primary-400" />
            </div>
            <h3 class="font-semibold text-apex-text">Ubah Password</h3>
          </div>
          <button @click="showChangePwd = false" class="btn-ghost btn-xs"><i class="fa-solid fa-xmark" /></button>
        </div>
        <form @submit.prevent="submitChangePassword" class="p-5 space-y-4">
          <div>
            <label class="form-label">Password Lama</label>
            <div class="relative">
              <input v-model="pwdForm.old_password"
                     :type="showOld ? 'text' : 'password'"
                     class="form-input pr-10" placeholder="Password saat ini" autocomplete="current-password" />
              <button type="button" @click="showOld = !showOld"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-apex-faint hover:text-apex-text">
                <i :class="showOld ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
              </button>
            </div>
          </div>
          <div>
            <label class="form-label">Password Baru</label>
            <div class="relative">
              <input v-model="pwdForm.new_password"
                     :type="showNew ? 'text' : 'password'"
                     class="form-input pr-10" placeholder="Min. 8 karakter" autocomplete="new-password" />
              <button type="button" @click="showNew = !showNew"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-apex-faint hover:text-apex-text">
                <i :class="showNew ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
              </button>
            </div>
          </div>
          <div>
            <label class="form-label">Konfirmasi Password Baru</label>
            <input v-model="pwdForm.confirm_password"
                   :type="showNew ? 'text' : 'password'"
                   class="form-input" placeholder="Ulangi password baru" autocomplete="new-password" />
          </div>
          <div v-if="pwdForm.new_password" class="space-y-1">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i"
                   class="h-1 flex-1 rounded-full transition-all duration-300"
                   :class="i <= pwdStrength ? pwdStrengthColor : 'bg-apex-card'" />
            </div>
            <div class="text-xs" :class="pwdStrengthTextColor">{{ pwdStrengthLabel }}</div>
          </div>
          <div v-if="pwdError"
               class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300">
            <i class="fa-solid fa-circle-exclamation text-red-400 shrink-0" />{{ pwdError }}
          </div>
          <div v-if="pwdSuccess"
               class="flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/50 rounded-lg px-3 py-2 text-xs text-emerald-300">
            <i class="fa-solid fa-circle-check text-emerald-400 shrink-0" />{{ pwdSuccess }}
          </div>
          <div class="flex gap-2 justify-end pt-1">
            <button type="button" @click="showChangePwd = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="savingPwd">
              <i v-if="savingPwd" class="fa-solid fa-circle-notch fa-spin" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth  = useAuthStore()
const route = useRoute()
const { put } = useApi()
const { isDark, toggle: toggleTheme } = useTheme()

// ── User dropdown ─────────────────────────────────────────────────────────
const userMenuOpen  = ref(false)
const avatarRowRef  = ref<HTMLElement | null>(null)
const dropdownStyle = ref({ bottom: '0px', left: '0px', width: '224px' })

function toggleUserMenu() {
  if (!userMenuOpen.value) {
    const rect = avatarRowRef.value?.getBoundingClientRect()
    if (rect) {
      dropdownStyle.value = {
        bottom: `${window.innerHeight - rect.top + 8}px`,
        left  : `${rect.left}px`,
        width : `${rect.width}px`,
      }
    }
  }
  userMenuOpen.value = !userMenuOpen.value
}

// ── Change password ───────────────────────────────────────────────────────
const showChangePwd = ref(false)
const savingPwd     = ref(false)
const pwdError      = ref('')
const pwdSuccess    = ref('')
const showOld       = ref(false)
const showNew       = ref(false)
const pwdForm       = reactive({ old_password: '', new_password: '', confirm_password: '' })

function openChangePassword() {
  userMenuOpen.value = false
  Object.assign(pwdForm, { old_password: '', new_password: '', confirm_password: '' })
  pwdError.value   = ''
  pwdSuccess.value = ''
  showOld.value    = false
  showNew.value    = false
  showChangePwd.value = true
}

const pwdStrength      = computed(() => {
  const p = pwdForm.new_password
  if (!p) return 0
  let s = 0
  if (p.length >= 8)           s++
  if (/[A-Z]/.test(p))         s++
  if (/[0-9]/.test(p))         s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const pwdStrengthColor     = computed(() => ['','bg-red-500','bg-orange-400','bg-yellow-400','bg-emerald-500'][pwdStrength.value])
const pwdStrengthTextColor = computed(() => ['','text-red-400','text-orange-400','text-yellow-400','text-emerald-400'][pwdStrength.value])
const pwdStrengthLabel     = computed(() => ['','Lemah','Cukup','Kuat','Sangat Kuat'][pwdStrength.value])

async function submitChangePassword() {
  pwdError.value   = ''
  pwdSuccess.value = ''
  if (!pwdForm.old_password)           { pwdError.value = 'Password lama wajib diisi.'; return }
  if (pwdForm.new_password.length < 8) { pwdError.value = 'Password baru minimal 8 karakter.'; return }
  if (pwdForm.new_password !== pwdForm.confirm_password) { pwdError.value = 'Konfirmasi password tidak cocok.'; return }
  savingPwd.value = true
  try {
    await put('/v1/auth/change-password', { current_password: pwdForm.old_password, new_password: pwdForm.new_password })
    pwdSuccess.value = 'Password berhasil diubah.'
    Object.assign(pwdForm, { old_password: '', new_password: '', confirm_password: '' })
    setTimeout(() => { showChangePwd.value = false; pwdSuccess.value = '' }, 1800)
  } catch (e: any) {
    pwdError.value = e?.data?.message || e?.message || 'Gagal mengubah password.'
  } finally {
    savingPwd.value = false
  }
}

// ── Notifications ─────────────────────────────────────────────────────────
const { get, put: apiPut } = useApi()
const bellRef           = ref<HTMLElement | null>(null)
const notifOpen         = ref(false)
const notifLoading      = ref(false)
const notifications     = ref<any[]>([])
const unreadCount       = ref(0)
const notifDropdownStyle = ref({})

async function fetchNotifs() {
  try {
    const res = await get('/v1/notifications', { limit: 30 })
    notifications.value = res.notifications || []
    unreadCount.value   = res.unread_count  || 0
  } catch {}
}

async function refreshNotifs() {
  notifLoading.value = true
  await fetchNotifs()
  notifLoading.value = false
}

function toggleNotif() {
  if (!notifOpen.value) {
    const rect = bellRef.value?.getBoundingClientRect()
    if (rect) {
      notifDropdownStyle.value = {
        top  : `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
      }
    }
    refreshNotifs()
  }
  notifOpen.value = !notifOpen.value
}

async function markAllRead() {
  await apiPut('/v1/notifications/read-all', {})
  notifications.value.forEach(n => { if (!n.read_at) n.read_at = new Date().toISOString() })
  unreadCount.value = 0
}

async function handleNotifClick(n: any) {
  if (!n.read_at) {
    await apiPut(`/v1/notifications/${n.id}/read`, {})
    n.read_at = new Date().toISOString()
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  notifOpen.value = false
  if (n.lead_id) navigateTo(`/pipeline/${n.lead_id}`)
}

function notifIcon(type: string) {
  const map: Record<string, string> = {
    overdue : 'fa-solid fa-clock text-red-400',
    stale   : 'fa-solid fa-hourglass-half text-orange-400',
    closing : 'fa-solid fa-bullseye text-emerald-400',
    reminder: 'fa-solid fa-calendar-check text-blue-400',
    comment : 'fa-solid fa-comment text-purple-400',
    approval: 'fa-solid fa-check-to-slot text-yellow-400',
    warning : 'fa-solid fa-triangle-exclamation text-orange-400',
    info    : 'fa-solid fa-circle-info text-blue-400',
  }
  return map[type] || 'fa-solid fa-bell text-apex-muted'
}

function notifIconBg(type: string) {
  const map: Record<string, string> = {
    overdue : 'bg-red-900/30',
    stale   : 'bg-orange-900/30',
    closing : 'bg-emerald-900/30',
    reminder: 'bg-blue-900/30',
    comment : 'bg-purple-900/30',
    approval: 'bg-yellow-900/30',
    warning : 'bg-orange-900/30',
    info    : 'bg-blue-900/30',
  }
  return map[type] || 'bg-apex-card'
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)   return 'Baru saja'
  if (mins < 60)  return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} jam lalu`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const { navGroups } = useNavMenus()
const sidebarOpen   = ref(true)
const isMobile      = ref(false)
const mobileMenuOpen = ref(false)

// Label pendek untuk grid 4 kolom di drawer
const SHORT_LABELS: Record<string, string> = {
  today:              'Hari Ini',
  calendar:           'Kalender',
  plan:               'Planner',
  followup:           'Log FU',
  field_activity:     'Check-In',
  field_monitor:      'Monitor',
  daily_report:       'Laporan',
  dashboard:          'Dashboard',
  pipeline:           'Pipeline',
  contacts:           'Kontak',
  winloss:            'Win/Loss',
  insights:           'Insights',
  forecast:           'Forecast',
  heatmap:            'Heatmap',
  sales_target:       'Target',
  rev_annual_target:  'Annual',
  rev_dashboard:      'Revenue',
  rev_insights:       'Insights',
  rev_tracker:        'Tracker',
  rev_monthly:        'Monthly',
  rev_proj_view:      'Projects',
  rev_invoice:        'Invoice',
  rev_kpi:            'KPI',
  rev_budget:         'Budget',
  export:             'Export',
  import:             'Import',
  products:           'Produk',
  org:                'Organisasi',
  sales:              'Sales',
  roles:              'Roles',
  users:              'Users',
  settings:           'Setelan',
  cleansing:          'Cleansing',
  entertain:          'Entertain',
  entertain_claims:   'Klaim',
  entertain_approval: 'Approval',
}

// Bottom nav: 5 item tetap
const BOTTOM_NAV_KEYS = ['dashboard', 'pipeline', 'today', 'calendar']
const BOTTOM_NAV_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  pipeline:  'Pipeline',
  today:     'Hari Ini',
  calendar:  'Kalender FU',
}

const bottomNavItems = computed(() => {
  const allMenus = navGroups.value.flatMap((g: any) => g.menus)
  const allowed = new Set(allMenus.map((m: any) => m.key))
  return BOTTOM_NAV_KEYS
    .filter(k => allowed.has(k))
    .map(k => {
      const m = allMenus.find((m: any) => m.key === k)
      return { ...m, label: BOTTOM_NAV_LABELS[k] }
    })
})

// Drawer: semua menu kecuali 5 bottom nav, dikelompokkan
const drawerMenuGroups = computed(() => {
  const bottomKeys = new Set(BOTTOM_NAV_KEYS)
  const groups: { name: string; menus: any[] }[] = []
  for (const g of navGroups.value) {
    const menus = g.menus
      .filter((m: any) => !bottomKeys.has(m.key))
      .map((m: any) => ({ ...m, shortLabel: SHORT_LABELS[m.key] || m.label }))
    if (menus.length) groups.push({ name: g.name, menus })
  }
  return groups
})

const todayStr = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

function isActive(url: string): boolean {
  if (url === '/') return route.path === '/'
  if (route.path === url) return true
  // only treat as prefix-match if url ends with / or next char is /
  return route.path.startsWith(url + '/')
}

function groupHasActive(group: { menus: { url: string }[] }): boolean {
  return group.menus.some(m => isActive(m.url))
}

// ── Collapsible groups ────────────────────────────────────────────────────
const STORAGE_KEY = 'apex-nav-open-groups'
const openGroups  = ref<Set<string>>(new Set())

function initOpenGroups() {
  // Buka group yang mengandung halaman aktif
  const activeGroups = new Set<string>()
  for (const g of navGroups.value) {
    if (groupHasActive(g)) activeGroups.add(g.name)
  }
  // Gabungkan dengan persisted state dari localStorage
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    for (const name of saved) activeGroups.add(name)
  } catch {}
  openGroups.value = activeGroups
}

function toggleGroup(name: string) {
  const next = new Set(openGroups.value)
  next.has(name) ? next.delete(name) : next.add(name)
  openGroups.value = next
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch {}
}

// Jika navigasi ke halaman baru, buka group-nya otomatis
watch(() => route.path, () => {
  for (const g of navGroups.value) {
    if (groupHasActive(g) && !openGroups.value.has(g.name)) {
      const next = new Set(openGroups.value)
      next.add(g.name)
      openGroups.value = next
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch {}
    }
  }
})

function closeSidebarOnMobile() {
  if (isMobile.value) sidebarOpen.value = false
}

let notifInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  isMobile.value    = window.innerWidth < 768
  sidebarOpen.value = !isMobile.value
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
  initOpenGroups()
  fetchNotifs()
  notifInterval = setInterval(fetchNotifs, 60_000)
})

onUnmounted(() => {
  if (notifInterval) clearInterval(notifInterval)
})
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all .2s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(8px); }
</style>
