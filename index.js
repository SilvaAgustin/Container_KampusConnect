const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Rute API untuk data layanan
app.get('/api/layanan', (req, res) => {
  const layananBelajarDocker = [
    { id: 1, nama: 'Docker Basics', status: 'Tersedia' },
    { id: 2, nama: 'Image Builder', status: 'Tersedia' },
    { id: 3, nama: 'Storage & Network', status: 'Tersedia' },
    { id: 4, nama: 'Orchestration', status: 'Tersedia' }
  ];
  res.json(layananBelajarDocker);
});

// Rute untuk mengecek kesehatan server
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Aplikasi Kampus Connect berjalan di http://localhost:${port}`);
});
