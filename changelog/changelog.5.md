# Changelog 5

Dokumen ini mencatat perubahan yang dibahas dan diputuskan sepanjang percakapan terkait fitur scan sampah di aplikasi Ijo-ijo, termasuk iterasi perubahan mekanisme, perbaikan kamera, dan rollback ke perilaku awal.

## 1. Fokus perubahan utama

Pada sesi ini, fokus perubahan berada di halaman scan sampah:

- `frontend/app/dashboard/scan/page.tsx`

File ini menjadi satu-satunya file yang relevan untuk alur berikut:
- proses deteksi sampah berbasis AI / Teachable Machine
- validasi objek sampah
- pengiriman data ke backend lewat API
- redirect setelah scan berhasil
- lifecycle kamera saat page aktif atau ditinggalkan

## 2. Perubahan mekanisme scan yang dibahas

### 2.1 Pindah dari redirect instan ke stay di halaman scan

Pada tahap awal, perubahan yang dipertimbangkan adalah:

- setelah scan berhasil, user tidak langsung dipindahkan ke dashboard
- user tetap berada di halaman `/dashboard/scan`
- halaman scan tetap siap menerima proses scan berikutnya tanpa navigasi ulang

Area utama yang diubah di file:
- `frontend/app/dashboard/scan/page.tsx` bagian `handleLapor`
- region sekitar baris 21-93 dalam file tersebut

Bagian ini mengatur:
- `isSendingRef`
- `isProcessing`
- `toast.success(...)`
- proses API `api.post('/garbage/scan', ...)`
- status setelah scan selesai

Catatan:
- mekanisme redirect awalnya disimpan di blok `setTimeout(() => router.push('/dashboard'), 2000)`
- kemudian diubah agar proses tetap berada di halaman scan dan state direset agar user bisa lanjut scan

### 2.2 Penghentian kamera saat user meninggalkan page

Masalah yang ditemukan adalah:

- kamera masih aktif meski user sudah berada di dashboard
- indikator browser menyatakan `This tab is using your camera`
- masalah ini terjadi karena stream video belum benar-benar dihentikan saat page unmount atau saat redirect

Area utama yang diperiksa di file:
- `frontend/app/dashboard/scan/page.tsx` bagian `useEffect` dan cleanup
- region sekitar baris 94-208

Bentuk perubahan yang diujicoba meliputi:
- `stopCamera()` helper
- `redirectTimeoutRef`
- `webcamInstanceRef.current = null`
- `cancelAnimationFrame(requestRef.current)`
- `webcam.stop()` saat cleanup atau sebelum redirect

Tujuan dari perubahan ini adalah:
- memastikan timer loop tidak terus berjalan
- memastikan stream kamera benar-benar di-stop saat user pindah halaman
- mencegah browser tetap menganggap tab masih memakai kamera

## 3. File dan line utama yang terlibat

### File utama

1. `frontend/app/dashboard/scan/page.tsx`

Area paling penting di file ini:

- `Baris ~21-40`: deklarasi state dan refs utama
  - `router`
  - `webcamRef`
  - `modelRef`
  - `webcamInstanceRef`
  - `requestRef`
  - `isMountedRef`
  - `stabilityCounterRef`
  - `currentClassRef`
  - `lastPredictTimeRef`
  - `isSendingRef`

- `Baris ~41-93`: fungsi `handleLapor`
  - validasi sampah
  - mapping kategori backend
  - pemanggilan `api.post('/garbage/scan')`
  - toast success
  - redirect/refresh dan logika setelah scan sukses

- `Baris ~94-175`: `useEffect` untuk AI dan kamera
  - `loop()` untuk prediksi frame-by-frame
  - `initAI()` untuk load model dan inisialisasi webcam
  - `tmImage.load()` dan `new tmImage.Webcam()`
  - `webcam.setup()` / `webcam.play()`
  - `requestAnimationFrame(loop)`

- `Baris ~175-208`: cleanup / lifecycle page
  - `isMountedRef.current = false`
  - `cancelAnimationFrame(...)`
  - `webcam.stop()`
  - pembatalan timer redirect jika ada

## 4. Hasil keputusan akhir dari iterasi ini

Setelah evaluasi dan perubahan yang sudah dicoba, user akhirnya meminta undo semua perubahan yang dibuat terhadap fitur scan. Maka perilaku dikembalikan ke kondisi awal, yaitu:

- setelah scan berhasil, redirect otomatis ke dashboard
- mekanisme kerja awal dipulihkan
- stream kamera ikut di-stop saat page dibersihkan/ditutup
- pengaturan yang berubah sementara untuk "stay di scan" tidak dipertahankan

Dengan demikian, file yang relevan tetap sama, tetapi fungsi akhir yang dipertahankan adalah yang ada pada perilaku awal project sebelum perubahan mekanisme scan dilaksanakan.

## 5. Ringkasan singkat

Seluruh diskusi dan perubahan yang terjadi di sesi ini berpusat pada file berikut:

- `frontend/app/dashboard/scan/page.tsx`

Area perubahan mencakup:
- callback `handleLapor`
- proses deteksi AI dan validasi objek
- lifecycle `Webcam` dan `MediaStream`
- redirect setelah scan selesai
- cleanup camera saat meninggalkan halaman

## 6. Catatan final

Dokumen ini dibuat untuk mencatat riwayat perubahan yang terjadi selama percakapan saat ini, termasuk:
- perubahan mekanisme scan yang dicoba
- perbaikan kamera tetap hidup
- rollback ke kondisi awal setelah user mengubah keputusan

Tujuannya agar semua iterasi perubahan di file scan terdokumentasi dengan jelas dan dapat dilacak kembali jika dibutuhkan di masa depan.
