<template>
  <form @submit.prevent="handleSubmit" class="card space-y-5">
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2">
        <label class="form-label">Nama Company *</label>
        <input v-model="form.nama_company" class="form-input" required placeholder="PT ..." />
      </div>
      <div>
        <label class="form-label">Produk / Layanan</label>
        <ProductSelect v-model="form.product" :products="productList" placeholder="Ketik atau pilih produk..." />
      </div>
      <div>
        <label class="form-label">Contact Person</label>
        <input v-model="form.contact_person" class="form-input" placeholder="Nama PIC" />
      </div>
      <div>
        <label class="form-label">Segmen</label>
        <select v-model="form.segmen" class="form-select">
          <option value="">— Pilih —</option>
          <option v-for="s in segmens" :key="s">{{ s }}</option>
        </select>
      </div>
      <div>
        <label class="form-label">Sub Segmen</label>
        <input v-model="form.sub_segmen" class="form-input" placeholder="Opsional" />
      </div>
      <div>
        <label class="form-label">Stage</label>
        <select v-model="form.stage" class="form-select" @change="form.probability = STAGE_PROBABILITY[form.stage] ?? form.probability">
          <option v-for="s in stages" :key="s">{{ s }}</option>
        </select>
      </div>
      <div>
        <label class="form-label">Prioritas</label>
        <select v-model="form.prioritas" class="form-select">
          <option>Hot</option><option>Warm</option><option>Cold</option>
        </select>
      </div>
      <div>
        <label class="form-label">Source</label>
        <select v-model="form.source" class="form-select">
          <option value="">— Pilih —</option>
          <option>Referral</option><option>Cold Call</option><option>Event</option>
          <option>Website</option><option>Existing Client</option><option>Tender</option>
          <option>Partnership</option><option>Internal</option>
        </select>
      </div>
      <div>
        <label class="form-label">Sales Owner</label>
        <select v-model="form.sales_owner" class="form-select">
          <option value="">— Pilih —</option>
          <option v-for="s in salesList" :key="s">{{ s }}</option>
        </select>
      </div>
      <div>
        <label class="form-label">Organisasi</label>
        <select v-model="form.organisasi" class="form-select">
          <option value="">— Pilih Organisasi —</option>
          <option v-for="o in orgList" :key="o.kode" :value="o.kode">
            {{ o.kode }} — {{ o.nama }}
          </option>
        </select>
      </div>
      <div>
        <label class="form-label">Tanggal Masuk</label>
        <input v-model="form.tgl_masuk" type="date" class="form-input" />
      </div>
      <div>
        <label class="form-label">Propose Value (Rp)</label>
        <input v-model.number="form.propose_value" type="number" class="form-input" min="0" step="1000000" />
      </div>
      <div>
        <label class="form-label">Deal Value (Rp)</label>
        <input v-model.number="form.deal_value" type="number" class="form-input" min="0" step="1000000" />
      </div>
      <div>
        <label class="form-label">Probability (%)</label>
        <input v-model.number="form.probability" type="number" class="form-input" min="0" max="100" />
      </div>
      <div>
        <label class="form-label">Exp. Close Date</label>
        <input v-model="form.exp_close_date" type="date" class="form-input" />
      </div>
      <div>
        <label class="form-label">Next FU Date</label>
        <input v-model="form.next_fu_date" type="date" class="form-input" />
      </div>
      <div class="col-span-2">
        <label class="form-label">Remarks</label>
        <textarea v-model="form.remarks" class="form-textarea h-20" placeholder="Catatan tambahan..." />
      </div>

      <!-- Loss Reason — hanya muncul saat stage = Lost -->
      <div v-if="form.stage === 'Lost'" class="col-span-2">
        <label class="form-label text-red-400">
          <i class="fa-solid fa-circle-xmark mr-1" />Alasan Tidak Menang (Loss Reason)
        </label>
        <select v-model="form.loss_reason" class="form-select">
          <option value="">— Pilih alasan —</option>
          <option value="Harga tidak kompetitif">Harga tidak kompetitif</option>
          <option value="Kalah dari kompetitor">Kalah dari kompetitor</option>
          <option value="Budget klien terbatas">Budget klien terbatas</option>
          <option value="Proyek ditunda">Proyek ditunda</option>
          <option value="Kebutuhan berubah">Kebutuhan berubah</option>
          <option value="Tidak ada respons">Tidak ada respons dari klien</option>
          <option value="Fitur tidak sesuai">Fitur / produk tidak sesuai kebutuhan</option>
          <option value="Hubungan tidak terjalin">Hubungan tidak terjalin dengan baik</option>
          <option value="Lainnya">Lainnya</option>
        </select>
        <textarea v-if="form.loss_reason === 'Lainnya'"
                  v-model="form.loss_reason_detail"
                  class="form-textarea h-16 mt-2"
                  placeholder="Jelaskan alasan lainnya..." />
      </div>
    </div>

    <div class="flex gap-3 justify-end pt-2 border-t border-navy-800">
      <NuxtLink to="/pipeline" class="btn-secondary">Batal</NuxtLink>
      <button type="submit" class="btn-primary" :disabled="loading">
        <i v-if="loading" class="fa-solid fa-circle-notch fa-spin" />
        <i v-else class="fa-solid fa-floppy-disk" />
        Simpan
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  initial?: Record<string, any> | null
  salesList?: string[]
  orgList?: { kode: string; nama: string }[]
  productList?: { kode: string; nama: string; kategori?: string }[]
  loading?: boolean
}>()
const emit = defineEmits(['submit'])

const stages  = ['New','In Progress','Demo Scheduled','Proposal Sent','Negotiation','Won','On Hold','Lost']
const { segmens } = useSegmen()

const STAGE_PROBABILITY: Record<string, number> = {
  'New': 10, 'In Progress': 20, 'Demo Scheduled': 40,
  'Proposal Sent': 60, 'Negotiation': 80, 'Won': 100,
  'On Hold': 20, 'Lost': 0,
}

const { todayStr } = useFormat()
const today = todayStr()

const form = reactive({
  nama_company:   props.initial?.nama_company   || '',
  product:        props.initial?.product        || '',
  contact_person: props.initial?.contact_person || '',
  segmen:         props.initial?.segmen         || '',
  sub_segmen:     props.initial?.sub_segmen     || '',
  source:         props.initial?.source         || '',
  stage:          props.initial?.stage          || 'New',
  prioritas:      props.initial?.prioritas      || 'Warm',
  sales_owner:    props.initial?.sales_owner    || '',
  organisasi:     props.initial?.organisasi     || '',
  tgl_masuk:      props.initial?.tgl_masuk      || today,
  propose_value:  props.initial?.propose_value  || 0,
  deal_value:     props.initial?.deal_value     || 0,
  probability:    props.initial?.probability    || 0,
  exp_close_date: props.initial?.exp_close_date || '',
  next_fu_date:        props.initial?.next_fu_date   || '',
  remarks:             props.initial?.remarks        || '',
  loss_reason:         props.initial?.loss_reason    || '',
  loss_reason_detail:  '',
})

// Saat submit, gabungkan loss_reason + detail kalau "Lainnya"
const originalEmit = emit
function handleSubmit() {
  const payload = { ...form }
  if (payload.loss_reason === 'Lainnya' && payload.loss_reason_detail) {
    payload.loss_reason = payload.loss_reason_detail
  }
  delete (payload as any).loss_reason_detail
  emit('submit', payload)
}
</script>
