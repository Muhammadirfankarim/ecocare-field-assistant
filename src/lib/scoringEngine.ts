// src/lib/scoringEngine.ts
import {
  AreaRecommendationGroup,
  DiagnosticResult,
  HygieneProductRecommendation,
  SurveyObservationInput,
} from '@/types/prospect';

export function validateSurveyInput(input: SurveyObservationInput): string[] {
  const errors: string[] = [];
  if (!input.namaGedung || input.namaGedung.trim().length < 2) {
    errors.push('Nama Gedung / Klien wajib diisi (minimal 2 karakter).');
  }
  if (
    !Number.isFinite(input.jamOperasional) ||
    input.jamOperasional < 1 ||
    input.jamOperasional > 24
  ) {
    errors.push('Jam Operasional harus berada di rentang 1 - 24 jam per hari.');
  }
  if (
    input.jumlahUrinoirKloset < 0 ||
    input.jumlahWastafel < 0 ||
    input.jumlahKubikalWanita < 0
  ) {
    errors.push('Jumlah titik tidak boleh bernilai negatif.');
  }
  return errors;
}

export function evaluateDiagnostic(input: SurveyObservationInput): DiagnosticResult {
  const area1Units: HygieneProductRecommendation[] = [];
  const area2Units: HygieneProductRecommendation[] = [];
  const area3Units: HygieneProductRecommendation[] = [];
  const area4Units: HygieneProductRecommendation[] = [];
  const summaryHighlights: string[] = [];

  // Hitung Pengaturan Timer Semprot Otomatis agar pas untuk 2 bulan (siklus servis EcoCare)
  const daysPerWeek = input.hariAktif === '5 Hari Kerja' ? 5 : 7;
  const safeHours = Math.min(24, Math.max(1, Number(input.jamOperasional) || 12));
  // Formula: (Jam Kerja * 60 menit * Hari Kerja/Minggu * 8 minggu) / 6000 semprotan
  const calculatedIntervalMinutes = Number(
    ((safeHours * 60 * daysPerWeek * 8) / 6000).toFixed(1)
  );

  // ==========================================================================
  // AREA 1: TOILET DAN KAMAR MANDI
  // Fokus: Sanitasi kloset/urinoir, pembuangan limbah sensitif, pembersih tangan,
  // dan keharuman ruangan/toilet.
  // ==========================================================================

  // 1. Sanitizer Kloset & Urinoir (EST vs EDST) - Main Products
  if (input.kondisiPipa === 'PIPA_MANUAL') {
    area1Units.push({
      id: 'A1-EST-MANUAL',
      kodeUnit: 'EST',
      namaUnit: 'Ecocare Sanitizer Manual (EST)',
      namaSpesifikAlat: 'EST – Ecocare Sanitizer (Bilas Mekanis Manual)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Pipa Bilas Luar Kloset & Urinoir (Bisa Dibor)',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 96,
      petunjukPemasangan:
        'Dipasang pada pipa bilas luar kloset/urinoir dengan injeksi katup mekanis. Otomatis bekerja saat dibilas tanpa baterai/listrik.',
      keunggulanGedung:
        'Mengendalikan bakteri, kerak urine, dan bau pesing pipa pembuangan tanpa membebani biaya listrik gedung.',
      estimasiUnit: `${input.jumlahUrinoirKloset || 1} Titik Urinoir / Kloset`,
      keteranganTipe: 'Sistem Bilas Otomatis Mekanis (Tanpa Baterai)',
    });
    summaryHighlights.push('Pipa Standar: Menggunakan EST Sanitizer manual mekanis.');
  } else {
    // PIPA_TANAM (Dilarang Bor / Sensor Autoflush / Dinding Marmer)
    area1Units.push({
      id: 'A1-EDST-DIGITAL',
      kodeUnit: 'EDST',
      namaUnit: 'Ecocare Digital Sanitizer (EDST)',
      namaSpesifikAlat: 'EDST – Ecocare Digital Sanitizer (Sistem Tetes Digital Sensor)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Kloset / Urinoir Dinding Marmer & Pipa Tanam (Tanpa Bor)',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 98,
      petunjukPemasangan:
        'Sistem tetes berkala presisi 0,1 ml per interval menggunakan 2 baterai C. Pemasangan tanpa melubangi dinding marmer.',
      catatanKhusus:
        'Peringatan Teknis: Pipa tanam / dinding marmer dilarang dibor. Wajib membawa unit EDST Digital (bukan EST manual).',
      keunggulanGedung:
        'Menjamin kloset & urinoir tetap higienis dan harum tanpa merusak instalasi pipa sensor otomatis atau estetika marmer mewah.',
      estimasiUnit: `${input.jumlahUrinoirKloset || 1} Titik Urinoir / Kloset`,
      keteranganTipe: 'Sistem Tetes Digital (Baterai)',
    });
    summaryHighlights.push('Pipa Tanam/Marmer: Unit EDST Digital wajib untuk melindungi dinding.');
  }

  // 2. Urinal Screen (Supporting Product)
  if (input.pasangUrinalScreen || input.jumlahUrinoirKloset >= 4) {
    area1Units.push({
      id: 'A1-URINAL-SCREEN',
      kodeUnit: 'Urinal Screen',
      namaUnit: 'Ecocare Urinal Screen Pengharum',
      namaSpesifikAlat: 'Urinal Screen – Penyaring Urinoir Pengharum (Anti-Splash)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Dasar Mangkuk Urinoir Pria',
      hierarchy: 'SUPPORTING_NEW',
      hierarchyLabel: 'Pengembangan & Pendukung',
      matchScore: 94,
      petunjukPemasangan:
        'Ditempatkan langsung pada saringan mangkuk urinoir pria. Mengandung bahan wangi aktif tahan 30 hari.',
      keunggulanGedung:
        'Mencegah puntung rokok/sampah menyumbat saluran urinoir dan mengurangi percikan urine (anti-splash) agar lantai tetap kering.',
      estimasiUnit: `${input.jumlahUrinoirKloset || 1} Mangkuk Urinoir`,
      keteranganTipe: 'Anti-Splash & Pengharum Aktif 30 Hari',
    });
  }

  // 3. Seat Cleaner (ESC vs Auto Seat Cleaner T900)
  if (input.khawatirBakteriKloset) {
    if (input.autoSeatCleanerTouchless) {
      area1Units.push({
        id: 'A1-AUTO-SEAT-T900',
        kodeUnit: 'Auto Seat Cleaner T900',
        namaUnit: 'Touchless Seat Cleaner (Auto T900)',
        namaSpesifikAlat: 'Auto Seat Cleaner (T900) – Touchless Seat Cleaner Sensor',
        kategori: 'Toilet & Sanitasi Utama',
        targetArea: 'AREA_1_TOILET',
        namaArea: 'Area 1: Toilet dan Kamar Mandi',
        posisiSpesifik: 'Dinding Samping Setiap Bilik Kloset Duduk',
        hierarchy: 'FLAGSHIP_PRODUCT',
        hierarchyLabel: 'Produk Unggulan (Touchless)',
        matchScore: 97,
        petunjukPemasangan:
          'Sensor inframerah mendeteksi tangan otomatis untuk mengeluarkan busa disinfektan ke atas tisu toilet.',
        keunggulanGedung:
          'Standar higienitas tertinggi tanpa sentuh tangan, membunuh 99,9% kuman pada dudukan kloset seketika.',
        estimasiUnit: `${input.jumlahKubikalWanita || Math.max(1, Math.ceil(input.jumlahUrinoirKloset / 2))} Bilik Kloset Duduk`,
        keteranganTipe: 'Sensor Otomatis Tanpa Sentuh (Touch-Free)',
      });
    } else {
      area1Units.push({
        id: 'A1-ESC-SEAT',
        kodeUnit: 'ESC',
        namaUnit: 'Ecocare Seat Cleaner (ESC)',
        namaSpesifikAlat: 'ESC – Ecocare Seat Cleaner (Pembersih Alas Duduk Kloset)',
        kategori: 'Toilet & Sanitasi Utama',
        targetArea: 'AREA_1_TOILET',
        namaArea: 'Area 1: Toilet dan Kamar Mandi',
        posisiSpesifik: 'Dinding Bilik Kloset Duduk',
        hierarchy: 'MAIN_PRODUCT',
        hierarchyLabel: 'Produk Utama',
        matchScore: 92,
        petunjukPemasangan:
          'Dipasang di dinding samping kloset duduk, mudah ditekan dengan tisu toilet sebelum dudukan digunakan.',
        keunggulanGedung:
          'Cairan pembersih cepat kering membunuh bakteri, memberi rasa aman dan nyaman bagi pengguna toilet.',
        estimasiUnit: `${input.jumlahKubikalWanita || Math.max(1, Math.ceil(input.jumlahUrinoirKloset / 2))} Bilik Kloset Duduk`,
        keteranganTipe: 'Cairan Disinfektan Cepat Kering',
      });
    }
  }

  // 4. Sanitary Bin (ESB / ESBD Digital Autolid) - Main Products
  if (input.butuhSanitaryBin) {
    area1Units.push({
      id: 'A1-ESBD-BIN',
      kodeUnit: 'ESBD',
      namaUnit: 'Ecocare Sanitary Bin Digital Autolid (ESBD)',
      namaSpesifikAlat: 'ESB / ESBD – Ecocare Sanitary Bin Digital Autolid (Sensor Otomatis)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Lantai Sudut Setiap Bilik Toilet Wanita',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 95,
      petunjukPemasangan:
        'Penempatan unit ramping di lantai bilik wanita. Tutup terbuka otomatis lewat sensor inframerah 0,5 detik.',
      keunggulanGedung:
        'Higienis tanpa sentuhan tangan, dilengkapi cairan sanitasi antibakteri penghilang bau serta mencegah kloset tersumbat pembalut.',
      estimasiUnit: `${input.jumlahKubikalWanita || 1} Bilik Toilet Wanita`,
      keteranganTipe: 'Sensor Otomatis Touchless + Antibakteri',
    });
  }

  // 5. Sabun Wastafel (ESD MS1000 / EFS SP830 / Auto Foam AK1255)
  if (input.autoDispenserTouchlessArea1) {
    area1Units.push({
      id: 'A1-AUTO-FOAM-AK1255',
      kodeUnit: 'Auto Foam AK1255',
      namaUnit: 'Touchless Foam Soap Dispenser (Auto AK1255)',
      namaSpesifikAlat: 'Auto Foam (AK1255) – Touchless Foam Soap Dispenser',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Dinding di Atas Meja Wastafel Toilet',
      hierarchy: 'FLAGSHIP_PRODUCT',
      hierarchyLabel: 'Produk Unggulan (Touchless)',
      matchScore: 97,
      petunjukPemasangan:
        'Dispenser otomatis bertenaga baterai dengan sensor tangan presisi di bawah moncong dispenser.',
      keunggulanGedung:
        'Mencegah kontaminasi kuman silang antar pengguna wastafel dengan busa lembut mewah dan higienis.',
      estimasiUnit: `${input.jumlahWastafel || 1} Titik Wastafel`,
      keteranganTipe: 'Busa Otomatis Tanpa Sentuh (Sensor)',
    });
  } else if (input.tipeWastafel === 'TRAFIK_PADAT') {
    area1Units.push({
      id: 'A1-ESD-MS1000',
      kodeUnit: 'ESD-MS1000',
      namaUnit: 'Ecocare Liquid Soap Dispenser (ESD 1.000 ml)',
      namaSpesifikAlat: 'ESD – Ecocare Liquid Soap Dispenser (MS1000 - 1.000 ml)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Dinding Area Wastafel Trafik Tinggi',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 94,
      petunjukPemasangan:
        'Dipasang kokoh di dinding wastafel dengan kunci pengaman ganda dan tabung kapasitas 1.000 ml.',
      keunggulanGedung:
        'Kapasitas besar 1.000 ml mencegah sabun cepat habis di area ramai, menghemat frekuensi isi ulang oleh petugas kebersihan.',
      estimasiUnit: `${input.jumlahWastafel || 1} Titik Wastafel`,
      keteranganTipe: 'Sabun Cair 1.000 ml (Trafik Tinggi)',
    });
  } else {
    // TRAFIK_GREEN
    area1Units.push({
      id: 'A1-EFS-SP830',
      kodeUnit: 'EFS-SP830',
      namaUnit: 'Ecocare Foam Soap Dispenser (EFS SP830)',
      namaSpesifikAlat: 'EFS – Ecocare Foam Soap Dispenser (SP830 - Sabun Busa Hemat Air)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Dinding Area Wastafel Perkantoran / Ramah Lingkungan',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 95,
      petunjukPemasangan:
        'Pompa khusus menghasilkan busa instan lembut siap pakai dengan dosis terukur 0,4 ml per tekan.',
      keunggulanGedung:
        'Menghemat penggunaan sabun dan air bilasan hingga 35%, mendukung target efisiensi operasional dan konsep Green Building.',
      estimasiUnit: `${input.jumlahWastafel || 1} Titik Wastafel`,
      keteranganTipe: 'Sabun Busa Hemat Air & Sabun 35%',
    });
    summaryHighlights.push('Wastafel Green Building: Sabun Busa EFS-SP830 menghemat air 35%.');
  }

  // 6. Hand Dryer (EHD / Mini High-Speed AK2822) - Flagship Products
  if (input.keluhanSampahTisu) {
    area1Units.push({
      id: 'A1-EHD-AK2822',
      kodeUnit: 'EHD-AK2822',
      namaUnit: 'Mini High-Speed Hand Dryer (EHD AK2822)',
      namaSpesifikAlat: 'EHD / AK2822 – Mini High-Speed Hand Dryer Otomatis',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Dinding Jalur Keluar Dekat Wastafel Toilet',
      hierarchy: 'FLAGSHIP_PRODUCT',
      hierarchyLabel: 'Produk Unggulan (Flagship)',
      matchScore: 90,
      petunjukPemasangan:
        'Pemasangan dinding dengan sambungan daya listrik 650-900W hemat energi, dilengkapi penampung tetesan air.',
      keunggulanGedung:
        'Mengeringkan tangan dalam 10-15 detik berkecepatan 82 m/s, memangkas 100% biaya pembelian tisu dan menghilangkan sampah kertas berserakan.',
      estimasiUnit: `${Math.max(1, Math.ceil((input.jumlahWastafel || 2) / 2))} Unit Area Wastafel`,
      keteranganTipe: 'Hembusan Cepat 10-15 Detik (Bebas Tisu)',
    });
  }

  // 7. Ecocare Air Freshener Blower Toilet (EAF)
  if (input.blowerToiletKipas) {
    area1Units.push({
      id: 'A1-EAF-TOILET',
      kodeUnit: 'EAF',
      namaUnit: 'Ecocare Air Freshener Toilet (EAF Blower)',
      namaSpesifikAlat: 'EAF – Ecocare Air Freshener (Penyegar Ruangan Blower/Kipas)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Dinding Atas Area Urinoir & Kloset Toilet',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 93,
      petunjukPemasangan:
        'Kipas hening bertenaga 1 baterai D dengan cartridge wangi padat, bekerja terus-menerus tanpa gas semprot.',
      keunggulanGedung:
        'Menetralkan bau di dalam toilet secara konstan dan lembut tanpa suara desis semprotan.',
      estimasiUnit: '1 - 2 Unit per Ruang Toilet',
      keteranganTipe: 'Blower Kipas Hening (Bebas Aerosol)',
    });
  }

  // 8. Hand Sanitizer Toilet (EHS / AK1205)
  if (input.handSanitizerToilet) {
    area1Units.push({
      id: 'A1-EHS-TOILET',
      kodeUnit: 'EHS',
      namaUnit: 'Ecocare Hand Sanitizer Toilet (EHS)',
      namaSpesifikAlat: 'EHS / AK1205 – Ecocare Hand Sanitizer Gel Antiseptik',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_1_TOILET',
      namaArea: 'Area 1: Toilet dan Kamar Mandi',
      posisiSpesifik: 'Dinding Samping Pintu Keluar Toilet',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 91,
      petunjukPemasangan:
        'Dipasang di dekat pintu keluar toilet untuk perlindungan higienis ekstra setelah mencuci tangan.',
      keunggulanGedung:
        'Gel antiseptik berstandar medis dengan pelembab kulit, membunuh kuman tanpa rasa lengket di tangan.',
      estimasiUnit: '1 Unit per Akses Pintu Keluar Toilet',
      keteranganTipe: 'Gel Antiseptik Cepat Kering',
    });
  }

  // ==========================================================================
  // AREA 2: PINTU MASUK DAN LOBI UTAMA
  // Fokus: Penampilan visual/prestise, pencegahan kotoran masuk ke dalam gedung,
  // serta aroma eksklusif cakupan luas.
  // ==========================================================================

  // 1. Ecocare Doormats (EDM) - Secondary Products
  if (input.pintuMasukLicinDebu) {
    area2Units.push({
      id: 'A2-EDM-MAT',
      kodeUnit: 'EDM',
      namaUnit: 'Ecocare Doormats (Keset Pelindung Lantai Anti-Slip)',
      namaSpesifikAlat: 'EDM – Ecocare Doormats (Keset Nilon & Karet Nitril Anti-Slip)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_2_LOBBY',
      namaArea: 'Area 2: Pintu Masuk dan Lobi Utama',
      posisiSpesifik: 'Ambang Pintu Masuk Utama Gedung & Akses Lobi (Main Entrance)',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 93,
      petunjukPemasangan:
        'Ditempatkan di area transisi pintu masuk. Layanan profesional sewa keset dengan penggantian & pencucian rutin oleh EcoCare.',
      keunggulanGedung:
        'Menyerap air dan kotoran debu sepatu hingga 70%, menjaga lobi tetap bersih dan mencegah risiko tamu terpeleset saat hujan.',
      estimasiUnit: '2 - 4 Lembar Pintu Masuk Lobi Utama',
      keteranganTipe: 'Layanan Rutin Ganti & Cuci Bersih',
    });
  }

  // 2. Hand Sanitizer Lobi (EHS / Auto Dispenser SP811/SP812) - Flagship Products
  if (input.handSanitizerLobi) {
    area2Units.push({
      id: 'A2-EHS-LOBBY',
      kodeUnit: 'Auto Dispenser SP811',
      namaUnit: 'Touchless Hand Sanitizer Lobi (Auto SP811)',
      namaSpesifikAlat: 'Auto Dispenser (SP811/SP812) – Touchless Soap & Hand Sanitizer Dispenser',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_2_LOBBY',
      namaArea: 'Area 2: Pintu Masuk dan Lobi Utama',
      posisiSpesifik: 'Standing Pole / Meja Resepsionis Lobi Utama',
      hierarchy: 'FLAGSHIP_PRODUCT',
      hierarchyLabel: 'Produk Unggulan (Touchless)',
      matchScore: 94,
      petunjukPemasangan:
        'Ditempatkan pada standing pole elegan atau dinding depan lift lobi utama. Sensor otomatis tanpa sentuhan tangan.',
      keunggulanGedung:
        'Menciptakan citra gedung modern peduli kesehatan bagi setiap tamu dan eksekutif yang memasuki gedung.',
      estimasiUnit: '1 - 2 Unit Standing Lobi Utama',
      keteranganTipe: 'Touchless Automatic Sensor',
    });
  }

  // 3. Large Area Scent Diffuser (SC-005 B5000 / SC-006 D300) - New Development Products
  if (input.kondisiLobi === 'HVAC_LUAS') {
    area2Units.push({
      id: 'A2-SCENT-B5000',
      kodeUnit: 'SC-005 (B5000)',
      namaUnit: 'Ecocare Large Area Scent Diffuser (SC-005 B5000)',
      namaSpesifikAlat: 'SC-005 (B5000) – Large Area Scent Diffuser (Koneksi AC Sentral HVAC)',
      kategori: 'Pengharum Premium (Smart Scenting)',
      targetArea: 'AREA_2_LOBBY',
      namaArea: 'Area 2: Pintu Masuk dan Lobi Utama',
      posisiSpesifik: 'Ruang Mesin AHU / Saluran Utama Pendingin AC Sentral Lobi',
      hierarchy: 'SUPPORTING_NEW',
      hierarchyLabel: 'Pengembangan & Pendukung',
      matchScore: 97,
      petunjukPemasangan:
        'Pipa injeksi mikro dihubungkan ke saluran ducting AC Sentral AHU gedung. Dilengkapi timer digital & kontrol konsentrasi uap.',
      keunggulanGedung:
        'Teknologi Cold Air Diffusion menyebarkan aroma mewah bintang lima ke seluruh atrium/lobi luas tanpa membuat lantai licin.',
      estimasiUnit: '1 Sistem Terkoneksi Saluran AC Lobi',
      keteranganTipe: 'Cold Air Diffusion (Koneksi HVAC)',
    });
    summaryHighlights.push('Lobi Utama HVAC: SC-005 (B5000) terintegrasi AC Sentral.');
  } else if (input.kondisiLobi === 'STANDALONE_300') {
    area2Units.push({
      id: 'A2-SCENT-D300',
      kodeUnit: 'SC-006 (D300)',
      namaUnit: 'Ecocare Scent Diffuser Stand Alone (SC-006 D300)',
      namaSpesifikAlat: 'SC-006 (D300) – Scent Diffuser Stand Alone (Kapasitas s/d 300 m³)',
      kategori: 'Pengharum Premium (Smart Scenting)',
      targetArea: 'AREA_2_LOBBY',
      namaArea: 'Area 2: Pintu Masuk dan Lobi Utama',
      posisiSpesifik: 'Meja Resepsionis / Sudut Strategis Lobi Utama',
      hierarchy: 'SUPPORTING_NEW',
      hierarchyLabel: 'Pengembangan & Pendukung',
      matchScore: 92,
      petunjukPemasangan:
        'Unit berdiri mandiri dengan desain modern compact. Pengaturan timer digital otomatis via panel tombol.',
      keunggulanGedung:
        'Menghadirkan aroma eksklusif di lobi dan area resepsionis secara instan tanpa perlu instalasi kabel atau membongkar plafon.',
      estimasiUnit: '1 - 2 Unit Area Resepsionis Lobi',
      keteranganTipe: 'Unit Berdiri Mandiri (Stand Alone)',
    });
  }

  // ==========================================================================
  // AREA 3: KORIDOR, LIFT, DAN RUANG RAPAT
  // Fokus: Sirkulasi udara stabil, operasional hening, bebas kuman,
  // dan kesegaran ruang kerja.
  // ==========================================================================

  // 1. Ecocare Air Freshener Blower Lift (EAF) - Main Products
  if (input.ruangSempitLift) {
    area3Units.push({
      id: 'A3-EAF-LIFT',
      kodeUnit: 'EAF',
      namaUnit: 'Ecocare Air Freshener Blower (EAF)',
      namaSpesifikAlat: 'EAF – Ecocare Air Freshener (Penyegar Ruangan Blower/Kipas)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_3_CORRIDOR',
      namaArea: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      posisiSpesifik: 'Dinding Atas Sangkar Lift & Ruang Tertutup 3x3x3m',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 91,
      petunjukPemasangan:
        'Kipas hening bertenaga baterai dengan sensor cahaya Day/24 Jam, tidak memerlukan colokan listrik.',
      keunggulanGedung:
        'Memberikan keharuman lembut stabil di ruang sempit tertutup tanpa suara desis semprotan kaleng yang mengagetkan pengguna lift.',
      estimasiUnit: '1 Unit per Sangkar Lift / Ruang Tertutup',
      keteranganTipe: 'Blower Hening (Bebas Gas Aerosol)',
    });
  }

  // 2. Ecocare LCD Automatic Spray Koridor (LCD) - Secondary Products
  if (input.koridorPublikTerbuka) {
    area3Units.push({
      id: 'A3-LCD-SPRAY',
      kodeUnit: 'LCD Sprayer',
      namaUnit: 'Ecocare LCD Automatic Spray (LCD)',
      namaSpesifikAlat: 'LCD – Ecocare LCD Automatic Spray (Penyegar Ruangan Aerosol Berkala)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_3_CORRIDOR',
      namaArea: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      posisiSpesifik: 'Dinding Koridor Terbuka (Jarak Tiap 8 - 10 Meter)',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 94,
      petunjukPemasangan: `Pengaturan program timer semprot otomatis disetel setiap ${calculatedIntervalMinutes} menit agar pas digunakan selama siklus servis 2 bulan (6.000 spray).`,
      keunggulanGedung:
        'Koridor selalu wangi segar merata sepanjang jam kerja gedung secara otomatis, takaran semprot terukur sehingga hemat biaya.',
      estimasiUnit: '1 Unit per jarak 8-10 meter koridor',
      keteranganTipe: `Semprot Tiap ${calculatedIntervalMinutes} Menit`,
      intervalSprayDetail: `Otomatis semprot tiap ${calculatedIntervalMinutes} menit (sesuai jam operasional ${input.jamOperasional} jam/hari).`,
    });
  }

  // 3. Ecocare Waterbase Freshener (EWB) - Secondary Products
  if (input.areaSensitifKlinik) {
    area3Units.push({
      id: 'A3-EWB-WATERBASE',
      kodeUnit: 'EWB',
      namaUnit: 'Ecocare Waterbase Freshener (EWB)',
      namaSpesifikAlat: 'EWB – Ecocare Waterbase Freshener (Penyegar Non-Aerosol Bebas Alkohol)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_3_CORRIDOR',
      namaArea: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      posisiSpesifik: 'Ruang Periksa / Rawat Klinik / Ruang Bayi & Anak',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 96,
      petunjukPemasangan:
        'Formula 100% berbahan dasar air murni tanpa alkohol dan tanpa gas propelan pemicu iritasi pernapasan.',
      keunggulanGedung:
        'Sangat aman untuk lingkungan klinik kesehatan, ruang tunggu pasien anak, atau ruangan eksekutif yang sensitif bau menyengat.',
      estimasiUnit: '1 Unit per Ruang Periksa / Rawat Medis',
      keteranganTipe: '100% Berbahan Dasar Air (Bebas Alkohol)',
    });
    summaryHighlights.push('Fasilitas Medis/Sensitif: Menggunakan EWB Waterbase aman pernapasan.');
  }

  // 4. Mini Scent Diffuser Ruang Rapat (SC-008 A80) - New Development Products
  if (input.ruangRapatVip) {
    area3Units.push({
      id: 'A3-SCENT-A80',
      kodeUnit: 'SC-008 (A80)',
      namaUnit: 'Ecocare Mini Scent Diffuser (SC-008 A80)',
      namaSpesifikAlat: 'SC-008 (A80) – Mini Scent Diffuser (Ultra-Silent Nano Mist <30 dB)',
      kategori: 'Pengharum Premium (Smart Scenting)',
      targetArea: 'AREA_3_CORRIDOR',
      namaArea: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      posisiSpesifik: 'Di Atas Meja Credenza Ruang Rapat Direksi & VIP Lounge',
      hierarchy: 'SUPPORTING_NEW',
      hierarchyLabel: 'Pengembangan & Pendukung',
      matchScore: 94,
      petunjukPemasangan:
        'Diletakkan di atas meja kabinet/credenza. Menggunakan uap nano partikel dingin dengan tingkat kebisingan ultra-senyap (<30 dB).',
      keunggulanGedung:
        'Menciptakan suasana pertemuan penting yang prestisius, tenang, dan elegan tanpa suara semprotan yang mengganggu jalannya diskusi direksi.',
      estimasiUnit: '1 Unit Ruang Rapat Direksi / VIP Lounge',
      keteranganTipe: 'Operasional Ultra-Hening (<30 dB)',
    });
  }

  // 5. Ecocare Microburst (EMB) - Secondary Products
  if (input.essentialOilMeeting) {
    area3Units.push({
      id: 'A3-EMB-BURST',
      kodeUnit: 'EMB',
      namaUnit: 'Ecocare Microburst (EMB Essential Oil)',
      namaSpesifikAlat: 'EMB – Ecocare Microburst (Penyegar Ruangan Essential Oil Premium)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_3_CORRIDOR',
      namaArea: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      posisiSpesifik: 'Dinding Ruang Pertemuan Eksekutif / Koridor VIP',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 92,
      petunjukPemasangan:
        'Unit dispenser semprot mikro dengan formula minyak esensial konsentrat tinggi yang bertahan lama di udara.',
      keunggulanGedung:
        'Memberikan sensasi aromaterapi mewah yang menenangkan pikiran dan meningkatkan fokus kerja tim.',
      estimasiUnit: '1 Unit per Ruang Meeting Eksekutif',
      keteranganTipe: 'Aromaterapi Essential Oil Premium',
    });
  }

  // 6. Hand Sanitizer Koridor (EHS / AK1205) - Secondary Products
  if (input.handSanitizerKoridor) {
    area3Units.push({
      id: 'A3-EHS-CORRIDOR',
      kodeUnit: 'EHS-AK1205',
      namaUnit: 'Ecocare Hand Sanitizer Koridor (AK1205)',
      namaSpesifikAlat: 'EHS / AK1205 – Touchless Hand Sanitizer Dinding Koridor',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_3_CORRIDOR',
      namaArea: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      posisiSpesifik: 'Dinding Depan Pintu Ruang Rapat & Akses Koridor',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 91,
      petunjukPemasangan:
        'Pemasangan dinding di titik lalu lintas koridor atau samping pintu meeting room.',
      keunggulanGedung:
        'Memudahkan peserta rapat mensterilkan tangan sebelum masuk ruangan, mencegah penyebaran virus antar karyawan.',
      estimasiUnit: '1 Unit per Pintu Ruang Rapat',
      keteranganTipe: 'Sanitasi Dinding Koridor',
    });
  }

  // 7. Doormats Akses Rapat (EDM)
  if (input.kesetAksesMeeting) {
    area3Units.push({
      id: 'A3-EDM-MEETING',
      kodeUnit: 'EDM',
      namaUnit: 'Ecocare Doormats Akses Rapat (EDM)',
      namaSpesifikAlat: 'EDM – Ecocare Doormats (Keset Pelindung Lantai Karpet)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_3_CORRIDOR',
      namaArea: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      posisiSpesifik: 'Pintu Masuk Ruang Rapat & Depan Pintu Lift',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 90,
      petunjukPemasangan:
        'Diletakkan di depan pintu masuk ruang rapat untuk menyaring sisa debu dari koridor.',
      keunggulanGedung:
        'Menjaga karpet ruang rapat tetap bersih dan tidak cepat kotor atau kusam akibat debu sepatu.',
      estimasiUnit: '1 Lembar per Pintu Ruang Rapat',
      keteranganTipe: 'Keset Proteksi Karpet',
    });
  }

  // ==========================================================================
  // AREA 4: DAPUR, KANTIN, DAN PANTRY
  // Fokus: Higienitas olahan makanan, penyerapan minyak/lemak,
  // dan pengendalian serangga terbang.
  // ==========================================================================

  // 1. Ecoflies (EFL) - Secondary Products
  if (input.masalahLalatKantin) {
    area4Units.push({
      id: 'A4-EFL-LALAT',
      kodeUnit: 'EFL',
      namaUnit: 'Ecoflies Pengusir Lalat Alami (EFL)',
      namaSpesifikAlat: 'EFL – Ecoflies (Pengendali / Pengusir Serangga Terbang Aman Pangan)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_4_PANTRY',
      namaArea: 'Area 4: Dapur, Kantin, dan Pantry',
      posisiSpesifik: 'Dinding Dekat Pintu Masuk Dapur & Area Saji Makanan Kantin',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 95,
      petunjukPemasangan:
        'Dipasang di dinding setinggi 2 meter dekat jalur keluar masuk dapur atau area penyajian makanan.',
      keunggulanGedung:
        'Mengusir lalat dengan ekstrak bahan alami yang tidak beracun dan aman bagi makanan, menjaga higienitas kantin tetap prima.',
      estimasiUnit: '1 - 2 Unit Dekat Pintu Kantin / Dapur',
      keteranganTipe: 'Pengusir Lalat Ramah Pangan',
    });
  }

  // 2. Sabun Pantry Ekonomis (ESD Fave 701W) - Main Products
  if (input.sabunPantryEkonomis) {
    area4Units.push({
      id: 'A4-ESD-PANTRY',
      kodeUnit: 'Fave 701W',
      namaUnit: 'Dispenser Sabun Pantry Kompak (Fave 701W - 500 ml)',
      namaSpesifikAlat: 'ESD – Ecocare Liquid Soap Dispenser (Fave 701W - 500 ml Kompak)',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_4_PANTRY',
      namaArea: 'Area 4: Dapur, Kantin, dan Pantry',
      posisiSpesifik: 'Dinding Dekat Wastafel Dapur & Pantry Staf',
      hierarchy: 'MAIN_PRODUCT',
      hierarchyLabel: 'Produk Utama',
      matchScore: 88,
      petunjukPemasangan:
        'Ukuran ramping 500 ml yang rapi dipasang di dinding dekat tempat cuci piring/wastafel dapur staf.',
      keunggulanGedung:
        'Kompak dan praktis untuk kebutuhan cuci tangan staf serta perlengkapan makan di area pantry.',
      estimasiUnit: '1 - 2 Unit Area Pantry Staf',
      keteranganTipe: 'Ukuran Ringkas 500 ml',
    });
  }

  // 3. Doormats Khusus Minyak & Lemak Dapur (EDM)
  if (input.kesetMinyakDapur) {
    area4Units.push({
      id: 'A4-EDM-KITCHEN',
      kodeUnit: 'EDM-Kitchen',
      namaUnit: 'Ecocare Doormats Dapur (Khusus Minyak & Lemak)',
      namaSpesifikAlat: 'EDM – Ecocare Doormats (Keset Khusus Penyerapan Minyak, Lemak & Air)',
      kategori: 'Pengharum & Kebersihan Lantai',
      targetArea: 'AREA_4_PANTRY',
      namaArea: 'Area 4: Dapur, Kantin, dan Pantry',
      posisiSpesifik: 'Akses Pintu Keluar/Masuk Dapur & Area Basah Kantin',
      hierarchy: 'SECONDARY_PRODUCT',
      hierarchyLabel: 'Produk Sekunder',
      matchScore: 93,
      petunjukPemasangan:
        'Keset karet nitril berdaya cengkeram tinggi untuk area basah dan berminyak, diganti dan dicuci rutin oleh EcoCare.',
      keunggulanGedung:
        'Mengunci tetesan minyak dan air agar tidak terbawa licin ke area makan atau koridor, melindungi keselamatan staf.',
      estimasiUnit: '1 - 2 Lembar Akses Dapur',
      keteranganTipe: 'Anti-Slip Serap Minyak & Lemak',
    });
  }

  // 4. Hand Sanitizer / Auto Foam Dapur (AK1255 / EHS)
  if (input.handSanitizerKantinDapur) {
    area4Units.push({
      id: 'A4-AUTO-FOAM-KITCHEN',
      kodeUnit: 'Auto Foam AK1255',
      namaUnit: 'Touchless Soap & Sanitizer Dapur (Auto AK1255)',
      namaSpesifikAlat: 'Auto Foam (AK1255) – Touchless Foam Soap & Sanitizer Dispenser',
      kategori: 'Toilet & Sanitasi Utama',
      targetArea: 'AREA_4_PANTRY',
      namaArea: 'Area 4: Dapur, Kantin, dan Pantry',
      posisiSpesifik: 'Dinding Jalur Olah Makanan Sebelum Penyajian',
      hierarchy: 'FLAGSHIP_PRODUCT',
      hierarchyLabel: 'Produk Unggulan (Touchless)',
      matchScore: 94,
      petunjukPemasangan:
        'Dispenser otomatis tanpa sentuh dipasang di dekat meja persiapan bahan makanan.',
      keunggulanGedung:
        'Menjamin standar kebersihan juru masak sebelum menyentuh makanan tanpa menyentuh dispenser.',
      estimasiUnit: '1 Unit Area Persiapan Makanan',
      keteranganTipe: 'Higienitas Touchless Olah Makanan',
    });
  }

  // ==========================================================================
  // KELOMPOKKAN REKOMENDASI KE DALAM 4 AREA GEDUNG
  // ==========================================================================
  const areaGroups: AreaRecommendationGroup[] = [
    {
      areaId: 'AREA_1_TOILET',
      areaNumber: 1,
      areaTitle: 'Area 1: Toilet dan Kamar Mandi',
      areaFokus:
        'Sanitasi kloset/urinoir, pembuangan limbah sensitif wanita, cuci tangan wastafel, dan kesegaran udara toilet.',
      units: area1Units,
    },
    {
      areaId: 'AREA_2_LOBBY',
      areaNumber: 2,
      areaTitle: 'Area 2: Pintu Masuk dan Lobi Utama',
      areaFokus:
        'Penampilan visual & prestise gedung, pencegahan kotoran masuk lewat alas kaki, dan aroma mewah cakupan luas.',
      units: area2Units,
    },
    {
      areaId: 'AREA_3_CORRIDOR',
      areaNumber: 3,
      areaTitle: 'Area 3: Koridor, Lift, dan Ruang Rapat',
      areaFokus:
        'Sirkulasi udara stabil, tingkat kebisingan rendah (silent operation), bebas kuman, dan kesegaran ruang kerja.',
      units: area3Units,
    },
    {
      areaId: 'AREA_4_PANTRY',
      areaNumber: 4,
      areaTitle: 'Area 4: Dapur, Kantin, dan Pantry',
      areaFokus:
        'Higienitas olahan makanan, penyerapan minyak & lemak lantai dapur, serta pengendalian serangga terbang ramah pangan.',
      units: area4Units,
    },
  ];

  const totalUnitRekomendasi =
    area1Units.length + area2Units.length + area3Units.length + area4Units.length;

  // Backward compatibility: map ke 3 kategori lama
  const allUnits = [...area1Units, ...area2Units, ...area3Units, ...area4Units];
  const kategori1_Restroom = allUnits.filter(
    (u) => u.kategori === 'Toilet & Sanitasi Utama'
  );
  const kategori2_Secondary = allUnits.filter(
    (u) =>
      u.kategori === 'Pengharum & Kebersihan Lantai' &&
      !u.namaSpesifikAlat.includes('Scent Diffuser')
  );
  const kategori3_SmartScenting = allUnits.filter(
    (u) =>
      u.kategori === 'Pengharum Premium (Smart Scenting)' ||
      u.namaSpesifikAlat.includes('Scent Diffuser')
  );

  return {
    runId: `HYCARE-SOP-${Date.now().toString(36).toUpperCase()}`,
    evaluatedAtUtc: new Date().toISOString(),
    namaGedung: input.namaGedung,
    surveyType: input.surveyType,
    segmen: input.segmen,
    totalUnitRekomendasi,
    areaGroups,
    kategori1_Restroom,
    kategori2_Secondary,
    kategori3_SmartScenting,
    sprayerIntervalMinutes: input.koridorPublikTerbuka ? calculatedIntervalMinutes : null,
    summaryHighlights,
    engineType: 'RULE_BASED',
  };
}
