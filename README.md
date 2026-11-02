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

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` di browser.
