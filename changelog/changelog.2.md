# Changelog

## 1. Admin approval register

Pada dashboard admin, ditambahkan fitur untuk melihat daftar pendaftar yang menunggu persetujuan di bawah menu Login & Register.

Perubahan yang dilakukan:
- menampilkan daftar user student dengan status `pending`
- tombol `Approve` untuk menyetujui pendaftaran
- tombol `Decline` untuk menolak pendaftaran
- saat `Decline`, data user yang dikirim pada saat register akan dihapus dari database
- badge jumlah pending ditampilkan di sisi tombol approval register

## 2. Daftar akun siswa yang telah disetujui

Admin kini dapat melihat seluruh akun yang sudah disetujui di bagian khusus user approved.

Perubahan yang dilakukan:
- menampilkan seluruh akun student dengan status `active`
- akun admin tidak ikut tampil di daftar akun siswa
- menampilkan avatar inisial user
- menampilkan tanggal akun dibuat
- menampilkan email sekolah dan username
- sort tersedia berdasarkan:
  - tanggal dibuat
  - email sekolah
  - abjad username

## 3. Sorting email sekolah dan username

Logika sorting diperbarui sesuai kebutuhan:
- sorting email sekolah didasarkan pada domain setelah `@`
- prioritas lebih tinggi diberikan pada domain dengan segment lebih panjang / lebih spesifik
- sorting username dilakukan berdasarkan abjad secara case-insensitive

## 4. Konfirmasi sebelum hapus akun

Sebelum akun siswa dihapus permanen, admin akan diminta konfirmasi terlebih dahulu melalui modal konfirmasi.

Manfaat:
- mencegah penghapusan data secara tidak sengaja
- meningkatkan keamanan operasi admin

## 5. Status online/offline dengan heartbeat TTL

Fitur status online/offline ditambahkan berdasarkan mekanisme heartbeat dan TTL 60 detik.

Cara kerja:
- saat user login dan membuka dashboard, frontend mengirim heartbeat ke backend
- backend menyimpan waktu terakhir aktivitas user di field `lastSeen`
- user dianggap online jika selisih antara waktu sekarang dengan `lastSeen` kurang dari atau sama dengan 60 detik
- jika melebihi TTL, status berubah menjadi offline

## 6. File yang diubah

### Backend
- `backend/src/schemas/user.schema.ts`
  - menambahkan field `lastSeen` untuk menyimpan timestamp terakhir aktif user

- `backend/src/users/users.service.ts`
  - menambahkan fungsi `getPresenceState()`
  - menambahkan fungsi `heartbeat(userId)`
  - menetapkan TTL 60 detik pada logika online/offline

- `backend/src/users/users.controller.ts`
  - menambahkan endpoint `POST /users/heartbeat`
  - endpoint menggunakan autentikasi JWT

- `backend/src/users/users.service.spec.ts`
  - menambahkan test untuk validasi heartbeat presence logic

### Frontend
- `frontend/app/admin/dashboard/page.tsx`
  - menambahkan UI approval register
  - menambahkan badge pending count
  - menambahkan daftar user approved
  - menambahkan konfirmasi hapus akun
  - menampilkan badge Online / Offline berdasarkan TTL heartbeat

- `frontend/app/dashboard/page.tsx`
  - mengirim heartbeat otomatis saat user aktif di dashboard
  - heartbeat dikirim secara berkala selama user sedang membuka aplikasi

## 7. Hasil validasi

Setelah perubahan, dilakukan validasi berikut:
- backend unit test untuk `UsersService` lulus
- frontend production build berhasil dijalankan tanpa error

## 8. Panduan dashboard user dan landing page feature card

Pada tahap berikutnya, dilakukan penambahan konten yang bisa dikelola melalui CMS untuk kebutuhan dashboard user dan landing page.

Perubahan yang dilakukan:
- menambahkan box `Panduan` di bawah box `Misi Hijau` pada dashboard user
- box `Panduan` menampilkan teks yang bisa diubah oleh admin melalui CMS
- tombol pengeditan `Panduan` ditambahkan di bawah menu `Video (LandingPage)` pada dashboard admin
- content `panduan_section` ditambahkan di backend sebagai struktur data default dan data dinamis yang bisa disimpan ke database
- menambahkan feature card baru berjudul `Misi Hijau` pada section `Fitur Unggulan Kami`
- grid feature card di-ubah agar bisa menampung 5 kartu dengan ukuran yang lebih rapi dan proporsional

### File yang diubah

#### Backend
- `backend/src/content/content.service.ts`
  - menambahkan default data `panduan_section`
  - memastikan konten panduan dapat dibaca dan disimpan bersama konten publik aplikasi

#### Frontend
- `frontend/app/dashboard/page.tsx`
  - menampilkan box Panduan di bawah Misi Hijau
  - fetch data `panduan_section` dari API konten publik

- `frontend/app/admin/dashboard/page.tsx`
  - menambahkan menu `Panduan` di sidebar CMS admin
  - menambahkan form edit `Judul Panduan` dan `Isi Panduan`
  - menyimpan perubahan ke endpoint content update

- `frontend/app/page.tsx`
  - menambahkan card `Misi Hijau`
  - resize grid feature agar tampak muat 5 card

## 9. Catatan

Semua perubahan yang tercantum di dokumen ini merupakan update yang relevan untuk alur admin approval, manajemen akun siswa, real-time presence user, serta pengelolaan konten dinamis seperti Panduan dan fitur landing page.
