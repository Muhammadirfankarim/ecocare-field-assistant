// src/app/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  History,
  ClipboardCheck,
  ArrowRight,
  Trash2,
  MapPin,
  Clock,
  RotateCcw,
  Search,
  ChevronRight,
  Layers,
  ShieldCheck,
  Send,
  Droplets,
  Wind,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Info,
  SlidersHorizontal,
  FileText,
  Download,
} from 'lucide-react';
import {
  DiagnosticResult,
  KondisiLobi,
  KondisiPipa,
  SavedDiagnosticRecord,
  SurveyObservationInput,
  SurveyType,
  TipeWastafel,
} from '@/types/prospect';
import {
  evaluateDiagnostic,
  validateSurveyInput,
} from '@/lib/scoringEngine';
import { predictWithHistoricalML } from '@/lib/mlInferenceEngine';

const STORAGE_KEY = 'hycare_records_v1';
const LEGACY_STORAGE_KEY = 'ecocare_hygiematch_records_v1';

// -------------------------------------------------------------
// 3 SKENARIO CONTOH UNTUK DEMO PRESENTASI
// -------------------------------------------------------------
const CONTOH_KANTOR: SurveyObservationInput = {
  namaGedung: 'Menara Astra Ventura (Tower 1)',
  alamatLokasi: 'Jl. Jend. Sudirman Kav. 5-6, Jakarta Pusat',
  picNama: 'Ibu Ratna (Building Facility Manager)',
  surveyType: 'NEW_CUSTOMER',
  segmen: 'Office Tower',
  hariAktif: '5 Hari Kerja',
  jamOperasional: 11,
  // Area 1: Toilet
  kondisiPipa: 'PIPA_TANAM',
  tipeWastafel: 'TRAFIK_GREEN',
  khawatirBakteriKloset: true,
  butuhSanitaryBin: true,
  keluhanSampahTisu: true,
  jumlahUrinoirKloset: 14,
  jumlahWastafel: 8,
  jumlahKubikalWanita: 8,
  // Area 2: Pintu Masuk & Lobi
  pintuMasukLicinDebu: true,
  kondisiLobi: 'STANDALONE_300',
  // Area 3: Koridor & Ruangan
  ruangSempitLift: true,
  koridorPublikTerbuka: false,
  areaSensitifKlinik: false,
  ruangRapatVip: true,
  // Area 4: Dapur & Staf
  masalahLalatKantin: false,
  sabunPantryEkonomis: true,
  catatanTeknis: 'Dinding toilet marmer mewah. Pengelola gedung menghendaki unit tanpa bor dinding.',
};

const CONTOH_MALL: SurveyObservationInput = {
  namaGedung: 'Grand Metropolitan Promenade & Mall',
  alamatLokasi: 'Kawasan Bisnis Boulevard No. 88, Bekasi Barat',
  picNama: 'Bpk. Fajar (Head of Building Operations)',
  surveyType: 'RENEWAL',
  segmen: 'Mall/Public Area',
  hariAktif: '7 Hari Kerja',
  jamOperasional: 14,
  // Area 1: Toilet
  kondisiPipa: 'PIPA_MANUAL',
  tipeWastafel: 'TRAFIK_PADAT',
  khawatirBakteriKloset: true,
  butuhSanitaryBin: true,
  keluhanSampahTisu: true,
  jumlahUrinoirKloset: 32,
  jumlahWastafel: 20,
  jumlahKubikalWanita: 24,
  // Area 2: Pintu Masuk & Lobi
  pintuMasukLicinDebu: true,
  kondisiLobi: 'HVAC_LUAS',
  // Area 3: Koridor & Ruangan
  ruangSempitLift: true,
  koridorPublikTerbuka: true,
  areaSensitifKlinik: false,
  ruangRapatVip: false,
  // Area 4: Dapur & Staf
  masalahLalatKantin: true,
  sabunPantryEkonomis: true,
  catatanTeknis: 'Pengunjung sangat ramai di akhir pekan. Lobi utama tersambung dengan sistem pendingin sentral (AC Ducting).',
};

const CONTOH_RS: SurveyObservationInput = {
  namaGedung: 'RS Hermina Premier Health Care',
  alamatLokasi: 'Jl. Pemuda No. 12, Pulo Gadung, Jakarta Timur',
  picNama: 'dr. Haryo, Sp.A (Komite PPI / K3 Gedung)',
  surveyType: 'NEW_CUSTOMER',
  segmen: 'RS/Klinik',
  hariAktif: '7 Hari Kerja',
  jamOperasional: 24,
  // Area 1: Toilet
  kondisiPipa: 'PIPA_TANAM',
  tipeWastafel: 'TRAFIK_GREEN',
  khawatirBakteriKloset: true,
  butuhSanitaryBin: true,
  keluhanSampahTisu: false,
  jumlahUrinoirKloset: 10,
  jumlahWastafel: 12,
  jumlahKubikalWanita: 10,
  // Area 2: Pintu Masuk & Lobi
  pintuMasukLicinDebu: true,
  kondisiLobi: 'STANDALONE_300',
  // Area 3: Koridor & Ruangan
  ruangSempitLift: true,
  koridorPublikTerbuka: false,
  areaSensitifKlinik: true,
  ruangRapatVip: false,
  // Area 4: Dapur & Staf
  masalahLalatKantin: false,
  sabunPantryEkonomis: true,
  catatanTeknis: 'Area poli anak dan kamar rawat sensitif aroma tajam. Diutamakan formula berbahan dasar air (waterbase).',
};

export default function EcoCareHygieMatchPage() {
  const [activeTab, setActiveTab] = useState<'survey' | 'riwayat'>('survey');
  const [activeZoneAccordion, setActiveZoneAccordion] = useState<number>(1);
  const [formData, setFormData] = useState<SurveyObservationInput>(CONTOH_KANTOR);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedDiagnosticRecord[]>([]);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSegmen, setFilterSegmen] = useState<string>('ALL');
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [engineMode, setEngineMode] = useState<'ML_HISTORICAL' | 'RULE_BASED'>('ML_HISTORICAL');

  const resultPanelRef = useRef<HTMLDivElement | null>(null);

  // Ambil riwayat dari LocalStorage saat pertama buka
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedRecords(parsed);
        }
      }
    } catch (err) {
      console.error('[Hycare Storage] Catatan lokal belum ada:', err);
    }
  }, []);

  const handleFieldChange = <K extends keyof SurveyObservationInput>(
    field: K,
    value: SurveyObservationInput[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Reset output agar user mengklik tombol Analisis
    setDiagnosticResult(null);
  };

  const handleApplyPreset = (preset: SurveyObservationInput) => {
    setValidationErrors([]);
    setFormData(preset);
    setDiagnosticResult(null);
  };

  const handleRunDiagnostic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors = validateSurveyInput(formData);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    const res = engineMode === 'ML_HISTORICAL'
      ? predictWithHistoricalML(formData)
      : evaluateDiagnostic(formData);
    setDiagnosticResult(res);

    setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSaveDraft = () => {
    const errors = validateSurveyInput(formData);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    const currentRes = diagnosticResult ?? (
      engineMode === 'ML_HISTORICAL'
        ? predictWithHistoricalML(formData)
        : evaluateDiagnostic(formData)
    );
    setDiagnosticResult(currentRes);

    const newRecord: SavedDiagnosticRecord = {
      id: `SURVEY-${Date.now().toString().slice(-6)}`,
      createdAtUtc: new Date().toISOString(),
      input: { ...formData },
      result: currentRes,
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaveToast(`Data rekomendasi untuk "${formData.namaGedung}" berhasil disimpan.`);
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err) {
      console.error('Gagal menyimpan ke LocalStorage:', err);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedRecords.filter((r) => r.id !== id);
    setSavedRecords(updated);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Gagal menghapus data dari LocalStorage:', err);
    }
  };

  const handleLoadRecord = (record: SavedDiagnosticRecord) => {
    setFormData(record.input);
    setDiagnosticResult(record.result);
    setValidationErrors([]);
    setActiveTab('survey');
  };

  // Format teks rapi dan mudah dibaca untuk WhatsApp / Email / Presentasi
  const handleCopyCleanSummary = () => {
    if (!diagnosticResult) return;

    const allUnits = [
      ...diagnosticResult.kategori1_Restroom,
      ...diagnosticResult.kategori2_Secondary,
      ...diagnosticResult.kategori3_SmartScenting,
    ];

    const unitLines = allUnits
      .map(
        (u, idx) =>
          `${idx + 1}. ${u.namaUnit} (${u.estimasiUnit})\n   - Keunggulan: ${u.keunggulanGedung}`
      )
      .join('\n');

    const summaryText = `*PROPOSAL REKOMENDASI SOLUSI KEBERSIHAN GEDUNG*
*Hycare - PT EcoCare Indo Pasifik Tbk*
--------------------------------------------------
*Gedung:* ${formData.namaGedung}
*Alamat:* ${formData.alamatLokasi || '-'}
*PIC:* ${formData.picNama || '-'}
*Kategori:* ${formData.segmen}
*Operasional:* ${formData.hariAktif} (${formData.jamOperasional} Jam/Hari)
*Tipe Layanan:* ${formData.surveyType === 'NEW_CUSTOMER' ? 'Pelanggan Baru' : 'Pembaruan Kontrak'}

*DAFTAR REKOMENDASI PRODUK (${diagnosticResult.totalUnitRekomendasi} Macam):*
${unitLines}

${formData.catatanTeknis ? `*Catatan Khusus Lapangan:*\n${formData.catatanTeknis}\n` : ''}
--------------------------------------------------
_Dianalisis menggunakan sistem rekomendasi Hycare_`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Kalkulasi estimasi interval timer LCD Sprayer untuk informasi user
  const liveDays = formData.hariAktif === '5 Hari Kerja' ? 5 : 7;
  const liveInterval = Number(
    ((formData.jamOperasional * 60 * liveDays * 8) / 6000).toFixed(1)
  );

  const filteredRecords = useMemo(() => {
    return savedRecords.filter((rec) => {
      const matchSearch =
        rec.input.namaGedung.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.input.alamatLokasi &&
          rec.input.alamatLokasi.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchSegmen =
        filterSegmen === 'ALL' || rec.input.segmen === filterSegmen;
      return matchSearch && matchSegmen;
    });
  }, [savedRecords, searchQuery, filterSegmen]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* HEADER UTAMA: HYCARE BRANDING                                 */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-md border-b border-emerald-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white p-1.5 shadow-md border border-emerald-300/30 flex items-center justify-center shrink-0">
              <Image
                src="/hycare-icon.png"
                alt="Hycare Logo"
                width={38}
                height={38}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                  Hycare
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  Solusi Kebersihan Gedung
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                PT EcoCare Indo Pasifik Tbk • Smart Hygiene Recommendation System
              </p>
            </div>
          </div>

          {/* Tab Navigasi Sederhana */}
          <div className="flex items-center bg-emerald-950/60 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('survey')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'survey'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Form Survei & Solusi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'riwayat'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Data Tersimpan</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                {savedRecords.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFIKASI TOAST */}
      {saveToast && (
        <div className="bg-emerald-700 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-md">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* KONTEN UTAMA                                                  */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'survey' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* --------------------------------------------------------- */}
            {/* KOLOM KIRI: FORM SURVEI (7 KOLOM)                         */}
            {/* --------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-5">
              {/* Contoh Skenario Demo Cepat */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
                    Pilih Contoh Skenario Gedung (1-Klik untuk Demo):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(CONTOH_KANTOR)}
                    className="text-left px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-emerald-950">1. Gedung Kantor</div>
                      <div className="text-[11px] text-emerald-700">Dinding Marmer & Konsep Ramah Lingkungan</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(CONTOH_MALL)}
                    className="text-left px-3 py-2 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-teal-950">2. Mall Besar</div>
                      <div className="text-[11px] text-teal-700">Pengunjung Ramai & Lobi AC Sentral</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-teal-600 group-hover:translate-x-0.5 transition" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(CONTOH_RS)}
                    className="text-left px-3 py-2 rounded-xl border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-cyan-950">3. Rumah Sakit</div>
                      <div className="text-[11px] text-cyan-700">Sensitif Alergi & Bebas Alkohol</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-600 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>

              {/* Peringatan Validasi jika ada yang belum terisi */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-xs sm:text-sm space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Mohon lengkapi data berikut:</span>
                  </div>
                  <ul className="list-disc list-inside pl-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleRunDiagnostic} className="space-y-4">
                {/* ----------------------------------------------------- */}
                {/* PROFIL GEDUNG & STATUS PELANGGAN                      */}
                {/* ----------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-800 text-white">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                          Profil Gedung & Kebutuhan Kunjungan
                        </h2>
                        <p className="text-xs text-slate-500">
                          Data dasar gedung untuk menentukan pilihan paket kebersihan terbaik
                        </p>
                      </div>
                    </div>

                    {/* Toggle Status Pelanggan */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleFieldChange('surveyType', 'NEW_CUSTOMER')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          formData.surveyType === 'NEW_CUSTOMER'
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Pelanggan Baru
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange('surveyType', 'RENEWAL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          formData.surveyType === 'RENEWAL'
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Pembaruan Kontrak
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Gedung / Perusahaan Klien *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.namaGedung}
                        onChange={(e) => handleFieldChange('namaGedung', e.target.value)}
                        placeholder="Contoh: Menara Mandiri Sudirman / Mall Kelapa Gading"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat / Lokasi Gedung
                      </label>
                      <div className="relative">
                        <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={formData.alamatLokasi || ''}
                          onChange={(e) => handleFieldChange('alamatLokasi', e.target.value)}
                          placeholder="Jl. Gatot Subroto..."
                          className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama PIC yang Ditemui
                      </label>
                      <input
                        type="text"
                        value={formData.picNama || ''}
                        onChange={(e) => handleFieldChange('picNama', e.target.value)}
                        placeholder="Nama Manajer Gedung / Purchasing"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jenis Gedung / Segmen
                      </label>
                      <select
                        value={formData.segmen}
                        onChange={(e) =>
                          handleFieldChange(
                            'segmen',
                            e.target.value as SurveyObservationInput['segmen']
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-emerald-600 outline-none font-medium"
                      >
                        <option value="Office Tower">Gedung Perkantoran (Office Tower)</option>
                        <option value="Mall/Public Area">Pusat Perbelanjaan / Mall / Publik</option>
                        <option value="Hotel">Hotel & Akomodasi</option>
                        <option value="RS/Klinik">Rumah Sakit / Fasilitas Kesehatan</option>
                        <option value="Resto/F&B">Restoran & Kafe F&B</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Hari Operasional
                        </label>
                        <select
                          value={formData.hariAktif}
                          onChange={(e) =>
                            handleFieldChange(
                              'hariAktif',
                              e.target.value as SurveyObservationInput['hariAktif']
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 px-2.5 py-2.5 text-sm bg-white focus:border-emerald-600 outline-none font-medium"
                        >
                          <option value="5 Hari Kerja">5 Hari Kerja (Senin - Jumat)</option>
                          <option value="7 Hari Kerja">7 Hari Kerja (Setiap Hari)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Jam Buka / Hari
                        </label>
                        <div className="relative">
                          <Clock className="h-4 w-4 text-slate-400 absolute left-2.5 top-3" />
                          <input
                            type="number"
                            min={1}
                            max={24}
                            value={formData.jamOperasional}
                            onChange={(e) =>
                              handleFieldChange('jamOperasional', Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-slate-300 pl-8 pr-2.5 py-2.5 text-sm focus:border-emerald-600 outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* 4 AREA OBSERVASI GEDUNG                               */}
                {/* ----------------------------------------------------- */}
                <div className="space-y-3">
                  {/* AREA 1: TOILET & KAMAR MANDI */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveZoneAccordion(activeZoneAccordion === 1 ? 0 : 1)
                      }
                      className="w-full px-5 py-3.5 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 flex items-center justify-between text-left hover:bg-emerald-100/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-700 text-white font-bold text-xs">
                          Area 1
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Area 1: Toilet & Kamar Mandi
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Pilihan kloset, urinoir, wastafel, tempat pembalut, dan pengering tangan
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          activeZoneAccordion === 1 ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeZoneAccordion === 1 && (
                      <div className="p-5 space-y-4 border-t border-slate-100">
                        {/* 1. Kondisi Pipa Kloset/Urinoir */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            1. Kondisi Pipa Kloset / Urinoir:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <label
                              className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                                formData.kondisiPipa === 'PIPA_MANUAL'
                                    ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-950'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="kondisiPipa"
                                checked={formData.kondisiPipa === 'PIPA_MANUAL'}
                                onChange={() => handleFieldChange('kondisiPipa', 'PIPA_MANUAL')}
                                className="mt-0.5 accent-emerald-600"
                              />
                              <div>
                                <strong className="block text-slate-900">
                                  Pipa Biasa (Bisa Dibor)
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  Saluran pipa luar standar, menggunakan alat pembersih otomatis mekanis tanpa perlu baterai.
                                </span>
                              </div>
                            </label>

                            <label
                              className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                                formData.kondisiPipa === 'PIPA_TANAM'
                                  ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-950'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="kondisiPipa"
                                checked={formData.kondisiPipa === 'PIPA_TANAM'}
                                onChange={() => handleFieldChange('kondisiPipa', 'PIPA_TANAM')}
                                className="mt-0.5 accent-emerald-600"
                              />
                              <div>
                                <strong className="block text-slate-900">
                                  Pipa Tanam / Dinding Marmer (Dilarang Dibor)
                                </strong>
                                <span className="text-[11px] text-amber-700">
                                  Toilet dengan sensor otomatis atau dinding marmer. Menggunakan alat tetes digital dengan baterai tanpa melubangi dinding.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* 2. Tipe Wastafel */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            2. Kebutuhan Sabun di Wastafel:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <label
                              className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                                formData.tipeWastafel === 'TRAFIK_PADAT'
                                  ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-950'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="tipeWastafel"
                                checked={formData.tipeWastafel === 'TRAFIK_PADAT'}
                                onChange={() => handleFieldChange('tipeWastafel', 'TRAFIK_PADAT')}
                                className="mt-0.5 accent-emerald-600"
                              />
                              <div>
                                <strong className="block text-slate-900">
                                  Pengunjung Ramai (&gt;1.000 orang/hari)
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  Menggunakan dispenser sabun cair kapasitas besar (1 Liter) agar tidak sering habis.
                                </span>
                              </div>
                            </label>

                            <label
                              className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                                formData.tipeWastafel === 'TRAFIK_GREEN'
                                  ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-950'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="tipeWastafel"
                                checked={formData.tipeWastafel === 'TRAFIK_GREEN'}
                                onChange={() => handleFieldChange('tipeWastafel', 'TRAFIK_GREEN')}
                                className="mt-0.5 accent-emerald-600"
                              />
                              <div>
                                <strong className="block text-slate-900">
                                  Perkantoran / Ramah Lingkungan
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  Menggunakan sabun busa (foam soap) yang menghemat air bilasan dan sabun hingga 35%.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* 3. Fasilitas Tambahan di Toilet */}
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-700">
                            3. Kebutuhan Tambahan di Toilet:
                          </label>

                          <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={formData.khawatirBakteriKloset}
                              onChange={(e) =>
                                handleFieldChange('khawatirBakteriKloset', e.target.checked)
                              }
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-slate-800">
                              Butuh pembersih dudukan kloset agar pengguna merasa higienis dan nyaman{' '}
                              <strong className="text-emerald-700">&rarr; Pembersih Dudukan Kloset (Seat Cleaner)</strong>
                            </span>
                          </label>

                          <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={formData.butuhSanitaryBin}
                              onChange={(e) =>
                                handleFieldChange('butuhSanitaryBin', e.target.checked)
                              }
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-slate-800">
                              Toilet wanita membutuhkan tempat pembuangan pembalut otomatis tanpa sentuh tangan{' '}
                              <strong className="text-emerald-700">&rarr; Tempat Sampah Sensor (Sanitary Bin)</strong>
                            </span>
                          </label>

                          <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={formData.keluhanSampahTisu}
                              onChange={(e) =>
                                handleFieldChange('keluhanSampahTisu', e.target.checked)
                              }
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-slate-800">
                              Ingin mengurangi biaya kertas tisu dan mencegah sampah tisu berserakan di wastafel{' '}
                              <strong className="text-emerald-700">&rarr; Pengering Tangan Cepat (Jet Hand Dryer)</strong>
                            </span>
                          </label>
                        </div>

                        {/* 4. Jumlah Titik Fasilitas */}
                        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Jumlah Urinoir/Kloset
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={formData.jumlahUrinoirKloset}
                              onChange={(e) =>
                                handleFieldChange('jumlahUrinoirKloset', Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-semibold focus:border-emerald-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Jumlah Wastafel
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={formData.jumlahWastafel}
                              onChange={(e) =>
                                handleFieldChange('jumlahWastafel', Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-semibold focus:border-emerald-600 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Bilik Toilet Wanita
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={formData.jumlahKubikalWanita}
                              onChange={(e) =>
                                handleFieldChange('jumlahKubikalWanita', Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-semibold focus:border-emerald-600 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AREA 2: PINTU MASUK & LOBI UTAMA */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveZoneAccordion(activeZoneAccordion === 2 ? 0 : 2)
                      }
                      className="w-full px-5 py-3.5 bg-gradient-to-r from-teal-50/80 to-emerald-50/50 flex items-center justify-between text-left hover:bg-teal-100/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-700 text-white font-bold text-xs">
                          Area 2
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Area 2: Pintu Masuk & Lobi Utama
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Pilihan keset karpet penahan kotoran dan pengharum suasana lobi
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          activeZoneAccordion === 2 ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeZoneAccordion === 2 && (
                      <div className="p-5 space-y-4 border-t border-slate-100 text-xs sm:text-sm">
                        <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.pintuMasukLicinDebu}
                            onChange={(e) =>
                              handleFieldChange('pintuMasukLicinDebu', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Pintu masuk berisiko licin saat hujan atau banyak debu terbawa sepatu
                            </span>
                            <span className="text-[11px] text-teal-700 font-medium">
                              &rarr; Rekomendasi: Layanan Sewa & Cuci Bersih Rutin Keset Karpet Penyerap Debu/Air.
                            </span>
                          </div>
                        </label>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Kebutuhan Pengharum di Area Lobi / Resepsionis:
                          </label>
                          <div className="space-y-2">
                            <label
                              className={`p-3 rounded-xl border block cursor-pointer transition ${
                                formData.kondisiLobi === 'NONE'
                                  ? 'border-teal-600 bg-teal-50/70 font-semibold text-teal-950'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="kondisiLobi"
                                  checked={formData.kondisiLobi === 'NONE'}
                                  onChange={() => handleFieldChange('kondisiLobi', 'NONE')}
                                  className="accent-teal-600"
                                />
                                <span>Tidak Memerlukan Pengharum Lobi</span>
                              </div>
                            </label>

                            <label
                              className={`p-3 rounded-xl border block cursor-pointer transition ${
                                formData.kondisiLobi === 'STANDALONE_300'
                                  ? 'border-teal-600 bg-teal-50/70 font-semibold text-teal-950'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <input
                                  type="radio"
                                  name="kondisiLobi"
                                  checked={formData.kondisiLobi === 'STANDALONE_300'}
                                  onChange={() =>
                                    handleFieldChange('kondisiLobi', 'STANDALONE_300')
                                  }
                                  className="mt-0.5 accent-teal-600"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    Lobi Sedang / Meja Resepsionis (Unit Berdiri Sendiri)
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Cocok untuk lobi tanpa AC sentral &rarr; Menggunakan mesin pengharum mandiri elegan di sudut ruangan.
                                  </span>
                                </div>
                              </div>
                            </label>

                            <label
                              className={`p-3 rounded-xl border block cursor-pointer transition ${
                                formData.kondisiLobi === 'HVAC_LUAS'
                                  ? 'border-teal-600 bg-teal-50/70 font-semibold text-teal-950'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <input
                                  type="radio"
                                  name="kondisiLobi"
                                  checked={formData.kondisiLobi === 'HVAC_LUAS'}
                                  onChange={() => handleFieldChange('kondisiLobi', 'HVAC_LUAS')}
                                  className="mt-0.5 accent-teal-600"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    Lobi Gedung Luas (Tersambung ke Saluran AC Sentral)
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Aroma disebarkan merata melalui saluran udara AC gedung tanpa perlu meletakkan banyak unit di lantai.
                                  </span>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AREA 3: KORIDOR, LIFT, & RUANG RAPAT */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveZoneAccordion(activeZoneAccordion === 3 ? 0 : 3)
                      }
                      className="w-full px-5 py-3.5 bg-gradient-to-r from-cyan-50/80 to-teal-50/40 flex items-center justify-between text-left hover:bg-cyan-100/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-700 text-white font-bold text-xs">
                          Area 3
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Area 3: Koridor, Lift, & Ruang Rapat
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Pengharum hening untuk lift, ruang rapat direksi, dan koridor umum
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          activeZoneAccordion === 3 ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeZoneAccordion === 3 && (
                      <div className="p-5 space-y-3 border-t border-slate-100 text-xs sm:text-sm">
                        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.ruangSempitLift}
                            onChange={(e) =>
                              handleFieldChange('ruangSempitLift', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Ada Ruang Tertutup Sempit (Lift atau Toilet Karyawan Kecil)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>Pengharum Kipas Blower</strong> dengan baterai, wangi lembut terus menerus tanpa suara semprotan.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.koridorPublikTerbuka}
                            onChange={(e) =>
                              handleFieldChange('koridorPublikTerbuka', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Koridor / Area Publik Terbuka membutuhkan semprotan wangi berkala
                            </span>
                            <span className="text-[11px] text-cyan-700 font-medium">
                              Sistem otomatis menghitung interval: <strong>Semprot setiap {liveInterval} menit</strong> (agar wangi pas selama masa servis 2 bulan).
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.areaSensitifKlinik}
                            onChange={(e) =>
                              handleFieldChange('areaSensitifKlinik', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Ruang Sensitif (Klinik, RS, Ruang Bayi & Anak yang menghindari aroma menyengat)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>Pengharum Berbahan Dasar Air (Waterbase)</strong> 100% bebas alkohol dan gas pemicu bersin.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.ruangRapatVip}
                            onChange={(e) =>
                              handleFieldChange('ruangRapatVip', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Ruang Rapat Direksi / Ruang VIP (Butuh aroma mewah dan tidak bersuara)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>Pengharum Ruang Rapat VIP</strong> bersuara sangat hening tanpa semprotan yang mengagetkan saat diskusi.
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* AREA 4: DAPUR, KANTIN, & PANTRY */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveZoneAccordion(activeZoneAccordion === 4 ? 0 : 4)
                      }
                      className="w-full px-5 py-3.5 bg-gradient-to-r from-amber-50/80 to-emerald-50/30 flex items-center justify-between text-left hover:bg-amber-100/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-700 text-white font-bold text-xs">
                          Area 4
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Area 4: Dapur, Kantin, & Pantry
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Pengendalian lalat ramah makanan dan sabun cuci tangan pantry staf
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          activeZoneAccordion === 4 ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeZoneAccordion === 4 && (
                      <div className="p-5 space-y-3 border-t border-slate-100 text-xs sm:text-sm">
                        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.masalahLalatKantin}
                            onChange={(e) =>
                              handleFieldChange('masalahLalatKantin', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Area kantin atau dapur sering terganggu lalat berterbangan
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>Semprotan Pengusir Lalat Alami (Ecoflies)</strong> berbahan alami yang aman untuk area makan.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.sabunPantryEkonomis}
                            onChange={(e) =>
                              handleFieldChange('sabunPantryEkonomis', e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Wastafel dapur/pantry membutuhkan dispenser sabun cuci tangan staf
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>Dispenser Sabun Pantry Ukuran Sedang (500 ml)</strong> yang ringkas dan hemat tempat.
                            </span>
                          </div>
                        </label>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Catatan Tambahan untuk Tim Lapangan (Opsional)
                          </label>
                          <textarea
                            rows={2}
                            value={formData.catatanTeknis || ''}
                            onChange={(e) => handleFieldChange('catatanTeknis', e.target.value)}
                            placeholder="Contoh: Stopkontak hand dryer sudah tersedia di wastafel barat, pintu masuk lobi wajib pasang keset ukuran besar..."
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-emerald-600 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PILIHAN METODE ANALISIS: MACHINE LEARNING (1.000 DATA) VS SOP STANDAR */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-3.5 rounded-2xl border border-emerald-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-700" />
                      Pilihan Mesin Rekomendasi (Client-Side Engine):
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      Zero Server • 0ms Latency
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEngineMode('ML_HISTORICAL')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        engineMode === 'ML_HISTORICAL'
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>Machine Learning Model</span>
                      </div>
                      <div
                        className={`text-[10px] ${
                          engineMode === 'ML_HISTORICAL' ? 'text-emerald-200' : 'text-slate-500'
                        }`}
                      >
                        Model 1.000 data survei (Akurasi 99.6%)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngineMode('RULE_BASED')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        engineMode === 'RULE_BASED'
                          ? 'bg-teal-800 text-white border-teal-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">SOP Standar (Aturan)</div>
                      <div
                        className={`text-[10px] ${
                          engineMode === 'RULE_BASED' ? 'text-teal-200' : 'text-slate-500'
                        }`}
                      >
                        Katalog resmi teknis EcoCare
                      </div>
                    </button>
                  </div>
                </div>

                {/* TOMBOL UTAMA: LIHAT REKOMENDASI SOLUSI */}
                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Sparkles className="h-5 w-5 text-emerald-200" />
                    <span>
                      {engineMode === 'ML_HISTORICAL'
                        ? 'Analisis dengan Model Machine Learning'
                        : 'Lihat Rekomendasi Solusi Kebersihan'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* --------------------------------------------------------- */}
            {/* KOLOM KANAN: HASIL REKOMENDASI (5 KOLOM)                  */}
            {/* --------------------------------------------------------- */}
            <div ref={resultPanelRef} className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
              {!diagnosticResult ? (
                /* Tampilan Awal Sebelum Tombol Ditekan */
                <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center shadow-sm space-y-3">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-2.5 flex items-center justify-center shadow-sm">
                    <Image
                      src="/hycare-icon.png"
                      alt="Hycare"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Hycare Intelligence Siap
                    </span>
                    <h3 className="text-base font-bold text-slate-800">
                      Menunggu Hasil Analisis Gedung
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Silakan periksa pilihan area di sebelah kiri, lalu klik tombol{' '}
                      <strong className="text-emerald-800">&ldquo;Lihat Rekomendasi Solusi Kebersihan&rdquo;</strong>{' '}
                      untuk menampilkan paket produk Hycare yang paling pas untuk gedung ini.
                    </p>
                  </div>
                </div>
              ) : (
                /* Hasil Rekomendasi Lengkap yang Sudah Bersih & Rapi */
                <>
                  {/* RINGKASAN REKOMENDASI GEDUNG */}
                  <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-800/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase block">
                          {diagnosticResult.engineType === 'MACHINE_LEARNING'
                            ? 'Model ML (1.000 Data Historis • Akurasi 99.6%)'
                            : 'Paket Rekomendasi SOP Standar'}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-[260px]">
                          {diagnosticResult.namaGedung}
                        </h3>
                        <p className="text-xs text-emerald-200/80">
                          {diagnosticResult.segmen} • {formData.hariAktif} ({formData.jamOperasional} Jam/Hari)
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${
                          diagnosticResult.surveyType === 'NEW_CUSTOMER'
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                            : 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                        }`}
                      >
                        {diagnosticResult.surveyType === 'NEW_CUSTOMER'
                          ? 'Pelanggan Baru'
                          : 'Pembaruan Kontrak'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/50">
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] text-emerald-300 block">Total Solusi Disarankan</span>
                        <span className="text-xl font-extrabold text-white">
                          {diagnosticResult.totalUnitRekomendasi} Produk
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] text-emerald-300 block">Karakteristik Pipa</span>
                        <span className="text-xs font-bold text-emerald-100">
                          {formData.kondisiPipa === 'PIPA_MANUAL'
                            ? 'Pipa Luar (Bisa Dibor)'
                            : 'Pipa Tanam / Marmer'}
                        </span>
                      </div>
                    </div>

                    {diagnosticResult.sprayerIntervalMinutes && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-xs text-cyan-200 flex items-center justify-between">
                        <span>Pengaturan Semprot Otomatis:</span>
                        <strong className="text-white bg-cyan-800/80 px-2 py-0.5 rounded-md font-mono text-xs">
                          Tiap {diagnosticResult.sprayerIntervalMinutes} Menit
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* DAFTAR PRODUK DALAM 3 KELOMPOK */}
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                    {/* KELOMPOK 1: TOILET & SANITASI UTAMA */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/70 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Droplets className="h-4 w-4 text-emerald-700" />
                          1. Solusi Toilet & Kamar Mandi ({diagnosticResult.kategori1_Restroom.length})
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Fasilitas Sanitasi
                        </span>
                      </div>

                      <div className="p-3.5 space-y-3">
                        {diagnosticResult.kategori1_Restroom.map((unit) => (
                          <div
                            key={unit.id}
                            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 transition space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {unit.namaUnit}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Cocok {unit.matchScore}%
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                                {unit.keteranganTipe}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Kebutuhan: {unit.estimasiUnit}
                              </span>
                            </div>

                            {unit.catatanKhusus && (
                              <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium flex items-start gap-1.5">
                                <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{unit.catatanKhusus}</span>
                              </div>
                            )}

                            <div className="space-y-1.5 pt-1 text-[11px]">
                              <p className="text-slate-600">
                                <strong className="text-slate-800">Petunjuk Pemasangan:</strong>{' '}
                                {unit.petunjukPemasangan}
                              </p>
                              <p className="text-emerald-950 bg-emerald-50/90 p-2 rounded-lg border border-emerald-100">
                                <strong className="text-emerald-800">Keunggulan untuk Gedung:</strong>{' '}
                                {unit.keunggulanGedung}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KELOMPOK 2: LANTAI & PENGHARUM RUANGAN */}
                    {diagnosticResult.kategori2_Secondary.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50/70 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-teal-700" />
                            2. Solusi Lantai & Pengharum Ruangan ({diagnosticResult.kategori2_Secondary.length})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            Kebersihan & Kesegaran
                          </span>
                        </div>

                        <div className="p-3.5 space-y-3">
                          {diagnosticResult.kategori2_Secondary.map((unit) => (
                            <div
                              key={unit.id}
                              className="p-3 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50/60 transition space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                  {unit.namaUnit}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                  Cocok {unit.matchScore}%
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                                  {unit.keteranganTipe}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                                  Kebutuhan: {unit.estimasiUnit}
                                </span>
                              </div>

                              <div className="space-y-1.5 pt-1 text-[11px]">
                                <p className="text-slate-600">
                                  <strong className="text-slate-800">Petunjuk Pemasangan:</strong>{' '}
                                  {unit.petunjukPemasangan}
                                </p>
                                <p className="text-teal-950 bg-teal-50/90 p-2 rounded-lg border border-teal-100">
                                  <strong className="text-teal-800">Keunggulan untuk Gedung:</strong>{' '}
                                  {unit.keunggulanGedung}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* KELOMPOK 3: PENGHARUM MEWAH SMART SCENTING */}
                    {diagnosticResult.kategori3_SmartScenting.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-50 to-emerald-50/50 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-cyan-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Wind className="h-4 w-4 text-cyan-700" />
                            3. Pengharum Mewah (Smart Scenting) ({diagnosticResult.kategori3_SmartScenting.length})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                            Kesan Pertama Mewah
                          </span>
                        </div>

                        <div className="p-3.5 space-y-3">
                          {diagnosticResult.kategori3_SmartScenting.map((unit) => (
                            <div
                              key={unit.id}
                              className="p-3 rounded-xl border border-slate-200 hover:border-cyan-300 bg-slate-50/60 transition space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                  {unit.namaUnit}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                                  Cocok {unit.matchScore}%
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                                  {unit.keteranganTipe}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                                  Kebutuhan: {unit.estimasiUnit}
                                </span>
                              </div>

                              <div className="space-y-1.5 pt-1 text-[11px]">
                                <p className="text-slate-600">
                                  <strong className="text-slate-800">Petunjuk Pemasangan:</strong>{' '}
                                  {unit.petunjukPemasangan}
                                </p>
                                <p className="text-cyan-950 bg-cyan-50/90 p-2 rounded-lg border border-cyan-100">
                                  <strong className="text-cyan-800">Keunggulan untuk Gedung:</strong>{' '}
                                  {unit.keunggulanGedung}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DUA TOMBOL AKSI BAWAH */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsQuotationModalOpen(true)}
                      className="w-full bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Buat Ringkasan Penawaran (Quotation)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <Save className="h-4 w-4 text-emerald-700" />
                      <span>Simpan Hasil Survei Ini</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ----------------------------------------------------------- */
          /* TAB 2: DATA SURVEI TERSIMPAN                               */
          /* ----------------------------------------------------------- */
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama gedung atau alamat..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-600"
                  />
                </div>
                <select
                  value={filterSegmen}
                  onChange={(e) => setFilterSegmen(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white outline-none focus:border-emerald-600 font-medium"
                >
                  <option value="ALL">Semua Jenis Gedung</option>
                  <option value="Office Tower">Perkantoran (Office Tower)</option>
                  <option value="Mall/Public Area">Mall / Area Publik</option>
                  <option value="Hotel">Hotel</option>
                  <option value="RS/Klinik">RS / Klinik</option>
                  <option value="Resto/F&B">Resto & Kafe F&B</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Total Tersimpan: <strong>{savedRecords.length} Data Gedung</strong>
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 p-2.5 flex items-center justify-center shadow-sm">
                  <Image
                    src="/hycare-icon.png"
                    alt="Hycare"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Belum Ada Data Survei Hycare Tersimpan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Isi data di form survei lalu klik tombol <strong>&ldquo;Simpan Hasil Survei Ini&rdquo;</strong> untuk menyimpan data hasil kunjungan gedung ke riwayat Hycare.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('survey')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition"
                >
                  <span>Mulai Isi Form Survei</span>
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
                          <span className="text-[10px] text-slate-400 font-medium">
                            Tersimpan: {new Date(rec.createdAtUtc).toLocaleString('id-ID')}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">
                            {rec.input.namaGedung}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {rec.input.alamatLokasi || 'Alamat tidak diisi'} • {rec.input.segmen}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {rec.result.totalUnitRekomendasi} Produk
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div>
                          <span className="text-slate-500 font-semibold">Tipe Pipa: </span>
                          <strong className="text-slate-800">
                            {rec.input.kondisiPipa === 'PIPA_MANUAL' ? 'Pipa Luar (Bisa Dibor)' : 'Pipa Tanam / Marmer'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Sabun Wastafel: </span>
                          <span className="text-slate-800">
                            {rec.input.tipeWastafel === 'TRAFIK_PADAT' ? 'Sabun Cair 1 Liter' : 'Sabun Busa (Foam) Hemat Air'}
                          </span>
                        </div>
                        {rec.input.kondisiLobi !== 'NONE' && (
                          <div>
                            <span className="text-slate-500 font-semibold">Pengharum Lobi: </span>
                            <span className="text-teal-800 font-medium">
                              {rec.input.kondisiLobi === 'HVAC_LUAS' ? 'Tersambung AC Sentral (HVAC)' : 'Unit Berdiri Sendiri (Stand Alone)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleLoadRecord(rec)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Buka & Edit Kembali</span>
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RINGKASAN PENAWARAN (QUOTATION)                        */}
      {/* ------------------------------------------------------------- */}
      {isQuotationModalOpen && diagnosticResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                  <Image
                    src="/hycare-icon.png"
                    alt="Hycare"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base">Ringkasan Penawaran Layanan (Hycare Quotation)</h3>
                  <p className="text-xs text-emerald-200/80">
                    Daftar rekomendasi produk Hycare siap diajukan untuk penawaran harga
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotationModalOpen(false)}
                className="text-white/80 hover:text-white text-xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>{diagnosticResult.namaGedung}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    {diagnosticResult.segmen}
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Rekomendasi telah disesuaikan dengan kebutuhan fasilitas dan siap dilanjutkan ke pembuatan surat penawaran harga.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  Daftar Produk yang Direkomendasikan ({diagnosticResult.totalUnitRekomendasi} Produk):
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  {[
                    ...diagnosticResult.kategori1_Restroom,
                    ...diagnosticResult.kategori2_Secondary,
                    ...diagnosticResult.kategori3_SmartScenting,
                  ].map((unit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 border-b border-slate-200 last:border-none"
                    >
                      <span className="font-medium text-slate-900">
                        {unit.namaUnit}
                      </span>
                      <span className="text-emerald-800 font-bold">{unit.estimasiUnit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ONNX Model Info Badge */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Format Model: <strong>ONNX Portable (Zero-Server In-Browser)</strong>
                </span>
                <a
                  href="/models/ecocare_hygiene_model.onnx"
                  download="ecocare_hygiene_model.onnx"
                  className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh ONNX</span>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCopyCleanSummary}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Rangkuman Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Salin Format Pesan / Email</span>
                    </>
                  )}
                </button>

                <a
                  href="https://pricing.ecocare.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs text-center"
                >
                  <span>Buka Sistem Penawaran</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
