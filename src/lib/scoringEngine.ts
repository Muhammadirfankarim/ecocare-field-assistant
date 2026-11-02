// src/lib/scoringEngine.ts
import {
  DiagnosticResult,
  HygieneProductRecommendation,
  SurveyObservationInput,
} from '@/types/prospect';

export function validateSurveyInput(input: SurveyObservationInput): string[] {
  const errors: string[] = [];
  if (!input.namaGedung || input.namaGedung.trim().length < 2) {
    errors.push('Nama Gedung / Klien wajib diisi (minimal 2 karakter).');
  }
  if (!Number.isFinite(input.jamOperasional) || input.jamOperasional < 1 || input.jamOperasional > 24) {
    errors.push('Jam Operasional harus berada di rentang 1 - 24 jam per hari.');
  }
  if (input.jumlahUrinoirKloset < 0 || input.jumlahWastafel < 0 || input.jumlahKubikalWanita < 0) {
    errors.push('Jumlah titik tidak boleh bernilai negatif.');
  }
  return errors;
}

export function evaluateDiagnostic(input: SurveyObservationInput): DiagnosticResult {
  const kat1_Restroom: HygieneProductRecommendation[] = [];
  const kat2_Secondary: HygieneProductRecommendation[] = [];
  const kat3_SmartScenting: HygieneProductRecommendation[] = [];
  const summaryHighlights: string[] = [];

  // Hitung Dynamic Interval untuk LCD Sprayer
  const daysPerWeek = input.hariAktif === '5 Hari Kerja' ? 5 : 7;
  const safeHours = Math.min(24, Math.max(1, Number(input.jamOperasional) || 12));
  // Formula: (Jam Operasional * 60 * Hari Kerja Seminggu * 8 minggu) / 6000 spray
  const calculatedIntervalMinutes = Number(
    ((safeHours * 60 * daysPerWeek * 8) / 6000).toFixed(1)
  );

  // -------------------------------------------------------------
  // KELOMPOK 1: MAIN RESTROOM PRODUCTS
  // -------------------------------------------------------------

  // 1. Sanitizer Urinoir & Kloset (EST vs EDST)
  if (input.kondisiPipa === 'PIPA_MANUAL') {
    kat1_Restroom.push({
      id: 'EST-MANUAL',
      kodeUnit: 'EST',
      namaUnit: 'Ecocare Sanitizer (EST - Pipa Manual)',
      kategori: 'Main Restroom',
      matchScore: 96,
      alasanTeknis:
        'Katup vakum mekanis 1.300x siram, pipa bisa dibor & ada tekanan air normal. Pemasangan mandiri tanpa baterai atau sambungan listrik.',
      nilaiBisnis:
        'Mencegah timbulnya kerak asam urat dan bau pesing toilet 24/7 secara otomatis, memangkas biaya pembersihan kerak pipa plumbing.',
      estimasiUnit: `${input.jumlahUrinoirKloset || 1} Titik Urinoir/Kloset`,
      badgeTeknis: 'Mekanis 1.300 Siram (Non-Baterai)',
    });
    summaryHighlights.push('Instalasi EST Manual direkomendasikan karena pipa bisa dibor dan memiliki tekanan air.');
  } else {
    // PIPA_TANAM / Sensor / Marmer
    kat1_Restroom.push({
      id: 'EDST-DIGITAL',
      kodeUnit: 'EDST',
      namaUnit: 'Ecocare Digital Sanitizer (EDST)',
      kategori: 'Main Restroom',
      matchScore: 98,
      alasanTeknis:
        'Sistem tetes mikro digital otomatis 2 baterai C Biru. Dosis 0,1 ml per 16,8 menit langsung ke leher kloset/urinoir.',
      warningTeknis:
        '⚠️ PERINGATAN TEKNISI: Pipa tanam / sensor autoflush / marmer DILARANG DIBOR! JANGAN bawa unit EST manual, WAJIB bawa unit EDST + 2 Baterai C Biru!',
      nilaiBisnis:
        'Solusi higienitas modern tanpa merusak marmer atau dinding mewah klien, menjaga reputasi toilet VIP tetap higienis dan harum.',
      estimasiUnit: `${input.jumlahUrinoirKloset || 1} Titik Urinoir/Kloset`,
      badgeTeknis: 'Digital Drip (Wajib 2x Baterai C)',
    });
    summaryHighlights.push('Pipa tanam/sensor terdeteksi: Wajib EDST Digital untuk menjaga marmer/dinding.');
  }

  // 2. Sabun Wastafel (ESD Liquid vs EFS Foam)
  if (input.tipeWastafel === 'TRAFIK_PADAT') {
    kat1_Restroom.push({
      id: 'ESD-LIQUID',
      kodeUnit: 'ESD-MS1000',
      namaUnit: 'EcoCare Liquid Soap Dispenser (MS1000)',
      kategori: 'Main Restroom',
      matchScore: 94,
      alasanTeknis:
        'Kapasitas tangki 1.000 ml standar servis bulanan EcoCare. Dilengkapi kunci pengaman ganda dan katup silikon anti bocor.',
      nilaiBisnis:
        'Kapasitas 1.000 ml standar mencegah pembengkakan biaya servis cabang/service cost saat menghadapi trafik padat >1.000 org/hari.',
      estimasiUnit: `${input.jumlahWastafel || 1} Titik Wastafel`,
      badgeTeknis: 'Sabun Cair 1.000 ml (Heavy Duty)',
    });
  } else {
    // TRAFIK_GREEN
    kat1_Restroom.push({
      id: 'EFS-FOAM',
      kodeUnit: 'EFS-SP830',
      namaUnit: 'EcoCare Foam Soap Dispenser (SP830)',
      kategori: 'Main Restroom',
      matchScore: 95,
      alasanTeknis:
        'Dispenser busa khusus dengan cartridge tersegel anti-kontaminasi silang. Dosis mikro 0,4 ml menghasilkan busa instan padat.',
      nilaiBisnis:
        'Busa lembut instan menghemat konsumsi sabun & air bilas hingga 35%, mendukung sertifikasi green building dan efisiensi air klien.',
      estimasiUnit: `${input.jumlahWastafel || 1} Titik Wastafel`,
      badgeTeknis: 'Eco Foam (Hemat Sabun & Air 35%)',
    });
    summaryHighlights.push('Wastafel hemat air: EFS Foam Soap terpilih untuk efisiensi green concept.');
  }

  // 3. Khawatir Bakteri Dudukan Kloset -> ESC (Seat Cleaner)
  if (input.khawatirBakteriKloset) {
    kat1_Restroom.push({
      id: 'ESC-SEAT',
      kodeUnit: 'ESC',
      namaUnit: 'EcoCare Toilet Seat Cleaner (ESC)',
      kategori: 'Main Restroom',
      matchScore: 92,
      alasanTeknis:
        'Dispenser manual cairan disinfektan cepat kering + stiker panduan pemakaian dengan tisu toilet. Pasang di samping kloset duduk setinggi 100 cm.',
      nilaiBisnis:
        'Disinfektan alkohol cepat kering memberikan rasa aman 100% bebas bakteri silang bagi pengguna toilet wanita, direksi, dan tamu VIP.',
      estimasiUnit: `${input.jumlahKubikalWanita || Math.max(1, Math.ceil(input.jumlahUrinoirKloset / 2))} Kubikal Kloset Duduk`,
      badgeTeknis: 'Disinfektan Dudukan Kloset',
    });
  }

  // 4. Kebutuhan Sanitary Bin Toilet Wanita -> ESBD (Digital Autolid Sanitary Bin)
  if (input.butuhSanitaryBin) {
    kat1_Restroom.push({
      id: 'ESBD-BIN',
      kodeUnit: 'ESBD',
      namaUnit: 'Digital Autolid Sanitary Bin (ESBD)',
      kategori: 'Main Restroom',
      matchScore: 95,
      alasanTeknis:
        'Sensor inframerah touchless membuka tutup dalam 0,5 detik. Menggunakan 4 baterai AA + pouch Sanitary Fluid antibakteri pengikat bau.',
      nilaiBisnis:
        'Mencegah pipa kloset tersumbat akibat pembalut, memberikan fasilitas sanitasi wanita yang privat, higienis tanpa sentuhan tangan.',
      estimasiUnit: `${input.jumlahKubikalWanita || 1} Kubikal Toilet Wanita`,
      badgeTeknis: 'Touchless Sensor + Sanitary Fluid',
    });
  }

  // 5. Keluhan Sampah Kertas Tisu -> EHD (Hand Dryer AK2822)
  if (input.keluhanSampahTisu) {
    kat1_Restroom.push({
      id: 'EHD-DRYER',
      kodeUnit: 'EHD',
      namaUnit: 'EcoCare Jet Hand Dryer (AK2822)',
      kategori: 'Main Restroom',
      matchScore: 90,
      alasanTeknis:
        'Daya hemat 1.800W dengan sensor optik ganda, hembusan dual-jet 82 m/s. Pastikan ketersediaan titik colokan listrik 220V dekat wastafel.',
      nilaiBisnis:
        'Mengeringkan tangan dalam 10-15 detik, memangkas biaya pembelian kertas tisu dan meniadakan sampah tisu berserakan di wastafel selamanya.',
      estimasiUnit: `${Math.max(1, Math.ceil((input.jumlahWastafel || 2) / 2))} Unit Area Wastafel`,
      badgeTeknis: 'Dual-Jet 82 m/s (Zero Waste Tisu)',
    });
  }

  // 6. Sabun Pantry Ekonomis -> ESD Sabun Cair / Fave 701W (500 ml)
  if (input.sabunPantryEkonomis) {
    kat1_Restroom.push({
      id: 'ESD-PANTRY',
      kodeUnit: 'Fave 701W',
      namaUnit: 'EcoCare Pantry Soap Dispenser (500 ml)',
      kategori: 'Main Restroom',
      matchScore: 88,
      alasanTeknis:
        'Unit dispenser kompak 500 ml fleksibel untuk area pantry/dapur staf. Pemasangan dengan baut fisher atau perekat industri pada dinding keramik.',
      nilaiBisnis:
        'Kompak & ekonomis untuk area pantry menjaga higienitas cuci tangan dan peralatan makan karyawan dengan biaya servis ringan.',
      estimasiUnit: '1 - 2 Unit Pantry',
      badgeTeknis: 'Kompak 500 ml (Pantry & Kantin)',
    });
  }

  // -------------------------------------------------------------
  // KELOMPOK 2: SECONDARY PRODUCTS
  // -------------------------------------------------------------

  // 1. Pintu Masuk Licin/Berdebu -> EDM (Ecocare Doormats / Keset)
  if (input.pintuMasukLicinDebu) {
    kat2_Secondary.push({
      id: 'EDM-MAT',
      kodeUnit: 'EDM',
      namaUnit: 'Ecocare Dust & Moisture Control Mat (EDM)',
      kategori: 'Secondary Products',
      matchScore: 93,
      alasanTeknis:
        'Sistem rental keset bersih berkala EcoCare. Serat nilon tebal berpadu karet nitril anti-slip, tahan hingga 400x pencucian industri.',
      nilaiBisnis:
        'Menahan hingga 70% debu dan air hujan dari sepatu pengunjung, melindungi lantai lobi tetap kinclong dan mencegah insiden terpeleset.',
      estimasiUnit: '2 - 4 Lembar Area Pintu Masuk & Lobi',
      badgeTeknis: 'Rental Mat (Ganti Bersih Berkala)',
    });
  }

  // 2. Ruang Sempit / Lift Tanpa Stopkontak -> EAF (Air Freshener Fan/Blower)
  if (input.ruangSempitLift) {
    kat2_Secondary.push({
      id: 'EAF-FAN',
      kodeUnit: 'EAF',
      namaUnit: 'EcoCare Air Freshener Fan (EAF Blower)',
      kategori: 'Secondary Products',
      matchScore: 91,
      alasanTeknis:
        'Blower hening bertenaga 1 baterai D + pad wangi padat, sensor cahaya otomatis (Day/24 Jam). Bebas tabung aerosol atau propelan gas bertekanan.',
      nilaiBisnis:
        'Wangi segar hening kontinyu tanpa suara desis semprotan kaleng yang mengagetkan di dalam lift atau ruang tertutup 3x3x3m.',
      estimasiUnit: '1 Unit per Lift / Ruang Tertutup',
      badgeTeknis: 'Blower Non-Aerosol (1x Baterai D)',
    });
  }

  // 3. Koridor Publik Terbuka -> LCD Sprayer
  if (input.koridorPublikTerbuka) {
    kat2_Secondary.push({
      id: 'LCD-SPRAY',
      kodeUnit: 'LCD Sprayer',
      namaUnit: 'EcoCare Digital LCD Sprayer (6.000 Spray)',
      kategori: 'Secondary Products',
      matchScore: 94,
      alasanTeknis: `LCD digital programmable sprayer. Rekomendasi teknisi: set interval ke ${calculatedIntervalMinutes} menit untuk sinkron dengan siklus servis 8 minggu (6.000 spray).`,
      nilaiBisnis:
        'Aroma segar konsisten sepanjang jam kerja, timer digital presisi mencegah pemborosan kaleng pengharum sebelum jadwal servis tiba.',
      estimasiUnit: '1 Unit per radius 8-10 meter koridor',
      badgeTeknis: `Interval ${calculatedIntervalMinutes} Menit (${input.hariAktif})`,
      intervalSprayDetail: `Set timer interval: ${calculatedIntervalMinutes} menit (${input.jamOperasional} jam/hari, ${input.hariAktif}, siklus servis 8 minggu / 6.000 shot).`,
    });
  }

  // 4. Area Sensitif / RS / Ruang Bayi -> EWB (Waterbase Freshener)
  if (input.areaSensitifKlinik) {
    kat2_Secondary.push({
      id: 'EWB-WATERBASE',
      kodeUnit: 'EWB',
      namaUnit: 'EcoCare Waterbase Freshener (EWB)',
      kategori: 'Secondary Products',
      matchScore: 96,
      alasanTeknis:
        'Formulasi waterbase non-aerosol, 100% bebas VOC propelan & alkohol. Hypoallergenic dan tidak meninggalkan lapisan minyak pada lantai.',
      nilaiBisnis:
        'Berbahan dasar air murni, aman bagi pasien rawat inap, anak-anak, dan penderita alergi pernapasan/asma di lingkungan medis.',
      estimasiUnit: '1 Unit per Ruang Rawat / Poli Medis',
      badgeTeknis: 'Waterbase 100% Bebas Propelan',
    });
    summaryHighlights.push('Area sensitif medis: EWB Waterbase dipilih untuk keamanan pernapasan pasien.');
  }

  // 5. Masalah Lalat di Kantin/Pantry -> Ecoflies (EFL)
  if (input.masalahLalatKantin) {
    kat2_Secondary.push({
      id: 'EFL-LALAT',
      kodeUnit: 'EFL',
      namaUnit: 'Ecoflies Automatic Fly Repellent (EFL)',
      kategori: 'Secondary Products',
      matchScore: 95,
      alasanTeknis:
        'Dispenser otomatis aerosol anti-lalat dengan zat aktif Permethrin & Transfluthrin dosis terukur. Efektif mengusir lalat di pintu pantry/kantin.',
      nilaiBisnis:
        'Perlindungan instan dari lalat tanpa bau menyengat kimiawi, menjaga standar kebersihan makanan staf dan area makan.',
      estimasiUnit: '1 - 2 Unit Pintu Masuk Kantin / Pantry',
      badgeTeknis: 'Pengusir Lalat Alami Food Area',
    });
  }

  // -------------------------------------------------------------
  // KELOMPOK 3: SMART SCENTING (COLD AIR DIFFUSION)
  // -------------------------------------------------------------

  // 1. Lobi Luas >300 m3 + AC Sentral -> Smart Scent B5000 (HVAC)
  if (input.kondisiLobi === 'HVAC_LUAS') {
    kat3_SmartScenting.push({
      id: 'SCENT-B5000',
      kodeUnit: 'Smart Scent B5000',
      namaUnit: 'Smart Scent B5000 (Koneksi AHU / HVAC)',
      kategori: 'Smart Scenting',
      matchScore: 97,
      alasanTeknis:
        'Pemasangan selang nozel langsung ke ducting suplai AHU AC Sentral gedung. Kapasitas oli aroma 1.000 - 5.000 ml dengan tekanan udara konstan.',
      nilaiBisnis:
        'Nano Mist berukuran <5 mikron menyebar rata ke seluruh lobi luas via ducting AC sentral tanpa residu dan tanpa membuat lantai marmer licin.',
      estimasiUnit: '1 Sistem Terintegrasi AHU Lobi',
      badgeTeknis: 'HVAC Central Ducting (>300 m3)',
    });
    summaryHighlights.push('Lobi luas ber-AC sentral: Smart Scent B5000 terintegrasi AHU untuk first impression premium.');
  } else if (input.kondisiLobi === 'STANDALONE_300') {
    // 2. Lobi Sedang s/d 300 m3 Stand Alone -> Smart Scent D300
    kat3_SmartScenting.push({
      id: 'SCENT-D300',
      kodeUnit: 'Smart Scent D300',
      namaUnit: 'Smart Scent D300 (Stand Alone)',
      kategori: 'Smart Scenting',
      matchScore: 92,
      alasanTeknis:
        'Unit difusi mandiri plug & play berkapasitas 500 ml. Dilengkapi modul kontrol waktu digital via tombol layar / bluetooth.',
      nilaiBisnis:
        'Menghadirkan aroma signature mewah khas hotel bintang 5 langsung di area resepsionis tanpa perlu membongkar plafon atau instalasi ducting.',
      estimasiUnit: '1 - 2 Unit Area Resepsionis',
      badgeTeknis: 'Stand Alone Digital (s/d 300 m3)',
    });
  }

  // 3. Ruang Rapat Direksi / VIP Lounge -> Smart Scent A80 (Nano Mist)
  if (input.ruangRapatVip) {
    kat3_SmartScenting.push({
      id: 'SCENT-A80',
      kodeUnit: 'Smart Scent A80',
      namaUnit: 'Smart Scent A80 (Nano Mist Ruang Rapat VIP)',
      kategori: 'Smart Scenting',
      matchScore: 94,
      alasanTeknis:
        'Ultra-quiet cold air diffusion (<30 dB hening), botol aroma 100 ml, cover area hingga 100 m3. Kompatibel diletakkan di atas meja credenza.',
      nilaiBisnis:
        'Desain elegan berestetika tinggi, operasional hening tanpa suara semprotan aerosol yang mengagetkan saat rapat penting direksi.',
      estimasiUnit: '1 Unit per Ruang Rapat Direksi / VIP',
      badgeTeknis: 'Silent Nano-Mist (<30 dB)',
    });
  }

  const totalUnitRekomendasi =
    kat1_Restroom.length + kat2_Secondary.length + kat3_SmartScenting.length;

  return {
    runId: `EC-DIAG-${Date.now().toString(36).toUpperCase()}`,
    evaluatedAtUtc: new Date().toISOString(),
    namaGedung: input.namaGedung,
    surveyType: input.surveyType,
    segmen: input.segmen,
    totalUnitRekomendasi,
    kategori1_MainRestroom: kat1_Restroom,
    kategori2_Secondary: kat2_Secondary,
    kategori3_SmartScenting: kat3_SmartScenting,
    sprayerIntervalMinutes: input.koridorPublikTerbuka ? calculatedIntervalMinutes : null,
    summaryHighlights,
  };
}
