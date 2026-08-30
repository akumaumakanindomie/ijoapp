# Changelog 3

## Update minor dan perbaikan UI awal

### 1. Perbaikan pemahaman struktur route Next.js
Pada tahap awal pengembangan frontend, dilakukan penyesuaian pemahaman terhadap struktur route App Router Next.js. Route dibuat sesuai folder dan file `page.tsx` di dalam folder tujuan, bukan berdasarkan penamaan file di root. Perbaikan ini penting agar halaman seperti dashboard, quest, dan route lainnya dapat tampil dengan benar tanpa error navigasi.

### 2. Penambahan label pada tombol kembali
Tombol navigasi kembali pada halaman quest diperbarui dengan penambahan label `kembali` di samping ikon panah. Hal ini memperjelas fungsi tombol bagi pengguna dan membuat pengalaman navigasi terasa lebih konsisten serta user-friendly.

### 3. Perbaikan tata letak dan komponen UI dasar
Beberapa elemen UI dilakukan revisi agar lebih rapi dan mudah dipahami, termasuk:
- penyesuaian penempatan komponen agar lebih logis pada dashboard
- peningkatan konsistensi spacing dan visual hierarchy
- penyederhanaan tampilan tombol serta elemen navigasi agar lebih bersih
- penataan area informasi penting seperti reward dan status pengguna agar lebih mudah dibaca

### 4. Penyesuaian notifikasi reward di dashboard
Pada dashboard, ditambahkan komponen notifikasi terkait reward mingguan agar user menerima informasi saat reward sudah siap dibagikan. Informasi yang tampil mencakup:
- status reward siap dibagikan
- countdown reset mingguan
- toast notifikasi yang muncul saat kondisi reward sudah tiba

### 5. Perbaikan routing dan akses halaman
Beberapa route pada aplikasi disesuaikan agar menu navigasi dan akses halaman sesuai tata letak yang benar. Fokus utama dari perbaikan ini adalah menjaga agar halaman tampil di jalur yang tepat dan tidak tertukar akibat struktur folder pada Next.js.

### 6. Update pendukung untuk reward dan quest
Pada tahap awal, dilakukan penyesuaian logika supaya fitur reward mingguan dan reset time tetap sinkron dengan cycle quest. Hal ini mencakup:
- reset skor mingguan mengikuti batas periode tertentu
- validasi agar reward tidak dibagikan berulang pada minggu yang sama
- sinkronisasi logika reset mingguan untuk menjaga konsistensi sistem

### File yang terdampak
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dashboard/quest/page.tsx`
- `backend/src/quests/quests.service.ts`
- `backend/src/games/games.service.ts`
- `backend/src/schemas/user.schema.ts`

---

## Update admin approval, presence, dan leaderboard

### 1. Admin approval register
Pada dashboard admin, dibuat fitur untuk melihat daftar pendaftar yang menunggu persetujuan. Admin dapat:
- melihat user dengan status `pending`
- menyetujui pendaftaran
- menolak pendaftaran dengan menghapus data yang dikirim saat register
- melihat badge jumlah pending di tombol approval

### 2. Manajemen akun siswa yang aktif
Admin dapat melihat seluruh akun siswa yang sudah disetujui dengan detail seperti avatar, tanggal dibuat, email sekolah, dan username. Fitur sorting juga diterapkan berdasarkan:
- tanggal dibuat
- email sekolah
- abjad username

### 3. Konfirmasi sebelum hapus akun
Sebelum akun siswa dihapus, admin akan diberikan modal konfirmasi untuk mencegah penghapusan data secara tidak sengaja.

### 4. Status online/offline dengan heartbeat TTL
Dibuat fitur presence online/offline berbasis heartbeat dan TTL 60 detik. Ketika user aktif, frontend otomatis mengirim heartbeat ke backend yang mencatat `lastSeen`. User dianggap online bila selisih waktu dengan `lastSeen` masih dalam 60 detik.

### 5. Implementasi reward leaderboard mingguan
Reward leaderboard mingguan dibuat dengan aturan:
- user harus masuk leaderboard dengan skor minimal `>= 500`
- hanya top 10 yang berhak menerima reward
- reward dibayarkan sekali per minggu
- reward diberikan berdasarkan peringkat dari 1 sampai 10

### File yang diubah
- `backend/src/schemas/user.schema.ts`
- `backend/src/users/users.service.ts`
- `backend/src/users/users.controller.ts`
- `backend/src/games/games.service.ts`
- `frontend/app/admin/dashboard/page.tsx`
- `frontend/app/dashboard/page.tsx`

### Perubahan tata letak dashboard
Pada tampilan dashboard, box "Pembagian reward minggu ini" dipindahkan dari posisi paling atas ke area setelah section "Misi Hijau". Tujuannya agar informasi reward muncul lebih relevan saat pengguna melihat misi dan aktivitas utama di dashboard.

### File yang diubah
- `frontend/app/dashboard/page.tsx`
  - menghapus card reward dari bagian paling atas dashboard
  - memindahkan card reward ke bawah section "Misi Hijau"
  - menjaga logika countdown reward, status rewardDue, dan toast notifikasi tetap berjalan seperti sebelumnya

### Area update
- file: `frontend/app/dashboard/page.tsx`
- area: bagian reward banner di dashboard, tepat di bawah section "Misi Hijau" dan sebelum grid menu fitur utama

### Validasi
- dilakukan pengecekan build frontend dengan perintah `npm run build` di folder `frontend`
- hasil: build berhasil, `Compiled successfully` dan proses selesai tanpa error
