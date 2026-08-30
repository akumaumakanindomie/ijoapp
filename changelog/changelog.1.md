# Changelog 1

## 1. Perbaikan routing dan struktur page Next.js

Pada pengembangan frontend, terdapat pemahaman penting terkait struktur folder route di Next.js:

- Route di Next.js ditentukan oleh struktur folder di bawah `app/`.
- File harus tetap bernama `page.tsx` di dalam folder route yang sesuai.
- Penamaan file seperti `page.dashboard.quest.tsx` tidak akan berfungsi sebagai route valid di App Router.
- Karena itu, perubahan nama file harus disesuaikan dengan struktur folder, bukan sekadar nama file pada level root.

Catatan:
- Route yang benar adalah `app/dashboard/quest/page.tsx`.
- Route yang salah adalah file dengan nama yang tidak mengikuti pola `page.tsx` di folder route.

## 2. Penambahan label "kembali" pada tombol back

Pada halaman quest, tombol navigasi mundur ditambah label teks `kembali` di samping ikon panah kiri agar UI lebih jelas dan user-friendly.

Tujuan:
- memudahkan pengguna memahami fungsi tombol
- menjaga konsistensi pengalaman navigasi di aplikasi

## 3. Implementasi reward leaderboard mingguan

Fitur reward leaderboard mingguan telah diimplementasikan di backend dengan aturan berikut:

1. User masuk leaderboard.
2. Skor leaderboard saat masuk leaderboard minimal harus `>= 500`.
3. User hanya berhak menerima reward jika masuk 10 besar leaderboard mingguan.
4. Reward dibayarkan sekali per minggu.
5. Reward diberikan berdasarkan peringkat:
   - 1: 300
   - 2: 275
   - 3: 250
   - 4: 225
   - 5: 200
   - 6: 175
   - 7: 150
   - 8: 125
   - 9: 110
   - 10: 100

Fitur ini disimpan pada field user seperti:
- `lastWeeklyRewardAt`
- `weeklyTotalScore`
- `weeklyLeaderboardUpdatedAt`

Validasi tambahan:
- pengguna tidak akan menerima reward berulang pada minggu yang sama
- reward dilakukan hanya pada user yang memenuhi syarat

## 4. Integrasi logika reset mingguan

Untuk menjaga konsistensi fitur reward dan quest, logika reset mingguan dibuat mengikuti pola reset pekanan berdasarkan hari Senin pukul 00:00.

Hal ini memastikan:
- skor mingguan akan reset di waktu yang sama
- reward dibagikan sesuai cycle yang sama
- proses leaderboard, reward, dan quest tetap konsisten

## 5. Notifikasi reward di frontend

Pada dashboard, ditambahkan notifikasi yang memberi tahu user ketika waktu pembagian reward leaderboard sudah tiba.

Komponen UI yang ditambahkan:
- banner status reward di bagian atas dashboard
- countdown waktu sampai reset mingguan
- toast notif saat reward siap dibagikan

Notifikasi ini dibuat agar user sadar bahwa leaderboard minggu ini sudah saatnya dibagikan dan dapat langsung mengecek klasemen.

## 6. Hasil validasi

Setelah implementasi, dilakukan pengecekan pada backend dan frontend.

### Backend
- unit test reward leaderboard berhasil dijalankan
- hasil test menunjukkan semua test lulus

### Frontend
- build Next.js berhasil dijalankan
- output build menunjukkan kompilasi sukses tanpa error

## 7. Ringkasan perubahan utama

- perbaikan pemahaman routing Next.js
- penambahan label "kembali" di halaman quest
- implementasi reward leaderboard mingguan dengan syarat skor >= 500
- pencegahan payout ganda dalam satu minggu
- integrasi notifikasi dashboard saat reward siap dibagikan

## 8. Rincian file dan line yang telah diubah

Berikut lokasi utama perubahan yang sudah dilakukan:

- frontend/app/dashboard/page.tsx
  - baris 61-124: penambahan state untuk countdown reward, status reward siap dibagikan, dan toast notifikasi
  - baris 282-301: banner status reward dan tampilan countdown reset mingguan di dashboard

- backend/src/games/games.service.ts
  - baris 44-84: implementasi `distributeWeeklyLeaderboardRewards()` untuk membagikan reward ke top 10 leaderboard mingguan dengan pengecekan skor >= 500 dan satu kali payout per minggu
  - baris 90-104: logika reset skor mingguan jika periode berubah

- backend/src/quests/quests.service.ts
  - baris 17-39: fungsi `getResetBounds()` untuk menentukan batas reset harian dan mingguan berdasarkan waktu 00:00

- backend/src/schemas/user.schema.ts
  - baris 59-61: penambahan field `weeklyTotalScore` dan `lastWeeklyRewardAt` untuk menyimpan status skor mingguan dan pencatatan reward terakhir

## 9. Catatan implementasi

Dokumen ini merupakan catatan perubahan yang telah dilakukan hingga tahap saat ini. Jika diperlukan pengembangan lanjutan, perubahan baru dapat ditambahkan di sini agar riwayat update aplikasi tetap terdokumentasi dengan baik.
