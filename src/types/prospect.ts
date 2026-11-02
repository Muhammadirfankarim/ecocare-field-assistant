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
  | 'PIPA_MANUAL' // Pipa Luar Biasa (Bisa Dibor)
  | 'PIPA_TANAM'; // Pipa Tanam / Sensor / Marmer (Dilarang Bor)

export type TipeWastafel =
  | 'TRAFIK_PADAT' // Pengunjung Ramai (>1.000 org/hari)
  | 'TRAFIK_GREEN'; // Area Kantor / Hemat Air

export type KondisiLobi =
  | 'NONE' // Tidak Perlu Pengharum Lobi
  | 'STANDALONE_300' // Lobi Sedang (Pengharum Mandiri)
  | 'HVAC_LUAS'; // Lobi Luas (Tersambung AC Sentral Gedung)

export interface SurveyObservationInput {
  // Informasi Gedung
  namaGedung: string;
  alamatLokasi?: string;
  picNama?: string;
  surveyType: SurveyType;
  segmen: SegmenGedung;
  hariAktif: HariAktif;
  jamOperasional: number; // Jam operasional per hari (1-24)

  // Area 1: Toilet & Kamar Mandi
  kondisiPipa: KondisiPipa;
  tipeWastafel: TipeWastafel;
  khawatirBakteriKloset: boolean;
  butuhSanitaryBin: boolean;
  keluhanSampahTisu: boolean;
  jumlahUrinoirKloset: number;
  jumlahWastafel: number;
  jumlahKubikalWanita: number;

  // Area 2: Pintu Masuk & Lobi Utama
  pintuMasukLicinDebu: boolean;
  kondisiLobi: KondisiLobi;

  // Area 3: Koridor, Lift, & Ruang Rapat
  ruangSempitLift: boolean;
  koridorPublikTerbuka: boolean;
  areaSensitifKlinik: boolean;
  ruangRapatVip: boolean;

  // Area 4: Dapur, Kantin, & Pantry
  masalahLalatKantin: boolean;
  sabunPantryEkonomis: boolean;

  // Catatan Tambahan
  catatanTeknis?: string;
}

export type HygieneCategory =
  | 'Toilet & Sanitasi Utama'
  | 'Pengharum & Kebersihan Lantai'
  | 'Pengharum Premium (Smart Scenting)';

export interface HygieneProductRecommendation {
  id: string;
  kodeUnit: string;
  namaUnit: string;
  kategori: HygieneCategory;
  matchScore: number; // Persentase kecocokan
  petunjukPemasangan: string; // Instruksi pemasangan sederhana
  keunggulanGedung: string; // Manfaat mudah dipahami untuk klien/BOD
  estimasiUnit: string;
  keteranganTipe: string;
  catatanKhusus?: string;
  intervalSprayDetail?: string;
}

export interface DiagnosticResult {
  runId: string;
  evaluatedAtUtc: string;
  namaGedung: string;
  surveyType: SurveyType;
  segmen: SegmenGedung;
  totalUnitRekomendasi: number;
  kategori1_Restroom: HygieneProductRecommendation[];
  kategori2_Secondary: HygieneProductRecommendation[];
  kategori3_SmartScenting: HygieneProductRecommendation[];
  sprayerIntervalMinutes: number | null;
  summaryHighlights: string[];
  engineType?: 'MACHINE_LEARNING' | 'RULE_BASED';
  modelAccuracy?: string;
}

export interface SavedDiagnosticRecord {
  id: string;
  createdAtUtc: string;
  input: SurveyObservationInput;
  result: DiagnosticResult;
}
