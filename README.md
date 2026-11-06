# WarungCuan

WarungCuan adalah prototipe aplikasi kasir dan pengelolaan warung berbasis web. Aplikasi menyediakan alur transaksi, katalog produk, stok, retur, hutang pelanggan, laporan, dan pengaturan toko.

## Fitur

- **Kasir:** keranjang belanja, jumlah barang, metode pembayaran tunai/transfer/hutang, dan struk.
- **Produk dan stok:** katalog, harga jual, beberapa pilihan satuan/harga, dan penyesuaian stok.
- **Stok masuk:** pencatatan penambahan barang.
- **Retur:** pencatatan retur barang.
- **Hutang:** data pelanggan, pencatatan bon, dan pembayaran hutang.
- **Laporan:** ringkasan transaksi dan laporan penjualan.
- **Pengaturan:** identitas toko dan preferensi aplikasi.
- **Backup data:** ekspor dan impor data dalam format JSON.

## Teknologi

- React 19 dan TypeScript
- Vite 6
- Tailwind CSS 4
- Recharts
- lucide-react
- Context API untuk state aplikasi

## Persyaratan

- Node.js yang kompatibel dengan Vite 6.
- npm.

## Menjalankan secara lokal

```bash
git clone https://github.com/Christiano167/WarungCuan.git
cd WarungCuan
npm install
npm run dev
```

Vite berjalan pada port **3000** sesuai script di `package.json`.

Buka [http://localhost:3000](http://localhost:3000).

## Script

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Membuat build produksi di `dist/` |
| `npm run preview` | Preview build produksi |
| `npm run lint` | Pemeriksaan TypeScript dengan `tsc --noEmit` |

## Penyimpanan data

Data aplikasi saat ini disimpan di `localStorage` browser. Artinya:

- Data tidak otomatis tersinkron ke perangkat atau browser lain.
- Menghapus data situs/browser dapat menghilangkan data yang tersimpan.
- Gunakan fitur ekspor JSON secara berkala dan simpan file backup di tempat aman.
- Fitur impor JSON dapat digunakan untuk memulihkan data yang diekspor.

Aplikasi ini belum menggunakan akun pengguna atau database cloud untuk sinkronisasi data pada implementasi yang diperiksa.

## Environment

Repository menyediakan file `.env.example` dengan variabel `GEMINI_API_KEY` dan `APP_URL` untuk kebutuhan runtime/integrasi yang sesuai. Di Google AI Studio, ikuti pengaturan Secrets dan environment yang disediakan platform. Jangan menaruh API key asli ke repository atau membagikannya melalui screenshot/log.

Jika menjalankan di luar AI Studio, pastikan cara pemuatan environment sesuai dengan runtime yang digunakan. Jangan menganggap seluruh variabel `.env` otomatis tersedia di kode browser Vite.

## Struktur utama

```text
.
├── assets/
├── src/
│   ├── components/   # Tampilan kasir, stok, hutang, laporan, pengaturan
│   ├── context/      # StoreContext dan state aplikasi
│   ├── data/         # Data awal/demo
│   ├── utils/        # Helper dan formatter
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

## Status dan batasan

WarungCuan merupakan aplikasi frontend yang menyimpan data pada browser. Sebelum dipakai sebagai sistem operasional utama, uji alur transaksi dan lakukan backup data secara rutin. README ini tidak menjanjikan sinkronisasi cloud, multi-user, atau integrasi pembayaran yang belum tersedia pada implementasi saat ini.
