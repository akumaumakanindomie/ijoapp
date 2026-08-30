# Changelog 9

## 1. Ringkasan perubahan yang sudah terjadi

Secara umum, update yang sudah dilakukan mencakup beberapa area besar berikut:

- logika game dan leaderboard mingguan
- reward coin dan poin berdasarkan skor
- profil, presence, dan status user
- dashboard siswa untuk check-in, exchange, quest, dan hadiah
- dashboard admin untuk CMS content dan approval user
- halaman artikel, landing page, login, dan redirect autentikasi
- perbaikan alur UI agar data lebih konsisten dan tidak rusak karena error network atau data stale

---

## 2. File dan area utama yang sudah diubah

### 2.1 Backend: game, leaderboard, reward, dan total score

#### File utama
- [backend/src/games/games.service.ts](../backend/src/games/games.service.ts)
- [backend/src/schemas/user.schema.ts](../backend/src/schemas/user.schema.ts)

#### Area yang terdampak
- [backend/src/games/games.service.ts](../backend/src/games/games.service.ts)
  - `getWeeklyStartDate()`
  - `getWeeklyRewardAmount()`
  - `distributeWeeklyLeaderboardRewards()`
  - `resetWeeklyScoresIfNeeded()`
  - `startGame()`
  - `saveScore()`
  - `getLeaderboard()`
  - `getMyLeaderboardRank()`

- [backend/src/schemas/user.schema.ts](../backend/src/schemas/user.schema.ts)
  - properti `scanPoints`
  - properti `gameScores`
  - properti `weeklyGameScores`
  - properti `totalScore`
  - properti `weeklyTotalScore`
  - properti `pointHistory`
  - properti `quests`
  - properti `lastWeeklyRewardAt`
  - properti `activeItem`

#### Fokus perubahan
- reward leaderboard mingguan dibangun agar hanya diberikan sesuai periode yang valid
- score weekly reset dilakukan secara otomatis berdasarkan waktu minggu yang aktif
- saat game dimulai, tiket dikurangi dan progres quest ditambah
- saat score tersimpan, totalScore dan weeklyTotalScore ikut diperbarui
- reward coin dihitung berdasarkan skor game
- leaderboard dapat diambil berdasarkan scope `all` atau `weekly`
- my rank dihitung berdasarkan total skor atau skor per game type tertentu

---

### 2.2 Backend: profil user, presence, approval, dan status akun

#### File utama
- [backend/src/users/users.service.ts](../backend/src/users/users.service.ts)
- [backend/src/users/users.controller.ts](../backend/src/users/users.controller.ts)
- [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
- [backend/src/auth/auth.controller.ts](../backend/src/auth/auth.controller.ts)

#### Area yang terdampak
- [backend/src/users/users.service.ts](../backend/src/users/users.service.ts)
  - `getPresenceState()`
  - `heartbeat()`
  - `getProfile()`
  - `getPublicProfile()`
  - `updateProfile()`
  - `findAllUsers()`
  - `findPendingUsers()`
  - `updateUserStatus()`
  - `deleteUser()`

- [backend/src/users/users.controller.ts](../backend/src/users/users.controller.ts)
  - `GET /users/profile`
  - `PATCH /users/profile`
  - `POST /users/heartbeat`
  - `GET /users/pending`
  - `GET /users`
  - `GET /users/:id`
  - `PATCH /users/:id/status`
  - `DELETE /users/:id`

- [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
  - logika autentikasi dan profil user setelah login
  - pemetaan data user ke payload auth

- [backend/src/auth/auth.controller.ts](../backend/src/auth/auth.controller.ts)
  - endpoint `getProfile` dan flow user login/auth dasar

#### Fokus perubahan
- status online/offline user berdasarkan `lastSeen`
- cooldown username diatur agar tidak bisa diubah terlalu sering
- profil public dan private user dibuat lebih lengkap
- admin dapat melihat user pending dan menyetujui/menolak registrasi
- user yang aktif dan pending dapat dikelola dari backend secara konsisten

---

### 2.3 Frontend: dashboard user, quest, check-in, reward, dan exchange

#### File utama
- [frontend/app/dashboard/page.tsx](../frontend/app/dashboard/page.tsx)
- [frontend/app/dashboard/quest/page.tsx](../frontend/app/dashboard/quest/page.tsx)

#### Area yang terdampak
- [frontend/app/dashboard/page.tsx](../frontend/app/dashboard/page.tsx)
  - state `greeting`, `rewardCountdown`, `rewardDue`
  - `useEffect` untuk reset reward mingguan
  - `fetchUserProfile()`
  - `sendHeartbeat()` dan interval heartbeat
  - `hasCheckedInToday()`
  - `handleCheckIn()`
  - `handleExchange()`
  - logika seleksi item/partner aktif
  - render data profil dan saldo user di dashboard

- [frontend/app/dashboard/quest/page.tsx](../frontend/app/dashboard/quest/page.tsx)
  - progress quest
  - validasi completion quest
  - timer/countdown yang dibuat lebih efisien
  - sinkronisasi quest dengan `activeItem` dan status check-in

#### Fokus perubahan
- dashboard user dibuat lebih stabil dalam menampilkan saldo, reward, dan status check-in
- bonus dan exchange coin/ticket ditangani dengan validasi yang lebih jelas
- quest progress dibatasi sesuai target dan tidak lagi bergantung pada data yang stale
- timer di quest tidak lagi membuat seluruh card re-render berlebihan

---

### 2.4 Frontend: admin dashboard, CMS content, dan approval pendaftaran

#### File utama
- [frontend/app/admin/dashboard/page.tsx](../frontend/app/admin/dashboard/page.tsx)

#### Area yang terdampak
- CMS content management
- tab Hero, Video, Auth, Approval Register, User Approved, Tips, Artikel
- `fetchPendingRegistrations()`
- `fetchApprovedUsers()`
- `handleRegistrationAction()`
- `handleDeleteApprovedUser()`
- `handleSave()`
- struktur `articles_section`
- slug artikel untuk URL yang lebih stabil

#### Fokus perubahan
- admin dapat mengelola konten publik dari UI
- pendaftaran siswa dapat diapprove/reject dari dashboard
- content artikel dan landing page dapat disimpan dengan data slug yang lebih aman
- admin dashboard dipersiapkan untuk kebutuhan CMS yang lebih rapi dan scalable

---

### 2.5 Frontend: artikel, landing page, dan alur navigasi konten

#### File utama
- [frontend/app/page.tsx](../frontend/app/page.tsx)
- [frontend/app/artikel/page.tsx](../frontend/app/artikel/page.tsx)
- [frontend/app/artikel/[id]/page.tsx](../frontend/app/artikel/[id]/page.tsx)
- [frontend/lib/axios.ts](../frontend/lib/axios.ts)

#### Area yang terdampak
- [frontend/app/page.tsx](../frontend/app/page.tsx)
  - `fetchData()`
  - `handleJudgeLogin()`
  - landing page section `Artikel Edukasi`
  - tombol masuk mode juri dan redirect tujuan

- [frontend/app/artikel/page.tsx](../frontend/app/artikel/page.tsx)
  - `error` handling
  - `retry` handling
  - `Link` untuk detail artikel
  - card article layout responsif

- [frontend/app/artikel/[id]/page.tsx](../frontend/app/artikel/[id]/page.tsx)
  - pencarian artikel berdasarkan `slug` dengan fallback ke index lama
  - state loading / error / artikel tidak ditemukan
  - tombol kembali ke halaman artikel

- [frontend/lib/axios.ts](../frontend/lib/axios.ts)
  - konfigurasi request HTTP dan penanganan error API

#### Fokus perubahan
- tombol dari landing page diarahkan ke halaman daftar artikel yang benar, bukan ke detail artikel yang belum stabil
- artikel diidentifikasi dengan `slug` agar link lebih aman saat data berubah
- error network dan API failure ditangani dengan pesan yang jelas
- layout artikel dibuat lebih responsif dan tidak meluber saat mobile

---

### 2.6 Frontend: halaman login, middleware, dan visibility autentikasi

#### File utama
- [frontend/app/login/page.tsx](../frontend/app/login/page.tsx)
- [frontend/middleware.ts](../frontend/middleware.ts)

#### Area yang terdampak
- [frontend/app/login/page.tsx](../frontend/app/login/page.tsx)
  - `useEffect` pengecekan token dan redirect
  - `fetchContent()`
  - `onSubmit()` login
  - `handleJudgeLogin()`
  - visibility tombol masuk dan daftar

- [frontend/middleware.ts](../frontend/middleware.ts)
  - proteksi route berdasarkan token dan status login

#### Fokus perubahan
- user yang sudah login tidak kembali ditampilkan form login/register
- token yang tidak valid dibersihkan agar user tetap bisa login ulang
- user diarahkan otomatis ke dashboard yang sesuai role
- middleware menjaga redirect dan akses route agar lebih konsisten

---

## 3. Catatan penting dari seluruh perubahan

Beberapa poin penting yang sudah menjadi fokus sepanjang update adalah:

1. Data user dibuat lebih lengkap untuk mendukung skor, quest, reward, dan status online.
2. Logika game dan leaderboard dibuat agar weekly reward dan total score lebih konsisten.
3. Dashboard user diperbarui agar check-in, exchange, quest, dan reward terlihat jelas di sisi UX.
4. Admin dashboard diperluas untuk CMS dan approval akun agar operasional website lebih terukur.
5. Halaman artikel dan login diperbarui agar alur navigasi, visibility, dan error handling lebih konsisten.
6. Semua perubahan diarahkan agar frontend dan backend tetap sinkron dalam data score, coin, quest, dan status user.

---

## 4. Ringkasan final

Berdasarkan review pada repo dan isi changelog sebelumnya, area yang paling tercatat sebagai titik perubahan utama adalah:

- [backend/src/games/games.service.ts](../backend/src/games/games.service.ts)
- [backend/src/schemas/user.schema.ts](../backend/src/schemas/user.schema.ts)
- [backend/src/users/users.service.ts](../backend/src/users/users.service.ts)
- [backend/src/users/users.controller.ts](../backend/src/users/users.controller.ts)
- [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
- [frontend/app/dashboard/page.tsx](../frontend/app/dashboard/page.tsx)
- [frontend/app/dashboard/quest/page.tsx](../frontend/app/dashboard/quest/page.tsx)
- [frontend/app/admin/dashboard/page.tsx](../frontend/app/admin/dashboard/page.tsx)
- [frontend/app/page.tsx](../frontend/app/page.tsx)
- [frontend/app/artikel/page.tsx](../frontend/app/artikel/page.tsx)
- [frontend/app/artikel/[id]/page.tsx](../frontend/app/artikel/[id]/page.tsx)
- [frontend/app/login/page.tsx](../frontend/app/login/page.tsx)
- [frontend/middleware.ts](../frontend/middleware.ts)

Dokumen ini dibuat sebagai dokumentasi traceability untuk review perubahan, debugging, dan pengembangan lanjutan di masa depan.
