# Kampus Connect

Portal pembelajaran Docker berbasis Node.js, Express, Nginx, MySQL, dan Cloudflare Tunnel. Aplikasi menyajikan halaman web HTML/CSS/JS, API daftar layanan, serta endpoint pemeriksaan kesehatan melalui satu pintu Nginx sehingga dapat diakses secara lokal maupun dari jaringan berbeda via `trycloudflare.com`.

## Arsitektur & Alur Kerja

Seluruh layanan berjalan di dalam satu jaringan Docker internal bernama `kampus-net`:

```text
Browser (Lokal / Jaringan Berbeda)
   │
   ├── Lokal  : http://localhost:8080
   └── Publik : https://*.trycloudflare.com ──▶ [cloudflared]
                                                     │
                                                     ▼
                                            [nginx:alpine :80]
                                               │          │
                   GET / (HTML/CSS/JS) ────────┘          └──────── GET /api/* & /health
                           │                                                 │
                           ▼                                                 ▼
                  Folder ./public/                                [web: Express :3000]
               (index.html, style.css)                                       │
                                                                             ▼
                                                                   [db: MySQL 8.4 :3306]
                                                                    (volume: db-data)
```

### 1. Alur Startup Layanan (`docker-compose.yml`)
1. **`db` (`mysql:8.4`)** dijalankan lebih dulu dan menyimpan data di volume `db-data`. Docker menjalankan `healthcheck` (`mysqladmin ping`) sampai database siap.
2. **`web` (Node.js 18 + Express)** dijalankan setelah `db` berstatus `healthy`. Container ini hanya membuka port internal `3000` di `kampus-net` (`expose`), tidak diekspos langsung ke host.
3. **`nginx` (`nginx:alpine`)** berjalan setelah `web`, memetakan port host `8080` ke port container `80`, serta membaca konfigurasi `nginx.conf` dan folder `public/`.
4. **`cloudflared` (`cloudflare/cloudflared:latest`)** berjalan setelah `nginx` dan membuat Cloudflare Quick Tunnel menuju `http://nginx:80`, menghasilkan URL publik `https://*.trycloudflare.com`.

### 2. Alur Permintaan (Request Flow)
- **Halaman Web (`GET /`)**: Permintaan dari browser masuk ke `nginx`, lalu langsung dilayani dari file statis di `./public/` (`index.html`, `style.css`).
- **API & Healthcheck (`GET /api/layanan`, `GET /health`)**: `nginx` meneruskan permintaan (`proxy_pass`) ke `http://web:3000` di jaringan internal `kampus-net`, lengkap dengan header `Host`, `X-Real-IP`, `X-Forwarded-For`, dan `X-Forwarded-Proto`.
- **Satu Origin (Tanpa CORS)**: Karena frontend dan API sama-sama dilayani lewat `nginx` di satu URL (`http://localhost:8080` atau `https://*.trycloudflare.com`), browser dapat memanggil API tanpa kendala CORS.

## Struktur Proyek

- `index.js` — server Express (port `3000`) untuk API `/api/layanan` dan `/health`.
- `public/` — aset frontend statis (`index.html`, `style.css`).
- `nginx.conf` — konfigurasi reverse proxy Nginx untuk static web dan API.
- `Dockerfile` — image build untuk service `web` berbasis `node:18-alpine`.
- `docker-compose.yml` — orkestrasi service `db`, `web`, `nginx`, dan `cloudflared`.

## Persyaratan

- Node.js 18 atau lebih baru dan npm untuk menjalankan aplikasi secara lokal tanpa Docker.
- Docker dengan Docker Compose untuk menjalankan seluruh stack (`web`, `db`, `nginx`, `cloudflared`).

## Menjalankan secara lokal (tanpa Docker)

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

Jalankan seluruh layanan di background:

```bash
docker compose up --build -d
```

Setelah container berjalan, buka [http://localhost:8080](http://localhost:8080) (dilayani oleh Nginx). MySQL dijalankan sebagai layanan `db`; data databasenya disimpan dalam volume Docker `db-data`.

### Akses Publik via Cloudflare Tunnel (`trycloudflare.com`)

Service `cloudflared` otomatis membuat Quick Tunnel ke `http://nginx:80`. Untuk melihat URL publik `https://*.trycloudflare.com` yang bisa dibagikan ke dosen/penguji di jaringan berbeda, jalankan:

```bash
docker compose logs cloudflared
```

Salin URL `https://....trycloudflare.com` yang muncul di log. Satu URL tersebut melayani:
- `GET /` — halaman web HTML/CSS/JS (melalui Nginx)
- `GET /api/layanan` — daftar layanan JSON (di-proxy ke Express)
- `GET /health` — status kesehatan server (di-proxy ke Express)

> **Catatan:** URL Quick Tunnel berlaku selama container `cloudflared` tetap berjalan. Jika container di-restart, URL baru akan dibuat.

Untuk menghentikan layanan, jalankan:

```bash
docker compose down
```

Perintah tersebut mempertahankan volume database. Jangan gunakan `docker compose down -v` kecuali memang ingin menghapus volume dan seluruh data database.

## Endpoint

- `GET /` — halaman utama.
- `GET /api/layanan` — daftar layanan belajar Docker dalam format JSON (diambil dari tabel `layanan` di MySQL).
- `GET /health` — status kesehatan server dan koneksi database MySQL (`{ status: "ok", database: "connected" }`).

Saat pertama kali berjalan, aplikasi otomatis membuat tabel `layanan` di database MySQL (`db`) dan mengisi data awal jika tabel masih kosong.
