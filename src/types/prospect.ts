// src/types/prospect.ts

export type SegmenIndustri =
  | 'Office_Tower'
  | 'Hotel_Hospital'
  | 'Mall_Retail'
  | 'Resto_F&B'
  | 'Warehouse_Pabrik'
  | 'Arsip_Instansi';

export type TrafficHarian = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat_Tinggi';
export type JamOperasional = '8_Jam' | '12_Jam' | '14_Jam' | '24_Jam';

// 1. Observasi Hygiene
export type KondisiAromaToilet = 'Segar' | 'Pengap' | 'Bau_Menyengat';
export type FasilitasCuciTangan =
  | 'Lengkap_Otomatis'
  | 'Dispenser_Manual'
  | 'Sabun_Batang_Curah'
  | 'Kosong_Tidak_Terawat';
export type KetersediaanSanitaryBin =
  | 'Ada_Tertutup'
  | 'Tempat_Sampah_Biasa'
  | 'Tidak_Ada';
export type KondisiLantaiPintuMasuk =
  | 'Kering_Ada_Mat'
  | 'Banyak_Debu_Sepatu'
  | 'Lembap_Licin';
export type SirkulasiUdaraRuang =
  | 'AC_Sentral_Baik'
  | 'Ventilasi_Cukup'
  | 'Pengap_Panas';

// 2. Observasi Pest Control
export type JarakTempatSampah =
  | '>15m_Terisolasi'
  | '5-15m_Tertutup'
  | '<5m_Terbuka';
export type ProteksiAksesPintu =
  | 'Rapat_AirCurtain_DoorSweep'
  | 'Standar_Tertutup'
  | 'Sering_Terbuka_Celah_Besar';
export type AktivitasLoadingBarang =
  | 'Tidak_Ada'
  | 'Rendah'
  | 'Tinggi_Tanpa_Inspeksi';
export type IndikasiVisualHama =
  | 'Tidak_Ada'
  | 'Lalat_Semut_Kucing'
  | 'Jejak_Tikus_Kecoa_Smear';
export type KondisiSanitasiDrainase =
  | 'Bersih_Lancar'
  | 'Ada_Genangan_Air'
  | 'Saluran_Kotor_Sisa_Makanan';

// 3. Observasi Termite Control (Rayap)
export type UsiaDanStatusBangunan =
  | 'Pra_Konstruksi'
  | 'Baru_<5Thn'
  | 'Sedang_5-10Thn'
  | 'Tua_>10Thn';
export type DominasiMaterialKayu =
  | 'Minim_Baja_Kaca'
  | 'Sedang_Furnitur'
  | 'Tinggi_Struktur_Partisi_Kayu';
export type IndikasiLembapAtauRayap =
  | 'Aman_Kering'
  | 'Dinding_Rembes_Bocor'
  | 'Ada_Jalur_Tanah_Kayu_Keropos';

// 4. Observasi Fumigasi & Vendor
export type PenyimpananKomoditasArsip =
  | 'Tidak_Ada'
  | 'Gudang_Arsip_Kertas'
  | 'Silo_Pangan_Karung'
  | 'Kontainer_Ekspor_Impor';
export type KondisiVendorSaatIni =
  | 'Ada_Kontrak_Puas'
  | 'Belum_Ada_Internal'
  | 'Ada_Komplain_Tidak_Puas';

export type LiniLayanan =
  | 'Hygiene'
  | 'Pest_Control'
  | 'Termite_Control'
  | 'Fumigasi';

export type StatusProspek = 'HOT PROSPECT' | 'WARM PROSPECT' | 'COLD PROSPECT';

export interface ProspectObservationInput {
  namaGedung: string;
  alamatLokasi: string;
  picNama?: string;
  catatanLapangan?: string;
  segmen_industri: SegmenIndustri;
  skala_area_m2: number;
  traffic_harian: TrafficHarian;
  jam_operasional: JamOperasional;
  rating_online_kebersihan: number;
  // Hygiene
  kondisi_aroma_toilet: KondisiAromaToilet;
  fasilitas_cuci_tangan: FasilitasCuciTangan;
  ketersediaan_sanitary_bin: KetersediaanSanitaryBin;
  kondisi_lantai_pintu_masuk: KondisiLantaiPintuMasuk;
  sirkulasi_udara_ruang: SirkulasiUdaraRuang;
  // Pest Control
  jarak_tempat_sampah_m: JarakTempatSampah;
  proteksi_akses_pintu: ProteksiAksesPintu;
  aktivitas_loading_barang: AktivitasLoadingBarang;
  indikasi_visual_hama: IndikasiVisualHama;
  kondisi_sanitasi_drainase: KondisiSanitasiDrainase;
  // Termite
  usia_dan_status_bangunan: UsiaDanStatusBangunan;
  dominasi_material_kayu: DominasiMaterialKayu;
  indikasi_lembap_atau_rayap: IndikasiLembapAtauRayap;
  // Fumigasi & Vendor
  penyimpanan_komoditas_arsip: PenyimpananKomoditasArsip;
  tuntutan_regulasi_audit: 0 | 1;
  kondisi_vendor_saat_ini: KondisiVendorSaatIni;
}

export interface SpecificProductRecommendation {
  kodeProduk: string;
  namaProduk: string;
  lini: LiniLayanan;
  prioritas: 'Utama' | 'Pendukung';
  alasanObservasi: string;
  scriptPitching: string;
}

export interface LiniScoreItem {
  lini: LiniLayanan;
  label: string;
  skorPersen: number;
}

export interface PredictionAuditMetadata {
  runId: string;
  evaluatedAtUtc: string;
  latencyMs: number;
  engineVersion: string;
}

export interface ProspectPredictionResult {
  probabilitasKonversi: number;
  statusLead: StatusProspek;
  rekomendasiUtama: LiniScoreItem;
  rekomendasiCrossSell: LiniScoreItem | null;
  distribusiSkorLini: LiniScoreItem[];
  produkSpesifik: SpecificProductRecommendation[];
  keyRiskFactors: string[];
  audit: PredictionAuditMetadata;
}

export interface SavedProspectRecord {
  id: string;
  createdAtUtc: string;
  input: ProspectObservationInput;
  prediction: ProspectPredictionResult;
}

