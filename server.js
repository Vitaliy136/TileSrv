const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const TILE_DIR = path.join(__dirname, 'static_tiles2');

// Cache settings
const CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 1; // 1 day

app.use(express.static(path.join(__dirname, "public")));

app.get('/:z/:x/:y.png', async (req, res) => {
  const { z, x, y } = req.params;
  console.log(z, x, y);
  const tilePath = path.join(TILE_DIR, z, x, `${y}.png`);

  // Setting cache headers
  res.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}, immutable`);

  if (fs.existsSync(tilePath)) {
    res.sendFile(tilePath);
  } else {
    // Transparent PNG placeholder
    const width = 256;
    const height = 256;

    const transparentPng = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    }).png().toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(transparentPng);
  }
});

// Starting the server
const PORT = 8082;
app.listen(PORT, () => {
  console.log(`🧭 Tile server running at http://localhost:${PORT}/{z}/{x}/{y}.png`);
});