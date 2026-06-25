const TILE_URLS: Record<string, { url: string; attr: string }> = {
  osm: {
    url:  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  },
  voyager: {
    url:  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attr: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors © <a href="https://carto.com/">CartoDB</a>',
  },
  hot: {
    url:  'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attr: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Tiles by <a href="https://hotosm.org/">HOT</a>',
  },
  voyager_nolabel: {
    url:  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
    attr: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors © <a href="https://carto.com/">CartoDB</a>',
  },
}

let _cachedTile: { url: string; attr: string } | null = null
let _pendingCount  = 0
let _flushTimer: ReturnType<typeof setTimeout> | null = null

async function _flush() {
  if (_pendingCount === 0) return
  const n     = _pendingCount
  _pendingCount = 0
  try {
    const config = useRuntimeConfig()
    const auth   = useAuthStore()
    await $fetch(`${config.public.apiBase}/v1/tile-usage`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body:    { count: n },
    })
  } catch {}
}

export async function getMapTile(): Promise<{ url: string; attr: string }> {
  if (_cachedTile) return _cachedTile
  try {
    const config = useRuntimeConfig()
    const auth   = useAuthStore()
    const res    = await $fetch<Record<string, string>>(`${config.public.apiBase}/v1/app-settings`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    const key  = res?.map_tile || 'osm'
    _cachedTile = TILE_URLS[key] ?? TILE_URLS.osm
  } catch {
    _cachedTile = TILE_URLS.osm
  }
  return _cachedTile
}

export async function addTileLayer(L: any, map: any): Promise<void> {
  const tile  = await getMapTile()
  const layer = L.tileLayer(tile.url, { attribution: tile.attr, maxZoom: 19 }).addTo(map)
  layer.on('tileload', () => {
    _pendingCount++
    if (_flushTimer) clearTimeout(_flushTimer)
    _flushTimer = setTimeout(_flush, 3000)
  })
}

export function resetMapTileCache() {
  _cachedTile = null
}
