# Kampus Connect

Portal pembelajaran Docker berbasis Node.js dan Express. Aplikasi menyajikan halaman web, API daftar layanan, dan endpoint pemeriksaan kesehatan. Docker Compose juga dapat menjalankan layanan MySQL.

## Persyaratan

- Node.js 18 atau lebih baru dan npm untuk menjalankan aplikasi secara lokal.
- Docker dengan Docker Compose untuk menjalankan aplikasi beserta MySQL.

## Menjalankan secara lokal

Dari folder proyek, jalankan:

```bash
npm install
npm start
```

Buka [http://localhost:3000](http://localhost:3000) di browser. Tekan `Ctrl+C` di terminal untuk menghentikan server.

## Menjalankan dengan Docker Compose

Docker Compose membaca konfigurasi variabel dari file `.env` di folder proyek. Jika file tersebut belum ada, buat `.env` dan isi dengan nilai lokal Anda:

```dotenv
DB_ROOT_PASSWORD=ganti_dengan_password_root
DB_NAME=kampus_connect
DB_USER=kampus_user
DB_PASSWORD=ganti_dengan_password_aplikasi
```

Jangan gunakan contoh password tersebut untuk lingkungan produksi dan jangan membagikan atau meng-commit file `.env`.

Jalankan layanan:

```bash
docker compose up --build
```

Setelah container web berjalan, buka [http://localhost:8080](http://localhost:8080). MySQL dijalankan sebagai layanan `db`; data databasenya disimpan dalam volume Docker `db-data`.

Untuk menghentikan layanan, tekan `Ctrl+C`, lalu jalankan:

```bash
docker compose down
```

Perintah tersebut mempertahankan volume database. Jangan gunakan `docker compose down -v` kecuali memang ingin menghapus volume dan seluruh data database.

## Endpoint

- `GET /` — halaman utama.
- `GET /api/layanan` — daftar layanan belajar Docker dalam format JSON.
- `GET /health` — status kesehatan server dalam format JSON.

Saat ini daftar layanan disediakan langsung oleh aplikasi. Walaupun MySQL ikut dijalankan melalui Docker Compose, aplikasi belum membaca atau menyimpan data layanan di database.
