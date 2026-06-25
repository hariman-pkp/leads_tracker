/**
 * plugins/auth.client.ts
 * Runs only on client side — before any page/layout mounts.
 * Restores token + user from localStorage so auth is ready
 * before the layout tries to fetch menus.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.init()
  auth.syncMenus()
})
