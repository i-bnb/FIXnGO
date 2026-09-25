const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create uncompressed PNG chunk
function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  
  // CRC32
  let crc = 0 ^ (-1);
  for (let i = 0; i < body.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ body[i]) & 0xFF];
  }
  crc = (crc ^ (-1)) >>> 0;
  
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, body, crcBuf]);
}

// Precompute CRC32 table
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[i] = c >>> 0;
}

function generatePng(width, height, r, g, b) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 2; // Color type: Truecolor RGB
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: Standard
  ihdr[12] = 0; // Interlace: None
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // Raw image data with 0 filter byte before each scanline
  const rowBytes = width * 3;
  const rawData = Buffer.alloc(height * (1 + rowBytes));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // No filter
    for (let x = 0; x < width; x++) {
      // Orange border / background, with centered white pattern
      const margin = Math.floor(width * 0.15);
      const isInside = (x >= margin && x < width - margin && y >= margin && y < height - margin);
      if (isInside && ((x === y) || (x + y === width))) {
        rawData[offset++] = 255;
        rawData[offset++] = 255;
        rawData[offset++] = 255;
      } else {
        rawData[offset++] = r;
        rawData[offset++] = g;
        rawData[offset++] = b;
      }
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files for public/
const publicDir = path.resolve(__dirname, '../apps/web/public');
const iconsDir = path.join(publicDir, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 1. Icon 192x192
const icon192 = generatePng(192, 192, 249, 115, 22); // Signal Orange
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);

// 2. Icon 512x512
const icon512 = generatePng(512, 512, 249, 115, 22);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);

// 3. Apple Touch Icon 180x180
const appleIcon = generatePng(180, 180, 249, 115, 22);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// 4. Favicon (PNG format named favicon.ico or 32x32 PNG)
const favicon = generatePng(32, 32, 249, 115, 22);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated icons and favicon!');
