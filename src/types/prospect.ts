// src/types/prospect.ts

export type SurveyType = 'NEW_CUSTOMER' | 'RENEWAL';

export type SegmenGedung =
  | 'Office Tower'
  | 'Mall/Public Area'
  | 'Hotel'
  | 'RS/Klinik'
  | 'Resto/F&B';

export type HariAktif = '5 Hari Kerja' | '7 Hari Kerja';

export type KondisiPipa =
  | 'PIPA_MANUAL' // Pipa Manual Biasa - Bisa Dibor & Ada Tekanan Air
  | 'PIPA_TANAM'; // Pipa Tanam / Sensor Autoflush / Marmer - Tidak Boleh Dibor

export type TipeWastafel =
  | 'TRAFIK_PADAT' // Wastafel Publik Trafik Padat >1.000 org/hari
  | 'TRAFIK_GREEN'; // Wastafel Perkantoran / Konsep Green Hemat Air

export type KondisiLobi =
  | 'NONE' // Tidak Butuh Scenting Lobi
  | 'STANDALONE_300' // Lobi Sedang / Resepsionis s/d 300 m3 (Tanpa AC Sentral / Stand Alone)
  | 'HVAC_LUAS'; // Lobi Gedung Luas >300 m3 (Tersedia Koneksi AHU / AC Sentral HVAC)

export interface SurveyObservationInput {
  // Profil Umum
  namaGedung: string;
  alamatLokasi?: string;
  picNama?: string;
  surveyType: SurveyType;
  segmen: SegmenGedung;
  hariAktif: HariAktif;
  jamOperasional: number; // e.g. 11, 13, 14, 24 jam/hari

  // ZONA 1: Restroom / Toilet (Kubikal, Urinoir, & Wastafel)
  kondisiPipa: KondisiPipa;
  tipeWastafel: TipeWastafel;
  khawatirBakteriKloset: boolean;
  butuhSanitaryBin: boolean;
  keluhanSampahTisu: boolean;
  jumlahUrinoirKloset: number;
  jumlahWastafel: number;
  jumlahKubikalWanita: number;

  // ZONA 2: Pintu Masuk & Lobi Utama (First Impression)
  pintuMasukLicinDebu: boolean;
  kondisiLobi: KondisiLobi;

  // ZONA 3: Koridor, Lift, & Ruang Rapat (Enclosed Area)
  ruangSempitLift: boolean;
  koridorPublikTerbuka: boolean;
  areaSensitifKlinik: boolean;
  ruangRapatVip: boolean;

  // ZONA 4: Pantry, Kantin, & Area Belakang
  masalahLalatKantin: boolean;
  sabunPantryEkonomis: boolean;

  // Catatan Tambahan
  catatanTeknis?: string;
}

export type HygieneCategory =
  | 'Main Restroom'
  | 'Secondary Products'
  | 'Smart Scenting';

export interface HygieneProductRecommendation {
  id: string;
  kodeUnit: string;
  namaUnit: string;
  kategori: HygieneCategory;
  matchScore: number; // e.g. 96
  alasanTeknis: string; // Instruksi teknisi agar tidak salah bawa barang
  nilaiBisnis: string; // Argumen pitching quotation
  estimasiUnit: string;
  badgeTeknis: string;
  warningTeknis?: string;
  intervalSprayDetail?: string;
}

export interface DiagnosticResult {
  runId: string;
  evaluatedAtUtc: string;
  namaGedung: string;
  surveyType: SurveyType;
  segmen: SegmenGedung;
  totalUnitRekomendasi: number;
  kategori1_MainRestroom: HygieneProductRecommendation[];
  kategori2_Secondary: HygieneProductRecommendation[];
  kategori3_SmartScenting: HygieneProductRecommendation[];
  sprayerIntervalMinutes: number | null;
  summaryHighlights: string[];
}

export interface SavedDiagnosticRecord {
  id: string;
  createdAtUtc: string;
  input: SurveyObservationInput;
  result: DiagnosticResult;
}
