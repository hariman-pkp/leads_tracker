<template>
  <div ref="mapEl" class="w-full rounded-xl overflow-hidden" :style="`height:${height}px`" />
</template>

<script setup lang="ts">
export interface MapMarker {
  user_id:       number
  sales_nama:    string
  latitude:      number
  longitude:     number
  address?:      string
  is_active:     boolean
  checked_in_at: string
  checked_out_at?: string | null
  client_nama?:  string | null
  type:          string
  notes?:        string | null
}

export interface TrailPoint {
  user_id:       number
  latitude:      number
  longitude:     number
  checked_in_at: string
  type:          string
}

const props = withDefaults(defineProps<{
  markers:  MapMarker[]
  trails?:  TrailPoint[]
  height?:  number
  center?:  [number, number]
  zoom?:    number
}>(), {
  trails:  () => [],
  height:  420,
  center:  () => [-6.2088, 106.8456], // Jakarta default
  zoom:    12,
})

const mapEl = ref<HTMLElement | null>(null)
let map: any         = null
let markerLayer: any = null  // markerClusterGroup
let trailLayer: any  = null

// Warna per user_id
const USER_COLORS = ['#22c55e','#3b82f6','#f97316','#a855f7','#ec4899','#14b8a6','#eab308','#ef4444']
function userColor(userId: number) {
  return USER_COLORS[userId % USER_COLORS.length]
}

function makeIcon(color: string, isActive: boolean) {
  const pulse = isActive
    ? `<span style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;background:${color};border-radius:50%;animation:pulse 1.5s infinite;border:2px solid #fff"></span>`
    : ''
  return `
    <div style="position:relative;width:36px;height:36px">
      <div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:${color};border:3px solid #fff;
        transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.4);
        opacity:${isActive ? 1 : 0.55}
      "></div>
      <i class="fa-solid fa-user" style="
        position:absolute;top:7px;left:9px;
        font-size:12px;color:#fff;
      "></i>
      ${pulse}
    </div>`
}

async function initMap() {
  if (!mapEl.value || map) return

  const L = (await import('leaflet')).default
  await import('leaflet.markercluster')

  map = L.map(mapEl.value, {
    center: props.center,
    zoom:   props.zoom,
    zoomControl: true,
  })

  await addTileLayer(L, map)

  markerLayer = (L as any).markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    iconCreateFunction: (c: any) => {
      const count  = c.getChildCount()
      const active = c.getAllChildMarkers().some((m: any) => m.options.isActive)
      const bg     = active ? '#22c55e' : '#6366f1'
      return L.divIcon({
        className: '',
        html: `<div style="
          width:38px;height:38px;border-radius:50%;
          background:${bg};border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,.45);
          display:flex;align-items:center;justify-content:center;
          font-size:13px;font-weight:700;color:#fff;
        ">${count}</div>`,
        iconSize:   [38, 38],
        iconAnchor: [19, 19],
      })
    },
  }).addTo(map)

  trailLayer = L.layerGroup().addTo(map)

  renderMarkers(L)
}

function renderMarkers(L: any) {
  markerLayer.clearLayers()  // clearLayers bekerja pada markerClusterGroup maupun layerGroup
  trailLayer.clearLayers()

  if (!props.markers.length) return

  const bounds: [number, number][] = []

  // Trail polylines per user
  const trailByUser: Record<number, [number, number][]> = {}
  for (const t of props.trails) {
    if (!trailByUser[t.user_id]) trailByUser[t.user_id] = []
    trailByUser[t.user_id].push([t.latitude, t.longitude])
  }
  for (const [uid, points] of Object.entries(trailByUser)) {
    const color = userColor(Number(uid))
    L.polyline(points, {
      color, weight: 2.5, opacity: 0.5, dashArray: '6,4',
    }).addTo(trailLayer)
  }

  // Markers
  for (const m of props.markers) {
    const color  = userColor(m.user_id)
    const icon   = L.divIcon({
      html:      makeIcon(color, m.is_active),
      className: '',
      iconSize:  [36, 36],
      iconAnchor:[18, 36],
      popupAnchor:[0, -38],
    })

    const toUtc = (s: string) => /Z|[+-]\d{2}:\d{2}$/.test(s) ? new Date(s) : new Date(s.replace(' ','T')+'Z')
    const checkinTime  = m.checked_in_at  ? toUtc(m.checked_in_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : '—'
    const checkoutTime = m.checked_out_at ? toUtc(m.checked_out_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : null

    const popup = `
      <div style="font-family:sans-serif;min-width:180px">
        <div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:4px">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:4px"></span>
          ${m.sales_nama}
        </div>
        ${m.client_nama ? `<div style="font-size:11px;color:#475569;margin-bottom:2px">📍 ${m.client_nama}</div>` : ''}
        ${m.address ? `<div style="font-size:10px;color:#64748b;margin-bottom:4px">${m.address}</div>` : ''}
        <div style="display:flex;gap:8px;font-size:11px;color:#64748b">
          <span>Masuk: <b style="color:#16a34a">${checkinTime}</b></span>
          ${checkoutTime ? `<span>Keluar: <b style="color:#dc2626">${checkoutTime}</b></span>` : '<span style="color:#f59e0b">● Aktif</span>'}
        </div>
        ${m.notes ? `<div style="font-size:10px;color:#94a3b8;margin-top:3px;font-style:italic">${m.notes}</div>` : ''}
      </div>`

    markerLayer.addLayer(
      L.marker([m.latitude, m.longitude], { icon, isActive: m.is_active } as any)
       .bindPopup(popup, { maxWidth: 240 })
    )

    bounds.push([m.latitude, m.longitude])
  }

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }
}

// Watch markers + trails
watch(() => [props.markers, props.trails], async () => {
  if (!map) return
  const L = (await import('leaflet')).default
  renderMarkers(L)
}, { deep: true })

onMounted(async () => {
  await nextTick()
  await initMap()
})

onUnmounted(() => {
  if (map) { map.remove(); map = null }
})
</script>

<style>
@keyframes pulse {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(1.5); opacity: .5; }
  100% { transform: scale(1); opacity: 1; }
}
.leaflet-container { background: #0f172a !important; }
.leaflet-popup-content-wrapper {
  background: #fff !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 20px rgba(0,0,0,.25) !important;
}
.leaflet-popup-tip { background: #fff !important; }
</style>
