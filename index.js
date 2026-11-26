const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

const initialLayanan = [
  ['Docker Basics', 'Tersedia'],
  ['Image Builder', 'Tersedia'],
  ['Storage & Network', 'Tersedia'],
  ['Orchestration', 'Tersedia']
];

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS layanan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL
    )
  `);

  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM layanan');
  if (rows[0].total === 0) {
    await pool.query('INSERT INTO layanan (nama, status) VALUES ?', [initialLayanan]);
    console.log('Data awal tabel layanan berhasil dimasukkan ke MySQL.');
  }
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rute API untuk data layanan dari MySQL
app.get('/api/layanan', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nama, status FROM layanan ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data layanan:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data dari database' });
  }
});

// Rute untuk mengecek kesehatan server & koneksi MySQL
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Healthcheck database gagal:', err.message);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

async function startServer() {
  try {
    await initDb();
    console.log('Koneksi ke MySQL berhasil.');
  } catch (err) {
    console.error('Gagal inisialisasi database saat startup:', err.message);
  }

  app.listen(port, () => {
    console.log(`Aplikasi Kampus Connect berjalan di http://localhost:${port}`);
  });
}

startServer();
