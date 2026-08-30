# Changelog 6

## 1. Penyesuaian wallet dan ekonomi aplikasi

Pada tahap ini, area ekonomi aplikasi dibenahi agar sistem coin, ticket, dan poin memiliki aturan yang jelas dan konsisten.

### Perubahan utama
- wallet user menampilkan saldo yang nyata dan tidak hanya visual
- exchange coin ke ticket dibuat dengan validasi saldo
- reward check-in diperbarui agar tidak lagi memberi ticket secara tidak sengaja
- logika coin, ticket, dan score dipisahkan agar lebih mudah dipelihara

### Area yang terlibat
- [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx)
- [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)
- [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts)
- [backend/src/schemas/user.schema.ts](backend/src/schemas/user.schema.ts)

### Aturan yang diterapkan
- check-in memberi reward `+10 coins`
- ticket hanya bertambah melalui exchange valid
- scan sampah memberi `+5 coins + 5 points`
- saldo tidak boleh negatif dan exchange harus divalidasi server-side

## 2. Fix quest progress agar sesuai target

Quest yang berhubungan dengan progres numerik diperbaiki agar tidak melebihi target yang sudah ditetapkan.

### Masalah yang ditemukan
- quest tertentu bisa bertambah melebihi cap target
- progress dapat terlihat tidak realistis ketika nilai target sudah tercapai
- beberapa quest terikat pada record yang bisa stale atau tidak merepresentasikan kondisi nyata user

### Solusi yang diterapkan
- progres quest dibatasi maksimal sesuai target
- claim quest dilakukan dengan validasi ulang sebelum dianggap sah
- quest yang berbasis availability seperti check-in diambil dari kondisi nyata user, bukan hanya dari progres tersimpan

### Area yang terlibat
- [backend/src/quests/quests.service.ts](backend/src/quests/quests.service.ts)
- [frontend/app/dashboard/quest/page.tsx](frontend/app/dashboard/quest/page.tsx)

## 3. Fix quest `Rawat Partner` berdasarkan availability check-in

Quest `Rawat Partner` menjadi fokus khusus karena sebelumnya dapat gagal atau tidak konsisten karena logikanya terlalu tergantung pada data progress yang tersimpan.

### Root cause
Data progress quest tidak selalu menjadi sumber kebenaran untuk quest yang berbasis ketersediaan hari ini. Untuk quest seperti check-in, sumber kebenaran yang valid adalah status availability user yang benar-benar terjadi saat ini.

### Perbaikan
- pengecekan completion quest didasarkan pada `activeItem.lastCheckIn`
- sistem menganggap quest sudah valid jika user benar-benar melakukan check-in pada hari yang aktif
- jika data stale ditemukan, proses claim dan pengecekan dilakukan ulang agar user tidak terhambat oleh rekam jejak lama

### Area yang terlibat
- [backend/src/items/items.service.ts](backend/src/items/items.service.ts)
- [backend/src/quests/quests.service.ts](backend/src/quests/quests.service.ts)

## 4. Integrasi poin scan ke total score

Pada fitur scan sampah, sistem reward diperbarui agar poin yang didapat benar-benar masuk ke total skor pengguna.

### Perubahan yang dilakukan
- `scanPoints` ditambahkan ke schema user
- `totalScore` dihitung kembali agar memuat:
  - skor game
  - skor scan
- score total diharapkan bisa semudah mungkin mendukung fitur leaderboard atau profil skor tinggi di masa depan

### Area yang terlibat
- [backend/src/garbage/garbage.service.ts](backend/src/garbage/garbage.service.ts)
- [backend/src/games/games.service.ts](backend/src/games/games.service.ts)
- [backend/src/schemas/user.schema.ts](backend/src/schemas/user.schema.ts)
- [frontend/app/dashboard/scan/page.tsx](frontend/app/dashboard/scan/page.tsx)

### Reward yang diberikan
- setiap scan sampah: `+5 coins`
- setiap scan sampah: `+5 points`

## 5. Perbaikan UI quest agar tidak re-render berlebihan

Pada frontend, timer quest sebelumnya membuat seluruh card quest ikut re-render saat detik berubah. Hal ini membuat tampilan terasa bergoyang atau tidak stabil.

### Solusi
- timer dibuat terisolasi dalam komponen khusus
- interval dibuat hanya pada bagian countdown
- render utama quest tidak ikut dipaksa ulang berulang-ulang

### File utama
- [frontend/app/dashboard/quest/page.tsx](frontend/app/dashboard/quest/page.tsx)

## 6. Persiapan untuk fitur skor tinggi dan profil masa depan

Perbaikan sistem skor saat ini dibuat agar kompatibel dengan kebutuhan pengembangan berikutnya, seperti:

- weekly high score
- all-time score
- leaderboard user
- profile ringkasan performa

### Prinsip yang diterapkan
- skor game dipertahankan dalam bentuk terpisah per kategori
- scan points ditambahkan sebagai sumber skor tambahan
- total score dibuat sebagai agregat yang konsisten dan bisa diperluas di masa depan

## 7. Ringkasan akhir

Update lanjut yang dimasukkan pada tahap ini berfokus pada tiga hal utama:

1. memperbaiki ekonomi aplikasi agar coin, ticket, dan points konsisten
2. memastikan quest completion mengikuti kondisi nyata user, bukan data rekam jejak yang mungkin stale
3. menghubungkan scan dan check-in ke total score yang benar agar siap untuk fitur lanjutan seperti leaderboard dan profil high score

Semua perubahan ini memperkuat konsistensi data antara frontend dan backend, serta menyiapkan sistem agar lebih mudah dikembangkan tanpa mengorbankan logika reward yang sudah ada.
