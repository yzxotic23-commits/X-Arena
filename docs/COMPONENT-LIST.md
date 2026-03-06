# Daftar Komponen UI – X-Arena Dashboard

Dokumentasi komponen untuk **Button**, **Layout**, **Font**, **Loading State**, dan **Date Slicer** yang dipakai di project X-Arena.

---

## Teknologi yang Dipakai

| Aspek | Teknologi |
|--------|-----------|
| **Framework** | Next.js 15 + React 18 |
| **Bahasa** | TypeScript |
| **Styling** | **Tailwind CSS** + **CSS (globals.css)** |
| **Komponen** | **React (TSX)** – komponen reusable + UI primitives |
| **Animasi** | Framer Motion |
| **Ikon** | Lucide React |
| **Utility class** | `cn()` dari `@/lib/utils` (clsx + tailwind-merge) |

**Ringkasan:** Tampilan diatur dengan **Tailwind CSS** dan **CSS global**; struktur dan perilaku dengan **React/Next.js**. Tidak pakai CSS-in-JS (styled-components, emotion). Font di-load lewat Google Fonts dan dipakai lewat CSS/Tailwind.

---

## 1. Button

### Sumber
- **File:** `components/ui/button.tsx`
- **Tipe:** React component (TSX) + Tailwind CSS

### API (Props)

| Prop | Tipe | Default | Keterangan |
|------|------|--------|------------|
| `variant` | `"default"` \| `"outline"` \| `"ghost"` | `"default"` | Gaya tombol |
| `size` | `"default"` \| `"sm"` \| `"lg"` | `"default"` | Ukuran |
| `className` | `string` | - | Kelas tambahan (Tailwind) |
| Semua props native `<button>` | - | - | `onClick`, `disabled`, `children`, dll. |

### Variant

| Variant | Kelas utama (Tailwind) | Tampilan |
|--------|-------------------------|----------|
| **default** | `bg-primary hover:bg-primary-dark text-white shadow-md` | Tombol isi (merah Nintendo) |
| **outline** | `border-2 border-primary text-primary hover:bg-primary/10` | Border saja, isi transparan |
| **ghost** | `hover:bg-primary/10 hover:text-primary` | Tanpa border, hover halus |

### Size

| Size | Kelas |
|------|--------|
| **default** | `h-10 px-4 py-2` |
| **sm** | `h-9 px-3 text-sm` |
| **lg** | `h-11 px-8` |

### Warna (Tailwind)
- `primary`: `#E60012` (Nintendo Red) – dari `tailwind.config.ts`
- `primary-dark`: `#CC0000`

### Contoh penggunaan

```tsx
import { Button } from '@/components/ui/button';

<Button>Simpan</Button>
<Button variant="outline" size="sm">Batal</Button>
<Button variant="ghost" size="lg">Selengkapnya</Button>
<Button disabled>Loading...</Button>
```

### Pemakaian lain
- **FilterButtons** (`components/FilterButtons.tsx`): filter “Squad → Personal” / “Squad → Brand” memakai `<button>` + Tailwind (bukan komponen `Button`).
- Dropdown (User, Month, Cycle) di `app/page.tsx`: memakai `<Button variant="outline" size="sm">` + kelas tambahan (mis. `bg-primary text-white`).

---

## 2. Layout

### Sumber
- **Root layout:** `app/layout.tsx`
- **Halaman utama:** `app/page.tsx`
- **Komponen:** `components/Sidebar.tsx`, `components/Header.tsx`
- **Styling:** Tailwind CSS + `app/globals.css` (CSS variables)

### Struktur layout

```
<html>
  <body>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            {children}   ← app/page.tsx (Dashboard)
            <ToastContainerWrapper />
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </body>
</html>
```

### Layout halaman dashboard (`app/page.tsx`)

```
div.min-h-screen (wrapper)
├── Sidebar (navigasi kiri, bisa collapse)
└── div.flex-1 (konten)
    ├── Header (atas: jam, cuaca, profil, notifikasi, tema, bahasa)
    └── main (area konten scroll)
        └── Konten per menu (Overview, Leaderboard, Reports, dll.)
```

### Kelas layout utama (Tailwind)

| Elemen | Kelas |
|--------|--------|
| Wrapper halaman | `min-h-screen bg-background flex relative z-10` |
| Area konten (setelah sidebar) | `flex-1 lg:ml-64` (atau `lg:ml-20` saat collapsed) |
| Main content | `flex-1 w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto` |
| Grid dashboard | `grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6`, `grid-cols-1 lg:grid-cols-2` |

### Sidebar
- **File:** `components/Sidebar.tsx`
- **Fitur:** collapse/expand, submenu (Settings), ikon Lucide, animasi Framer Motion.
- **Lebar:** lebar penuh saat expand, hanya ikon saat collapse (mis. `lg:ml-64` → `lg:ml-20`).

### CSS variables (globals.css) untuk tema
- `--background`, `--foreground`, `--border`
- `--card-bg`, `--card-border`
- `--bg-secondary`, `--bg-card`, `--border-card`, `--text-primary`, `--text-secondary`
- Dark: background bisa pakai gambar (`url('/background-layout/dark-blur.jpg')`).

---

## 3. Font

### Sumber
- **Definisi:** `app/globals.css` (import Google Fonts + `font-family`)
- **Tailwind:** `tailwind.config.ts` (`fontFamily.heading`, `fontFamily.body`)

### Font yang dipakai

| Font | Sumber | Penggunaan |
|------|--------|------------|
| **Poppins** | Google Fonts | Body & heading utama (default) |
| **Orbitron** | Google Fonts | Tersedia (di-import), dipakai di kelas tertentu jika ada |
| **Inter** | Google Fonts | Tersedia (di-import) |

### Import (globals.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
```

### Pemakaian di CSS

- **Body:** `font-family: 'Poppins', sans-serif;` (di `body` dan beberapa komponen).
- **Tailwind:**  
  - `font-heading`: `['Poppins', 'sans-serif']`  
  - `font-body`: `['Poppins', 'sans-serif']`  
  Jadi kelas `font-heading` / `font-body` pakai Poppins.

### Contoh di komponen
- Card title: `font-heading font-bold` (dari `components/ui/card.tsx`).

---

## 4. Loading State

### Sumber
- **File:** `components/Loading.tsx`
- **Teknologi:** React + Framer Motion + Tailwind CSS

### API (Props)

| Prop | Tipe | Default | Keterangan |
|------|------|--------|------------|
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Ukuran elemen loading |
| `text` | `string` | - | Teks di bawah/belakang animasi |
| `variant` | `'default'` \| `'gaming'` \| `'gaming-coin'` \| `'minimal'` | `'gaming'` | Jenis tampilan loading |

### Variant

| Variant | Deskripsi |
|--------|-----------|
| **default** | Spinner putar (border-top) + teks opsional |
| **gaming** | Karakter Mario + question block + koin (animasi Framer Motion) |
| **gaming-coin** | Hanya teks + 3 koin animasi (tanpa Mario) |
| **minimal** | Spinner kecil + teks opsional |

### Ukuran (size)
- **sm:** elemen lebih kecil (spinner/coin/Mario).
- **md / lg:** proporsi lebih besar (detail di `Loading.tsx`: pixel untuk Mario, block, coin).

### Contoh penggunaan

```tsx
import { Loading } from '@/components/Loading';

<Loading size="lg" text="Loading..." variant="gaming" />
<Loading size="md" variant="minimal" text="Memuat..." />
<Loading variant="gaming-coin" text="Processing..." />
```

### Pemakaian di app
- Auth loading: `<Loading size="lg" text={translations.common.loading} variant="gaming" />`
- Overview: `<Loading size="lg" text={`Loading ${translations.nav.overview}...`} variant="gaming" />`

---

## 5. Date Slicer

### Sumber
- **Implementasi:** Custom React state + Tailwind (bukan library date picker eksternal).
- **Lokasi:** `app/page.tsx` (Overview), `components/pages/ReportsPage.tsx` (Reports).
- **Library tanggal:** `date-fns` dipakai untuk perhitungan/format (bukan untuk UI date picker).

### Jenis “slicer” yang ada

1. **Month slicer**  
   - Pilih bulan dalam format `YYYY-MM` (tahun = tahun berjalan).  
   - UI: tombol yang menampilkan nama bulan (Jan–Dec), dropdown daftar bulan.  
   - State: `selectedMonth`, `setSelectedMonth`, `showMonthDropdown`.

2. **Cycle slicer**  
   - Opsi: `All`, `Cycle 1`, `Cycle 2`, `Cycle 3`, `Cycle 4`.  
   - Cycle 1: 1–7, Cycle 2: 8–14, Cycle 3: 15–21, Cycle 4: 22–akhir bulan.  
   - State: `selectedCycle`, `setSelectedCycle`, `showCycleDropdown`.

3. **Date range picker (opsional)**  
   - Di `app/page.tsx`: state `dateRange` (`start`, `end`) dan `showDateRangePicker`.  
   - Bisa dipakai untuk rentang kustom (implementasi UI bisa pakai input `type="date"` atau custom picker).

### Implementasi UI (Ringkas)

- **Month & Cycle:**  
  - `<Button variant="outline" size="sm">` untuk trigger.  
  - Dropdown: `div` absolut dengan daftar `<button>` (bulan atau cycle).  
  - Kelas: `bg-card-inner border border-card-border rounded-md shadow-lg z-50`, item dengan `hover:bg-primary/10`, selected `bg-primary/20 text-primary font-semibold`.

- **Logic tanggal (Reports):**  
  - `getCycleDateRange(monthStr, cycle)` mengembalikan `{ startDate, endDate }` (objek `Date`).  
  - Format ke string untuk query: `formatDateLocal(date)` → `YYYY-MM-DD`.  
  - Filter data (mis. Supabase) dengan `.gte('date', startDateStr).lte('date', endDateStr)`.

### State terkait (contoh di `app/page.tsx`)

```ts
const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
const [selectedCycle, setSelectedCycle] = useState<string>('All');
const [showMonthDropdown, setShowMonthDropdown] = useState(false);
const [showCycleDropdown, setShowCycleDropdown] = useState(false);
const [dateRange, setDateRange] = useState({ start: '', end: '' });
const [showDateRangePicker, setShowDateRangePicker] = useState(false);
```

### Kesimpulan Date Slicer
- **Teknologi:** React (state + event) + Tailwind untuk styling.
- **Tanpa:** Komponen date picker pihak ketiga (react-datepicker, dll.); hanya `date-fns` untuk perhitungan/format.

---

## Ringkasan File Penting

| Komponen | File | Teknologi |
|----------|------|-----------|
| Button | `components/ui/button.tsx` | React + Tailwind |
| Card | `components/ui/card.tsx` | React + Tailwind |
| Layout | `app/layout.tsx`, `app/page.tsx`, `Sidebar.tsx`, `Header.tsx` | React + Tailwind + CSS |
| Font | `app/globals.css`, `tailwind.config.ts` | CSS + Tailwind |
| Loading | `components/Loading.tsx` | React + Framer Motion + Tailwind |
| Date Slicer | `app/page.tsx`, `components/pages/ReportsPage.tsx` | React (state) + Tailwind + date-fns (logic) |

---

## Apakah Pakai CSS atau React?

- **Styling:** **CSS** (termasuk Tailwind dan `globals.css`). Semua komponen di atas memakai kelas Tailwind dan/atau variabel CSS.
- **Struktur & perilaku:** **React (TSX)** – komponen, state, event, conditional render.
- **Animasi loading:** **Framer Motion** (React library) dengan style inline/Tailwind.

Jadi: **kombinasi React (Next.js) + Tailwind CSS + CSS global**; tidak pakai CSS-in-JS murni.
