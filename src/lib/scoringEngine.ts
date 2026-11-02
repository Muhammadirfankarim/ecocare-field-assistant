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

  // Hitung Pengaturan Timer Semprot Otomatis agar pas untuk 2 bulan (siklus servis EcoCare)
  const daysPerWeek = input.hariAktif === '5 Hari Kerja' ? 5 : 7;
  const safeHours = Math.min(24, Math.max(1, Number(input.jamOperasional) || 12));
  // Formula: (Jam Kerja * 60 menit * Hari Kerja/Minggu * 8 minggu) / 6000 semprotan
  const calculatedIntervalMinutes = Number(
    ((safeHours * 60 * daysPerWeek * 8) / 6000).toFixed(1)
  );

  // -------------------------------------------------------------
  // KELOMPOK 1: TOILET & SANITASI UTAMA
  // -------------------------------------------------------------

  // 1. Sanitizer Kloset & Urinoir (EST Manual vs EDST Digital)
  if (input.kondisiPipa === 'PIPA_MANUAL') {
    kat1_Restroom.push({
      id: 'EST-MANUAL',
      kodeUnit: 'EST',
      namaUnit: 'Ecocare Sanitizer Manual (EST)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 96,
      petunjukPemasangan:
        'Dipasang pada pipa luar kloset/urinoir yang bisa dilubangi. Bekerja otomatis setiap kali dibilas tanpa perlu baterai atau listrik.',
      keunggulanGedung:
        'Mencegah timbulnya bau pesing dan kerak urine di pipa saluran kloset, hemat biaya karena tidak memerlukan daya listrik.',
      estimasiUnit: `${input.jumlahUrinoirKloset || 1} Titik Urinoir/Kloset`,
      keteranganTipe: 'Sistem Bilas Otomatis (Tanpa Baterai)',
    });
    summaryHighlights.push('Pipa standar: Cocok menggunakan unit EST Manual hemat energi.');
  } else {
    // PIPA_TANAM / Sensor / Marmer
    kat1_Restroom.push({
      id: 'EDST-DIGITAL',
      kodeUnit: 'EDST',
      namaUnit: 'Ecocare Sanitizer Digital (EDST)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 98,
      petunjukPemasangan:
        'Dipasang dengan sistem tetes berkala menggunakan 2 baterai. Tidak memerlukan pengeboran pada dinding marmer atau pipa tanam.',
      catatanKhusus:
        'Perhatian: Dinding toilet marmer/pipa tanam dilarang dibor. Gunakan unit EDST Digital (bukan tipe manual).',
      keunggulanGedung:
        'Menjaga kebersihan dan aroma toilet tetap wangi tanpa merusak dinding marmer mewah atau sistem sensor otomatis gedung.',
      estimasiUnit: `${input.jumlahUrinoirKloset || 1} Titik Urinoir/Kloset`,
      keteranganTipe: 'Sistem Tetes Digital (Baterai)',
    });
    summaryHighlights.push('Pipa tanam/marmer: Wajib unit EDST Digital agar tidak merusak dinding.');
  }

  // 2. Sabun Wastafel (Sabun Cair vs Sabun Busa Foam)
  if (input.tipeWastafel === 'TRAFIK_PADAT') {
    kat1_Restroom.push({
      id: 'ESD-LIQUID',
      kodeUnit: 'ESD-MS1000',
      namaUnit: 'Dispenser Sabun Cair Kapasitas Besar (1 Liter)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 94,
      petunjukPemasangan:
        'Wadah sabun kapasitas 1.000 ml yang kuat dengan kunci pengaman, cocok untuk pemakaian jumlah orang banyak.',
      keunggulanGedung:
        'Kapasitas besar mencegah sabun cepat habis di wastafel ramai, meringankan pekerjaan tim kebersihan.',
      estimasiUnit: `${input.jumlahWastafel || 1} Titik Wastafel`,
      keteranganTipe: 'Sabun Cair 1.000 ml (Trafik Padat)',
    });
  } else {
    // TRAFIK_GREEN
    kat1_Restroom.push({
      id: 'EFS-FOAM',
      kodeUnit: 'EFS-SP830',
      namaUnit: 'Dispenser Sabun Busa Hemat Air (Foam Soap)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 95,
      petunjukPemasangan:
        'Menghasilkan busa instan lembut siap pakai dengan takaran terukur yang efisien dan higienis.',
      keunggulanGedung:
        'Busa lembut menghemat sabun dan air bilasan hingga 35%, sangat mendukung citra gedung perkantoran ramah lingkungan.',
      estimasiUnit: `${input.jumlahWastafel || 1} Titik Wastafel`,
      keteranganTipe: 'Sabun Busa (Hemat Sabun & Air 35%)',
    });
    summaryHighlights.push('Wastafel ramah lingkungan: Menggunakan Sabun Busa (Foam Soap) hemat air.');
  }

  // 3. Pembersih Dudukan Kloset (Seat Cleaner)
  if (input.khawatirBakteriKloset) {
    kat1_Restroom.push({
      id: 'ESC-SEAT',
      kodeUnit: 'ESC',
      namaUnit: 'Pembersih Dudukan Kloset (Seat Cleaner)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 92,
      petunjukPemasangan:
        'Dispenser cairan pembersih cepat kering di setiap bilik kloset duduk, digunakan bersama tisu toilet sebelum duduk.',
      keunggulanGedung:
        'Memberikan rasa nyaman dan kepastian higienis bebas kuman bagi para pengunjung dan tamu penting.',
      estimasiUnit: `${input.jumlahKubikalWanita || Math.max(1, Math.ceil(input.jumlahUrinoirKloset / 2))} Bilik Kloset Duduk`,
      keteranganTipe: 'Cairan Disinfektan Dudukan Kloset',
    });
  }

  // 4. Tempat Sampah Pembalut Otomatis (Sanitary Bin)
  if (input.butuhSanitaryBin) {
    kat1_Restroom.push({
      id: 'ESBD-BIN',
      kodeUnit: 'ESBD',
      namaUnit: 'Tempat Sampah Pembalut Sensor Otomatis (Sanitary Bin)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 95,
      petunjukPemasangan:
        'Tutup membuka otomatis lewat sensor gerak tangan (touchless), di dalamnya terdapat cairan antibakteri penghilang bau.',
      keunggulanGedung:
        'Menjaga toilet wanita tetap bersih tanpa disentuh tangan dan mencegah saluran kloset tersumbat pembalut.',
      estimasiUnit: `${input.jumlahKubikalWanita || 1} Bilik Toilet Wanita`,
      keteranganTipe: 'Sensor Otomatis Tanpa Sentuh',
    });
  }

  // 5. Pengering Tangan Cepat (Hand Dryer)
  if (input.keluhanSampahTisu) {
    kat1_Restroom.push({
      id: 'EHD-DRYER',
      kodeUnit: 'EHD',
      namaUnit: 'Pengering Tangan Cepat (Jet Hand Dryer)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 90,
      petunjukPemasangan:
        'Pengering tangan angin berkecepatan tinggi dengan sensor otomatis, memerlukan sambungan listrik di area wastafel.',
      keunggulanGedung:
        'Mengeringkan tangan dalam 10-15 detik, memangkas biaya pembelian kertas tisu dan membuat wastafel bebas sampah kertas berserakan.',
      estimasiUnit: `${Math.max(1, Math.ceil((input.jumlahWastafel || 2) / 2))} Unit Area Wastafel`,
      keteranganTipe: 'Angin Cepat (Bebas Sampah Tisu)',
    });
  }

  // 6. Sabun Pantry Ekonomis
  if (input.sabunPantryEkonomis) {
    kat1_Restroom.push({
      id: 'ESD-PANTRY',
      kodeUnit: 'Fave 701W',
      namaUnit: 'Dispenser Sabun Dapur & Pantry (500 ml)',
      kategori: 'Toilet & Sanitasi Utama',
      matchScore: 88,
      petunjukPemasangan:
        'Ukuran sedang 500 ml yang rapi dipasang di dinding dekat wastafel dapur atau area staf.',
      keunggulanGedung:
        'Praktis dan higienis untuk staf saat mencuci tangan dan perlengkapan makan di area pantry.',
      estimasiUnit: '1 - 2 Unit Pantry',
      keteranganTipe: 'Ukuran Sedang 500 ml',
    });
  }

  // -------------------------------------------------------------
  // KELOMPOK 2: PENGHARUM & KEBERSIHAN LANTAI
  // -------------------------------------------------------------

  // 1. Keset Karpet Penahan Debu & Air (Doormat)
  if (input.pintuMasukLicinDebu) {
    kat2_Secondary.push({
      id: 'EDM-MAT',
      kodeUnit: 'EDM',
      namaUnit: 'Keset Karpet Penyerap Debu & Air (Doormat Bersih Rutin)',
      kategori: 'Pengharum & Kebersihan Lantai',
      matchScore: 93,
      petunjukPemasangan:
        'Sistem sewa keset profesional dengan penukaran dan pencucian bersih secara rutin oleh tim EcoCare.',
      keunggulanGedung:
        'Menyerap kotoran debu dan air dari sepatu hingga 70%, menjaga lobi tetap bersih dan mencegah risiko terpeleset saat hujan.',
      estimasiUnit: '2 - 4 Lembar Pintu Masuk / Lobi',
      keteranganTipe: 'Layanan Ganti & Cuci Rutin',
    });
  }

  // 2. Kipas Pengharum Lift / Ruang Sempit (EAF Blower)
  if (input.ruangSempitLift) {
    kat2_Secondary.push({
      id: 'EAF-FAN',
      kodeUnit: 'EAF',
      namaUnit: 'Pengharum Lift & Ruang Sempit (Kipas Blower)',
      kategori: 'Pengharum & Kebersihan Lantai',
      matchScore: 91,
      petunjukPemasangan:
        'Menggunakan kipas hening dengan 1 baterai dan aroma padat, tidak perlu colokan listrik dan bebas semprotan gas.',
      keunggulanGedung:
        'Memberikan keharuman lembut tanpa suara semprotan yang mengagetkan di dalam lift atau ruangan kecil tertutup.',
      estimasiUnit: '1 Unit per Lift / Ruang Tertutup',
      keteranganTipe: 'Blower Hening (Bebas Gas Aerosol)',
    });
  }

  // 3. Pengharum Semprot Otomatis Koridor (LCD Sprayer)
  if (input.koridorPublikTerbuka) {
    kat2_Secondary.push({
      id: 'LCD-SPRAY',
      kodeUnit: 'LCD Sprayer',
      namaUnit: 'Pengharum Semprot Otomatis (LCD Sprayer)',
      kategori: 'Pengharum & Kebersihan Lantai',
      matchScore: 94,
      petunjukPemasangan: `Timer semprot otomatis diatur setiap ${calculatedIntervalMinutes} menit agar pas digunakan selama 2 bulan sesuai jadwal penggantian servis.`,
      keunggulanGedung:
        'Koridor selalu wangi segar merata sepanjang jam kerja secara otomatis, takaran semprot terukur sehingga tidak boros.',
      estimasiUnit: '1 Unit per jarak 8-10 meter koridor',
      keteranganTipe: `Semprot Tiap ${calculatedIntervalMinutes} Menit`,
      intervalSprayDetail: `Otomatis semprot tiap ${calculatedIntervalMinutes} menit (sesuai operasional ${input.jamOperasional} jam/hari).`,
    });
  }

  // 4. Pengharum Lembut Medis Waterbase
  if (input.areaSensitifKlinik) {
    kat2_Secondary.push({
      id: 'EWB-WATERBASE',
      kodeUnit: 'EWB',
      namaUnit: 'Pengharum Lembut Berbahan Dasar Air (Waterbase)',
      kategori: 'Pengharum & Kebersihan Lantai',
      matchScore: 96,
      petunjukPemasangan:
        'Menggunakan formula 100% berbahan dasar air murni tanpa alkohol dan tanpa gas propelan pemicu bersin/alergi.',
      keunggulanGedung:
        'Sangat aman untuk lingkungan klinik, ruang tunggu dokter anak, atau pasien yang sensitif terhadap wangi menyengat.',
      estimasiUnit: '1 Unit per Ruang Periksa / Rawat',
      keteranganTipe: '100% Berbahan Dasar Air (Non-Alkohol)',
    });
    summaryHighlights.push('Fasilitas medis: Menggunakan Pengharum Waterbase yang aman bagi pernapasan.');
  }

  // 5. Semprotan Pengusir Lalat Alami (Ecoflies)
  if (input.masalahLalatKantin) {
    kat2_Secondary.push({
      id: 'EFL-LALAT',
      kodeUnit: 'EFL',
      namaUnit: 'Semprotan Pengusir Lalat Alami (Ecoflies)',
      kategori: 'Pengharum & Kebersihan Lantai',
      matchScore: 95,
      petunjukPemasangan:
        'Alat semprot otomatis berjadwal khusus area makan atau dapur dengan ekstrak bahan yang mengusir lalat secara aman.',
      keunggulanGedung:
        'Menjaga area kantin dan pantry bebas dari lalat yang mengganggu tanpa meninggalkan bau obat kimia pada makanan.',
      estimasiUnit: '1 - 2 Unit Dekat Pintu Kantin / Dapur',
      keteranganTipe: 'Aman untuk Area Makanan',
    });
  }

  // -------------------------------------------------------------
  // KELOMPOK 3: PENGHARUM PREMIUM (SMART SCENTING)
  // -------------------------------------------------------------

  // 1. Lobi Luas Terhubung AC Sentral (HVAC)
  if (input.kondisiLobi === 'HVAC_LUAS') {
    kat3_SmartScenting.push({
      id: 'SCENT-B5000',
      kodeUnit: 'Smart Scent B5000',
      namaUnit: 'Pengharum Lobi Luas Terkoneksi AC Sentral (HVAC)',
      kategori: 'Pengharum Premium (Smart Scenting)',
      matchScore: 97,
      petunjukPemasangan:
        'Tersambung langsung ke saluran utama pendingin udara (AC Sentral), mengalirkan uap aroma mikro ke seluruh penjuru lobi.',
      keunggulanGedung:
        'Seluruh lobi gedung tercium harum mewah secara merata tanpa ada tetesan air atau lantai marmer yang menjadi licin.',
      estimasiUnit: '1 Sistem Terintegrasi Saluran AC Lobi',
      keteranganTipe: 'Tersambung AC Sentral Gedung',
    });
    summaryHighlights.push('Lobi utama ber-AC sentral: Smart Scenting terintegrasi untuk kesan pertama mewah.');
  } else if (input.kondisiLobi === 'STANDALONE_300') {
    // 2. Lobi Sedang Stand-Alone
    kat3_SmartScenting.push({
      id: 'SCENT-D300',
      kodeUnit: 'Smart Scent D300',
      namaUnit: 'Pengharum Resepsionis & Lobi Mandiri (Stand Alone)',
      kategori: 'Pengharum Premium (Smart Scenting)',
      matchScore: 92,
      petunjukPemasangan:
        'Unit mesin pengharum berdesain modern yang dapat diletakkan di sudut lobi atau meja resepsionis dengan pengaturan waktu otomatis.',
      keunggulanGedung:
        'Memberikan aroma khas hotel berbintang di area pintu masuk gedung secara praktis tanpa perlu modifikasi plafon.',
      estimasiUnit: '1 - 2 Unit Area Resepsionis',
      keteranganTipe: 'Unit Mandiri (Stand Alone)',
    });
  }

  // 3. Ruang Rapat VIP & Ruang Direksi
  if (input.ruangRapatVip) {
    kat3_SmartScenting.push({
      id: 'SCENT-A80',
      kodeUnit: 'Smart Scent A80',
      namaUnit: 'Pengharum Ruang Rapat VIP & Direksi (Sangat Hening)',
      kategori: 'Pengharum Premium (Smart Scenting)',
      matchScore: 94,
      petunjukPemasangan:
        'Mesin pengharum elegan bersuara sangat hening yang dapat diletakkan di atas meja kabinet ruang rapat.',
      keunggulanGedung:
        'Menghadirkan suasana pertemuan yang prestisius, nyaman, dan tenang tanpa suara semprotan yang mengganggu jalannya diskusi.',
      estimasiUnit: '1 Unit Ruang Rapat Direksi / VIP',
      keteranganTipe: 'Operasional Hening Tanpa Suara',
    });
  }

  const totalUnitRekomendasi =
    kat1_Restroom.length + kat2_Secondary.length + kat3_SmartScenting.length;

  return {
    runId: `HYCARE-SOP-${Date.now().toString(36).toUpperCase()}`,
    evaluatedAtUtc: new Date().toISOString(),
    namaGedung: input.namaGedung,
    surveyType: input.surveyType,
    segmen: input.segmen,
    totalUnitRekomendasi,
    kategori1_Restroom: kat1_Restroom,
    kategori2_Secondary: kat2_Secondary,
    kategori3_SmartScenting: kat3_SmartScenting,
    sprayerIntervalMinutes: input.koridorPublikTerbuka ? calculatedIntervalMinutes : null,
    summaryHighlights,
    engineType: 'RULE_BASED',
  };
}
