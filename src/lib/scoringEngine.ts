// src/lib/scoringEngine.ts
import {
  LiniLayanan,
  LiniScoreItem,
  ProspectObservationInput,
  ProspectPredictionResult,
  SpecificProductRecommendation,
  StatusProspek,
} from '@/types/prospect';

export const LINI_LABELS: Record<LiniLayanan, string> = {
  Hygiene: 'EcoCare Hygiene & Sanitation',
  Pest_Control: 'EcoCare Pest Control (tukanghama)',
  Termite_Control: 'EcoCare Termite Control (Anti-Rayap)',
  Fumigasi: 'EcoCare Fumigation & Quarantine',
};

function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return fallback;
  }
  return numerator / denominator;
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export function validateObservationInput(input: ProspectObservationInput): string[] {
  const errors: string[] = [];
  if (!input.namaGedung || input.namaGedung.trim().length < 2) {
    errors.push('Nama/Lokasi Gedung wajib diisi (minimal 2 karakter).');
  }
  if (!Number.isFinite(input.skala_area_m2) || input.skala_area_m2 <= 0) {
    errors.push('Skala Area (m²) harus berupa angka positif (> 0).');
  }
  if (
    !Number.isFinite(input.rating_online_kebersihan) ||
    input.rating_online_kebersihan < 1.0 ||
    input.rating_online_kebersihan > 5.0
  ) {
    errors.push('Rating Online Kebersihan harus berada di rentang 1.0 hingga 5.0.');
  }
  return errors;
}

export function evaluateProspect(input: ProspectObservationInput): ProspectPredictionResult {
  const startPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();

  // Sanitize numeric boundaries defensively
  const areaM2 = clamp(Number(input.skala_area_m2) || 500, 20, 500000);
  const rating = clamp(Number(input.rating_online_kebersihan) || 4.0, 1.0, 5.0);

  // Raw urgency points per business line
  let rawHygiene = 8;
  let rawPest = 8;
  let rawTermite = 5;
  let rawFumigasi = 2;

  const keyRiskFactors: string[] = [];
  const produkSpesifik: SpecificProductRecommendation[] = [];

  // --- 1. ANALISIS OBSERVASI HYGIENE ---
  if (input.kondisi_aroma_toilet === 'Bau_Menyengat') {
    rawHygiene += 34;
    keyRiskFactors.push('Aroma toilet menyengat (risiko komplain pengunjung & bakteri asam urat)');
    produkSpesifik.push({
      kodeProduk: 'EC-EST-01',
      namaProduk: 'EcoCare Sanitizer (EST) & Biological Urinal Block',
      lini: 'Hygiene',
      prioritas: 'Utama',
      alasanObservasi: 'Terdeteksi bau menyengat pada area toilet/urinal.',
      scriptPitching:
        'Bapak/Ibu, bau menyengat di toilet umumnya berasal dari kerak asam urat di pipa urinal. EcoCare Sanitizer (EST) bekerja otomatis mencegah kerak dan menjaga toilet bebas bau 24 jam.',
    });
  } else if (input.kondisi_aroma_toilet === 'Pengap') {
    rawHygiene += 18;
    produkSpesifik.push({
      kodeProduk: 'EC-EAF-02',
      namaProduk: 'EcoCare Air Freshener (EAF) Programmable Dispenser',
      lini: 'Hygiene',
      prioritas: 'Utama',
      alasanObservasi: 'Kondisi aroma toilet terpantau pengap.',
      scriptPitching:
        'Untuk menjaga kesegaran ruang washroom secara konsisten sesuai jam operasional gedung, kami merekomendasikan unit EcoCare Air Freshener otomatis dengan jadwal semprot terkalibrasi.',
    });
  }

  if (
    input.fasilitas_cuci_tangan === 'Kosong_Tidak_Terawat' ||
    input.fasilitas_cuci_tangan === 'Sabun_Batang_Curah'
  ) {
    rawHygiene += 24;
    keyRiskFactors.push('Fasilitas cuci tangan belum higienis (sabun curah/kosong rentan kontaminasi silang)');
    produkSpesifik.push({
      kodeProduk: 'EC-AFS-03',
      namaProduk: 'Automated Foam Soap Dispenser & Hand Sanitizer',
      lini: 'Hygiene',
      prioritas: 'Utama',
      alasanObservasi: `Fasilitas cuci tangan saat ini: ${input.fasilitas_cuci_tangan.replace(/_/g, ' ')}.`,
      scriptPitching:
        'Penggunaan sabun curah/batang berisiko menularkan bakteri antar pengunjung dan boros pemakaian. Sistem Automated Foam Soap touchless kami menghemat konsumsi sabun hingga 40% dengan kontrak servis berkala.',
    });
  } else if (input.fasilitas_cuci_tangan === 'Dispenser_Manual') {
    rawHygiene += 10;
  }

  if (input.ketersediaan_sanitary_bin === 'Tidak_Ada') {
    rawHygiene += 26;
    keyRiskFactors.push('Toilet wanita belum dilengkapi Sanitary Bin (risiko pipa kloset mampet)');
    produkSpesifik.push({
      kodeProduk: 'EC-FSB-04',
      namaProduk: 'EcoCare Feminine Sanitary Bin (Touch-Free Sensor)',
      lini: 'Hygiene',
      prioritas: 'Utama',
      alasanObservasi: 'Belum tersedia unit Sanitary Bin khusus di kubikal toilet wanita.',
      scriptPitching:
        'Tanpa Sanitary Bin khusus, pembalut sering dibuang ke kloset dan menyumbat plumbing gedung. Layanan Sanitary Bin EcoCare mencakup penggantian unit steril secara rutin dan pengelolaan limbah higienis.',
    });
  } else if (input.ketersediaan_sanitary_bin === 'Tempat_Sampah_Biasa') {
    rawHygiene += 16;
    produkSpesifik.push({
      kodeProduk: 'EC-FSB-04',
      namaProduk: 'EcoCare Feminine Sanitary Bin (Anti-Bacterial Liner)',
      lini: 'Hygiene',
      prioritas: 'Pendukung',
      alasanObservasi: 'Menggunakan tempat sampah biasa untuk limbah pembalut.',
      scriptPitching:
        'Tempat sampah biasa yang terbuka memicu bau dan perkembangan kuman di dalam kubikal. Unit Sanitary Bin tertutup kami dilengkapi disinfektan khusus.',
    });
  }

  if (input.kondisi_lantai_pintu_masuk === 'Lembap_Licin' || input.kondisi_lantai_pintu_masuk === 'Banyak_Debu_Sepatu') {
    rawHygiene += 14;
    produkSpesifik.push({
      kodeProduk: 'EC-MAT-05',
      namaProduk: 'EcoCare Dust Control Mat (Rental & Laundry Service)',
      lini: 'Hygiene',
      prioritas: 'Pendukung',
      alasanObservasi: `Lantai akses masuk terpantau ${input.kondisi_lantai_pintu_masuk.replace(/_/g, ' ').toLowerCase()}.`,
      scriptPitching:
        '80% debu dan kelembapan di dalam gedung masuk dari alas kaki pengunjung. Dust Control Mat EcoCare menyerap debu dan air secara efektif untuk mencegah lantai licin.',
    });
  }

  if (input.sirkulasi_udara_ruang === 'Pengap_Panas' || input.segmen_industri === 'Hotel_Hospital' || input.segmen_industri === 'Office_Tower' || input.segmen_industri === 'Mall_Retail') {
    if (input.sirkulasi_udara_ruang === 'Pengap_Panas') {
      rawHygiene += 15;
    }
    produkSpesifik.push({
      kodeProduk: 'EC-SCD-06',
      namaProduk: 'EcoCare Ambient Scenting / Cold-Air Aroma Diffuser',
      lini: 'Hygiene',
      prioritas: input.sirkulasi_udara_ruang === 'Pengap_Panas' ? 'Utama' : 'Pendukung',
      alasanObservasi: `Optimalisasi impresi aroma lobby untuk segmen ${input.segmen_industri.replace(/_/g, ' ')}.`,
      scriptPitching:
        'Untuk meningkatkan citra premium di area lobby dan koridor utama, EcoCare Scent Diffuser menggunakan teknologi mikro-nebulizer yang menyebarkan aroma signature secara merata.',
    });
  }

  // --- 2. ANALISIS OBSERVASI PEST CONTROL ---
  if (input.indikasi_visual_hama === 'Jejak_Tikus_Kecoa_Smear') {
    rawPest += 48;
    keyRiskFactors.push('Ditemukan indikasi aktif tikus/kecoa/smear mark (risiko kerusakan aset & reputasi)');
    produkSpesifik.push({
      kodeProduk: 'EC-IPM-01',
      namaProduk: 'Integrated Rodent & Cockroach Management (Monitoring Station + Gel Baiting)',
      lini: 'Pest_Control',
      prioritas: 'Utama',
      alasanObservasi: 'Terdeteksi jejak visual tikus, kecoa, atau smear mark di lokasi.',
      scriptPitching:
        'Kami menemukan indikasi jalur aktif tikus/kecoa. Tim Pest Control EcoCare menerapkan sistem Integrated Pest Management dengan Tamper-Resistant Bait Station di perimeter luar dan Gel Baiting tidak berbau di area dalam.',
    });
  } else if (input.indikasi_visual_hama === 'Lalat_Semut_Kucing') {
    rawPest += 26;
    keyRiskFactors.push('Terpantau aktivitas hama terbang (lalat) / semut di sekitar area operasional');
    produkSpesifik.push({
      kodeProduk: 'EC-ILT-02',
      namaProduk: 'EcoCare UV Fly Catcher (Glue Board Insect Light Trap)',
      lini: 'Pest_Control',
      prioritas: 'Utama',
      alasanObservasi: 'Terpantau gangguan lalat/serangga terbang di area gedung.',
      scriptPitching:
        'Untuk mengendalikan lalat tanpa suara sengatan listrik dan tanpa serpihan serangga yang mengontaminasi ruangan, kami menyarankan pemasangan unit UV Fly Catcher berpelat lem standar audit.',
    });
  }

  if (input.kondisi_sanitasi_drainase === 'Saluran_Kotor_Sisa_Makanan') {
    rawPest += 25;
    keyRiskFactors.push('Saluran drainase mengandung residu organik (sumber koloni kecoa & lalat limbah)');
  } else if (input.kondisi_sanitasi_drainase === 'Ada_Genangan_Air') {
    rawPest += 16;
    keyRiskFactors.push('Terdapat genangan air pada saluran (potensi perindukan nyamuk & hama)');
  }

  if (input.jarak_tempat_sampah_m === '<5m_Terbuka') {
    rawPest += 20;
    keyRiskFactors.push('Tempat pembuangan sampah terbuka berjarak < 5m dari akses bangunan');
  } else if (input.jarak_tempat_sampah_m === '5-15m_Tertutup') {
    rawPest += 8;
  }

  if (input.proteksi_akses_pintu === 'Sering_Terbuka_Celah_Besar') {
    rawPest += 18;
    keyRiskFactors.push('Akses pintu memiliki celah/sering terbuka tanpa proteksi Air Curtain/Door Sweep');
  }

  if (input.aktivitas_loading_barang === 'Tinggi_Tanpa_Inspeksi') {
    rawPest += 16;
  }

  // --- 3. ANALISIS OBSERVASI TERMITE CONTROL ---
  if (input.indikasi_lembap_atau_rayap === 'Ada_Jalur_Tanah_Kayu_Keropos') {
    rawTermite += 62;
    keyRiskFactors.push('Ditemukan jalur tanah (mud tubes) / kerusakan kayu akibat koloni rayap aktif');
    produkSpesifik.push({
      kodeProduk: 'EC-TBS-01',
      namaProduk: 'EcoCare Colony Elimination Termite Baiting System (In-Ground & Above-Ground)',
      lini: 'Termite_Control',
      prioritas: 'Utama',
      alasanObservasi: 'Terdeteksi jalur tanah rayap aktif / pelapukan struktur kayu.',
      scriptPitching:
        'Jalur tanah ini menandakan koloni rayap tanah sudah menyerang struktur interior. Kami merekomendasikan Termite Baiting System yang mengeliminasi hingga ke ratu koloni tanpa perlu pengeboran masif yang mengganggu operasional.',
    });
  } else if (input.indikasi_lembap_atau_rayap === 'Dinding_Rembes_Bocor') {
    rawTermite += 28;
    keyRiskFactors.push('Kelembapan dinding/rembesan tinggi (kondisi ideal serangan rayap subteran)');
    produkSpesifik.push({
      kodeProduk: 'EC-TCB-02',
      namaProduk: 'Termite Chemical Soil Barrier & Moisture Inspection',
      lini: 'Termite_Control',
      prioritas: 'Pendukung',
      alasanObservasi: 'Terdeteksi rembesan dinding yang memicu daya tarik rayap tanah.',
      scriptPitching:
        'Area dinding yang lembap sangat menarik bagi koloni rayap pekerja. Proteksi injeksi Chemical Barrier dengan garansi perlindungan hingga 3-5 tahun sangat disarankan sebelum merusak partisi.',
    });
  }

  if (input.dominasi_material_kayu === 'Tinggi_Struktur_Partisi_Kayu') {
    rawTermite += 24;
  } else if (input.dominasi_material_kayu === 'Sedang_Furnitur') {
    rawTermite += 10;
  }

  if (input.usia_dan_status_bangunan === 'Tua_>10Thn') {
    rawTermite += 18;
  } else if (input.usia_dan_status_bangunan === 'Pra_Konstruksi') {
    rawTermite += 35;
  } else if (input.usia_dan_status_bangunan === 'Sedang_5-10Thn') {
    rawTermite += 8;
  }

  // --- 4. ANALISIS OBSERVASI FUMIGASI ---
  if (input.penyimpanan_komoditas_arsip === 'Silo_Pangan_Karung') {
    rawFumigasi += 65;
    keyRiskFactors.push('Penyimpanan komoditas pangan/karung skala gudang (risiko tinggi kutu gudang / Stored Product Insect)');
    produkSpesifik.push({
      kodeProduk: 'EC-FUM-01',
      namaProduk: 'Phosphine (PH3) Stack Fumigation & Gas Monitoring',
      lini: 'Fumigasi',
      prioritas: 'Utama',
      alasanObservasi: 'Terdapat penyimpanan komoditas pangan/karung (Silo/Gudang).',
      scriptPitching:
        'Untuk melindungi komoditas pangan dari kutu gudang (Sitophilus/Tribolium) hingga ke bagian dalam karung, tim Fumigasi bersertifikat EcoCare siap melakukan fumigasi Phosphine berstandar keamanan pangan.',
    });
  } else if (input.penyimpanan_komoditas_arsip === 'Kontainer_Ekspor_Impor') {
    rawFumigasi += 68;
    keyRiskFactors.push('Aktivitas kargo kontainer ekspor/impor (membutuhkan sertifikasi bebas hama karantina)');
    produkSpesifik.push({
      kodeProduk: 'EC-FUM-02',
      namaProduk: 'ISPM-15 & AQIS Standard Container Fumigation',
      lini: 'Fumigasi',
      prioritas: 'Utama',
      alasanObservasi: 'Operasional melibatkan kontainer ekspor-impor.',
      scriptPitching:
        'Kami menyediakan layanan Fumigasi Kontainer sesuai regulasi karantina internasional (ISPM-15) agar pengiriman kargo Bapak/Ibu bebas risiko penolakan (detention) di pelabuhan tujuan.',
    });
  } else if (input.penyimpanan_komoditas_arsip === 'Gudang_Arsip_Kertas') {
    rawFumigasi += 52;
    keyRiskFactors.push('Penyimpanan gudang arsip dokumen fisik (rentan kutu buku/silverfish & jamur)');
    produkSpesifik.push({
      kodeProduk: 'EC-FUM-03',
      namaProduk: 'Document & Archive Preservation Fumigation',
      lini: 'Fumigasi',
      prioritas: 'Utama',
      alasanObservasi: 'Memiliki ruang penyimpanan arsip kertas/dokumen penting.',
      scriptPitching:
        'Arsip dokumen fisik sangat rentan rusak oleh serangga pemakan kertas (silverfish/booklice). Layanan fumigasi ruang arsip kami membasmi hama sampai fase telur tanpa merusak tinta atau kertas.',
    });
  }

  if (input.tuntutan_regulasi_audit === 1) {
    rawPest += 12;
    rawFumigasi += input.penyimpanan_komoditas_arsip !== 'Tidak_Ada' ? 20 : 4;
    keyRiskFactors.push('Memiliki kewajiban kepatuhan regulasi/audit (HACCP, ISO, BPOM, atau Akreditasi)');
  }

  // Segment-specific calibration multipliers
  if (input.segmen_industri === 'Resto_F&B') {
    rawPest *= 1.22;
    rawHygiene *= 1.1;
  } else if (input.segmen_industri === 'Office_Tower' || input.segmen_industri === 'Mall_Retail') {
    rawHygiene *= 1.25;
  } else if (input.segmen_industri === 'Hotel_Hospital') {
    rawHygiene *= 1.18;
    rawPest *= 1.15;
  } else if (input.segmen_industri === 'Warehouse_Pabrik' || input.segmen_industri === 'Arsip_Instansi') {
    rawFumigasi *= 1.25;
    rawPest *= 1.1;
  }

  // Normalize service line scores to 100%
  const totalRawLini = rawHygiene + rawPest + rawTermite + rawFumigasi;
  const rawList: { lini: LiniLayanan; raw: number }[] = [
    { lini: 'Hygiene', raw: rawHygiene },
    { lini: 'Pest_Control', raw: rawPest },
    { lini: 'Termite_Control', raw: rawTermite },
    { lini: 'Fumigasi', raw: rawFumigasi },
  ];

  const distribusiSkorLini: LiniScoreItem[] = rawList
    .map((item) => ({
      lini: item.lini,
      label: LINI_LABELS[item.lini],
      skorPersen: Number((safeDivide(item.raw, totalRawLini, 0.25) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.skorPersen - a.skorPersen);

  const rekomendasiUtama = distribusiSkorLini[0];
  const kandidatKedua = distribusiSkorLini[1];
  const rekomendasiCrossSell = kandidatKedua && kandidatKedua.skorPersen >= 20.0 ? kandidatKedua : null;

  // --- 5. HITUNG LEAD SCORING (PROBABILITAS KONVERSI) ---
  let leadScore = 26;

  // Vendor pain point (faktor pendorong konversi terkuat di lapangan)
  if (input.kondisi_vendor_saat_ini === 'Ada_Komplain_Tidak_Puas') {
    leadScore += 28;
    keyRiskFactors.push('Manajemen tidak puas / ada komplain terhadap vendor eksisting (Momentum Takeover Tinggi)');
  } else if (input.kondisi_vendor_saat_ini === 'Belum_Ada_Internal') {
    leadScore += 18;
    keyRiskFactors.push('Pengelolaan masih dilakukan internal (peluang edukasi efisiensi outsourcing)');
  } else {
    leadScore -= 8;
  }

  // Urgency from observed physical issues
  const maxPainRaw = Math.max(rawHygiene, rawPest, rawTermite, rawFumigasi);
  leadScore += clamp(maxPainRaw * 0.36, 4, 34);

  // Audit requirement
  if (input.tuntutan_regulasi_audit === 1) {
    leadScore += 10;
  }

  // Traffic & Operational Hours
  if (input.traffic_harian === 'Sangat_Tinggi') leadScore += 8;
  else if (input.traffic_harian === 'Tinggi') leadScore += 6;
  else if (input.traffic_harian === 'Sedang') leadScore += 3;

  if (input.jam_operasional === '24_Jam' || input.jam_operasional === '14_Jam') {
    leadScore += 4;
  }

  // Online cleanliness rating gap
  if (rating <= 3.5) {
    leadScore += 9;
    keyRiskFactors.push(`Rating kebersihan online rendah (${rating.toFixed(1)}/5.0) — urgensi perbaikan citra publik`);
  } else if (rating <= 4.0) {
    leadScore += 4;
  }

  // Building scale bonus
  if (areaM2 >= 2500) leadScore += 5;
  else if (areaM2 >= 800) leadScore += 3;

  const probabilitasKonversi = Number(clamp(leadScore, 8.5, 98.5).toFixed(1));
  const statusLead: StatusProspek =
    probabilitasKonversi >= 70
      ? 'HOT PROSPECT'
      : probabilitasKonversi >= 45
      ? 'WARM PROSPECT'
      : 'COLD PROSPECT';

  // Ensure at least 2 specific product recommendations are always surfaced
  if (produkSpesifik.length === 0) {
    produkSpesifik.push({
      kodeProduk: 'EC-HYG-STD',
      namaProduk: 'Paket Audit & Upgrading EcoCare Smart Restroom',
      lini: 'Hygiene',
      prioritas: 'Utama',
      alasanObservasi: 'Pemeliharaan standar kebersihan preventif gedung.',
      scriptPitching:
        'Fasilitas Bapak/Ibu sudah terawat dengan baik. Kami menawarkan program trial unit EcoCare Air Freshener & Sanitizer otomatis untuk efisiensi biaya maintenance bulanan.',
    });
  }

  // Sort specific products so primary line products appear first
  const sortedProducts = [...produkSpesifik].sort((a, b) => {
    const aIsMain = a.lini === rekomendasiUtama.lini ? 0 : 1;
    const bIsMain = b.lini === rekomendasiUtama.lini ? 0 : 1;
    if (aIsMain !== bIsMain) return aIsMain - bIsMain;
    return a.prioritas === 'Utama' ? -1 : 1;
  });

  const endPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();

  return {
    probabilitasKonversi,
    statusLead,
    rekomendasiUtama,
    rekomendasiCrossSell,
    distribusiSkorLini,
    produkSpesifik: sortedProducts,
    keyRiskFactors: keyRiskFactors.slice(0, 5),
    audit: {
      runId: `EC-RUN-${Date.now().toString(36).toUpperCase()}`,
      evaluatedAtUtc: new Date().toISOString(),
      latencyMs: Math.max(1, Math.round(endPerf - startPerf)),
      engineVersion: 'v2.4-ecocare-nbo',
    },
  };
}

