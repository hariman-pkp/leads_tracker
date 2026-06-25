import { defineStore } from 'pinia'

interface User {
  id: number
  nama: string
  email: string
  role_id: number
  role_nama: string
  allowed_menus: string[]
}

interface AuthState {
  token: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    canAccess: (state) => (menuKey: string) =>
      state.user?.allowed_menus?.includes(menuKey) ?? false,
  },

  actions: {
    init() {
      if (import.meta.client) {
        const token   = localStorage.getItem('crm_token')
        const userStr = localStorage.getItem('crm_user')
        if (token && userStr) {
          try {
            this.token = token
            this.user  = JSON.parse(userStr)
          } catch {
            this.clear()
          }
        }
      }
    },

    setAuth(token: string, user: User) {
      this.token = token
      this.user  = user
      if (import.meta.client) {
        localStorage.setItem('crm_token', token)
        localStorage.setItem('crm_user', JSON.stringify(user))
      }
    },

    clear() {
      this.token = null
      this.user  = null
      if (import.meta.client) {
        localStorage.removeItem('crm_token')
        localStorage.removeItem('crm_user')
      }
    },

    async syncMenus() {
      if (!this.token) return
      try {
        const config = useRuntimeConfig()
        const res = await $fetch<any>(`${config.public.apiBase}/v1/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        if (res?.allowed_menus && this.user) {
          this.user = { ...this.user, allowed_menus: res.allowed_menus }
          if (import.meta.client) localStorage.setItem('crm_user', JSON.stringify(this.user))
        }
      } catch {}
    },

    async logout() {
      this.clear()
      await navigateTo('/login')
    },
  },
})
