# WarungCuan

Buat warung mama makin cuan — aplikasi Point-of-Sale (POS) berbasis web untuk membantu pencatatan penjualan, manajemen stok, retur, hutang pelanggan, dan laporan sederhana yang mudah digunakan.

## Fitur Utama
- Kasir (POS) cepat untuk transaksi harian
- Katalog stok & pengaturan harga termasuk multiple price tiers
- Pencatatan stok masuk (supplier / sales)
- Retur barang dan penyesuaian stok
- Buku hutang pelanggan (kasbon) dan pencatatan pembayaran
- Laporan penjualan & laba rugi
- Pengaturan toko (nama, footer, ukuran cetak struk, dsb.)

## Stack
- Language: TypeScript (React)
- Framework / runtime: Vite + React (client-side)
- Notable libraries:
  - Tailwind CSS (UI)
  - Recharts (grafik / laporan)
  - lucide-react (ikon)
  - dotenv / express (untuk kebutuhan env / server ringan jika diperlukan)

## Struktur Proyek (top-level)

```
.env.example          # contoh variabel lingkungan
.gitignore
assets/               # aset statis (gambar, icon, dsb.)
bun.lock              # file lock (mengindikasikan kompatibilitas Bun)
index.html
metadata.json
package.json
src/                  # sumber aplikasi (TypeScript + React)
tsconfig.json
vite.config.ts
```

Struktur penting dalam src/:

```
src/
  App.tsx             # entry UI utama, routing tab internal
  main.tsx            # mount React
  index.css           # gaya global (Tailwind)
  types.ts            # tipe TypeScript untuk domain (produk, transaksi, hutang, dsb.)
  context/
    StoreContext.tsx  # state global / store aplikasi
  components/
    POSView.tsx
    StockCatalog.tsx
    StockIncomingView.tsx
    StockReturnView.tsx
    DebtView.tsx
    ReportView.tsx
    SettingsView.tsx
    Sidebar.tsx
    StockAdjustmentModal.tsx
  utils/               # utilitas umum
  data/                # data mock / seed (jika ada)
```

Bagaimana semuanya bekerja (singkat):
- Aplikasi adalah SPA React yang di-boot melalui Vite. `StoreContext` menyediakan state global (active tab, pengaturan toko, daftar produk, transaksi). `App.tsx` menampilkan sidebar / menu dan memilih view yang relevan (POS, Stok, Laporan, dsb.). Komponen di `src/components` menangani UI dan logika fitur utama.

## Persyaratan
- Node.js (saran: Node 18+) atau Bun (repo mengandung `bun.lock`).
- NPM / Yarn / Bun untuk instalasi dependency.

## Instalasi (dari clone)
Jalankan perintah berikut di terminal:

```bash
# clone repo
git clone https://github.com/Christiano167/WarungCuan.git
cd WarungCuan

# instal dependency (pilih salah satu)
npm install
# atau
# yarn
# atau (jika menggunakan Bun)
# bun install

# jalankan development server
npm run dev
```

Aplikasi dev berjalan di port 3000 (script dev mengeksekusi `vite --port=3000 --host=0.0.0.0`).

Perintah penting lainnya:

```bash
# build untuk produksi
npm run build

# preview hasil build (lokal)
npm run preview

# bersihkan output
npm run clean

# cek tipe / lint (TypeScript)
npm run lint
```

## Konfigurasi environment
- Ada file `.env.example` di root. Salin dan ubah sesuai kebutuhan:

```bash
cp .env.example .env
# lalu edit .env sesuai variabel yang diperlukan
```

Isi variabel env tergantung integrasi yang dipakai (mis. API keys, konfigurasi server). Jika aplikasi hanya frontend, file .env biasanya untuk konfigurasi build atau koneksi ke layanan eksternal.

## Cara penggunaan singkat
- Buka aplikasi di browser (http://localhost:3000)
- Gunakan menu (Kasir, Stok & Harga, Stok Masuk, Retur, Hutang, Laporan, Pengaturan)
- Di Pengaturan, ubah nama toko dan preferensi lain agar muncul di header/struk

## Pengembangan & kontribusi
- Ikuti pola komponen di `src/components` dan tipe di `src/types.ts`.
- Gunakan `StoreContext` untuk state global agar perilaku konsisten.
- Buka issue jika menemukan bug atau fitur yang ingin ditambahkan; kirim PR dengan deskripsi jelas dan screenshot bila perlu.
- Jalankan `npm run lint` sebelum PR untuk memastikan tidak ada error tipe.

## Testing & quality
- Saat ini tidak ada suite testing yang otomatis — tambahkan tests sesuai konvensi repo jika ingin memperkuat kualitas.
- Gunakan TypeScript (ketat) dan `npm run lint` untuk cek tipe.

## Deployment (singkat)
- Build: `npm run build`
- Hasil build ada di `dist/`. Deploy sebagai static site (Netlify, Vercel, atau server static lain). Jika menggunakan server Node/Express untuk fitur backend, sesuaikan konfigurasi server untuk serve static files dari `dist/`.

## Lisensi
- Belum ditentukan dalam repo — tambahkan file `LICENSE` sesuai preferensi (mis. MIT) jika ingin mengizinkan kontribusi publik.

## Kontak
- Pemilik repo: @Christiano167  
- Gunakan GitHub Issues untuk laporan bug, permintaan fitur, atau diskusi implementasi.

---
