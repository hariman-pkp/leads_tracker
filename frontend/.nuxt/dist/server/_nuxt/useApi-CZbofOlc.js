import { u as useAuthStore, d as useRuntimeConfig, n as navigateTo } from "../server.mjs";
function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const baseURL = config.public.apiBase;
  async function apiFetch(path, options = {}) {
    const headers = {
      ...options.headers || {}
    };
    if (auth.token) {
      headers["Authorization"] = `Bearer ${auth.token}`;
    }
    try {
      return await $fetch(`${baseURL}${path}`, {
        ...options,
        headers
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        auth.clear();
        await navigateTo("/login");
      }
      throw err;
    }
  }
  const get = (path, query) => apiFetch(path, { method: "GET", query });
  const post = (path, body) => apiFetch(path, { method: "POST", body });
  const put = (path, body) => apiFetch(path, { method: "PUT", body });
  const del = (path) => apiFetch(path, { method: "DELETE" });
  async function getBlob(path) {
    const headers = {};
    if (auth.token) headers["Authorization"] = `Bearer ${auth.token}`;
    const res = await fetch(`${baseURL}${path}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  }
  async function postForm(path, formData) {
    const headers = {};
    if (auth.token) headers["Authorization"] = `Bearer ${auth.token}`;
    const res = await fetch(`${baseURL}${path}`, {
      method: "POST",
      headers,
      body: formData
    });
    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json?.message || `HTTP ${res.status}`);
      err.data = json;
      if (res.status === 401) {
        auth.clear();
        await navigateTo("/login");
      }
      throw err;
    }
    return json;
  }
  return { get, post, put, del, apiFetch, getBlob, postForm };
}
export {
  useApi as u
};
//# sourceMappingURL=useApi-CZbofOlc.js.map
