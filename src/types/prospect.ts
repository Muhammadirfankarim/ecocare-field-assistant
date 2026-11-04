// src/types/prospect.ts

export type SurveyType = 'NEW_CUSTOMER' | 'RENEWAL';

export type Segmen13Sektor =
  | 'Bank & Finance (BAF)'
  | 'Commercial Office (COF)'
  | 'Commercial Building (COB)'
  | 'Hospital & Clinic (HOC)'
  | 'Education (EDS)'
  | 'Hotel, Motel, Inn (HMI)'
  | 'Shopping Mall (SHM)'
  | 'Restaurant & Entertainment (REN)'
  | 'Recreation / Health Club (RHC)'
  | 'Manufacture & Industrial (MAI)'
  | 'Government / Institutions (GOI)'
  | 'Public Religion (POR)'
  | 'Other (OTH)';

export type SegmenGedung =
  | Segmen13Sektor
  | 'Corporate & Financial'
  | 'Healthcare & Education'
  | 'Hospitality & Lifestyle'
  | 'Industrial & Institutional'
  | 'Other';

export type HariAktif = '5 Hari Kerja' | '7 Hari Kerja';

export type KondisiPipa =
  | 'NONE'        // Tidak Memerlukan Pembersih Pipa Kloset / Lewati
  | 'PIPA_MANUAL' // Pipa Luar Biasa (Bisa Dibor) -> EST
  | 'PIPA_TANAM'; // Pipa Tanam / Sensor / Marmer (Dilarang Bor) -> EDST

export type TipeWastafel =
  | 'NONE'          // Tidak Memerlukan Dispenser Sabun Wastafel / Lewati
  | 'TRAFIK_PADAT'  // Pengunjung Ramai (>1.000 org/hari) -> ESD MS1000
  | 'TRAFIK_GREEN'; // Area Kantor / Hemat Air -> EFS SP830

export type TipeSanitaryBin =
  | 'AUTOLID_SENSOR' // ESBD Digital Autolid Sensor
  | 'MANUAL_PEDAL';  // ESB Manual Pedal Kaki

export type TipeHandDryer =
  | 'JET_MINI_AK2822' // Mini High-Speed AK2822 (Standar Hemat Ruang)
  | 'HANDS_IN_DUAL'   // Dual Jet Hands-In (Bandara, Mall Mewah, Hotel Bintang 5)
  | 'COFFEEMAKER';    // Coffeemaker Sedang 1.350W (Restoran, Kantor Menengah)

export type TipeDispenserWastafelOtomatis =
  | 'AUTO_AK1255'      // Auto Foam AK1255
  | 'AUTO_1017T'       // Auto Foam 1017 T (Touchless Hemat 35% Anti-Kerak)
  | 'AUTO_SP811_WALL'  // Seri SP811/SP812 Wall (EASD / EAFS 4 Baterai AA)
  | 'AUTO_STAINLESS';  // AK1205 / AK1205C Stainless Steel 304 IPX5

export type TipeSabunShower =
  | 'LUXURY_MILK' // Luxury Soap 2-in-1 (White Milk / White Natural)
  | 'SABUN_3IN1'; // Sabun 3-in-1 (Hand, Body & Shampoo)

export type CoverageLobiScent =
  | 'AUTO'          // Menyesuaikan otomatis tipe lobi
  | 'SMALL_100_300' // Small Area (100 - 300 m³) -> SC-008 (A80) / SC-006 (D300)
  | 'MEDIUM_3000'   // Free Standing (s/d 3.000 m³) -> SC-007 (S3000)
  | 'LARGE_5000';   // HVAC AC Sentral (s/d 5.000 m³) -> SC-005 (B5000)

export type DayaListrikScent =
  | 'AUTO'        // Menyesuaikan otomatis (Rekomendasi AI)
  | 'LOW_POWER'   // Daya Rendah / Hemat Listrik (A80 0,0015 kWh / D300 0,0060 kWh)
  | 'HIGH_POWER'; // Daya Tinggi / Output HVAC Maksimal (B5000 0,0310 kWh / S3000)

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
  tipeSanitaryBin?: TipeSanitaryBin;
  keluhanSampahTisu: boolean;
  tipeHandDryer?: TipeHandDryer;
  jumlahUrinoirKloset: number;
  jumlahWastafel: number;
  jumlahKubikalWanita: number;
  // Fitur Spesifik Area 1
  pasangUrinalScreen?: boolean;
  autoSeatCleanerTouchless?: boolean;
  autoDispenserTouchlessArea1?: boolean;
  tipeDispenserWastafelOtomatis?: TipeDispenserWastafelOtomatis;
  butuhSabunMandiShower?: boolean;
  tipeSabunShower?: TipeSabunShower;
  blowerToiletKipas?: boolean;
  handSanitizerToilet?: boolean;

  // AREA 2: Pintu Masuk dan Lobi Utama
  pintuMasukLicinDebu: boolean;
  kondisiLobi: KondisiLobi;
  coverageLobiScent?: CoverageLobiScent;
  dayaListrikScent?: DayaListrikScent;
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
