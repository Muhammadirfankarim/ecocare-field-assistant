// src/app/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Sparkles,
  Bug,
  ShieldAlert,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ThermometerSun,
  Snowflake,
  Save,
  History,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Trash2,
  MapPin,
  Star,
  Clock,
  Users,
  Maximize2,
  Info,
  RotateCcw,
  Download,
  Search,
  ChevronRight,
  Award,
  Layers,
  MessageSquareQuote,
} from 'lucide-react';
import {
  LiniLayanan,
  ProspectObservationInput,
  ProspectPredictionResult,
  SavedProspectRecord,
} from '@/types/prospect';
import {
  evaluateProspect,
  LINI_LABELS,
  validateObservationInput,
} from '@/lib/scoringEngine';

const STORAGE_KEY = 'ecocare_field_prospects_v1';

// Skenario Preset sesuai Notebook MVP untuk Demo Cepat 1-Klik di Lapangan
const PRESET_RESTO: ProspectObservationInput = {
  namaGedung: 'Resto Nusantara Bistro & Grill',
  alamatLokasi: 'Jl. Senopati No. 48, Jakarta Selatan',
  picNama: 'Bpk. Hendra (Store Manager)',
  catatanLapangan: 'Area loading belakang dekat dapur, aroma urinal lantai 1 cukup menyengat.',
  segmen_industri: 'Resto_F&B',
  skala_area_m2: 350,
  traffic_harian: 'Tinggi',
  jam_operasional: '14_Jam',
  rating_online_kebersihan: 3.2,
  kondisi_aroma_toilet: 'Bau_Menyengat',
  fasilitas_cuci_tangan: 'Sabun_Batang_Curah',
  ketersediaan_sanitary_bin: 'Tempat_Sampah_Biasa',
  kondisi_lantai_pintu_masuk: 'Lembap_Licin',
  sirkulasi_udara_ruang: 'Pengap_Panas',
  jarak_tempat_sampah_m: '<5m_Terbuka',
  proteksi_akses_pintu: 'Sering_Terbuka_Celah_Besar',
  aktivitas_loading_barang: 'Tinggi_Tanpa_Inspeksi',
  indikasi_visual_hama: 'Jejak_Tikus_Kecoa_Smear',
  kondisi_sanitasi_drainase: 'Saluran_Kotor_Sisa_Makanan',
  usia_dan_status_bangunan: 'Sedang_5-10Thn',
  dominasi_material_kayu: 'Sedang_Furnitur',
  indikasi_lembap_atau_rayap: 'Aman_Kering',
  penyimpanan_komoditas_arsip: 'Tidak_Ada',
  tuntutan_regulasi_audit: 1,
  kondisi_vendor_saat_ini: 'Ada_Komplain_Tidak_Puas',
};

const PRESET_OFFICE: ProspectObservationInput = {
  namaGedung: 'Menara Cakrawala Sejahtera',
  alamatLokasi: 'Jl. HR Rasuna Said Kav. B-12, Kuningan, Jakarta',
  picNama: 'Ibu Diana (Building Management)',
  catatanLapangan: 'Toilet lantai 2-5 belum ada sanitary bin khusus dan dispenser sabun sering macet.',
  segmen_industri: 'Office_Tower',
  skala_area_m2: 4500,
  traffic_harian: 'Sangat_Tinggi',
  jam_operasional: '12_Jam',
  rating_online_kebersihan: 3.6,
  kondisi_aroma_toilet: 'Bau_Menyengat',
  fasilitas_cuci_tangan: 'Kosong_Tidak_Terawat',
  ketersediaan_sanitary_bin: 'Tidak_Ada',
  kondisi_lantai_pintu_masuk: 'Banyak_Debu_Sepatu',
  sirkulasi_udara_ruang: 'AC_Sentral_Baik',
  jarak_tempat_sampah_m: '>15m_Terisolasi',
  proteksi_akses_pintu: 'Standar_Tertutup',
  aktivitas_loading_barang: 'Rendah',
  indikasi_visual_hama: 'Tidak_Ada',
  kondisi_sanitasi_drainase: 'Bersih_Lancar',
  usia_dan_status_bangunan: 'Baru_<5Thn',
  dominasi_material_kayu: 'Minim_Baja_Kaca',
  indikasi_lembap_atau_rayap: 'Aman_Kering',
  penyimpanan_komoditas_arsip: 'Tidak_Ada',
  tuntutan_regulasi_audit: 0,
  kondisi_vendor_saat_ini: 'Belum_Ada_Internal',
};

const PRESET_WAREHOUSE: ProspectObservationInput = {
  namaGedung: 'Gudang Logistik & Pangan Terpadu Cikarang',
  alamatLokasi: 'Kawasan Industri Jababeka Tahap II, Bekasi',
  picNama: 'Bpk. Antonius (QA & Warehouse Head)',
  catatanLapangan: 'Ditemukan jalur tanah rayap di palet kayu sudut timur & butuh sertifikasi audit.',
  segmen_industri: 'Warehouse_Pabrik',
  skala_area_m2: 6200,
  traffic_harian: 'Sedang',
  jam_operasional: '24_Jam',
  rating_online_kebersihan: 3.9,
  kondisi_aroma_toilet: 'Pengap',
  fasilitas_cuci_tangan: 'Dispenser_Manual',
  ketersediaan_sanitary_bin: 'Tidak_Ada',
  kondisi_lantai_pintu_masuk: 'Banyak_Debu_Sepatu',
  sirkulasi_udara_ruang: 'Ventilasi_Cukup',
  jarak_tempat_sampah_m: '5-15m_Tertutup',
  proteksi_akses_pintu: 'Sering_Terbuka_Celah_Besar',
  aktivitas_loading_barang: 'Tinggi_Tanpa_Inspeksi',
  indikasi_visual_hama: 'Lalat_Semut_Kucing',
  kondisi_sanitasi_drainase: 'Ada_Genangan_Air',
  usia_dan_status_bangunan: 'Tua_>10Thn',
  dominasi_material_kayu: 'Tinggi_Struktur_Partisi_Kayu',
  indikasi_lembap_atau_rayap: 'Ada_Jalur_Tanah_Kayu_Keropos',
  penyimpanan_komoditas_arsip: 'Silo_Pangan_Karung',
  tuntutan_regulasi_audit: 1,
  kondisi_vendor_saat_ini: 'Ada_Komplain_Tidak_Puas',
};

export default function EcoCareFieldAssistantPage() {
  const [activeTab, setActiveTab] = useState<'observasi' | 'riwayat'>('observasi');
  const [formData, setFormData] = useState<ProspectObservationInput>(PRESET_RESTO);
  const [prediction, setPrediction] = useState<ProspectPredictionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedProspectRecord[]>([]);
  const [quarantinedCount, setQuarantinedCount] = useState<number>(0);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const resultPanelRef = useRef<HTMLDivElement | null>(null);

  // Load saved records from LocalStorage with defensive schema validation (DLQ/Quarantine pattern)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid: SavedProspectRecord[] = [];
          let corrupt = 0;
          for (const item of parsed) {
            if (
              item &&
              typeof item.id === 'string' &&
              item.input &&
              typeof item.input.namaGedung === 'string' &&
              item.prediction &&
              typeof item.prediction.probabilitasKonversi === 'number'
            ) {
              valid.push(item);
            } else {
              corrupt += 1;
            }
          }
          setSavedRecords(valid);
          setQuarantinedCount(corrupt);
        }
      }
    } catch (err) {
      console.error('[EcoCare Storage Warning] Gagal memuat riwayat lokal:', err);
    }
  }, []);

  const handleFieldChange = <K extends keyof ProspectObservationInput>(
    field: K,
    value: ProspectObservationInput[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Reset hasil analisis jika input diubah agar hasil hanya muncul saat klik "Analisis Prospek"
    setPrediction(null);
  };

  const handleAnalyzeProspect = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors = validateObservationInput(formData);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    const result = evaluateProspect(formData);
    setPrediction(result);

    setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const handleApplyPreset = (preset: ProspectObservationInput) => {
    setValidationErrors([]);
    setFormData(preset);
    // Hanya mengisi form; hasil AI baru muncul ketika user mengklik "Analisis Prospek"
    setPrediction(null);
  };

  const handleSaveToHistory = () => {
    const errors = validateObservationInput(formData);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    const currentPrediction = prediction ?? evaluateProspect(formData);
    setPrediction(currentPrediction);

    const newRecord: SavedProspectRecord = {
      id: `EC-PROS-${Date.now().toString().slice(-6)}`,
      createdAtUtc: new Date().toISOString(),
      input: { ...formData },
      prediction: currentPrediction,
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaveNotification(`Prospek "${formData.namaGedung}" berhasil disimpan ke riwayat kunjungan hari ini.`);
      setTimeout(() => setSaveNotification(null), 4000);
    } catch (err) {
      setValidationErrors(['Gagal menyimpan ke LocalStorage (kuota penyimpanan penuh atau diblokir).']);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedRecords.filter((r) => r.id !== id);
    setSavedRecords(updated);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Gagal memperbarui LocalStorage:', err);
    }
  };

  const handleLoadRecordToForm = (record: SavedProspectRecord) => {
    setFormData(record.input);
    setPrediction(record.prediction);
    setValidationErrors([]);
    setActiveTab('observasi');
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(savedRecords, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ecocare_canvassing_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered History & Summary KPIs
  const filteredRecords = useMemo(() => {
    return savedRecords.filter((rec) => {
      const matchSearch =
        rec.input.namaGedung.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.input.alamatLokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.input.segmen_industri.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === 'ALL' || rec.prediction.statusLead === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [savedRecords, searchQuery, filterStatus]);

  const summaryStats = useMemo(() => {
    const total = savedRecords.length;
    const hotCount = savedRecords.filter(
      (r) => r.prediction.statusLead === 'HOT PROSPECT'
    ).length;
    const warmCount = savedRecords.filter(
      (r) => r.prediction.statusLead === 'WARM PROSPECT'
    ).length;
    const avgScore =
      total > 0
        ? (
            savedRecords.reduce(
              (acc, cur) => acc + cur.prediction.probabilitasKonversi,
              0
            ) / total
          ).toFixed(1)
        : '0.0';
    return { total, hotCount, warmCount, avgScore };
  }, [savedRecords]);

  const getLiniBadgeStyle = (lini: LiniLayanan) => {
    switch (lini) {
      case 'Hygiene':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Pest_Control':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Termite_Control':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Fumigasi':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* TOP CORPORATE HEADER */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-inner">
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  EcoCare Field Sales Assistant
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  AI Lead Scoring & NBO
                </span>
              </div>
              <p className="text-xs text-emerald-100/85">
                PT EcoCare Indo Pasifik Tbk • Door-to-Door Prospecting & Canvassing System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-emerald-950/40 p-1 rounded-xl border border-white/15 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('observasi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'observasi'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Form Observasi & AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'riwayat'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Ringkasan & Riwayat</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-emerald-500 text-white font-semibold">
                {savedRecords.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICATION BANNER */}
      {saveNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'observasi' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: INTERACTIVE OBSERVATION CHECKLIST FORM (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quick Preset Bar for Field Demo */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-teal-600" />
                    Simulasi Cepat Skenario Lapangan (1-Klik):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(PRESET_RESTO)}
                    className="text-left px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-emerald-900">1. Resto F&B Ramai</div>
                      <div className="text-[11px] text-emerald-700">Masalah Hama & Toilet</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(PRESET_OFFICE)}
                    className="text-left px-3 py-2 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-teal-900">2. Office Tower</div>
                      <div className="text-[11px] text-teal-700">Masalah Hygiene & Toilet</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-teal-600 group-hover:translate-x-0.5 transition" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(PRESET_WAREHOUSE)}
                    className="text-left px-3 py-2 rounded-xl border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-cyan-900">3. Gudang & Pangan</div>
                      <div className="text-[11px] text-cyan-700">Fumigasi & Anti-Rayap</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-600 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-xs sm:text-sm space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Mohon periksa kembali input observasi:</span>
                  </div>
                  <ul className="list-disc list-inside pl-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleAnalyzeProspect} className="space-y-6">
                {/* SECTION 1: PROFIL GEDUNG & PROSPEK */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-700 text-white">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800">
                          A. Identitas & Profil Operasional Gedung
                        </h2>
                        <p className="text-xs text-slate-500">
                          Data dasar lokasi prospek dan skala aktivitas harian
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Langkah 1/5
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Gedung / Nama Bisnis Prospek *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.namaGedung}
                        onChange={(e) => handleFieldChange('namaGedung', e.target.value)}
                        placeholder="Contoh: Menara Mandiri / RS Mitra Keluarga / Resto Sederhana"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat / Kawasan Lokasi
                      </label>
                      <div className="relative">
                        <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={formData.alamatLokasi}
                          onChange={(e) => handleFieldChange('alamatLokasi', e.target.value)}
                          placeholder="Jl. Jend. Sudirman..."
                          className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        PIC Ditemui (Purchasing / BM / GA)
                      </label>
                      <input
                        type="text"
                        value={formData.picNama || ''}
                        onChange={(e) => handleFieldChange('picNama', e.target.value)}
                        placeholder="Nama & Jabatan PIC"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Segmen Industri
                      </label>
                      <select
                        value={formData.segmen_industri}
                        onChange={(e) =>
                          handleFieldChange(
                            'segmen_industri',
                            e.target.value as ProspectObservationInput['segmen_industri']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        <option value="Office_Tower">Office Tower (Perkantoran)</option>
                        <option value="Hotel_Hospital">Hotel / Hospital (RS & Perhotelan)</option>
                        <option value="Mall_Retail">Mall / Retail Komersial</option>
                        <option value="Resto_F&B">Resto / Cafe / Kuliner F&B</option>
                        <option value="Warehouse_Pabrik">Warehouse / Pabrik Manufaktur</option>
                        <option value="Arsip_Instansi">Arsip / Instansi Pemerintah & Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Estimasi Luas Area (m²)
                      </label>
                      <div className="relative">
                        <Maximize2 className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="number"
                          min={20}
                          max={500000}
                          value={formData.skala_area_m2}
                          onChange={(e) =>
                            handleFieldChange('skala_area_m2', Number(e.target.value))
                          }
                          className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tingkat Traffic Pengunjung Harian
                      </label>
                      <div className="relative">
                        <Users className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                        <select
                          value={formData.traffic_harian}
                          onChange={(e) =>
                            handleFieldChange(
                              'traffic_harian',
                              e.target.value as ProspectObservationInput['traffic_harian']
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                          <option value="Rendah">Rendah (&lt; 100 orang/hari)</option>
                          <option value="Sedang">Sedang (100 - 500 orang/hari)</option>
                          <option value="Tinggi">Tinggi (500 - 1.500 orang/hari)</option>
                          <option value="Sangat_Tinggi">Sangat Tinggi (&gt; 1.500 orang/hari)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jam Operasional Gedung
                      </label>
                      <div className="relative">
                        <Clock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                        <select
                          value={formData.jam_operasional}
                          onChange={(e) =>
                            handleFieldChange(
                              'jam_operasional',
                              e.target.value as ProspectObservationInput['jam_operasional']
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                          <option value="8_Jam">8 Jam (Jam Kerja Reguler)</option>
                          <option value="12_Jam">12 Jam Operasional</option>
                          <option value="14_Jam">14 Jam (Mall / Resto)</option>
                          <option value="24_Jam">24 Jam Non-Stop</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          Rating Online & Ulasan Kebersihan (Google Maps Review)
                        </label>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {formData.rating_online_kebersihan.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1.0}
                        max={5.0}
                        step={0.1}
                        value={formData.rating_online_kebersihan}
                        onChange={(e) =>
                          handleFieldChange(
                            'rating_online_kebersihan',
                             parseFloat(e.target.value)
                          )
                        }
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>1.0 (Banyak Komplain Bau/Kotor)</span>
                        <span>3.5 (Rata-rata)</span>
                        <span>5.0 (Sangat Bersih)</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: CHECKLIST OBSERVASI HYGIENE */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50/40 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-teal-700 text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800">
                          B. Checklist Observasi Hygiene & Washroom
                        </h2>
                        <p className="text-xs text-slate-500">
                          Inspeksi aroma toilet, dispenser cuci tangan, sanitary bin & mat
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                      Langkah 2/5
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        1. Kondisi Aroma Toilet / Urinal
                      </label>
                      <select
                        value={formData.kondisi_aroma_toilet}
                        onChange={(e) =>
                          handleFieldChange(
                            'kondisi_aroma_toilet',
                            e.target.value as ProspectObservationInput['kondisi_aroma_toilet']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-teal-600 outline-none"
                      >
                        <option value="Segar">Segar & Harum Terawat</option>
                        <option value="Pengap">Pengap / Kurang Pengharum</option>
                        <option value="Bau_Menyengat">Bau Menyengat (Pesing / Asam Urat)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        2. Fasilitas Sabun Cuci Tangan
                      </label>
                      <select
                        value={formData.fasilitas_cuci_tangan}
                        onChange={(e) =>
                          handleFieldChange(
                            'fasilitas_cuci_tangan',
                            e.target.value as ProspectObservationInput['fasilitas_cuci_tangan']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-teal-600 outline-none"
                      >
                        <option value="Lengkap_Otomatis">Lengkap & Dispenser Otomatis</option>
                        <option value="Dispenser_Manual">Dispenser Tekan Manual</option>
                        <option value="Sabun_Batang_Curah">Sabun Batang / Botol Isi Ulang Curah</option>
                        <option value="Kosong_Tidak_Terawat">Kosong / Rusak Tidak Terawat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        3. Ketersediaan Sanitary Bin (Toilet Wanita)
                      </label>
                      <select
                        value={formData.ketersediaan_sanitary_bin}
                        onChange={(e) =>
                          handleFieldChange(
                            'ketersediaan_sanitary_bin',
                            e.target.value as ProspectObservationInput['ketersediaan_sanitary_bin']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-teal-600 outline-none"
                      >
                        <option value="Ada_Tertutup">Ada Unit Sanitary Bin Tertutup</option>
                        <option value="Tempat_Sampah_Biasa">Hanya Tempat Sampah Plastik Biasa</option>
                        <option value="Tidak_Ada">Tidak Ada Sama Sekali</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        4. Kondisi Lantai Pintu Masuk / Lobby
                      </label>
                      <select
                        value={formData.kondisi_lantai_pintu_masuk}
                        onChange={(e) =>
                          handleFieldChange(
                            'kondisi_lantai_pintu_masuk',
                            e.target.value as ProspectObservationInput['kondisi_lantai_pintu_masuk']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-teal-600 outline-none"
                      >
                        <option value="Kering_Ada_Mat">Kering & Sudah Ada Dust Mat</option>
                        <option value="Banyak_Debu_Sepatu">Banyak Jejak Debu Sepatu</option>
                        <option value="Lembap_Licin">Lembap & Licin Saat Hujan/Basah</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        5. Sirkulasi Udara & Kesegaran Ruangan / Lobby
                      </label>
                      <select
                        value={formData.sirkulasi_udara_ruang}
                        onChange={(e) =>
                          handleFieldChange(
                            'sirkulasi_udara_ruang',
                            e.target.value as ProspectObservationInput['sirkulasi_udara_ruang']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-teal-600 outline-none"
                      >
                        <option value="AC_Sentral_Baik">AC Sentral Dingin & Sirkulasi Baik</option>
                        <option value="Ventilasi_Cukup">Ventilasi Standar Cukup</option>
                        <option value="Pengap_Panas">Pengap / Panas / Bau Makanan Mengendap</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* SECTION 3: CHECKLIST OBSERVASI PEST CONTROL */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50/50 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-700 text-white">
                        <Bug className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800">
                          C. Checklist Observasi Pest Control (Hama)
                        </h2>
                        <p className="text-xs text-slate-500">
                          Inspeksi perimeter tempat sampah, akses pintu, drainase & jejak visual hama
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Langkah 3/5
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        1. Indikasi Visual Hama di Lokasi
                      </label>
                      <select
                        value={formData.indikasi_visual_hama}
                        onChange={(e) =>
                          handleFieldChange(
                            'indikasi_visual_hama',
                            e.target.value as ProspectObservationInput['indikasi_visual_hama']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 outline-none"
                      >
                        <option value="Tidak_Ada">Tidak Ditemukan Indikasi Visual</option>
                        <option value="Lalat_Semut_Kucing">Terlihat Lalat / Semut / Kucing Liar</option>
                        <option value="Jejak_Tikus_Kecoa_Smear">
                          Ada Kotoran Tikus / Kecoa / Smear Mark
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        2. Kondisi Sanitasi & Saluran Drainase
                      </label>
                      <select
                        value={formData.kondisi_sanitasi_drainase}
                        onChange={(e) =>
                          handleFieldChange(
                            'kondisi_sanitasi_drainase',
                            e.target.value as ProspectObservationInput['kondisi_sanitasi_drainase']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 outline-none"
                      >
                        <option value="Bersih_Lancar">Bersih, Tertutup Grill & Lancar</option>
                        <option value="Ada_Genangan_Air">Ada Genangan Air Terbuka</option>
                        <option value="Saluran_Kotor_Sisa_Makanan">
                          Saluran Kotor / Banyak Sisa Makanan & Lemak
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        3. Jarak Tempat Pembuangan Sampah (TPS)
                      </label>
                      <select
                        value={formData.jarak_tempat_sampah_m}
                        onChange={(e) =>
                          handleFieldChange(
                            'jarak_tempat_sampah_m',
                            e.target.value as ProspectObservationInput['jarak_tempat_sampah_m']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 outline-none"
                      >
                        <option value=">15m_Terisolasi">&gt; 15m & Ruang Sampah Terisolasi</option>
                        <option value="5-15m_Tertutup">5 - 15m & Kontainer Tertutup</option>
                        <option value="<5m_Terbuka">&lt; 5m dari Pintu & Kondisi Terbuka</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        4. Proteksi Akses Pintu & Loading Dock
                      </label>
                      <select
                        value={formData.proteksi_akses_pintu}
                        onChange={(e) =>
                          handleFieldChange(
                            'proteksi_akses_pintu',
                            e.target.value as ProspectObservationInput['proteksi_akses_pintu']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 outline-none"
                      >
                        <option value="Rapat_AirCurtain_DoorSweep">
                          Rapat + Ada Air Curtain / Door Sweep
                        </option>
                        <option value="Standar_Tertutup">Pintu Standar Tertutup</option>
                        <option value="Sering_Terbuka_Celah_Besar">
                          Sering Terbuka / Ada Celah Bawah Pintu &gt; 1 cm
                        </option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        5. Aktivitas Keluar-Masuk Barang (Loading)
                      </label>
                      <select
                        value={formData.aktivitas_loading_barang}
                        onChange={(e) =>
                          handleFieldChange(
                            'aktivitas_loading_barang',
                            e.target.value as ProspectObservationInput['aktivitas_loading_barang']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 outline-none"
                      >
                        <option value="Tidak_Ada">Sangat Minim / Tidak Ada Loading</option>
                        <option value="Rendah">Frekuensi Loading Rendah & Terkontrol</option>
                        <option value="Tinggi_Tanpa_Inspeksi">
                          Frekuensi Tinggi (Kardus/Palet Masuk Tanpa Inspeksi Hama)
                        </option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* SECTION 4: CHECKLIST OBSERVASI TERMITE / RAYAP */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/40 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-600 text-white">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800">
                          D. Checklist Observasi Termite Control (Anti-Rayap)
                        </h2>
                        <p className="text-xs text-slate-500">
                          Usia bangunan, dominasi interior kayu & indikasi rembesan/jalur tanah rayap
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Langkah 4/5
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        1. Usia & Status Bangunan
                      </label>
                      <select
                        value={formData.usia_dan_status_bangunan}
                        onChange={(e) =>
                          handleFieldChange(
                            'usia_dan_status_bangunan',
                            e.target.value as ProspectObservationInput['usia_dan_status_bangunan']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white focus:border-amber-600 outline-none"
                      >
                        <option value="Baru_<5Thn">Baru (&lt; 5 Tahun)</option>
                        <option value="Sedang_5-10Thn">Sedang (5 - 10 Tahun)</option>
                        <option value="Tua_>10Thn">Tua (&gt; 10 Tahun)</option>
                        <option value="Pra_Konstruksi">Renovasi / Pra-Konstruksi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        2. Dominasi Material Kayu
                      </label>
                      <select
                        value={formData.dominasi_material_kayu}
                        onChange={(e) =>
                          handleFieldChange(
                            'dominasi_material_kayu',
                            e.target.value as ProspectObservationInput['dominasi_material_kayu']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white focus:border-amber-600 outline-none"
                      >
                        <option value="Minim_Baja_Kaca">Minim (Dominan Baja/Kaca)</option>
                        <option value="Sedang_Furnitur">Sedang (Furnitur & Meja)</option>
                        <option value="Tinggi_Struktur_Partisi_Kayu">
                          Tinggi (Partisi, Parket & Kusen Kayu)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        3. Indikasi Rembesan / Rayap
                      </label>
                      <select
                        value={formData.indikasi_lembap_atau_rayap}
                        onChange={(e) =>
                          handleFieldChange(
                            'indikasi_lembap_atau_rayap',
                            e.target.value as ProspectObservationInput['indikasi_lembap_atau_rayap']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white focus:border-amber-600 outline-none"
                      >
                        <option value="Aman_Kering">Aman & Dinding Kering</option>
                        <option value="Dinding_Rembes_Bocor">Ada Dinding Rembes / Lembap</option>
                        <option value="Ada_Jalur_Tanah_Kayu_Keropos">
                          Ada Jalur Tanah Rayap / Kayu Keropos
                        </option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* SECTION 5: CHECKLIST FUMIGASI & VENDOR SAAT INI */}
                <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-50 to-teal-50/40 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-cyan-700 text-white">
                        <FileArchive className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800">
                          E. Observasi Fumigasi, Audit & Status Vendor
                        </h2>
                        <p className="text-xs text-slate-500">
                          Komoditas arsip/pangan, kepatuhan audit & peluang takeover vendor
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-cyan-900 bg-cyan-100 px-2.5 py-0.5 rounded-full">
                      Langkah 5/5
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        1. Penyimpanan Komoditas / Arsip
                      </label>
                      <select
                        value={formData.penyimpanan_komoditas_arsip}
                        onChange={(e) =>
                          handleFieldChange(
                            'penyimpanan_komoditas_arsip',
                            e.target.value as ProspectObservationInput['penyimpanan_komoditas_arsip']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white focus:border-cyan-600 outline-none"
                      >
                        <option value="Tidak_Ada">Tidak Ada</option>
                        <option value="Gudang_Arsip_Kertas">Gudang Arsip Dokumen Kertas</option>
                        <option value="Silo_Pangan_Karung">Silo / Gudang Pangan Karung</option>
                        <option value="Kontainer_Ekspor_Impor">Kontainer Kargo Ekspor-Impor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        2. Tuntutan Regulasi / Audit
                      </label>
                      <select
                        value={formData.tuntutan_regulasi_audit}
                        onChange={(e) =>
                          handleFieldChange(
                            'tuntutan_regulasi_audit',
                            Number(e.target.value) as 0 | 1
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white focus:border-cyan-600 outline-none"
                      >
                        <option value={0}>Tidak Wajib Audit Khusus</option>
                        <option value={1}>Wajib Audit (ISO / HACCP / BPOM / KARS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        3. Kondisi Vendor Saat Ini
                      </label>
                      <select
                        value={formData.kondisi_vendor_saat_ini}
                        onChange={(e) =>
                          handleFieldChange(
                            'kondisi_vendor_saat_ini',
                            e.target.value as ProspectObservationInput['kondisi_vendor_saat_ini']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white focus:border-cyan-600 outline-none"
                      >
                        <option value="Ada_Komplain_Tidak_Puas">
                          Ada Vendor (Komplain / Kurang Puas)
                        </option>
                        <option value="Belum_Ada_Internal">
                          Belum Ada Vendor (Dikelola Internal)
                        </option>
                        <option value="Ada_Kontrak_Puas">Ada Kontrak Vendor & Puas</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Catatan Tambahan Sales di Lapangan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formData.catatanLapangan || ''}
                        onChange={(e) => handleFieldChange('catatanLapangan', e.target.value)}
                        placeholder="Contoh: Kontrak vendor lama habis bulan depan, minta kirim penawaran via email..."
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Analisis Prospek (AI Engine)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToHistory}
                    className="bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600 font-bold py-3.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Kunjungan</span>
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: AI PREDICTION & RECOMMENDATION ENGINE PANEL (5 COLS, STICKY) */}
            <div ref={resultPanelRef} className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
              {!prediction ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center shadow-sm space-y-3">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      AI Engine Siap
                    </span>
                    <h3 className="text-base font-bold text-slate-800">
                      Menunggu Analisis Prospek
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Silakan lengkapi checklist observasi di sebelah kiri, kemudian klik tombol{' '}
                      <strong className="text-emerald-800">&ldquo;Analisis Prospek (AI Engine)&rdquo;</strong>{' '}
                      di bagian bawah form untuk menampilkan <strong>Lead Scoring</strong>,{' '}
                      <strong>Next Best Offer</strong>, dan <strong>Rekomendasi Produk Spesifik</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* CARD 1: LEAD SCORING GAUGE & STATUS BADGE */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 px-5 py-4 text-white flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold block">
                          AI Predictive Lead Scoring
                        </span>
                        <h3 className="text-base font-bold truncate max-w-[240px] sm:max-w-xs">
                          {formData.namaGedung}
                        </h3>
                      </div>
                      {/* Status Prospect Badge */}
                      {prediction.statusLead === 'HOT PROSPECT' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-200 border border-rose-400/40">
                          <Flame className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                          HOT PROSPECT
                        </span>
                      )}
                      {prediction.statusLead === 'WARM PROSPECT' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-200 border border-amber-400/40">
                          <ThermometerSun className="h-3.5 w-3.5 text-amber-400" />
                          WARM PROSPECT
                        </span>
                      )}
                      {prediction.statusLead === 'COLD PROSPECT' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-500/20 text-sky-200 border border-sky-400/40">
                          <Snowflake className="h-3.5 w-3.5 text-sky-400" />
                          COLD PROSPECT
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Score Meter */}
                      <div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-600">
                            Probabilitas Konversi (Closing Probability)
                          </span>
                          <span
                            className={`text-2xl font-black ${
                              prediction.probabilitasKonversi >= 70
                                ? 'text-emerald-700'
                                : prediction.probabilitasKonversi >= 45
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {prediction.probabilitasKonversi}%
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              prediction.probabilitasKonversi >= 70
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                : prediction.probabilitasKonversi >= 45
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${prediction.probabilitasKonversi}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                          <span>0% (Cold &lt;45%)</span>
                          <span>Warm (45-69%)</span>
                          <span>Hot (&ge;70%)</span>
                        </div>
                      </div>

                      {/* NEXT BEST OFFER (PRIMARY RECOMMENDATION) */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/70 to-white border border-emerald-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-emerald-700" />
                            Next Best Offer (Lini Utama)
                          </span>
                          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                            Kecocokan {prediction.rekomendasiUtama.skorPersen}%
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900">
                          {prediction.rekomendasiUtama.label}
                        </div>
                      </div>

                      {/* CROSS-SELLING RECOMMENDATION */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0 mt-0.5">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-700">
                            Rekomendasi Cross-Selling (Bundling)
                          </div>
                          {prediction.rekomendasiCrossSell ? (
                            <div className="mt-0.5">
                              <span className="text-sm font-bold text-teal-800">
                                {prediction.rekomendasiCrossSell.label}
                              </span>
                              <span className="ml-2 text-xs font-semibold text-slate-500">
                                ({prediction.rekomendasiCrossSell.skorPersen}% kecocokan)
                              </span>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Prospek memiliki masalah ganda. Tawarkan paket bundling kontrak untuk meningkatkan nilai langganan bulanan.
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600 mt-0.5">
                              Fokus penuh pada penawaran lini utama (<strong>{prediction.rekomendasiUtama.lini.replace(/_/g, ' ')}</strong>) terlebih dahulu untuk mempercepat closing.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* DISTRIBUSI SKOR SELURUH LINI LAYANAN */}
                      <div>
                        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Rincian Skor Kebutuhan 4 Lini EcoCare:</span>
                        </div>
                        <div className="space-y-2">
                          {prediction.distribusiSkorLini.map((item) => (
                            <div key={item.lini} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-700">
                                  {item.lini.replace(/_/g, ' ')}
                                </span>
                                <span className="font-bold text-slate-900">
                                  {item.skorPersen}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                  style={{ width: `${item.skorPersen}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: ACTIONABLE PRODUCT PITCHING RECOMMENDATIONS */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
                    <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquareQuote className="h-4 w-4 text-emerald-700" />
                        <h3 className="text-sm font-bold text-slate-800">
                          Rekomendasi Produk Spesifik & Panduan Pitching
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {prediction.produkSpesifik.length} Unit Solusi
                      </span>
                    </div>

                    <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
                      {prediction.produkSpesifik.map((prod, idx) => (
                        <div
                          key={`${prod.kodeProduk}-${idx}`}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 transition space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getLiniBadgeStyle(
                                prod.lini
                              )}`}
                            >
                              {prod.lini.replace(/_/g, ' ')} • {prod.kodeProduk}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                prod.prioritas === 'Utama'
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Prioritas {prod.prioritas}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {prod.namaProduk}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <strong>Temuan:</strong> {prod.alasanObservasi}
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-emerald-100 text-xs text-slate-700 italic">
                            &ldquo;{prod.scriptPitching}&rdquo;
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Traceability Footer */}
                    <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Run ID: {prediction.audit.runId}</span>
                      <span>
                        {prediction.audit.engineVersion} • {prediction.audit.latencyMs}ms
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: DASHBOARD SUMMARY & LOCALSTORAGE HISTORY */
          <div className="space-y-6">
            {/* KPI SUMMARY CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">
                  Total Prospek Tersimpan
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {summaryStats.total}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Target Kunjungan Sesi Ini
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm">
                <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  Hot Prospects (&ge;70%)
                </span>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {summaryStats.hotCount}
                </div>
                <span className="text-[11px] text-slate-500">
                  Prioritas Follow-Up Segera
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-xs font-semibold text-amber-700">
                  Warm Prospects (45-69%)
                </span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {summaryStats.warmCount}
                </div>
                <span className="text-[11px] text-slate-500">
                  Jadwalkan Demo / Trial Unit
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-xs font-semibold text-emerald-800">
                  Rata-rata Skor Konversi
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {summaryStats.avgScore}%
                </div>
                <span className="text-[11px] text-slate-500">
                  Kualitas Pipeline Lapangan
                </span>
              </div>
            </div>

            {quarantinedCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Guardrail Data Aktif: {quarantinedCount} entri LocalStorage yang rusak/tidak sesuai skema telah diisolasi (quarantined) secara otomatis.
                </span>
              </div>
            )}

            {/* SEARCH, FILTER & EXPORT BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama gedung, alamat, atau segmen..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-600"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white outline-none focus:border-emerald-600"
                >
                  <option value="ALL">Semua Status Lead</option>
                  <option value="HOT PROSPECT">Hot Prospect</option>
                  <option value="WARM PROSPECT">Warm Prospect</option>
                  <option value="COLD PROSPECT">Cold Prospect</option>
                </select>
              </div>

              {savedRecords.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Data (JSON)</span>
                </button>
              )}
            </div>

            {/* PROSPECT HISTORY LIST */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Belum Ada Riwayat Kunjungan Tersimpan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Silakan isi Form Observasi Lapangan lalu klik tombol{' '}
                  <strong>&ldquo;Simpan Kunjungan&rdquo;</strong> untuk mencatat target prospek hari ini.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('observasi')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
                >
                  <span>Mulai Observasi Baru</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {rec.id} • {new Date(rec.createdAtUtc).toLocaleString('id-ID')}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">
                            {rec.input.namaGedung}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {rec.input.alamatLokasi || 'Lokasi belum dicantumkan'} •{' '}
                            {rec.input.segmen_industri.replace(/_/g, ' ')} ({rec.input.skala_area_m2} m²)
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold shrink-0 ${
                            rec.prediction.statusLead === 'HOT PROSPECT'
                              ? 'bg-rose-100 text-rose-800'
                              : rec.prediction.statusLead === 'WARM PROSPECT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.prediction.probabilitasKonversi}% • {rec.prediction.statusLead}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-1">
                        <div>
                          <span className="font-semibold text-slate-600">Lini Utama: </span>
                          <strong className="text-emerald-900">
                            {rec.prediction.rekomendasiUtama.label} (
                            {rec.prediction.rekomendasiUtama.skorPersen}%)
                          </strong>
                        </div>
                        {rec.prediction.rekomendasiCrossSell && (
                          <div>
                            <span className="font-semibold text-slate-600">Cross-Sell: </span>
                            <strong className="text-teal-800">
                              {rec.prediction.rekomendasiCrossSell.label} (
                              {rec.prediction.rekomendasiCrossSell.skorPersen}%)
                            </strong>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-slate-600">Produk Utama: </span>
                          <span className="text-slate-800">
                            {rec.prediction.produkSpesifik[0]?.namaProduk}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleLoadRecordToForm(rec)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Buka & Edit Observasi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

