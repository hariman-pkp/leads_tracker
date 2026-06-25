/**
 * composables/useApi.ts
 * Wrapper untuk semua HTTP call ke REST API.
 * Otomatis menambahkan Authorization header dari auth store.
 */

export function useApi() {
  const config  = useRuntimeConfig()
  const auth    = useAuthStore()
  // SSR: pakai URL internal langsung ke FastAPI (relative URL tidak bisa resolve di server)
  // Client: pakai /api-proxy yang diforward oleh Nuxt dev server
  const baseURL = import.meta.server
    ? ((config.apiBaseServer as string) || 'http://localhost:8001/api')
    : (config.public.apiBase as string)

  /**
   * Core fetch — tambah JWT header secara otomatis
   */
  async function apiFetch<T = any>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {}
  ): Promise<T> {
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
    apiFetch<T>(path, { method: 'GET', query })

  const post = <T = any>(path: string, body: any) =>
    apiFetch<T>(path, { method: 'POST', body })

  const put  = <T = any>(path: string, body: any) =>
    apiFetch<T>(path, { method: 'PUT', body })

  const del  = <T = any>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' })

  /**
   * Download file as Blob (for template downloads)
   */
  async function getBlob(path: string): Promise<Blob> {
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

  return { get, post, put, del, apiFetch, getBlob, postForm }
}
