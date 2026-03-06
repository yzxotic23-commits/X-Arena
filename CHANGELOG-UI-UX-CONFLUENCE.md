# Changelog UI/UX – Ringkasan Perubahan

Dokumen ini merangkum perubahan tampilan (UI) dan pengalaman pengguna (UX) pada aplikasi X-Arena. Gunakan sebagai referensi di Confluence: salin bagian yang diperlukan, atau tempel seluruhnya lalu sesuaikan format tabel/gambar di Confluence.

---

## 1. Battle Arena

**Perubahan:**
- **Banner:** Animasi zoom in/out diganti menjadi fade-in saja (tanpa scale) agar tidak mengganggu dan menghindari layout shift.
- **Struktur kode:** CSS yang sebelumnya di file terpisah (`battle-arena.css`) dan konten di `BattleArenaContent.tsx` digabung ke dalam satu halaman; style Battle Arena dipindah ke `globals.css`.
- **Loading:** Teks loading menggunakan "Loading Battle Arena..." dengan animasi gaming (konsisten dengan halaman lain).
- **Filter:** Dropdown Month dan Cycle mengikuti style dan perilaku seperti di halaman Leaderboard, dengan posisi tombol di center.

**Before:** Animasi zoom pada banner, CSS dan komponen terpisah, loading generik, filter beda style.  
**After:** Fade-in banner, satu file halaman + style di globals, loading khusus Battle Arena, filter seragam dan center.

---

## 2. Sidebar

**Perubahan:**
- **Active state:** Font tidak lagi terlihat mengecil; ukuran tetap (`text-sm`), hanya font-weight yang berbeda (semibold saat active, medium saat inactive) agar tidak ada layout shift.
- **Zoom:** Menu yang active tampil zoom in (scale-105 untuk tombol, scale-110 untuk icon); yang inactive tetap normal (scale-100).
- **Klik:** Saat diklik, tombol tidak lagi terasa shrink berkat `whileTap: { scale: 1 }`.

**Before:** Font terlihat kecil saat active, tanpa efek zoom, klik terasa shrink.  
**After:** Ukuran font konsisten, active zoom in, klik stabil tanpa perubahan frame.

---

## 3. Landing Page

**Perubahan:**
- Tombol **"Your Rank"** diubah dari gaya hitam dengan aksen merah menjadi **outline merah minimal**: background transparan, teks dan border merah, hover dengan background merah halus.

**Before:** Tombol hitam dengan teks/border merah.  
**After:** Outline merah minimal, lebih bersih dan selaras dengan tema.

---

## 4. PK Score Rules (Halaman Baru)

**Deskripsi:**
- Halaman baru di **Settings → PK Score Rules**.
- Terdiri dari dua kartu: **Score Rules** dan **Traffic Source Rules**.

**Score Rules:**
- Input untuk points (Reactivation, Recommend, Active Member) dan Opponent Effect (None / Decrease / Increase).
- Tombol **Reset** dan **Save** hanya muncul setelah ada perubahan, di pojok kanan bawah kartu.

**Traffic Source Rules:**
- Form untuk menambah traffic source (nama, points, effect).
- Tombol **Save** dan **Cancel** hanya muncul saat form sudah diisi atau list traffic source berubah, di pojok kanan bawah kartu.

**Tombol:** Semua tombol di kedua kartu menggunakan warna **solid merah** (tidak transparan atau outline).

**Before:** Halaman belum ada.  
**After:** Halaman PK Score Rules dengan dua kartu, tombol kontekstual, dan tombol solid merah.

---

## 5. Judul Halaman (Font Seragam)

**Perubahan:**
- Semua judul halaman menggunakan font yang sama dengan Battle Arena: **Poppins** (class `font-heading`).
- Diterapkan di globals.css untuk class judul Battle Arena dan di komponen halaman (AppearanceSettings, PK Score Rules, Targets, dll.).

**Before:** Font judul berbeda-beda per halaman.  
**After:** Semua judul konsisten dengan font Poppins.

---

## 6. Leaderboard

**Perubahan:**
- **Layout:** Halaman diubah menjadi **split screen**. Bagian atas menggunakan background gambar `dark-podium.jpg`; bagian bawah berisi daftar ranking dan top performers.
- **Error handling:** Pesan gagal fetch (avatars, target personal, squad mappings, brand mapping) tidak lagi memakai `console.error`; di development hanya `console.warn` agar tidak membanjiri console dengan error merah. Aplikasi tetap jalan dengan fallback data.

**Before:** Satu layout penuh, error fetch tampil sebagai error merah di console.  
**After:** Split screen dengan background podium di atas, error fetch diperlakukan sebagai peringatan di development.

---

## 7. Loading Component

**Perubahan:**
- Hydration error akibat perbedaan theme (server vs client) diatasi dengan state `mounted`: theme hanya diterapkan setelah komponen ter-mount di client, sehingga hasil render server dan client konsisten.

**Before:** Hydration error saat theme berbeda antara server dan client.  
**After:** Tidak ada hydration error; loading tampil konsisten.

---

## 8. Lain-lain

- **Scrollbar (dark mode):** Opsi untuk menyembunyikan scrollbar atau mengubah tampilannya menjadi transparan/glass dapat diatur di `globals.css`.
- **Recent Achievements (Battle Arena):** Animasi loop ticker pada Recent Achievements tetap dipertahankan, tidak dihapus.

---

## Cara pakai di Confluence

1. Buat halaman baru di Confluence.
2. Salin isi dokumen ini (atau bagian yang perlu) ke body halaman.
3. Ubah heading `##` menjadi heading level 2 di Confluence jika perlu.
4. Untuk tabel: konversi bagian "Before / After" ke tabel Confluence (Insert → Table).
5. Untuk screenshot: sisipkan gambar via Insert → Image, lalu tempatkan di bagian yang sesuai (mis. setelah setiap bagian "After").

Jika perlu versi lebih singkat (hanya poin-poin), bisa dibuat dokumen terpisah berisi bullet list saja.
