// src/types/prospect.ts

export type SurveyType = 'NEW_CUSTOMER' | 'RENEWAL';

export type SegmenGedung =
  | 'Corporate & Financial'
  | 'Healthcare & Education'
  | 'Hospitality & Lifestyle'
  | 'Industrial & Institutional'
  | 'Other';

export type HariAktif = '5 Hari Kerja' | '7 Hari Kerja';

export type KondisiPipa =
  | 'PIPA_MANUAL' // Pipa Luar Biasa (Bisa Dibor) -> EST
  | 'PIPA_TANAM'; // Pipa Tanam / Sensor / Marmer (Dilarang Bor) -> EDST

export type TipeWastafel =
  | 'TRAFIK_PADAT' // Pengunjung Ramai (>1.000 org/hari) -> ESD MS1000
  | 'TRAFIK_GREEN'; // Area Kantor / Hemat Air -> EFS SP830

export type KondisiLobi =
  | 'NONE' // Tidak Perlu Pengharum Lobi
  | 'STANDALONE_300' // Lobi Sedang (SC-006 D300 Stand Alone)
  | 'HVAC_LUAS'; // Lobi Luas (SC-005 B5000 / SC-007 S3000 Tersambung AC Sentral Gedung)

// --------------------------------------------------------------------------
// 1. KATEGORISASI & HIERARKI PRODUK ECOCARE
// --------------------------------------------------------------------------
export type ProductHierarchy =
  | 'MAIN_PRODUCT'      // Main Products (Produk Utama)
  | 'SECONDARY_PRODUCT' // Secondary Products (Produk Sekunder)
  | 'FLAGSHIP_PRODUCT'  // Flagship Products (Produk Unggulan / Otomatis High-End)
  | 'SUPPORTING_NEW';   // New Development & Supporting Products (Pengembangan & Pendukung)

// --------------------------------------------------------------------------
// 2. PENGELOMPOKAN PRODUK BERDASARKAN 4 AREA GEDUNG
// --------------------------------------------------------------------------
export type TargetArea =
  | 'AREA_1_TOILET'     // AREA 1: Toilet dan Kamar Mandi
  | 'AREA_2_LOBBY'      // AREA 2: Pintu Masuk dan Lobi Utama
  | 'AREA_3_CORRIDOR'   // AREA 3: Koridor, Lift, dan Ruang Rapat
  | 'AREA_4_PANTRY';    // AREA 4: Dapur, Kantin, dan Pantry

export interface SurveyObservationInput {
  // Informasi Gedung
  namaGedung: string;
  alamatLokasi?: string;
  picNama?: string;
  surveyType: SurveyType;
  segmen: SegmenGedung;
  hariAktif: HariAktif;
  jamOperasional: number; // Jam operasional per hari (1-24)

  // AREA 1: Toilet dan Kamar Mandi
  kondisiPipa: KondisiPipa;
  tipeWastafel: TipeWastafel;
  khawatirBakteriKloset: boolean;
  butuhSanitaryBin: boolean;
  keluhanSampahTisu: boolean;
  jumlahUrinoirKloset: number;
  jumlahWastafel: number;
  jumlahKubikalWanita: number;
  // Fitur Spesifik Area 1
  pasangUrinalScreen?: boolean;
  autoSeatCleanerTouchless?: boolean;
  autoDispenserTouchlessArea1?: boolean;
  blowerToiletKipas?: boolean;
  handSanitizerToilet?: boolean;

  // AREA 2: Pintu Masuk dan Lobi Utama
  pintuMasukLicinDebu: boolean;
  kondisiLobi: KondisiLobi;
  handSanitizerLobi?: boolean;

  // AREA 3: Koridor, Lift, dan Ruang Rapat
  ruangSempitLift: boolean;
  koridorPublikTerbuka: boolean;
  areaSensitifKlinik: boolean;
  ruangRapatVip: boolean;
  essentialOilMeeting?: boolean;
  handSanitizerKoridor?: boolean;
  kesetAksesMeeting?: boolean;

  // AREA 4: Dapur, Kantin, dan Pantry
  masalahLalatKantin: boolean;
  sabunPantryEkonomis: boolean;
  kesetMinyakDapur?: boolean;
  handSanitizerKantinDapur?: boolean;

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
  namaSpesifikAlat: string; // Nama spesifik alat resmi EcoCare
  kategori: HygieneCategory;
  targetArea: TargetArea; // Posisi ke area (1, 2, 3, atau 4)
  namaArea: string; // "Area 1: Toilet & Kamar Mandi", dll.
  posisiSpesifik: string; // Titik pasang spesifik di lokasi
  hierarchy: ProductHierarchy;
  hierarchyLabel: string; // "Produk Utama", "Produk Sekunder", "Flagship Touchless", "Pengembangan & Pendukung"
  matchScore: number; // Persentase kecocokan (0 - 100%)
  petunjukPemasangan: string; // Instruksi teknis pemasangan
  keunggulanGedung: string; // Manfaat bisnis untuk klien / BOD
  estimasiUnit: string;
  keteranganTipe: string;
  catatanKhusus?: string;
  intervalSprayDetail?: string;
}

export interface AreaRecommendationGroup {
  areaId: TargetArea;
  areaNumber: number; // 1, 2, 3, 4
  areaTitle: string;
  areaFokus: string;
  units: HygieneProductRecommendation[];
}

export interface DiagnosticResult {
  runId: string;
  evaluatedAtUtc: string;
  namaGedung: string;
  surveyType: SurveyType;
  segmen: SegmenGedung;
  totalUnitRekomendasi: number;
  areaGroups: AreaRecommendationGroup[]; // Rekomendasi dikelompokkan berdasarkan 4 Area Gedung
  // Backward compatibility fields
  kategori1_Restroom: HygieneProductRecommendation[];
  kategori2_Secondary: HygieneProductRecommendation[];
  kategori3_SmartScenting: HygieneProductRecommendation[];
  sprayerIntervalMinutes: number | null;
  summaryHighlights: string[];
  engineType?: 'MACHINE_LEARNING' | 'RULE_BASED';
  modelAccuracy?: string;
  modelMetrics?: {
    modelName: string;
    trainedSamples: number;
    averageAccuracyF1: number;
  };
  predictionsDetail?: any[];
}

export interface SavedDiagnosticRecord {
  id: string;
  createdAtUtc: string;
  input: SurveyObservationInput;
  result: DiagnosticResult;
}
