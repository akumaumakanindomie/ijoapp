# Changelog 8

## 1. Perbaikan alur artikel pada landing page

### Area utama yang diubah
- [frontend/app/page.tsx](../frontend/app/page.tsx)
- [frontend/app/artikel/page.tsx](../frontend/app/artikel/page.tsx)
- [frontend/app/artikel/[id]/page.tsx](../frontend/app/artikel/[id]/page.tsx)
- [frontend/app/admin/dashboard/page.tsx](../frontend/app/admin/dashboard/page.tsx)

### Detail perubahan
- Section `Artikel Edukasi` pada landing page dibenahi agar tidak langsung membuka halaman detail artikel tertentu.
- Tombol `Baca Selengkapnya` pada landing page diubah untuk menuju halaman daftar artikel keseluruhan, yaitu `/artikel`, bukan langsung ke `/artikel/0` atau URL berbasis indeks.
- Logika `handleJudgeLogin` pada landing page disesuaikan agar dapat menerima parameter redirect tujuan, sehingga user yang belum login bisa diarahkan ke route tertentu setelah login otomatis berhasil.
- Struktur artikel pada frontend diperluas untuk mendukung field `slug` sebagai alternatif identifikasi artikel yang lebih stabil dibanding indeks array.

### Tujuan perbaikan
- mencegah user langsung membuka detail artikel yang salah ketika banyak artikel ditambah/hapus
- memastikan alur tombol dari landing page konsisten dengan halaman daftar artikel
- membuat redirect lebih terkontrol dibanding sekadar mengakses detail berdasarkan `idx`

## 2. Fix halaman daftar artikel

### File yang terlibat
- [frontend/app/artikel/page.tsx](../frontend/app/artikel/page.tsx)

### Perubahan penting
- Tombol `Baca Selengkapnya` berubah dari elemen `button` statis menjadi `Link` yang valid ke halaman detail.
- Penambahan state `error` agar request gagal tidak dianggap sebagai artikel kosong.
- Penambahan state `retry` / tombol `Coba Lagi` saat API gagal memuat artikel.
- Pembersihan layout pada teks artikel dengan `wrap-break-word` agar tidak meluber pada layout mobile.
- Peningkatan responsivitas card artikel agar gambar dan konten tidak rusak saat panjang judul atau isi artikel.

### Hasil yang diinginkan
- user dapat masuk ke daftar artikel dengan benar
- user mendapat pesan jelas saat backend gagal merespons
- UI tidak terlihat rusak ketika data artikel kosong atau panjang

## 3. Fix halaman detail artikel

### File yang terlibat
- [frontend/app/artikel/[id]/page.tsx](../frontend/app/artikel/[id]/page.tsx)

### Perubahan penting
- Penambahan search article berdasarkan `slug` dengan fallback ke indeks lama untuk kompatibilitas data lama.
- Pembedaan status:
  - loading
  - error API
  - artikel tidak ditemukan
  - artikel berhasil dimuat
- Tombol `Kembali ke artikel` tetap berfungsi untuk kembali ke halaman daftar.
- Setelah data gagal dimuat, halaman menampilkan pesan yang jelas bukan halaman “artikel tidak ditemukan” yang salah.

### Tujuan perbaikan
- mencegah salah interpretasi antara kegagalan request dan data yang memang tidak ada
- menjaga kompatibilitas untuk artikel lama yang masih relevan dengan format indeks array

## 4. Perubahan CMS artikel di admin dashboard

### File yang terlibat
- [frontend/app/admin/dashboard/page.tsx](../frontend/app/admin/dashboard/page.tsx)

### Perubahan penting
- `articles_section` pada state CMS diperluas untuk mencakup `slug`.
- Saat data artikel dimuat dari backend, slug dibuat jika belum ada.
- Saat artikel baru dibuat, slug otomatis dihasilkan agar link lebih stabil.
- Titik penyimpanan artikel tetap kompatibel dengan struktur data yang ada, tetapi menyiapkan kebutuhan link yang tidak bergantung pada index array.

### Tujuan perbaikan
- agar artikel memiliki identitas yang stabil di URL
- mengurangi risiko link rusak saat user menambah atau menghapus artikel

## 5. Penanganan error Network Error pada landing page

### File yang terlibat
- [frontend/app/page.tsx](../frontend/app/page.tsx)
- [frontend/lib/axios.ts](../frontend/lib/axios.ts)

### Perubahan penting
- `fetchData` pada halaman landing page ditambahkan state `error`.
- Saat `Network Error` atau request gagal, halaman tidak lagi stuck pada loading spinner tanpa keterangan.
- Halaman menampilkan pesan yang jelas: `Konten belum tersedia` dan tombol `Coba Lagi`.
- Penanganan error diarahkan untuk memudahkan debugging saat backend offline atau port API tidak aktif.

### Root cause yang diidentifikasi
- frontend mengarah ke `NEXT_PUBLIC_API_URL` yang biasanya menunjuk `http://localhost:3000`
- jika backend tidak berjalan, browser akan gagal mengirim request dan menimbulkan `Network Error`
- permasalahan utama bukan pada JSX, melainkan koneksi ke backend yang gagal

## 6. Perubahan visibility tombol masuk berdasarkan status login

### File yang terlibat
- [frontend/app/login/page.tsx](../frontend/app/login/page.tsx)
- [frontend/middleware.ts](../frontend/middleware.ts)

### Perubahan penting
- Halaman login menambahkan pengecekan token saat komponen mount.
- Jika token valid, user otomatis diarahkan ke `/dashboard` atau `/admin/dashboard`.
- Form login, tombol masuk, tombol akses cepat, dan link daftar ditutup/di-hide saat user sudah login.
- Jika token tidak valid atau rusak, token dihapus dan user tetap bisa login ulang.
- Middleware tetap menjaga akses halaman auth agar user yang sudah login tidak kembali ke login/register.

### Hasil yang diinginkan
- user yang sudah login tidak melihat form login di halaman masuk
- user yang belum login tetap bisa login normal
- browser tidak mengulang logout saat berpindah antar halaman dengan cookie yang valid

## 7. Ringkasan perubahan akhir

Update yang dilakukan pada fase ini fokus pada tiga hal utama:

1. perbaikan navigasi artikel dan link landing page
2. perbaikan validasi UI serta error handling pada halaman artikel dan landing page
3. penyesuaian visibility login berdasarkan status autentikasi user

Secara keseluruhan, perubahan ini memperkuat alur user dari awal landing page hingga halaman detail artikel dan autentikasi, sekaligus menutup masalah umum seperti network error, redirect yang tidak konsisten, serta halaman login yang tampil meskipun user sudah login.
