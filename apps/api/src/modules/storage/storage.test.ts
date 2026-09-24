import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { detectMagicBytes, stripExifMetadata } from './storage.service';

describe('Storage & Upload Hardening (OWASP ASVS / UAE PDPL)', () => {
  describe('1. Binary Header Signatures & Magic Bytes Detection', () => {
    it('should strictly reject a Windows executable (.exe) renamed to .jpg', () => {
      // Windows PE executable starts with "MZ" (0x4D 0x5A)
      const fakeJpgExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
      const result = detectMagicBytes(fakeJpgExe);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.isMalicious, true);
    });

    it('should strictly reject a Linux ELF executable renamed to .png', () => {
      // Linux ELF executable starts with 0x7F 'E' 'L' 'F'
      const fakePngElf = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]);
      const result = detectMagicBytes(fakePngElf);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.isMalicious, true);
    });

    it('should strictly reject script and PHP payloads', () => {
      const phpPayload = Buffer.from('<?php echo system($_GET["cmd"]); ?>');
      const scriptPayload = Buffer.from('<script>alert("xss")</script>');

      assert.strictEqual(detectMagicBytes(phpPayload).isMalicious, true);
      assert.strictEqual(detectMagicBytes(scriptPayload).isMalicious, true);
    });

    it('should validate genuine JPEG magic bytes (FF D8 FF)', () => {
      const genuineJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const result = detectMagicBytes(genuineJpg);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.detectedMime, 'image/jpeg');
    });

    it('should validate genuine PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)', () => {
      const genuinePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const result = detectMagicBytes(genuinePng);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.detectedMime, 'image/png');
    });

    it('should validate genuine PDF magic bytes (%PDF)', () => {
      const genuinePdf = Buffer.from('%PDF-1.7\n%c2b5c2b6c2b7c2b8');
      const result = detectMagicBytes(genuinePdf);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.detectedMime, 'application/pdf');
    });
  });

  describe('2. UAE PDPL EXIF Metadata Stripping', () => {
    it('should strip APP1 (0xFF 0xE1) EXIF segment containing GPS telemetry', () => {
      // Construct minimal JPEG with APP1 marker (FF E1, length 8) followed by image data
      const exifMarker = Buffer.from([0xff, 0xe1, 0x00, 0x06, 0x45, 0x78, 0x69, 0x66]); // APP1 + "Exif"
      const imgData = Buffer.from([0xff, 0xda, 0x00, 0x02, 0xaa, 0xbb]); // SOS marker + payload
      const fullJpg = Buffer.concat([
        Buffer.from([0xff, 0xd8]), // SOI
        exifMarker,
        imgData,
      ]);

      const stripped = stripExifMetadata(fullJpg, 'image/jpeg');

      // Verify APP1 marker (FF E1) is absent in stripped buffer
      assert.strictEqual(stripped.includes(Buffer.from([0xff, 0xe1])), false);
      // Verify SOI (FF D8) and image data remain intact
      assert.strictEqual(stripped[0], 0xff);
      assert.strictEqual(stripped[1], 0xd8);
      assert.strictEqual(stripped.includes(Buffer.from([0xff, 0xda])), true);
    });
  });
});
