// src/app/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  History,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Trash2,
  MapPin,
  Clock,
  RotateCcw,
  Download,
  Search,
  ChevronRight,
  Award,
  Layers,
  MessageSquareQuote,
  ShieldCheck,
  Send,
  Droplets,
  Wind,
  Flame,
  Wrench,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Info,
  SlidersHorizontal,
  FileSpreadsheet,
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

const STORAGE_KEY = 'ecocare_hygiene_diagnostic_v2';

// -------------------------------------------------------------
// 3 SKENARIO PRESET DEMO CEPAT (1-KLIK)
// -------------------------------------------------------------
const PRESET_KANTOR: SurveyObservationInput = {
  namaGedung: 'Menara Astra Ventura (Tower 1)',
  alamatLokasi: 'Jl. Jend. Sudirman Kav. 5-6, Jakarta Pusat',
  picNama: 'Ibu Ratna (Building Facility Manager)',
  surveyType: 'NEW_CUSTOMER',
  segmen: 'Office Tower',
  hariAktif: '5 Hari Kerja',
  jamOperasional: 11,
  // Zona 1
  kondisiPipa: 'PIPA_TANAM',
  tipeWastafel: 'TRAFIK_GREEN',
  khawatirBakteriKloset: true,
  butuhSanitaryBin: true,
  keluhanSampahTisu: true,
  jumlahUrinoirKloset: 14,
  jumlahWastafel: 8,
  jumlahKubikalWanita: 8,
  // Zona 2
  pintuMasukLicinDebu: true,
  kondisiLobi: 'STANDALONE_300',
  // Zona 3
  ruangSempitLift: true,
  koridorPublikTerbuka: false,
  areaSensitifKlinik: false,
  ruangRapatVip: true,
  // Zona 4
  masalahLalatKantin: false,
  sabunPantryEkonomis: true,
  catatanTeknis: 'Dinding toilet full marmer Italia. Manajemen tidak mengizinkan pengeboran pipa apapun.',
};

const PRESET_MALL: SurveyObservationInput = {
  namaGedung: 'Grand Metropolitan Mall & Promenade',
  alamatLokasi: 'Kawasan Bisnis Boulevard No. 88, Bekasi Barat',
  picNama: 'Bpk. Fajar (Head of Operations & Maintenance)',
  surveyType: 'RENEWAL',
  segmen: 'Mall/Public Area',
  hariAktif: '7 Hari Kerja',
  jamOperasional: 14,
  // Zona 1
  kondisiPipa: 'PIPA_MANUAL',
  tipeWastafel: 'TRAFIK_PADAT',
  khawatirBakteriKloset: true,
  butuhSanitaryBin: true,
  keluhanSampahTisu: true,
  jumlahUrinoirKloset: 32,
  jumlahWastafel: 20,
  jumlahKubikalWanita: 24,
  // Zona 2
  pintuMasukLicinDebu: true,
  kondisiLobi: 'HVAC_LUAS',
  // Zona 3
  ruangSempitLift: true,
  koridorPublikTerbuka: true,
  areaSensitifKlinik: false,
  ruangRapatVip: false,
  // Zona 4
  masalahLalatKantin: true,
  sabunPantryEkonomis: true,
  catatanTeknis: 'Trafik akhir pekan >10.000 pengunjung/hari. Lobi utama terkoneksi ducting suplai AHU.',
};

const PRESET_RS: SurveyObservationInput = {
  namaGedung: 'RS Hermina Premier Health Care',
  alamatLokasi: 'Jl. Pemuda No. 12, Pulo Gadung, Jakarta Timur',
  picNama: 'dr. Haryo, Sp.A (Komite PPI / K3RS)',
  surveyType: 'NEW_CUSTOMER',
  segmen: 'RS/Klinik',
  hariAktif: '7 Hari Kerja',
  jamOperasional: 24,
  // Zona 1
  kondisiPipa: 'PIPA_TANAM',
  tipeWastafel: 'TRAFIK_GREEN',
  khawatirBakteriKloset: true,
  butuhSanitaryBin: true,
  keluhanSampahTisu: false,
  jumlahUrinoirKloset: 10,
  jumlahWastafel: 12,
  jumlahKubikalWanita: 10,
  // Zona 2
  pintuMasukLicinDebu: true,
  kondisiLobi: 'STANDALONE_300',
  // Zona 3
  ruangSempitLift: true,
  koridorPublikTerbuka: false,
  areaSensitifKlinik: true,
  ruangRapatVip: false,
  // Zona 4
  masalahLalatKantin: false,
  sabunPantryEkonomis: true,
  catatanTeknis: 'Area poli anak dan rawat inap sensitif alergi alkohol/propelan aerosol. Wajib waterbase.',
};

export default function EcoCareSmartDiagnosticPage() {
  const [activeTab, setActiveTab] = useState<'survey' | 'riwayat'>('survey');
  const [activeZoneAccordion, setActiveZoneAccordion] = useState<number>(1);
  const [formData, setFormData] = useState<SurveyObservationInput>(PRESET_KANTOR);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedDiagnosticRecord[]>([]);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSegmen, setFilterSegmen] = useState<string>('ALL');
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  const resultPanelRef = useRef<HTMLDivElement | null>(null);

  // Load records from LocalStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedRecords(parsed);
        }
      }
    } catch (err) {
      console.error('[EcoCare Storage] Gagal membaca riwayat survei lokal:', err);
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
    // Reset output diagnosis agar hanya muncul ketika tombol Analisis diklik
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

    const res = evaluateDiagnostic(formData);
    setDiagnosticResult(res);

    setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSaveDraft = () => {
    const errors = validateSurveyInput(formData);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    const currentRes = diagnosticResult ?? evaluateDiagnostic(formData);
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
      setSaveToast(`Lampiran Teknis & Hasil Survei "${formData.namaGedung}" berhasil disimpan.`);
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

  const handleCopyQuotationPayload = () => {
    if (!diagnosticResult) return;
    const payload = {
      stage: 'Stage 5 - Pricing & Quotation',
      sourceSystem: 'EcoCare Super Sales App (Stage 4 Site Survey)',
      targetEndpoint: 'https://pricing.ecocare.id/api/v1/quotation/draft',
      client: {
        namaGedung: formData.namaGedung,
        alamat: formData.alamatLokasi,
        pic: formData.picNama,
        surveyType: formData.surveyType,
        segmen: formData.segmen,
        hariKerjaPerMinggu: formData.hariAktif,
        jamOperasionalPerHari: formData.jamOperasional,
      },
      recommendedUnits: [
        ...diagnosticResult.kategori1_MainRestroom.map((u) => ({
          kode: u.kodeUnit,
          nama: u.namaUnit,
          kategori: u.kategori,
          estimasi: u.estimasiUnit,
          matchScore: `${u.matchScore}%`,
        })),
        ...diagnosticResult.kategori2_Secondary.map((u) => ({
          kode: u.kodeUnit,
          nama: u.namaUnit,
          kategori: u.kategori,
          estimasi: u.estimasiUnit,
          matchScore: `${u.matchScore}%`,
        })),
        ...diagnosticResult.kategori3_SmartScenting.map((u) => ({
          kode: u.kodeUnit,
          nama: u.namaUnit,
          kategori: u.kategori,
          estimasi: u.estimasiUnit,
          matchScore: `${u.matchScore}%`,
        })),
      ],
      technicianNotes: formData.catatanTeknis,
      evaluatedAtUtc: diagnosticResult.evaluatedAtUtc,
    };

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
  };

  // Kalkulasi estimasi interval LCD Sprayer secara live untuk informasi sales
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
      {/* CORPORATE APP HEADER & SALES KPI BAR                          */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-lg border-b border-emerald-800/60">
        {/* Top Operational KPI Status Bar */}
        <div className="bg-emerald-950/80 px-4 sm:px-8 py-1.5 border-b border-emerald-800/40 text-[11px] sm:text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-200">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Sales Hygiene KPI Live:</span>
            <span>Target: 7 Visit/Hari</span>
            <span className="text-emerald-500">•</span>
            <span>2 Presentasi Baru</span>
            <span className="text-emerald-500">•</span>
            <span className="text-amber-300 font-bold">Target Quotation: 25/Bulan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-800/80 text-emerald-100 font-mono text-[10px] border border-emerald-700/50">
              Module: Fitur 3 Survey (Stage 4)
            </span>
          </div>
        </div>

        {/* Main Header Brand & Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 flex items-center justify-center shadow-inner">
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  EcoCare Super Sales App — Smart Survey Diagnostic
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  Hygiene Line Only
                </span>
              </div>
              <p className="text-xs text-emerald-100/75">
                PT EcoCare Indo Pasifik Tbk • Unit Matchmaking, Alasan Teknis Instalasi & Nilai Bisnis Klien
              </p>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
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
              <span>Survei 4 Zona & Matchmaking</span>
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
              <span>Draft Lapangan Tersimpan</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                {savedRecords.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {saveToast && (
        <div className="bg-emerald-700 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-md">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTAINER                                                */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'survey' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* --------------------------------------------------------- */}
            {/* LEFT COLUMN: 4 ZONA SURVEY OBSERVATION FORM (7 COLS)      */}
            {/* --------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-5">
              {/* Skenario Demo Cepat (1-Klik) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
                    Pilih Skenario Demo Lapangan (1-Klik Isi Cepat):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(PRESET_KANTOR)}
                    className="text-left px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-emerald-950">1. Gedung Kantor</div>
                      <div className="text-[11px] text-emerald-700">Pipa Tanam & Green Concept</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(PRESET_MALL)}
                    className="text-left px-3 py-2 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-teal-950">2. Mall Besar</div>
                      <div className="text-[11px] text-teal-700">Trafik Padat & Lobi HVAC</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-teal-600 group-hover:translate-x-0.5 transition" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(PRESET_RS)}
                    className="text-left px-3 py-2 rounded-xl border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-cyan-950">3. RS / Klinik</div>
                      <div className="text-[11px] text-cyan-700">Sensitif Alergi & Bebas Alkohol</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-600 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>

              {/* Validation Alert */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-xs sm:text-sm space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Lengkapi data wajib survei sebelum menjalankan diagnostik:</span>
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
                {/* PROFIL UMUM & SURVEY TYPE                             */}
                {/* ----------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-800 text-white">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                          Profil Prospek & Tipe Penugasan Survei
                        </h2>
                        <p className="text-xs text-slate-500">
                          Stage 4: On-Site Visual Inspection & Technical Matchmaking
                        </p>
                      </div>
                    </div>

                    {/* Survey Type Toggle */}
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
                        New Customer
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
                        Renewal / Upselling
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
                        Alamat / Kawasan Gedung
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
                        PIC Ditemui (Purchasing / Facility / GA)
                      </label>
                      <input
                        type="text"
                        value={formData.picNama || ''}
                        onChange={(e) => handleFieldChange('picNama', e.target.value)}
                        placeholder="Nama & Kontak PIC"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Segmen Industri Gedung
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
                        <option value="Office Tower">Office Tower (Perkantoran)</option>
                        <option value="Mall/Public Area">Mall / Area Publik Komersial</option>
                        <option value="Hotel">Hotel & Hospitality</option>
                        <option value="RS/Klinik">RS / Klinik / Fasilitas Kesehatan</option>
                        <option value="Resto/F&B">Resto / Cafe F&B</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Hari Kerja Aktif
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
                          <option value="5 Hari Kerja">5 Hari Kerja</option>
                          <option value="7 Hari Kerja">7 Hari Kerja</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Jam Operasional
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
                {/* 4 ZONA OBSERVASI ACCORDION SECTION                    */}
                {/* ----------------------------------------------------- */}
                <div className="space-y-3">
                  {/* ZONA 1: RESTROOM / TOILET */}
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
                          Z1
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Zona 1: Restroom / Toilet (Kubikal, Urinoir, & Wastafel)
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Pipa kloset/urinoir, trafik sabun cuci tangan, sanitary bin, dan seat cleaner
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
                            1. Kondisi Pipa Kloset / Urinoir (Kritis untuk Rekomendasi Sanitizer)
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
                                  Pipa Manual Biasa (Bisa Dibor)
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  Tersedia tekanan air normal, pipa luar bisa dilubangi/dibor untuk katup vakum mekanis EST.
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
                                  Pipa Tanam / Sensor / Marmer (Dilarang Bor)
                                </strong>
                                <span className="text-[11px] text-amber-700">
                                  Autoflush sensor / dinding marmer mewah. <strong>Wajib EDST Digital Drip</strong> (jangan bawa EST).
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* 2. Tipe Trafik Wastafel */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            2. Tipe Trafik & Konsep Wastafel
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
                                  Wastafel Publik Trafik Padat (&gt;1.000 org/hari)
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  Kapasitas 1.000 ml sabun cair (ESD-MS1000) mencegah komplain kehabisan sabun.
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
                                  Wastafel Perkantoran / Konsep Green Hemat Air
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  Foam Soap (EFS-SP830) menghemat air bilas & sabun hingga 35%.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* 3. Masalah Tambahan Restroom */}
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-700">
                            3. Observasi Masalah Tambahan di Restroom:
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
                              Banyak pengguna wanita/publik khawatir bakteri kulit & kelamin di dudukan kloset{' '}
                              <strong className="text-emerald-700">&rarr; Butuh Seat Cleaner (ESC)</strong>
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
                              Toilet wanita butuh tempat pembuangan pembalut higienis tanpa sentuh (touchless){' '}
                              <strong className="text-emerald-700">&rarr; Butuh Digital Autolid Bin (ESBD)</strong>
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
                              Klien mengeluh sampah kertas tisu berserakan / boros pembelian tisu wastafel{' '}
                              <strong className="text-emerald-700">&rarr; Butuh Jet Hand Dryer (EHD)</strong>
                            </span>
                          </label>
                        </div>

                        {/* 4. Estimasi Jumlah Titik */}
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
                              Kubikal Toilet Wanita
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

                  {/* ZONA 2: PINTU MASUK & LOBI UTAMA */}
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
                          Z2
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Zona 2: Pintu Masuk & Lobi Utama (First Impression)
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Mat keset penahan debu/air dan teknologi Cold-Air Scenting lobi
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
                              Area transisi pintu masuk licin saat hujan / banyak debu jalanan terbawa sepatu
                            </span>
                            <span className="text-[11px] text-teal-700 font-medium">
                              &rarr; Rekomendasi: EcoCare Dust & Moisture Control Mat (EDM) sistem rental cuci berkala.
                            </span>
                          </div>
                        </label>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Kondisi Scenting Area Lobi / Resepsionis:
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
                                <span>Tidak Butuh Scenting Lobi</span>
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
                                    Lobi Sedang / Resepsionis s/d 300 m³ (Stand Alone)
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Tanpa AC sentral &rarr; Rekomendasi <strong>Smart Scent D300</strong> (difusi mandiri digital timer).
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
                                    Lobi Gedung Luas &gt;300 m³ (Koneksi AHU / AC Sentral HVAC)
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Tersedia saluran AC sentral &rarr; Rekomendasi <strong>Smart Scent B5000</strong> (Nano-mist via ducting AHU).
                                  </span>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ZONA 3: KORIDOR, LIFT, & RUANG RAPAT */}
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
                          Z3
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Zona 3: Koridor, Lift, & Ruang Rapat (Enclosed Area)
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Air Freshener blower, semprotan aerosol LCD berkala, waterbase medis & aroma ruang rapat
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
                              Ada Ruang Tertutup Sempit (Lift / Toilet Karyawan 3x3x3m) tanpa stopkontak
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>EAF (Air Freshener Blower)</strong> baterai D, wangi terus tanpa gas aerosol.
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
                              Koridor / Area Publik Terbuka butuh semprotan wangi berkala (LCD Sprayer)
                            </span>
                            <span className="text-[11px] text-cyan-700 font-medium">
                              Kalkulasi Kalibrasi Otomatis:{' '}
                              <strong>Set Timer = {liveInterval} menit</strong> ({formData.jamOperasional} jam/hari, {formData.hariAktif}, siklus 8 minggu / 6.000 spray).
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
                              Area Klinik / RS / Ruang Bayi & Anak (Sensitif bau menyengat & alergi propelan)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>EWB (Waterbase Freshener)</strong> 100% bebas aerosol & propelan kimia.
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
                              Ruang Rapat Direksi / VIP Lounge (s/d 100 m³) butuh aroma mewah hening
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>Smart Scent A80</strong> (Ultra silent cold-air diffusion &lt;30 dB tanpa suara semprotan).
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* ZONA 4: PANTRY, KANTIN, & AREA BELAKANG */}
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
                          Z4
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Zona 4: Pantry, Kantin, & Area Belakang
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Pengendalian lalat makanan dan sabun cuci tangan ekonomis staf
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
                              Kantin karyawan / pantry / pintu dapur sering ada lalat berterbangan
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>Ecoflies (EFL)</strong> repellent aerosol alami berbahan Permethrin/Transfluthrin aman pangan.
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
                              Wastafel pantry butuh sabun ekonomis untuk cuci tangan & peralatan makan staf
                            </span>
                            <span className="text-[11px] text-slate-500">
                              &rarr; Rekomendasi <strong>ESD Sabun Cair / Fave 701W (500 ml)</strong> unit kompak & higienis.
                            </span>
                          </div>
                        </label>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Catatan Khusus Instalasi Teknisi (Opsional)
                          </label>
                          <textarea
                            rows={2}
                            value={formData.catatanTeknis || ''}
                            onChange={(e) => handleFieldChange('catatanTeknis', e.target.value)}
                            placeholder="Contoh: Titik colokan hand dryer sudah ada di wastafel barat, pintu masuk lobi wajib pasang keset 115x180cm..."
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-emerald-600 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SINGLE PRIMARY ACTION BUTTON UNDER FORM */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Sparkles className="h-5 w-5 text-emerald-200" />
                    <span>Jalankan Smart Diagnostic (Unit Matchmaking)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* --------------------------------------------------------- */}
            {/* RIGHT COLUMN: DIAGNOSTIC RESULT & MATCHMAKING (5 COLS)    */}
            {/* --------------------------------------------------------- */}
            <div ref={resultPanelRef} className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
              {!diagnosticResult ? (
                /* Placeholder saat hasil belum di-generate */
                <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center shadow-sm space-y-3">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Hygiene Matchmaking Ready
                    </span>
                    <h3 className="text-base font-bold text-slate-800">
                      Menunggu Hasil Diagnosis Survei
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Silakan isi dan periksa form checklist observasi 4 zona di sebelah kiri, kemudian klik tombol{' '}
                      <strong className="text-emerald-800">&ldquo;Jalankan Smart Diagnostic (Unit Matchmaking)&rdquo;</strong>{' '}
                      untuk menampilkan rekomendasi unit, instruksi teknis instalasi, dan kalkulasi interval.
                    </p>
                  </div>
                </div>
              ) : (
                /* Kartu Hasil Rekomendasi Lengkap */
                <>
                  {/* RINGKASAN SURVEY HEADER */}
                  <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-800/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase block font-mono">
                          {diagnosticResult.runId} • Stage 4 Diagnosed
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-[260px]">
                          {diagnosticResult.namaGedung}
                        </h3>
                        <p className="text-xs text-emerald-200/80">
                          {diagnosticResult.segmen} • {formData.hariAktif} ({formData.jamOperasional} Jam)
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
                          ? 'New Customer'
                          : 'Renewal Upsell'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/50">
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] text-emerald-300 block">Total Unit Match</span>
                        <span className="text-xl font-extrabold text-white">
                          {diagnosticResult.totalUnitRekomendasi} Unit Model
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] text-emerald-300 block">Pipa Kloset/Urinoir</span>
                        <span className="text-xs font-bold text-emerald-100">
                          {formData.kondisiPipa === 'PIPA_MANUAL'
                            ? 'Manual (Bisa Dibor)'
                            : 'Tanam (Dilarang Bor)'}
                        </span>
                      </div>
                    </div>

                    {diagnosticResult.sprayerIntervalMinutes && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-xs text-cyan-200 flex items-center justify-between">
                        <span>Setting Timer LCD Sprayer:</span>
                        <strong className="text-white bg-cyan-800/80 px-2 py-0.5 rounded-md font-mono text-xs">
                          {diagnosticResult.sprayerIntervalMinutes} Menit / Spray
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* HIERARKI REKOMENDASI 3 KELOMPOK PRODUK */}
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                    {/* KELOMPOK 1: MAIN RESTROOM PRODUCTS */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/70 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Droplets className="h-4 w-4 text-emerald-700" />
                          1. Main Restroom Products ({diagnosticResult.kategori1_MainRestroom.length})
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Area Toilet
                        </span>
                      </div>

                      <div className="p-3.5 space-y-3">
                        {diagnosticResult.kategori1_MainRestroom.map((unit) => (
                          <div
                            key={unit.id}
                            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 transition space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {unit.namaUnit}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Match {unit.matchScore}%
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                                {unit.badgeTeknis}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Estimasi: {unit.estimasiUnit}
                              </span>
                            </div>

                            {unit.warningTeknis && (
                              <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium flex items-start gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{unit.warningTeknis}</span>
                              </div>
                            )}

                            <div className="space-y-1 pt-1 text-[11px]">
                              <p className="text-slate-600">
                                <strong className="text-slate-800">Alasan Teknis:</strong> {unit.alasanTeknis}
                              </p>
                              <p className="text-emerald-900 bg-emerald-50/80 p-1.5 rounded-md">
                                <strong>Nilai Bisnis Klien:</strong> {unit.nilaiBisnis}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KELOMPOK 2: SECONDARY PRODUCTS */}
                    {diagnosticResult.kategori2_Secondary.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50/70 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-teal-700" />
                            2. Secondary Products ({diagnosticResult.kategori2_Secondary.length})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                            Mat & Air Freshener
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
                                  Match {unit.matchScore}%
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                                  {unit.badgeTeknis}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                                  Estimasi: {unit.estimasiUnit}
                                </span>
                              </div>

                              <div className="space-y-1 pt-1 text-[11px]">
                                <p className="text-slate-600">
                                  <strong className="text-slate-800">Alasan Teknis:</strong> {unit.alasanTeknis}
                                </p>
                                <p className="text-teal-900 bg-teal-50/80 p-1.5 rounded-md">
                                  <strong>Nilai Bisnis Klien:</strong> {unit.nilaiBisnis}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* KELOMPOK 3: SMART SCENTING */}
                    {diagnosticResult.kategori3_SmartScenting.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-50 to-emerald-50/50 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-cyan-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Wind className="h-4 w-4 text-cyan-700" />
                            3. Smart Scenting / Cold Air ({diagnosticResult.kategori3_SmartScenting.length})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                            First Impression
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
                                  Match {unit.matchScore}%
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                                  {unit.badgeTeknis}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                                  Estimasi: {unit.estimasiUnit}
                                </span>
                              </div>

                              <div className="space-y-1 pt-1 text-[11px]">
                                <p className="text-slate-600">
                                  <strong className="text-slate-800">Alasan Teknis:</strong> {unit.alasanTeknis}
                                </p>
                                <p className="text-cyan-950 bg-cyan-50/80 p-1.5 rounded-md">
                                  <strong>Nilai Bisnis Klien:</strong> {unit.nilaiBisnis}
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
                      <Send className="h-4 w-4" />
                      <span>Kirim Draft ke Quotation (Stage 5 - pricing.ecocare.id)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <Save className="h-4 w-4 text-emerald-700" />
                      <span>Simpan Lampiran Teknis untuk Teknisi & Admin</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ----------------------------------------------------------- */
          /* TAB 2: RINGKASAN DRAFT LAPANGAN & RIWAYAT SURVEI          */
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
                    placeholder="Cari nama gedung atau lokasi..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-600"
                  />
                </div>
                <select
                  value={filterSegmen}
                  onChange={(e) => setFilterSegmen(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white outline-none focus:border-emerald-600"
                >
                  <option value="ALL">Semua Segmen</option>
                  <option value="Office Tower">Office Tower</option>
                  <option value="Mall/Public Area">Mall / Public</option>
                  <option value="Hotel">Hotel</option>
                  <option value="RS/Klinik">RS / Klinik</option>
                  <option value="Resto/F&B">Resto / F&B</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Total Tersimpan: <strong>{savedRecords.length} Draft</strong>
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Belum Ada Lampiran Teknis Survei Tersimpan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Isi form survei 4 zona lalu klik tombol <strong>&ldquo;Simpan Lampiran Teknis untuk Teknisi & Admin&rdquo;</strong> untuk mendokumentasikan hasil survei lapangan.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('survey')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition"
                >
                  <span>Mulai Survei Baru</span>
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
                            {rec.input.alamatLokasi || 'Alamat tidak diisi'} • {rec.input.segmen}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {rec.result.totalUnitRekomendasi} Unit Match
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div>
                          <span className="text-slate-500 font-semibold">Tipe Pipa: </span>
                          <strong className="text-slate-800">
                            {rec.input.kondisiPipa === 'PIPA_MANUAL' ? 'Manual (EST)' : 'Tanam (EDST)'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Wastafel: </span>
                          <span className="text-slate-800">
                            {rec.input.tipeWastafel === 'TRAFIK_PADAT' ? 'Liquid MS1000' : 'Foam SP830'}
                          </span>
                        </div>
                        {rec.input.kondisiLobi !== 'NONE' && (
                          <div>
                            <span className="text-slate-500 font-semibold">Scenting: </span>
                            <span className="text-teal-800 font-medium">
                              {rec.input.kondisiLobi === 'HVAC_LUAS' ? 'Smart Scent B5000 (AHU)' : 'Smart Scent D300 (Stand Alone)'}
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
                        <span>Buka & Edit Survei</span>
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
      {/* MODAL: KIRIM DRAFT KE QUOTATION (STAGE 5 PRICING)             */}
      {/* ------------------------------------------------------------- */}
      {isQuotationModalOpen && diagnosticResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send className="h-5 w-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">Handover ke Stage 5: Pricing & Quotation</h3>
                  <p className="text-xs text-emerald-200/80">
                    Endpoint: pricing.ecocare.id/api/v1/quotation/draft
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotationModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Draft Siap Diproses ke Surat Penawaran (Quotation):</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                    ID: QT-{diagnosticResult.runId}
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Data unit matchmaking dari hasil survei lapangan telah dikompilasi dengan spesifikasi teknis dan alasan bisnis untuk dilanjutkan ke perhitungan skema harga rental & servis bulanan.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  Rincian Unit yang Dikirim ({diagnosticResult.totalUnitRekomendasi} Unit Model):
                </span>
                <div className="max-h-44 overflow-y-auto space-y-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  {[
                    ...diagnosticResult.kategori1_MainRestroom,
                    ...diagnosticResult.kategori2_Secondary,
                    ...diagnosticResult.kategori3_SmartScenting,
                  ].map((unit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 border-b border-slate-200 last:border-none"
                    >
                      <span className="font-medium text-slate-900">
                        {unit.kodeUnit} - {unit.namaUnit}
                      </span>
                      <span className="text-emerald-700 font-semibold">{unit.estimasiUnit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCopyQuotationPayload}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Payload JSON Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Salin Payload Handover (JSON)</span>
                    </>
                  )}
                </button>

                <a
                  href="https://pricing.ecocare.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs text-center"
                >
                  <span>Buka pricing.ecocare.id</span>
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
