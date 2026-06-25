/**
 * middleware/auth.ts
 * Global route guard — redirect ke /login jika belum login.
 */
export default defineNuxtRouteMiddleware((to) => {
  // Server tidak punya localStorage — skip, biar client yang cek
  if (import.meta.server) return

  const auth = useAuthStore()
  auth.init()

  if (to.path === '/login') return

  if (!auth.isLoggedIn) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
