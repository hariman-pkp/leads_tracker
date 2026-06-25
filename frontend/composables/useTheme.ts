type Theme = 'dark' | 'light'

const STORAGE_KEY = 'apex-theme'

const _theme = ref<Theme>('dark')

export function useTheme() {
  const isDark = computed(() => _theme.value === 'dark')

  function apply(t: Theme) {
    _theme.value = t
    if (import.meta.client) {
      document.documentElement.classList.toggle('light', t === 'light')
      localStorage.setItem(STORAGE_KEY, t)
    }
  }

  function toggle() {
    apply(_theme.value === 'dark' ? 'light' : 'dark')
  }

  function init() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    apply(saved ?? 'dark')
  }

  return { theme: _theme, isDark, toggle, init, apply }
}
