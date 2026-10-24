# PRD - Fshare
Versi: 1.4 | Tanggal: 2026-10-24 | Status: Disetujui

## 1. Informasi Umum
- Nama webapp: `Fshare` [USER]
- Tujuan: Web app untuk pencatatan keseharian digital mencakup keuangan, tugas kuliah, dan checklist sholat 5 waktu dengan tampilan mobile friendly dan desktop [USER]
- Mode deploy: B (GitHub Pages + Web App Apps Script Backend) [USER]
- Tema Tampilan: **Dark Mode dengan Nuansa Biru (Obsidian Sapphire + Electric Sky Blue Glassmorphism)** dengan **Animasi Navigasi Glider** (desktop sidebar & mobile bottom bar dock) [USER]
- Folder keluaran: root folder proyek (`d:/02 - Hasil AI/AntiGravity IDE/Fshare`) [ASUMSI-TEKNIS]
- Link exec Apps Script: `https://script.google.com/macros/s/AKfycbz7yeQJ9dsPyrD55p9vqzgFpRHo0fxMWbA1OHVTkJLQFljKJSVbbWbKvOc9m5p30j32SQ/exec` [USER]
- Fitur PWA: Web App Manifest & Service Worker untuk kemampuan install / unduh ke homescreen HP dan Desktop [USER]

## 2. Teks Literal (wajib dipakai persis)
| Lokasi | Teks persis | Sumber |
|---|---|---|
| Nama webapp | `Fshare` | [USER] |
| Subjudul / Deskripsi | `pencatatan keseharian digital` | [USER] |
| Jadwal Sholat Subuh | `Subuh: 04:34 WITA` | [USER] |
| Jadwal Sholat Zuhur | `Zuhur: 11:57 WITA` | [USER] |
| Jadwal Sholat Ashar | `Ashar: 15:13 WITA` | [USER] |
| Jadwal Sholat Maghrib | `Maghrib: 18:00 WITA` | [USER] |
| Jadwal Sholat Isya | `Isya: 19:10 WITA` | [USER] |
| Menu Navigasi | `Beranda`, `Keuangan`, `Tugas Kuliah`, `Sholat 5 Waktu`, `Rekapan` | [USER] / [GAMBAR] |
| Filter Keuangan | `Semua`, `Pemasukan`, `Pengeluaran` | [USER] |
| Tombol PDF Keuangan | `Unduh PDF` | [USER] |
| Aksi Tugas | `Tambah Kategori`, `Tambah Tugas`, `Hapus` | [USER] |
| Field Login / Daftar | `Username`, `Password`, `Masuk`, `Daftar` | [USER] |

Label fungsional standar yang boleh dipakai bila tidak disebut user: Simpan, Batal, Hapus, Cari, Tambah, Edit, Tutup. [ASUMSI-TEKNIS]

Aturan Ikon: Hindari emoticon/emoji sama sekali. Wajib menggunakan ikon SVG inline yang bersih dan modern. [USER]

## 3. Pengguna & Hak Akses
- Sistem akun pengguna mandiri berbasis `Username` dan `Password`. [USER]
- Pendaftaran: Pengguna baru mengisi `Username` dan `Password`, lalu langsung berhasil terdaftar dan langsung masuk ke aplikasi. [USER]
- Login: Pengguna memasukkan `Username` dan `Password` untuk masuk. [USER]
- Isolasi Data: Setiap pengguna hanya dapat melihat dan mengelola data catatan miliknya sendiri (keuangan, tugas kuliah, kategori, dan checklist sholat). [ASUMSI-TEKNIS]
- Hak akses: Single role per akun user. Tidak ada multi-level admin kecuali pengelolaan langsung via Google Spreadsheet oleh pemilik sheet. [ASUMSI-TEKNIS]

## 4. Menu & Fitur

### Menu 0: Autentikasi (Masuk & Daftar)
- Tujuan: Mengamankan data pribadi masing-masing pengguna. [USER]
- Tampilan: Card modern di tengah layar (desktop split view dengan ilustrasi alam teal di sisi kiri, kartu form di sisi kanan; mobile single card elegan). [GAMBAR]
- Tab: Switch antara `Masuk` dan `Daftar`. [GAMBAR]
- Form Field:
  - Input `Username` (dengan icon SVG user)
  - Input `Password` (dengan icon SVG gembok dan toggle visibility mata SVG)
- Aksi:
  - Tombol `Masuk`: Memvalidasi username dan password, menyimpan sesi aktif di localStorage.
  - Tombol `Daftar`: Mendaftarkan user baru dan langsung otomatis masuk ke sistem tanpa alur berbelit. [USER]
- Validasi: Username dan password tidak boleh kosong (minimal 3 karakter). Username harus unik.

### Menu 1: Beranda
- Tujuan: Menampilkan ringkasan menyeluruh aktivitas harian dan metrik utama pengguna. [GAMBAR]
- Isi halaman:
  1. Header ucapan selamat datang dengan username pengguna dan status tanggal hari ini. [GAMBAR]
  2. Kartu Ringkasan Cepat:
     - Total `Pemasukan` bulan ini (dengan icon SVG panah naik hijau) [GAMBAR]
     - Total `Pengeluaran` bulan ini (dengan icon SVG panah turun merah) [GAMBAR]
     - Jumlah `Tugas Aktif` belum selesai (dengan icon SVG dokumen) [GAMBAR]
     - Status `Sholat Hari Ini` (e.g. X/5 sholat telah dikerjakan) (dengan icon SVG bulan sabit/masjid) [GAMBAR]
  3. Grafik / Rekapan Bulanan visual perbandingan pemasukan vs pengeluaran bulan berjalan dan tombol `Unduh PDF`. [USER] / [GAMBAR]
  4. Widget Tugas Kuliah Terdekat (deadline paling mendesak dengan checkbox cepat). [GAMBAR]
  5. Widget Checklist Sholat 5 Waktu Hari Ini (bisa langsung dicentang dari beranda). [USER] / [GAMBAR]
- Aksi: Navigasi cepat ke detail masing-masing menu.

### Menu 2: Keuangan
- Tujuan: Mencatat pemasukan dan pengeluaran uang, memfilter riwayat, melihat rekapan bulanan, serta mengunduh rekapan sebagai PDF. [USER]
- Isi halaman:
  1. Kartu Rekapan Bulanan:
     - Pemilih Bulan & Tahun (filter rekapan per bulan). [GAMBAR]
     - Total Pemasukan bulan terpilih. [USER]
     - Total Pengeluaran bulan terpilih. [USER]
     - Sisa Saldo (Pemasukan - Pengeluaran). [GAMBAR]
     - Tombol `Unduh PDF` untuk mengekspor rekap transaksi bulanan ke dokumen PDF siap cetak. [USER]
  2. Grafik Batang Tren Bulanan pemasukan vs pengeluaran harian/mingguan. [GAMBAR]
  3. Form Modal / Panel Tambah Transaksi:
     - Tipe: Pilihan `Pemasukan` atau `Pengeluaran` [USER]
     - Tanggal transaksi (default hari ini) [ASUMSI-TEKNIS]
     - Keterangan / Deskripsi pengeluaran atau pemasukan [USER]
     - Kategori transaksi (e.g., Uang Saku, Makanan & Minuman, Buku Kuliah, Transportasi, Freelance, dll.) [GAMBAR]
     - Jumlah (nominal angka Rupiah) [USER]
     - Tombol `Simpan` dan `Batal` [ASUMSI-TEKNIS]
  4. Filter Penglihatan Tab: [USER]
     - `Semua` (menampilkan seluruh catatan transaksi) [USER]
     - `Pemasukan` (hanya menampilkan pemasukan) [USER]
     - `Pengeluaran` (hanya menampilkan pengeluaran) [USER]
  5. Fitur Pencarian & Filter Kategori: Input teks pencarian keterangan transaksi. [GAMBAR]
  6. Tabel / Daftar Transaksi:
     - Menampilkan: Tanggal, Deskripsi/Keterangan, Kategori, Tipe badge (hijau untuk Pemasukan, merah untuk Pengeluaran), Jumlah (format Rp), serta tombol Aksi Hapus/Edit. [USER] / [GAMBAR]
- Aksi: Tambah Transaksi, Hapus Transaksi, Filter jenis transaksi, Filter bulan, Cari transaksi, Unduh PDF. [USER]
- Validasi: Nominal wajib angka positif > 0, keterangan wajib diisi, tanggal valid.

### Menu 3: Tugas Kuliah
- Tujuan: Mengelola daftar tugas kuliah, mengelompokkan berdasarkan kategori mata kuliah, memantau deadline, serta menghapus tugas yang sudah selesai/tidak diperlukan. [USER]
- Isi halaman:
  1. Kelola Kategori Mata Kuliah:
     - Tombol `Tambah Kategori` [USER]
     - Modal / Input Tambah Kategori (nama mata kuliah dan pilihan warna penanda) [GAMBAR]
     - Daftar Kategori Mata Kuliah yang sudah dibuat oleh pengguna, dilengkapi jumlah tugas per kategori dan opsi hapus/edit kategori. [USER] / [GAMBAR]
  2. Form Tambah Tugas Kuliah: [USER]
     - Dropdown Pemilihan Kategori Mata Kuliah (berisi kategori yang dibuat user) [USER]
     - Input Judul / Nama Tugas [USER]
     - Input Keterangan Tugas (catatan/deskripsi tugas kuliah) [USER]
     - Input Deadline (pemilih tanggal dan waktu batas pengumpulan) [USER]
     - Tombol `Tambah Tugas` [USER]
  3. Filter Status Tugas:
     - Tab `Semua`, `Belum Selesai`, `Selesai` [GAMBAR]
     - Kotak Pencarian tugas [GAMBAR]
  4. Daftar Tugas Kuliah (Tabel di Desktop / Card List di Mobile):
     - Checkbox status selesai (centang untuk menandai tugas selesai) [GAMBAR]
     - Judul Tugas & Keterangan Tugas [USER]
     - Badge Kategori Mata Kuliah (dengan warna kategori) [USER] / [GAMBAR]
     - Tanggal Deadline beserta indikator sisa hari / terlambat [USER] / [GAMBAR]
     - Status (`Belum Selesai` / `Selesai`) [GAMBAR]
     - Tombol `Hapus` tugas jika sudah tidak diperlukan [USER]
- Aksi: Tambah Kategori Mata Kuliah, Tambah Tugas Kuliah, Ubah Status Selesai, Hapus Tugas, Hapus Kategori, Filter status, Cari tugas. [USER]
- Validasi: Nama kategori tidak boleh kosong, judul tugas wajib diisi, kategori wajib dipilih, deadline valid.

### Menu 4: Sholat 5 Waktu
- Tujuan: Mencatat pelaksanaan ibadah sholat 5 waktu harian dengan sistem checklist box yang otomatis reset setiap 24 jam dan tersimpan dalam rekapan riwayat. [USER]
- Jadwal Waktu Sholat (Sesuai Permintaan User - Zona Waktu WITA): [USER]
  1. `Subuh: 04:34 WITA`
  2. `Zuhur: 11:57 WITA`
  3. `Ashar: 15:13 WITA`
  4. `Maghrib: 18:00 WITA`
  5. `Isya: 19:10 WITA`
- Fitur & Mekanisme Checklist:
  - Menampilkan 5 kartu/baris sholat dengan icon SVG khas masing-masing waktu (fajar, matahari siang, matahari sore, senja, malam/bintang), nama sholat, jam WITA, dan checklist box interaktif. [USER] / [GAMBAR]
  - Saat kotak dicentang, status tersimpan langsung ke database untuk tanggal hari ini. [USER]
  - Sistem Reset 24 Jam:
    - Setiap pergantian hari (pukul 00:00 waktu lokal atau saat aplikasi dibuka pada tanggal baru), checklist box sholat harian otomatis reset menjadi belum dicentang untuk hari baru tersebut. [USER]
    - Data centang hari-hari sebelumnya tetap tersimpan utuh dan tidak terhapus, melainkan diarsipkan ke dalam sheet/tabel Rekap Sholat. [USER]
  - Teks Penjelasan Sistem: *"Checklist akan direset otomatis setiap 24 jam dan tercatat dalam rekapan harian."* [GAMBAR]
- Rekapan & Riwayat Sholat: [USER] / [GAMBAR]
  - Persentase Konsistensi Sholat (e.g. Ring progress chart tingkat keterlaksanaan bulan ini / 7 hari terakhir). [GAMBAR]
  - Total Sholat Terlaksana (e.g. X dari total target sholat). [GAMBAR]
  - Tabel / List Riwayat Harian Sholat: Menampilkan tanggal, jumlah sholat yang terlaksana (misal 5/5, 4/5), persentase, dan rincian centang masing-masing sholat (Subuh, Zuhur, Ashar, Maghrib, Isya). [GAMBAR]

### Menu 5: Rekapan & Pengaturan
- Tujuan: Menampilkan akumulasi laporan komprehensif seluruh aktivitas (keuangan bulanan, produktivitas tugas kuliah, konsistensi ibadah sholat) serta opsi akun user (Ganti Password, Logout). [GAMBAR]
- Aksi: Logout akun (membersihkan sesi), Ganti password, Unduh rekap lengkap.

## 5. Database (setup.gs)

Tabel-tabel yang dibuat secara otomatis oleh `setup.gs`:

| Sheet | Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|---|
| `Users` | `user_id` | id | Ya | Kunci unik (UUID / prefix U-) |
| | `username` | text | Ya | Username unik |
| | `password_hash` | text | Ya | Hash / teks password terenkripsi |
| | `created_at` | datetime | Ya | Waktu pendaftaran akun |
| `Keuangan` | `transaksi_id` | id | Ya | Kunci unik transaksi (prefix TRX-) |
| | `user_id` | id | Ya | Relasi ke sheet Users |
| | `tanggal` | date | Ya | Format YYYY-MM-DD |
| | `tipe` | text | Ya | 'Pemasukan' atau 'Pengeluaran' |
| | `kategori` | text | Ya | Kategori transaksi |
| | `keterangan` | longtext | Ya | Deskripsi detail transaksi |
| | `jumlah` | currency | Ya | Nominal angka (Rupiah) |
| | `created_at` | datetime | Ya | Timestamp pencatatan |
| `Kategori_Tugas` | `kategori_id` | id | Ya | Kunci unik kategori (prefix KAT-) |
| | `user_id` | id | Ya | Relasi ke sheet Users |
| | `nama_kategori` | text | Ya | Nama mata kuliah |
| | `warna` | text | Tidak | Kode warna hex atau nama warna badge |
| | `created_at` | datetime | Ya | Timestamp |
| `Tugas_Kuliah` | `tugas_id` | id | Ya | Kunci unik tugas (prefix TGS-) |
| | `user_id` | id | Ya | Relasi ke sheet Users |
| | `kategori_id` | id | Ya | Relasi ke Kategori_Tugas |
| | `nama_kategori` | text | Ya | Denormalisasi nama mata kuliah |
| | `judul_tugas` | text | Ya | Nama/judul tugas |
| | `keterangan` | longtext | Tidak | Rincian keterangan tugas |
| | `deadline` | datetime | Ya | Tanggal dan waktu batas pengumpulan |
| | `status` | text | Ya | 'Belum Selesai' atau 'Selesai' |
| | `created_at` | datetime | Ya | Timestamp |
| `Rekap_Sholat` | `log_id` | id | Ya | Kunci unik (prefix SHL-YYYYMMDD-USERID) |
| | `user_id` | id | Ya | Relasi ke sheet Users |
| | `tanggal` | date | Ya | Tanggal pencatatan YYYY-MM-DD |
| | `subuh` | boolean | Ya | TRUE jika Subuh terlaksana |
| | `zuhur` | boolean | Ya | TRUE jika Zuhur terlaksana |
| | `ashar` | boolean | Ya | TRUE jika Ashar terlaksana |
| | `maghrib` | boolean | Ya | TRUE jika Maghrib terlaksana |
| | `isya` | boolean | Ya | TRUE jika Isya terlaksana |
| | `total_terlaksana`| number | Ya | Jumlah sholat terlaksana (0 - 5) |
| | `updated_at` | datetime | Ya | Waktu terakhir dicentang |

Relasi antar sheet:
- `Keuangan.user_id` -> `Users.user_id`
- `Kategori_Tugas.user_id` -> `Users.user_id`
- `Tugas_Kuliah.user_id` -> `Users.user_id`
- `Tugas_Kuliah.kategori_id` -> `Kategori_Tugas.kategori_id`
- `Rekap_Sholat.user_id` -> `Users.user_id`

Data awal (seed):
- Akun default: `Username`: `Uang ku`, `Password`: `uangku` [USER]
- Data Transaksi Keuangan: 146 entri riil dari file lampiran transaksi keuangan pengguna untuk user `Uang ku`, terdistribusi dari September - Oktober 2026. [USER]

## 6. Alur & Aturan Bisnis (code.gs)
1. Autentikasi Pengguna:
   - Fungsi `registerUser(username, password)`: Cek apakah username sudah ada. Jika belum, hash password / simpan credential, buat user_id baru, dan kembalikan token sesi / status sukses langsung masuk.
   - Fungsi `loginUser(username, password)`: Validasi kecocokan username dan password, kembalikan data user jika cocok.
2. Manajemen Keuangan:
   - CRUD Transaksi: Tambah, Ambil (dengan filter tipe: Semua / Pemasukan / Pengeluaran dan filter bulan), Hapus Transaksi berdasarkan `transaksi_id` milik user yang bersangkutan.
   - Rekapitulasi: Hitung total pemasukan bulanan, total pengeluaran bulanan, dan sisa saldo.
   - Ekspor PDF:
     - Fungsi frontend / backend yang menghasilkan dokumen PDF rapi berisi: Kop laporan Fshare, Nama User, Periode Bulan, Tabel Transaksi terstruktur, Total Pemasukan, Total Pengeluaran, dan Saldo Akhir. Menggunakan library client-side (seperti jsPDF + autoTable atau Google Apps Script Drive PDF conversion).
3. Manajemen Tugas Kuliah:
   - CRUD Kategori: Tambah kategori mata kuliah, ambil kategori user, hapus kategori (dengan validasi tugas terkait).
   - CRUD Tugas: Tambah tugas kuliah (dengan relasi kategori), ambil tugas (filter: Semua, Belum Selesai, Selesai), update status (selesai / belum selesai), dan tombol Hapus tugas.
4. Manajemen Sholat 5 Waktu & Reset 24 Jam:
   - Jadwal Patokan (WITA):
     - Subuh: `04:34 WITA`
     - Zuhur: `11:57 WITA`
     - Ashar: `15:13 WITA`
     - Maghrib: `18:00 WITA`
     - Isya: `19:10 WITA`
   - Fungsi `getTodaySholat(userId, clientDate)`: Mengambil catatan checklist tanggal hari ini. Jika belum ada record untuk tanggal hari ini, record baru diinisiasi dengan seluruh nilai sholat bernilai `false` (otomatis reset per 24 jam / pergantian hari).
   - Fungsi `toggleSholat(userId, clientDate, prayerName, isChecked)`: Mengubah status sholat tertentu, menghitung total terlaksana (0 - 5), dan menyimpan pembaruan ke `Rekap_Sholat`.
   - Fungsi `getSholatSummary(userId, monthYear)`: Mengambil riwayat sholat bulanan atau rentang tanggal untuk menghitung tingkat konsistensi persentase dan daftar rincian harian.

## 7. Desain (index.html)
Sumber: Gambar referensi desain layout Desktop & Mobile serta instruksi user.

- Larangan Mutlak: Dilarang keras menggunakan emoticon/emoji karakter teks (e.g. 📱, 💰, 🕌, dll). Seluruh indikator dan dekorasi WAJIB menggunakan icon SVG bersih (stroke 1.5 - 2px, crisp, modern). [USER]
- Mode tema: Terang bernuansa alam lembut dan modern (Fresh Clean Mint / Emerald & Slate Palette). [GAMBAR]
- Token Warna (hex ≈):
  - `--bg-body`: `#f0f7f5` (soft mint/sage background yang menenangkan)
  - `--surface`: `#ffffff` (putih bersih untuk kartu dan container)
  - `--surface-subtle`: `#f8fbf9`
  - `--border`: `#e2ece8` (border halus hijau keabu-abuan)
  - `--text-main`: `#0f172a` (teks utama gelap tajam)
  - `--text-muted`: `#64748b` (teks sekunder / label)
  - `--primary`: `#0d9488` (teal / toska modern identitas utama Fshare)
  - `--primary-hover`: `#0f766e`
  - `--primary-light`: `#ccfbf1` (background badge/highlight teal lembut)
  - `--primary-contrast`: `#ffffff`
  - `--income-green`: `#10b981` (pemasukan & sholat selesai)
  - `--income-bg`: `#ecfdf5`
  - `--expense-red`: `#f43f5e` (pengeluaran & tombol hapus)
  - `--expense-bg`: `#fff1f2`
  - `--warning-amber`: `#f59e0b` (deadline mendesak)
  - `--warning-bg`: `#fef3c7`
  - `--accent-blue`: `#3b82f6` (kategori mata kuliah)
  - `--accent-purple`: `#8b5cf6` (kategori mata kuliah)
- Tipografi:
  - Font Family: `'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
  - Heading 1 (Page Title): `24px - 28px`, font-weight `700`, line-height `1.2`
  - Section Title: `18px - 20px`, font-weight `600`
  - Body Text: `14px - 15px`, font-weight `400`
  - Small / Badge / Meta: `12px`, font-weight `500`
- Bentuk & Spacing:
  - Radius: Kartu `16px`, Tombol & Input `10px` - `12px`, Badge/Pill `9999px` (fully rounded)
  - Box Shadow: `0 4px 20px -2px rgba(13, 148, 136, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)`
  - Spacing Dasar: Modular 4px/8px (padding kartu 20px - 24px pada desktop, 16px pada mobile).
- Layout & Navigasi:
  - **Desktop View (>= 1024px)**:
    - Sidebar kiri statis (lebar 260px) berisi: Logo `Fshare` SVG + nama + slogan `pencatatan keseharian digital`, Menu navigasi vertikal (`Beranda`, `Keuangan`, `Tugas Kuliah`, `Sholat 5 Waktu`, `Rekapan`), serta card banner estetis di bagian bawah sidebar dengan ilustrasi dedaunan bukit SVG toska.
    - Top bar: Kolom pencarian global, notifikasi icon SVG, profil akun user (`Username`) dan tombol logout.
    - Area konten dinamis: Grid fluid responsif multi-kolom yang luas dan tertata rapi persis mockup desktop.
  - **Mobile View (< 1024px, dioptimasi untuk HP 360px - 480px)**:
    - Top App Bar minimalis: Logo `Fshare`, nama user, dan icon notifikasi/logout SVG.
    - Konten utama berscroll vertikal mulus, form dan kartu full-width dengan margin 12px - 16px.
    - Bottom Navigation Bar tetap (fixed bottom): 5 tombol menu berikon SVG (`Beranda`, `Keuangan`, `Tugas`, `Sholat`, `Lainnya/Rekapan`) dengan status aktif berubah warna toska primer.
- Komponen UI:
  - Tab Switcher pill elegan dengan transisi halus (`Semua`, `Pemasukan`, `Pengeluaran` / `Belum Selesai`, `Selesai`).
  - Metric Card dengan background gradasi halus dan icon bulat bergaris.
  - Interactive Checklist Box untuk Sholat dan Tugas dengan centang SVG animasi lembut.
  - Tombol Aksi: Tombol primer toska penuh, tombol sekunder outline, dan tombol hapus merah muda halus.
  - Modal Pop-up untuk input transaksi dan tambah tugas kuliah yang responsif di mobile (bottom-sheet style di HP).

## 8. Responsif & Presisi di Semua Device
- Breakpoint spesifik:
  - Mobile Small: 320px - 375px (padding kompak, ukuran font proporsional, layout single column).
  - Mobile Standard: 376px - 480px (tampilan kartu lapang, bottom navigation bar tetap di dasar layar).
  - Tablet: 768px - 1023px (2 kolom grid fleksibel).
  - Laptop / Desktop: 1024px - 1440px (sidebar kiri penuh + 2 atau 3 kolom dashboard).
  - Ultrawide: 1920px+ (konten berada dalam container `max-width: 1440px` terpusat agar tidak terlalu renggang).
- Bebas dari horizontal scrollbar yang tidak disengaja.
- Sentuhan mobile (touch-target) tombol dan checklist minimal 44px x 44px agar nyaman dioperasikan satu tangan di smartphone.

## 9. Tampilan Spreadsheet
- Desain Spreadsheet otomatis dirapikan oleh `setup.gs`:
  - Baris header diberi warna latar Teal elegan (`#0d9488`) dengan teks tebal warna putih (`#ffffff`).
  - Baris pertama (header) dibekukan (freeze row 1) pada seluruh sheet.
  - Lebar setiap kolom disesuaikan otomatis (autofit) dengan margin wajar agar data tidak terpotong.
  - Format angka dan mata uang otomatis diset format Rupiah `Rp #,##0` pada kolom jumlah keuangan.
  - Format tanggal diset `YYYY-MM-DD` atau `DD MMM YYYY`.
  - Filter otomatis diaktifkan pada baris header seluruh sheet.
  - Seluruh sheet kosong bawaan (seperti `Sheet1` default Google Sheets) dihapus agar spreadsheet bersih.
  - Urutan tab sheet: `Users`, `Keuangan`, `Kategori_Tugas`, `Tugas_Kuliah`, `Rekap_Sholat`.

## 10. Pop-up setup.gs
Saat fungsi `setupDatabase()` pada file `setup.gs` selesai dijalankan di Google Spreadsheet, wajib menampilkan pop-up kotak dialog (`SpreadsheetApp.getUi().alert(...)`) berisi ringkasan sheet dan kolom yang berhasil dibuat, dengan baris terakhir persis:
```text
By - Fadhil
```

## 11. Mode GitHub Pages (hanya jika mode B)
Jika pengguna memilih mode deploy B (GitHub Pages):
- Backend `code.gs` menangani request HTTP via `doGet(e)` dan `doPost(e)` dengan `ContentService.createTextOutput(...)` bertipe MIME JSON.
- Header CORS ditangani dengan baik agar dapat diakses dari domain GitHub Pages.
- File `index.html` dapat dijalankan mandiri di web browser lokal maupun di-host di GitHub Pages dengan memanggil endpoint URL Web App Apps Script melalui `fetch()`.

## 12. Di Luar Cakupan
- Pengiriman email notifikasi otomatis / reminder bot Telegram/WhatsApp (tidak diminta user).
- Multi-currency / mata uang asing (hanya mendukung format Rupiah Indonesia).
- Sistem pembayaran online payment gateway (hanya pencatatan manual pemasukan/pengeluaran).
- Penghitungan kompas arah kiblat otomatis berbasis GPS (hanya jadwal patokan 5 waktu WITA dan checklist riwayat).

## 13. Pertanyaan Terbuka
- Tidak ada (Mode A telah dipilih dan disetujui pengguna).

## 14. Riwayat Revisi
| Versi | Tanggal | Perubahan (TAMBAH/UBAH/HAPUS) | File terdampak |
|---|---|---|---|
| 1.0 | 2026-10-24 | Dokumen spesifikasi awal web app Fshare (Autentikasi, Keuangan + PDF, Tugas Kuliah + Kategori, Sholat 5 Waktu WITA + Reset 24 Jam, Desain SVG Desktop & Mobile) | code.gs, setup.gs, index.html |
| 1.1 | 2026-10-24 | TAMBAH akun default `Uang ku`/`uangku` beserta 146 entri data riil transaksi keuangan; UBAH Mode deploy menjadi Mode A (Apps Script saja). | code.gs, setup.gs, index.html |
| 1.2 | 2026-10-24 | UBAH password menjadi teks asli (plain text) tanpa hashing; UBAH Mode deploy menjadi Mode B (GitHub Pages) dengan link exec aktif; TAMBAH fitur PWA (manifest & service worker). | code.gs, setup.gs, index.html |
| 1.3 | 2026-10-24 | UBAH desain UI ke tema Glassmorphism premium dengan animasi interaktif halus; HAPUS teks judul & deskripsi 'Tentang Aplikasi' (hanya menyisakan label versi). | index.html |
