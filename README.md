# EcoCare Smart Diagnostic

**EcoCare Super Sales App — Smart Survey Diagnostic (Stage 4: Site Survey)**  
Aplikasi Asisten Survei Lapangan khusus 1 lini bisnis (**EcoCare Hygiene**) untuk Tim Sales PT EcoCare Indo Pasifik Tbk.

## 🎯 Fitur Utama:
1. **Interactive 4-Zone Observation Form (Accordion / Multi-Zone)**:
   - **Profil Umum & Zona 1 (Restroom / Toilet)**: Tipe pipa kloset/urinoir (Pipa Manual Biasa vs Pipa Tanam/Sensor/Marmer), tipe wastafel (Trafik Padat vs Green Hemat Air), kebutuhan Seat Cleaner (ESC), Sanitary Bin (ESBD), dan Hand Dryer (EHD).
   - **Zona 2 (Pintu Masuk & Lobi Utama)**: Penanganan debu/air hujan dengan keset rental (EDM) dan varian Cold-Air Scenting lobi (Stand Alone D300 vs HVAC Central B5000).
   - **Zona 3 (Koridor, Lift, & Ruang Rapat)**: Kipas blower wangi hening (EAF), semprotan aerosol LCD Sprayer dengan kalkulasi interval otomatis, waterbase steril medis (EWB), dan difusi hening ruang rapat VIP (A80).
   - **Zona 4 (Pantry, Kantin, & Area Belakang)**: Aerosol anti-lalat alami (EFL) dan sabun pantry ekonomis (Fave 701W).
2. **Hygiene Unit Matchmaking & Technical Guardrails**:
   - Menghitung **% Kecocokan (Match Score)** setiap unit hygiene.
   - Menyertakan **Alasan Teknis Instalasi** (termasuk peringatan kritis bagi teknisi agar tidak salah bawa barang atau mengebor marmer).
   - Menyertakan **Nilai Bisnis Klien** untuk bahan pitching quotation.
   - Menghitung **Kalkulasi Interval Timer LCD Sprayer** otomatis:  
     $$\text{Interval (menit)} = \frac{\text{Jam Operasional} \times 60 \times \text{Hari Kerja/Minggu} \times 8 \text{ minggu}}{6.000 \text{ spray}}$$
3. **Preset Skenario Cepat**:
   - Gedung Kantor (Pipa Tanam & Green Concept)
   - Mall Besar (Trafik Padat & Lobi HVAC)
   - RS / Klinik (Sensitif Alergi & Higienitas Medis)
4. **Handover & Riwayat**:
   - Tombol **Kirim Draft ke Quotation (Stage 5 - pricing.ecocare.id)** dengan modal payload JSON terstruktur.
   - Tombol **Simpan Lampiran Teknis untuk Teknisi & Admin** ke LocalStorage.

## 🚀 Cara Menjalankan

### 1. Web Version (Development)
```bash
npm install
npm run dev
```
Buka `http://localhost:3000` di browser.

### 2. Mobile App Version (Android & iOS — Capacitor)
Aplikasi Hycare menggunakan arsitektur **Unified Cross-Platform Capacitor** (1 Codebase untuk Web, Android, dan iOS):
- **100% Offline-Ready**: Model ML (Random Forest) dan rule-based scoring dieksekusi langsung di perangkat client tanpa butuh server/koneksi internet.
- **Native Hardware Access**: Mendukung auto-deteksi GPS lokasi gedung survei, haptic tactile feedback, kamera bukti survei, dan native system share sheet (WhatsApp/Email).
- **Branded Splash & App Icons**: Terpasang otomatis untuk semua density Android (Adaptive icon mipmap) dan iOS (Assets.xcassets).

#### Build Langsung File Installer APK (Android):
Anda bisa langsung menghasilkan file installer `.apk` tanpa perlu membuka Android Studio:
```bash
# Otomatis compile Next.js statis, sync aset, dan build file APK
npm run build:apk

# Buka folder tempat file APK berada di Windows Explorer
npm run open:apk
```
File APK siap instal berada di:
`android/app/build/outputs/apk/debug/app-debug.apk` (dapat langsung dikirim ke HP Android via WhatsApp, Google Drive, atau kabel USB).

#### Buka di Android Studio:
```bash
npm run cap:android
```


#### Shortcut Command:
- `npm run cap:sync`: Memperbarui file web statis dan plugin ke folder `android/` dan `ios/`.
- `npm run cap:run:android`: Menjalankan langsung ke perangkat Android / Emulator yang terhubung via ADB.
- `npm run cap:run:ios`: Menjalankan langsung ke iPhone / iOS Simulator (memerlukan macOS).

