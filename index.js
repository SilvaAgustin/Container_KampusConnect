const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rute API untuk data layanan
app.get('/api/layanan', (req, res) => {
  const layanan = [
    { id: 1, nama: 'Peminjaman Ruang', status: 'Tersedia' },
    { id: 2, nama: 'Peminjaman Proyektor', status: 'Tersedia' }
  ];
  res.json(layanan);
});

// Rute untuk mengecek kesehatan server
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Aplikasi Kampus Connect berjalan di http://localhost:${port}`);
});
