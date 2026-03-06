# Changelog UI/UX (Before & After)

Ringkasan singkat perubahan tampilan dan pengalaman.  
**Screenshot:** simpan gambar di folder `changelog-screenshots/` dengan nama file di bawah, lalu isi akan tampil otomatis.

---

## Battle Arena

| Sebelum | Sesudah |
|--------|---------|
| Animasi zoom in/out pada banner | Fade-in saja (tanpa scale) |
| CSS terpisah (`battle-arena.css`) | Semua style di `globals.css` |
| Konten terpisah (`BattleArenaContent.tsx`) | Satu file `BattleArenaPage.tsx` |
| Loading teks generik | Loading "Loading Battle Arena..." + animasi gaming |
| Dropdown Month/Cycle beda style | Button Cycle/Month seperti Leaderboard, posisi center |

**Screenshot (opsional):**
- Before: `changelog-screenshots/battle-arena-before.png`
- After: `changelog-screenshots/battle-arena-after.png`

![Battle Arena - Before](changelog-screenshots/battle-arena-before.png)
*Ganti file di atas dengan screenshot sebelum perubahan.*

![Battle Arena - After](changelog-screenshots/battle-arena-after.png)
*Ganti file di atas dengan screenshot setelah perubahan.*

---

## Sidebar

| Sebelum | Sesudah |
|--------|---------|
| Active state: font terlihat mengecil / layout geser | Ukuran font tetap (`text-sm`), hanya font-weight beda |
| Tanpa efek zoom | Active: zoom in (scale-105 + icon scale-110), inactive: normal |
| Klik terasa shrink | `whileTap: { scale: 1 }` agar frame tidak berubah saat klik |

**Screenshot (opsional):**
- Before: `changelog-screenshots/sidebar-before.png`
- After: `changelog-screenshots/sidebar-after.png`

![Sidebar - Before](changelog-screenshots/sidebar-before.png)

![Sidebar - After](changelog-screenshots/sidebar-after.png)

---

## Landing Page

| Sebelum | Sesudah |
|--------|---------|
| Button "Your Rank" hitam + merah | Outline merah minimal: transparan, border & text merah, hover halus |

**Screenshot (opsional):**
- Before: `changelog-screenshots/landing-your-rank-before.png`
- After: `changelog-screenshots/landing-your-rank-after.png`

![Landing Your Rank - Before](changelog-screenshots/landing-your-rank-before.png)

![Landing Your Rank - After](changelog-screenshots/landing-your-rank-after.png)

---

## PK Score Rules (Baru)

| Fitur | Keterangan |
|-------|------------|
| Halaman baru | Settings → PK Score Rules |
| Score Rules | Input points + opponent effect; **Reset** & **Save** muncul setelah ada perubahan |
| Traffic Source Rules | **Save** & **Cancel** muncul saat form diisi / list berubah |
| Tombol | Semua tombol solid merah |

**Screenshot (opsional):**
- `changelog-screenshots/pk-score-rules.png`

![PK Score Rules](changelog-screenshots/pk-score-rules.png)

---

## Judul Halaman

| Sebelum | Sesudah |
|--------|---------|
| Font judul beda-beda | Semua judul pakai font sama seperti Battle Arena (Poppins / `font-heading`) |

**Screenshot (opsional):**
- `changelog-screenshots/titles-font.png`

![Judul - Font seragam](changelog-screenshots/titles-font.png)

---

## Leaderboard

| Sebelum | Sesudah |
|--------|---------|
| Satu layout penuh | Split screen: atas background `dark-podium.jpg`, bawah ranking & top performers |
| Error fetch merah di console | Gagal fetch hanya `console.warn` di development |

**Screenshot (opsional):**
- Before: `changelog-screenshots/leaderboard-before.png`
- After: `changelog-screenshots/leaderboard-after.png`

![Leaderboard - Before](changelog-screenshots/leaderboard-before.png)

![Leaderboard - After](changelog-screenshots/leaderboard-after.png)

---

## Loading Component

| Sebelum | Sesudah |
|--------|---------|
| Hydration error (theme server vs client) | State `mounted` agar theme konsisten, tidak mismatch |

---

## Lain-lain

- **Scrollbar (dark mode):** Bisa diatur hide atau transparan/glass di `globals.css`.
- **Recent Achievements (Battle Arena):** Animasi loop ticker tetap dipakai.
