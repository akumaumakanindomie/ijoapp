# Changelog 4

## 1. Fokus perubahan utama

Update yang dibahas pada tahap ini berfokus pada logika sistem reward dan progres quest yang lebih konsisten, terutama pada area berikut:

- [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx)
- [frontend/app/dashboard/quest/page.tsx](frontend/app/dashboard/quest/page.tsx)
- [frontend/app/dashboard/scan/page.tsx](frontend/app/dashboard/scan/page.tsx)
- [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts)
- [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)
- [backend/src/items/items.service.ts](backend/src/items/items.service.ts)
- [backend/src/garbage/garbage.service.ts](backend/src/garbage/garbage.service.ts)
- [backend/src/games/games.service.ts](backend/src/games/games.service.ts)
- [backend/src/quests/quests.service.ts](backend/src/quests/quests.service.ts)
- [backend/src/schemas/user.schema.ts](backend/src/schemas/user.schema.ts)

## 2. Penambahan tombol exchange coin ke ticket

Pada dashboard, box dompet dibuat memiliki tombol exchange yang memungkinkan user menukar Ijo Coins menjadi Ijo Tickets.

### Perubahan yang dilakukan
- Tombol `Exchange` ditempatkan di sisi kanan box saldo Ijo Coins.
- Label keterangan ditambahkan: `30 coins = 1 ticket`.
- Validasi dicek di frontend dan backend agar user tidak bisa menukar jika saldo kurang dari 30.
- Endpoint baru dibuat untuk proses exchange.

### File utama
- [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx)
- [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts)
- [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)

### Mekanisme
- frontend memanggil `POST /auth/exchange-coins`
- backend melakukan update atomik:
  - saldo `ijoCoins` berkurang 30
  - saldo `gameTickets` bertambah 1
- jika saldo tidak cukup, server mengembalikan error yang jelas

## 3. Perbaikan timer quest agar tidak membuat box bergetar

Pada halaman quest, timer reset diubah agar hanya komponen countdown yang rerender setiap detik, bukan seluruh section atau seluruh card quest.

### Perubahan yang dilakukan
- logika timer dipisahkan ke komponen lokal `QuestCountdown`
- `useEffect` untuk setInterval dibatasi pada elemen countdown
- state `tick` yang sebelumnya digunakan untuk memaksa rerender dihapus

### File utama
- [frontend/app/dashboard/quest/page.tsx](frontend/app/dashboard/quest/page.tsx)

### Hasil
- saat timer berjalan, layout dan card quest tidak ikut “jedag-jedug” karena state rerender tidak membebani seluruh komponen besar

## 4. Fix progress quest `Raih 200 Poin`

Quest `Raih 200 Poin` diperbaiki agar progres mengikuti target dan tidak terus bertambah di luar batas maksimal.

### Perubahan yang dilakukan
- progress quest dibatasi supaya tidak melebihi target quest
- pada backend, nilai progress untuk quest tertentu di-simpan dengan `Math.min(target, progress + amount)`
- state UI menampilkan progres maksimum `200/200` saat target sudah tercapai

### File utama
- [backend/src/quests/quests.service.ts](backend/src/quests/quests.service.ts)
- [frontend/app/dashboard/quest/page.tsx](frontend/app/dashboard/quest/page.tsx)

### Tujuan
- mencegah progress bertambah tanpa batas
- memastikan quest yang sudah mencapai target tampil dengan nilai maksimal yang benar
- mempermudah integrasi ke sistem skor mingguan atau high score di masa depan

## 5. Fix reward dan quest check-in pada box `Setia`

Pada fitur check-in di box `Setia`, mekanisme reward diubah agar tidak lagi memberi ticket.

### Perubahan yang dilakukan
- reward check-in berubah dari tiket menjadi `+10 Coins`
- quest `Rawat Partner` tidak lagi bergantung pada record quest yang mungkin stale
- progres quest `daily-checkin` sekarang diperiksa berdasarkan `activeItem.lastCheckIn` yang valid untuk hari ini

### File utama
- [backend/src/items/items.service.ts](backend/src/items/items.service.ts)
- [backend/src/quests/quests.service.ts](backend/src/quests/quests.service.ts)
- [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx)

### Mekanisme
- saat user check-in berhasil:
  - XP bertambah
  - `ijoCoins` bertambah 10
  - `gameTickets` tidak berubah
  - quest `Rawat Partner` dinyatakan selesai jika user sudah check-in hari ini
- Keterlambatan atau stale record quest ditangani dengan logika penyelarasan saat claim / request data quest

## 6. Fix scan sampah: coin dan points masuk ke skor total

Pada fitur Pilah2, mekanisme scan diperbarui agar rewardnya sesuai kebutuhan baru:

- user mendapatkan `+5 Coins`
- user mendapatkan `+5 Points`
- poin scan masuk ke akumulasi skor total user secara keseluruhan

### File utama
- [backend/src/garbage/garbage.service.ts](backend/src/garbage/garbage.service.ts)
- [backend/src/games/games.service.ts](backend/src/games/games.service.ts)
- [backend/src/schemas/user.schema.ts](backend/src/schemas/user.schema.ts)
- [frontend/app/dashboard/scan/page.tsx](frontend/app/dashboard/scan/page.tsx)

### Perubahan data
- ditambahkan field `scanPoints` pada user schema
- `totalScore` dihitung ulang untuk mencakup:
  - skor permainan per game
  - poin scan
- skor game tetap dipertahankan per kategori (`catcher`, `snake`, `quiz`) agar integrasi ke weekly high score atau all-time high score tetap terbuka di masa depan

### Output API
- response scan sekarang mengembalikan informasi reward yang jelas, misalnya:
  - `+5 Coins, +5 Points`
  - `scanPoints`
  - `totalScore`

## 7. Integrasi skor untuk pengembangan ke depan

Sistem skor saat ini dibuat agar lebih siap untuk fitur berikutnya, seperti:

- weekly high score
- all-time high score
- leaderboard profile
- perbandingan performa user

### Prinsip yang diterapkan
- skor game tetap dipisahkan per kategori
- skor scan dikelola sebagai bagian dari total score user
- total score tidak menghapus atau menimpa skor game lama
- struktur data dibuat agar mudah diteruskan ke kebutuhan profil maupun leaderboard nanti

### File utama
- [backend/src/schemas/user.schema.ts](backend/src/schemas/user.schema.ts)
- [backend/src/games/games.service.ts](backend/src/games/games.service.ts)
- [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)

## 8. Ringkasan file yang banyak terdampak

### Frontend
- [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx)
  - wallet box
  - exchange button
  - reward check-in

- [frontend/app/dashboard/quest/page.tsx](frontend/app/dashboard/quest/page.tsx)
  - quest countdown fix
  - progress cap
  - completion logic

- [frontend/app/dashboard/scan/page.tsx](frontend/app/dashboard/scan/page.tsx)
  - reward toast scan
  - info reward poin dan coin

### Backend
- [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)
  - exchange logic
  - profile response termasuk score data yang relevan

- [backend/src/items/items.service.ts](backend/src/items/items.service.ts)
  - reward check-in
  - quest progress `daily-checkin`

- [backend/src/garbage/garbage.service.ts](backend/src/garbage/garbage.service.ts)
  - reward scan coin + points
  - total score update

- [backend/src/games/games.service.ts](backend/src/games/games.service.ts)
  - aggregasi skor total
  - integrasi skor game + scan

- [backend/src/quests/quests.service.ts](backend/src/quests/quests.service.ts)
  - quest progress cap
  - quest completion logic berdasarkan availability

- [backend/src/schemas/user.schema.ts](backend/src/schemas/user.schema.ts)
  - data skor dan poin user

## 9. Kesimpulan

Update yang dibahas dalam percakapan ini memusatkan perhatian pada empat hal utama:

1. wallet dan exchange coin-to-ticket
2. quest progress dan logic completion
3. reward check-in dan scan yang benar-benar sesuai kebutuhan produk
4. integrasi poin dan skor yang siap untuk fitur high score mendatang

Dengan perubahan ini, sistem reward dan quest menjadi lebih konsisten, lebih dapat diprediksi, dan lebih siap untuk pengembangan lanjutan di profil, leaderboard, serta riwayat skor user.
