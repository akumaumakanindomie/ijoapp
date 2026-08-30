# Changelog 7

## 1. Ringkasan perubahan yang sudah dilakukan

Secara umum, perubahan yang dilakukan mencakup:
- perbaikan logika skor, weekly leaderboard, dan reward coin
- penyesuaian profil user dan presence status
- pengelolaan approval user/admin di backend dan frontend
- pembaruan dashboard siswa untuk check-in, reward, dan exchange coin
- penyesuaian page artikel serta halaman login agar lebih konsisten dengan data CMS
- perbaikan quest dan progress yang sudah dicatat pada changelog sebelumnya

## 2. Daftar file yang berubah berdasarkan hasil review repo

Berikut file yang terdeteksi berubah dalam sesi ini berdasarkan status Git yang terakhir dicek:

- backend/src/auth/auth.service.ts
- backend/src/games/games.service.spec.ts
- backend/src/games/games.service.ts
- backend/src/schemas/user.schema.ts
- backend/src/users/users.controller.ts
- backend/src/users/users.service.spec.ts
- backend/src/users/users.service.ts
- frontend/app/admin/dashboard/page.tsx
- frontend/app/artikel/page.tsx
- frontend/app/dashboard/page.tsx
- frontend/app/dashboard/quest/page.tsx
- frontend/app/login/page.tsx

## 3. Lokasi perubahan utama per file

### 3.1 backend/src/games/games.service.ts
Area utama yang diubah terletak pada bagian:
- `getWeeklyStartDate()` dan `getWeeklyRewardAmount()`; sekitar awal file sampai method `distributeWeeklyLeaderboardRewards()`
- `resetWeeklyScoresIfNeeded()`
- `startGame()`
- `saveScore()`
- `getLeaderboard()`
- `getMyLeaderboardRank()`

Bagian ini menangani:
- penjadwalan weekly leaderboard
- distribusi reward mingguan ke user yang memenuhi kriteria
- pengurangan tiket saat game dimulai
- penyimpanan `totalScore`, `weeklyTotalScore`, dan `weeklyGameScores`
- reward coin berdasarkan skor yang diperoleh
- pengaturan logika progres game dan leaderboard

### 3.2 backend/src/schemas/user.schema.ts
Area utama yang diubah terletak pada bagian definisi schema `User`, khususnya:
- properti `scanPoints`
- properti `gameScores`
- properti `weeklyGameScores`
- properti `totalScore`
- properti `weeklyTotalScore`
- properti `pointHistory`
- properti `quests`
- properti `lastWeeklyRewardAt`

Fungsi logika ini berkaitan dengan pengumpulan skor, histori poin, progress quest, dan reward mingguan.

### 3.3 backend/src/users/users.service.ts
Area utama perubahan terdapat pada:
- `getPresenceState()` dan `heartbeat()`
- `getProfile()`
- `getPublicProfile()`
- `updateProfile()`
- `findAllUsers()` / `findPendingUsers()`
- `updateUserStatus()`
- `deleteUser()`

Isi perubahan di sini mencakup:
- status online/offline pengguna berdasarkan `lastSeen`
- penghitung weekly dan monthly points dari `pointHistory`
- validasi cooldown username
- profile public dan private user
- penanganan admin untuk approve/reject pendaftaran

### 3.4 backend/src/users/users.controller.ts
Area yang diperbarui pada endpoint API:
- `GET /users/profile`
- `PATCH /users/profile`
- `POST /users/heartbeat`
- `GET /users/pending`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id/status`
- `DELETE /users/:id`

Endpoint ini digunakan untuk keperluan autentikasi, profil, akses admin, status pendaftaran, serta data siswa yang sudah disetujui.

### 3.5 frontend/app/dashboard/page.tsx
Area utama yang diubah berada pada bagian:
- state `greeting`, `rewardCountdown`, `rewardDue`
- `useEffect` untuk reset reward mingguan
- `fetchUserProfile()`
- `sendHeartbeat()` dan interval heartbeat
- `hasCheckedInToday()`
- `handleCheckIn()`
- `handleExchange()`
- logika pemilihan item/partner
- pengambilan data profil pengguna di dashboard

Perubahan ini terkait dengan:
- dashboard user setelah login
- validasi check-in harian
- reward mingguan dan countdown
- pertukaran coin ke ticket
- status partner yang aktif

### 3.6 frontend/app/dashboard/quest/page.tsx
File ini turut diperbarui pada perbaikan quest dan UI progress. Area fokusnya meliputi:
- progress quest
- validasi completion quest
- timer/countdown yang dibuat lebih efisien agar tidak menyebabkan re-render berlebihan
- penyelarasan quest dengan data availability user dan status check-in

Dari sisi logika, file ini terkait dengan perbaikan quest yang sudah dijelaskan pada changelog sebelumnya dan ikut masuk dalam pembaruan route/dashboard saat ini.

### 3.7 frontend/app/admin/dashboard/page.tsx
Area utama yang diubah berada pada:
- CMS content management
- tab Hero, Video, Auth, Approval Register, User Approved, Tips, Artikel
- fungsi `fetchPendingRegistrations()`
- fungsi `fetchApprovedUsers()`
- fungsi `handleRegistrationAction()`
- fungsi `handleDeleteApprovedUser()`
- fungsi `handleSave()` untuk menyimpan perubahan konten

Perubahan ini terkait dengan:
- admin dashboard untuk mengelola konten website
- approval pendaftaran akun siswa
- pengelolaan data user yang aktif dan pending
- pengeditan konten landing page, artikel, tips, dan form autentikasi

### 3.8 frontend/app/artikel/page.tsx
Area yang diperbarui meliputi:
- fetching artikel dari `/content/public`
- tampilan navbar untuk user login dan user belum login
- status profile user
- tombol logout
- tampilan daftar artikel dan detail routing artikel

File ini disesuaikan agar artikel dapat ditampilkan dari data yang diatur di CMS.

### 3.9 frontend/app/login/page.tsx
Area utama yang diubah ada pada:
- `useEffect` pengecekan token dan redirect user
- `fetchContent()` untuk memuat konten auth dari backend
- `onSubmit()` login
- `handleJudgeLogin()` untuk akses juri
- tampilan form login dan visual content section

Perubahan ini menyesuaikan halaman login dengan content yang dikelola dari admin CMS serta routing berdasarkan role user/admin.

## 4. Catatan penting

Berikut poin penting yang menjadi fokus update pada sesi ini:
1. Struktur data user dibuat lebih lengkap untuk mendukung skor, quest, dan reward.
2. Logic weekly leaderboard dan reward dibuat agar lebih konsisten dan bisa diaudit.
3. Dashboard user diperbarui agar check-in, exchange coin, dan reward lebih jelas di sisi UX.
4. Admin CMS dan approval flow dibuat lebih lengkap untuk pengelolaan akun dan konten publik.
5. Perubahan-front end dan backend diarahkan agar skor, quest, dan reward tetap konsisten satu sama lain.

## 5. Ringkasan final

Berdasarkan perubahan yang sudah terverifikasi, area terdampak utama adalah:
- backend game logic: `games.service.ts`
- backend user schema: `user.schema.ts`
- backend profile/user management: `users.service.ts` dan `users.controller.ts`
- frontend dashboard: `frontend/app/dashboard/page.tsx`
- frontend admin CMS: `frontend/app/admin/dashboard/page.tsx`
- frontend auth: `frontend/app/login/page.tsx`
- frontend article page: `frontend/app/artikel/page.tsx`
- quest dashboard: `frontend/app/dashboard/quest/page.tsx`

Dokumen ini dibuat sebagai catatan perubahan yang dapat dipakai untuk review, debugging, dan tracking update lanjutan di masa depan.
