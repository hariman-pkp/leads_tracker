/**
 * composables/useApi.ts
 * Wrapper untuk semua HTTP call ke REST API.
 * Otomatis menambahkan Authorization header dari auth store.
 */

export function useApi() {
  const config  = useRuntimeConfig()
  const auth    = useAuthStore()

  const serverURL = (config.apiBaseServer as string) || 'http://localhost:8001/api'
  const clientURL = config.public.apiBase as string  // '/api-proxy'

  /**
   * Core fetch — tambah JWT header secara otomatis.
   * Mutation (POST/PUT/PATCH/DELETE) selalu pakai clientURL (proxy ke Laravel)
   * karena tidak boleh dijalankan server-side.
   * GET boleh pakai serverURL saat SSR untuk data fetching.
   */
  async function apiFetch<T = any>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> {
    const method = ((options.method as string) || 'GET').toUpperCase()
    const isMutation = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
    const baseURL = (isMutation || !import.meta.server) ? clientURL : serverURL

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }
    if (auth.token) {
      headers['Authorization'] = `Bearer ${auth.token}`
    }
    try {
      return await $fetch<T>(`${baseURL}${path}`, {
        ...options,
        headers,
      })
    } catch (err: any) {
      // Jika 401 → logout otomatis
      if (err?.response?.status === 401) {
        auth.clear()
        await navigateTo('/login')
      }
      throw err
    }
  }

  // Convenience methods
  const get  = <T = any>(path: string, query?: Record<string, any>) =>
    apiFetch<T>(path, { method: 'GET', query, cache: 'no-store' as RequestCache })

  const post = <T = any>(path: string, body: any) =>
    apiFetch<T>(path, { method: 'POST', body })

  const put   = <T = any>(path: string, body: any) =>
    apiFetch<T>(path, { method: 'PUT', body })

  const patch = <T = any>(path: string, body: any) =>
    apiFetch<T>(path, { method: 'PATCH', body })

  const del  = <T = any>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' })

  /**
   * Download file as Blob (for template downloads)
   */
  async function getBlob(path: string): Promise<Blob> {
    const baseURL = getBaseURL()
    const headers: Record<string, string> = {}
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    const res = await fetch(`${baseURL}${path}`, { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.blob()
  }

  /**
   * POST with FormData (for file upload)
   */
  async function postForm<T = any>(path: string, formData: FormData): Promise<T> {
    const baseURL = getBaseURL()
    const headers: Record<string, string> = {}
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    const res = await fetch(`${baseURL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) {
      const err: any = new Error(json?.message || `HTTP ${res.status}`)
      err.data = json
      if (res.status === 401) { auth.clear(); await navigateTo('/login') }
      throw err
    }
    return json as T
  }

  return { get, post, put, patch, del, apiFetch, getBlob, postForm }
}
