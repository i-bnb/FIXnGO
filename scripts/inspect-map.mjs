import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const OUT_DIR = path.join(process.cwd(), 'map-inspect-screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

let totalErrors = 0;

async function testPage(name, role, locale, viewport, fn) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport,
    locale: locale === 'ar' ? 'ar-AE' : 'en-US',
  });
  if (role) {
    await context.addCookies([
      { name: 'fixngo_session', value: role, domain: 'localhost', path: '/' },
    ]);
  }
  const page = await context.newPage();
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('404')) {
        errors.push(`[Console Error] ${text}`);
      }
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`[Page Error] ${err.message}`);
  });

  try {
    await fn(page);
    console.log(`[PASS] ${name} (${locale.toUpperCase()}) - 0 errors`);
  } catch (err) {
    errors.push(`[Exception] ${err.message}`);
    console.error(`[FAIL] ${name} (${locale.toUpperCase()}):`, err.message);
  } finally {
    if (errors.length > 0) {
      totalErrors += errors.length;
      console.error(`Errors in ${name}:`, errors);
    }
    await browser.close();
  }
}

async function main() {
  console.log('=== FIXnGO Map Comprehensive Multi-Portal Verification ===\n');

  // 1. Admin Dispatch Board (EN & AR)
  for (const locale of ['en', 'ar']) {
    await testPage(`Admin Dispatch Map`, 'SUPER_ADMIN', locale, { width: 1280, height: 900 }, async (page) => {
      await page.goto(`${BASE_URL}/${locale}/admin/dispatch`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const leaflet = await page.$('.leaflet-container');
      if (!leaflet) throw new Error('No .leaflet-container found');

      // Verify direction is LTR
      const dir = await leaflet.evaluate((el) => window.getComputedStyle(el).direction);
      if (dir !== 'ltr') throw new Error(`Expected ltr direction on map, got ${dir}`);

      // Verify tiles are loaded
      const tileCount = await page.$$eval('.leaflet-tile', (els) => els.length);
      if (tileCount === 0) throw new Error('0 leaflet tiles loaded');

      // Click on a job to test recenter & zoom
      const jobItem = await page.$('text=WO-2026-00026') || await page.$('text=Carrier');
      if (jobItem) {
        await jobItem.click();
        await page.waitForTimeout(600);
      }

      await page.screenshot({
        path: path.join(OUT_DIR, `verified_dispatch_${locale}.png`),
        fullPage: true,
      });
    });
  }

  // 2. Customer Portal - Live Tracking Map (EN & AR)
  for (const locale of ['en', 'ar']) {
    await testPage(`Customer Live Tracking Map`, 'CUSTOMER', locale, { width: 450, height: 900 }, async (page) => {
      await page.goto(`${BASE_URL}/${locale}/app`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);

      const liveJobCard = await page.$('text=LIVE JOB') || await page.$('text=طلب نشط');
      if (!liveJobCard) throw new Error('Live job card not found on customer home');

      await liveJobCard.click();
      await page.waitForTimeout(1000);

      const leaflet = await page.$('.leaflet-container');
      if (!leaflet) throw new Error('No .leaflet-container found in Live Tracking');

      const dir = await leaflet.evaluate((el) => window.getComputedStyle(el).direction);
      if (dir !== 'ltr') throw new Error(`Expected ltr direction on map, got ${dir}`);

      const tileCount = await page.$$eval('.leaflet-tile', (els) => els.length);
      if (tileCount === 0) throw new Error('0 leaflet tiles loaded in Live Tracking');

      await page.screenshot({
        path: path.join(OUT_DIR, `verified_customer_tracking_${locale}.png`),
        fullPage: true,
      });
    });
  }

  // 3. Customer Portal - Booking Step 3 Location & Interactive Pinning (EN & AR)
  for (const locale of ['en', 'ar']) {
    await testPage(`Customer Booking Location Map`, 'CUSTOMER', locale, { width: 450, height: 900 }, async (page) => {
      await page.goto(`${BASE_URL}/${locale}/app`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const bookBtn = await page.$('button:has-text("AC")') || await page.$('button:has-text("صيانة التكييف")');
      if (!bookBtn) throw new Error('AC booking button not found');
      await bookBtn.click();
      await page.waitForTimeout(500);

      const continueBtn = await page.$('button:has-text("Continue to Details")') || await page.$('button:has-text("متابعة إلى التفاصيل")');
      if (!continueBtn) throw new Error('Continue to Details button not found');
      await continueBtn.click();
      await page.waitForTimeout(1000);

      const leaflet = await page.$('.leaflet-container');
      if (!leaflet) throw new Error('No .leaflet-container found in Booking Step 3');

      // Test map pinning: click on map
      const box = await leaflet.boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);

      // Verify address overlay pill is visible
      const pinnedBadge = await page.$('text=Pinned') || await page.$('text=محدد');
      if (!pinnedBadge) throw new Error('Pinned overlay pill not visible on map');

      await page.screenshot({
        path: path.join(OUT_DIR, `verified_customer_step3_${locale}.png`),
        fullPage: true,
      });
    });
  }

  // 4. Technician Portal - Active Job Embedded Map (EN & AR)
  for (const locale of ['en', 'ar']) {
    await testPage(`Technician Active Job Map`, 'TECHNICIAN', locale, { width: 450, height: 950 }, async (page) => {
      await page.goto(`${BASE_URL}/${locale}/tech`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const leaflet = await page.$('.leaflet-container');
      if (!leaflet) throw new Error('No .leaflet-container found in Technician Active Job');

      const dir = await leaflet.evaluate((el) => window.getComputedStyle(el).direction);
      if (dir !== 'ltr') throw new Error(`Expected ltr direction on map, got ${dir}`);

      const tileCount = await page.$$eval('.leaflet-tile', (els) => els.length);
      if (tileCount === 0) throw new Error('0 leaflet tiles loaded in Technician Active Job');

      await page.screenshot({
        path: path.join(OUT_DIR, `verified_tech_${locale}.png`),
        fullPage: true,
      });
    });
  }

  console.log(`\n=== Verification Finished. Total Errors: ${totalErrors} ===`);
  if (totalErrors > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
