import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(process.cwd(), 'smoke-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = [];
let totalErrors = 0;

async function runTest(name, role, fn) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });

  if (role) {
    await context.addCookies([
      {
        name: 'fixngo_session',
        value: role,
        domain: 'localhost',
        path: '/',
      },
    ]);
  }

  const page = await context.newPage();

  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore non-fatal external warnings
      if (
        !text.includes('favicon') &&
        !text.includes('Leaflet') &&
        !text.includes('404 (Not Found)')
      ) {
        pageErrors.push(`[Console Error] ${text}`);
      }
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  const start = Date.now();
  try {
    await fn(browser, page);
    const durationMs = Date.now() - start;
    if (pageErrors.length > 0) {
      totalErrors += pageErrors.length;
      results.push({ url: page.url(), name, status: 'FAIL', errors: pageErrors, durationMs });
    } else {
      results.push({ url: page.url(), name, status: 'PASS', errors: [], durationMs });
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    pageErrors.push(`[Exception] ${err.message}`);
    totalErrors += pageErrors.length;
    results.push({ url: page.url(), name, status: 'FAIL', errors: pageErrors, durationMs });
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log(`Starting FIXnGO Comprehensive Smoke Test Suite against ${BASE_URL}...`);

  // ==========================================
  // 1. CUSTOMER PORTAL SCREENS
  // ==========================================
  await runTest('Customer App Home (/en/app)', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Our services', { timeout: 10000 });
  });

  await runTest('Customer Bookings (/en/app/bookings)', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app/bookings`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Bookings', { timeout: 10000 });
  });

  await runTest('Customer Account (/en/app/account)', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app/account`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Customer Account', { timeout: 10000 });
  });

  await runTest('Customer Shop (/en/app/shop)', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app/shop`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Shop', { timeout: 10000 });
  });

  // ==========================================
  // 2. 6 SERVICE BOOKINGS & SCREENSHOTS
  // ==========================================
  // AC Service & Screenshot of Step 2
  await runTest('Book Service Step 2 - AC & Screenshot', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("AC Service")').click();
    await page.waitForTimeout(600);

    // Verify Step 2 is active with AC specific tasks
    await page.waitForSelector('text=Select Specific Task', { timeout: 8000 });
    await page.waitForSelector('text=AC service & filter cleaning', { timeout: 8000 });

    // Capture screenshot of Step 2 for AC
    const acPath = path.join(SCREENSHOT_DIR, 'step2_ac.png');
    await page.screenshot({ path: acPath, fullPage: true });
    console.log(`Saved AC Step 2 screenshot to: ${acPath}`);

    // Complete Booking
    await page.locator('text=AC service & filter cleaning').first().click();
    await page.locator('button:has-text("Continue to Details")').click();
    await page.waitForSelector('text=Service Address', { timeout: 8000 });
    await page.locator('button:has-text("Review & Confirm")').click();
    await page.waitForSelector('text=Review & Confirm', { timeout: 8000 });
    await page.locator('button:has-text("Confirm Booking & Dispatch")').click();
    await page.waitForSelector('text=Booking Confirmed!', { timeout: 12000 });
  });

  // Plumbing Service & Screenshot of Step 2
  await runTest('Book Service Step 2 - Plumbing & Screenshot', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Plumbing")').click();
    await page.waitForTimeout(600);

    // Verify Step 2 is active with Plumbing specific tasks
    await page.waitForSelector('text=Select Specific Task', { timeout: 8000 });
    await page.waitForSelector('text=Leak repair', { timeout: 8000 });

    // Capture screenshot of Step 2 for Plumbing
    const plumbingPath = path.join(SCREENSHOT_DIR, 'step2_plumbing.png');
    await page.screenshot({ path: plumbingPath, fullPage: true });
    console.log(`Saved Plumbing Step 2 screenshot to: ${plumbingPath}`);

    // Complete Booking
    await page.locator('text=Leak repair').first().click();
    await page.locator('button:has-text("Continue to Details")').click();
    await page.waitForSelector('text=Service Address', { timeout: 8000 });
    await page.locator('button:has-text("Review & Confirm")').click();
    await page.waitForSelector('text=Review & Confirm', { timeout: 8000 });
    await page.locator('button:has-text("Confirm Booking & Dispatch")').click();
    await page.waitForSelector('text=Booking Confirmed!', { timeout: 12000 });
  });

  // Electrical Service
  await runTest('Book Service - Electrical', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Electrical")').click();
    await page.waitForSelector('text=Power trip / no power', { timeout: 8000 });
    await page.locator('text=Power trip / no power').first().click();
    await page.locator('button:has-text("Continue to Details")').click();
    await page.locator('button:has-text("Review & Confirm")').click();
    await page.locator('button:has-text("Confirm Booking & Dispatch")').click();
    await page.waitForSelector('text=Booking Confirmed!', { timeout: 12000 });
  });

  // Labour Supply Service
  await runTest('Book Service - Labour Supply', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Labour Supply")').click();
    await page.waitForSelector('text=Helper', { timeout: 8000 });
    await page.locator('text=Helper').first().click();
    await page.locator('button:has-text("Continue to Details")').click();
    await page.locator('button:has-text("Review & Confirm")').click();
    await page.locator('button:has-text("Request Official Quote")').click();
    await page.waitForSelector('text=Quotation Request Sent!', { timeout: 12000 });
  });

  // Equipment Rental Service
  await runTest('Book Service - Equipment Rental', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Equipment Rental")').click();
    await page.waitForSelector('text=Generator', { timeout: 8000 });
    await page.locator('text=Generator').first().click();
    await page.locator('button:has-text("Continue to Details")').click();
    await page.locator('button:has-text("Review & Confirm")').click();
    await page.locator('button:has-text("Request Official Quote")').click();
    await page.waitForSelector('text=Quotation Request Sent!', { timeout: 12000 });
  });

  // Materials Service (Redirects to Shop)
  await runTest('Book Service - Materials (Shop Redirect)', 'CUSTOMER', async (_, page) => {
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Materials")').click();
    await page.waitForURL(/.*\/shop/, { timeout: 8000 });
  });

  // ==========================================
  // 3. API QUOTE APPROVAL & REJECTION
  // ==========================================
  await runTest('API Quote Approval & Rejection', 'CUSTOMER', async (_, page) => {
    // Approve quote
    const approveRes = await page.request.post(`${BASE_URL}/api/customer/quotes/qt-2026-0081`, {
      data: { action: 'APPROVE' },
    });
    if (!approveRes.ok()) throw new Error(`Approve quote failed: ${approveRes.status()}`);
    const approveData = await approveRes.json();
    if (!approveData.success || approveData.status !== 'APPROVED') {
      throw new Error(`Approve quote unexpected response: ${JSON.stringify(approveData)}`);
    }

    // Reject quote
    const rejectRes = await page.request.post(`${BASE_URL}/api/customer/quotes/qt-2026-0081`, {
      data: { action: 'REJECT' },
    });
    if (!rejectRes.ok()) throw new Error(`Reject quote failed: ${rejectRes.status()}`);
    const rejectData = await rejectRes.json();
    if (!rejectData.success || rejectData.status !== 'REJECTED') {
      throw new Error(`Reject quote unexpected response: ${JSON.stringify(rejectData)}`);
    }
  });

  // ==========================================
  // 4. TECHNICIAN PORTAL
  // ==========================================
  await runTest('Technician Portal (/en/tech)', 'TECHNICIAN', async (_, page) => {
    await page.goto(`${BASE_URL}/en/tech`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=TECHNICIAN', { timeout: 10000 });
    await page.waitForSelector('text=Jobs today', { timeout: 8000 });
    await page.waitForSelector('text=Today\'s Schedule', { timeout: 8000 });
  });

  // ==========================================
  // 5. ADMIN PORTAL PAGES
  // ==========================================
  const adminPages = [
    { name: 'Admin Dashboard', path: '/en/admin', checkText: 'Executive Operations' },
    { name: 'Admin Dispatch Board', path: '/en/admin/dispatch', checkText: 'Intelligent Dispatch Board' },
    { name: 'Admin Service Requests', path: '/en/admin/service-requests', checkText: 'Service Requests' },
    { name: 'Admin Work Orders', path: '/en/admin/work-orders', checkText: 'Work Orders' },
    { name: 'Admin Technicians', path: '/en/admin/technicians', checkText: 'Technicians' },
    { name: 'Admin Customers', path: '/en/admin/customers', checkText: 'Customers' },
    { name: 'Admin Analytics', path: '/en/admin/analytics', checkText: 'Profitability' },
    { name: 'Admin Finance', path: '/en/admin/finance', checkText: 'Finance' },
  ];

  for (const adm of adminPages) {
    await runTest(`${adm.name} (${adm.path})`, 'SUPER_ADMIN', async (_, page) => {
      await page.goto(`${BASE_URL}${adm.path}`, { waitUntil: 'networkidle' });
      await page.waitForSelector(`text=${adm.checkText}`, { timeout: 15000 });
    });
  }

  // ==========================================
  // PRINT SUMMARY
  // ==========================================
  console.log('\n================ SMOKE TEST RESULTS ================');
  console.table(
    results.map((r) => ({
      Test: r.name,
      Status: r.status,
      'Duration (ms)': r.durationMs,
      Errors: r.errors.length,
    }))
  );

  if (totalErrors > 0) {
    console.error(`\nTEST SUITE FAILED with ${totalErrors} errors!`);
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.error(`\nFailed: ${r.name}`);
        r.errors.forEach((e) => console.error(`  - ${e}`));
      });
    process.exit(1);
  } else {
    console.log(`\nALL ${results.length} TESTS PASSED WITH 0 ERRORS!`);
  }
}

main().catch((err) => {
  console.error('Smoke test suite failed with error:', err);
  process.exit(1);
});
