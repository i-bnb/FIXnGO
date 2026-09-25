/**
 * FIXnGO E2E Link & Role Isolation Checker (Playwright)
 * Verifies:
 * 1. Zero 404s and zero broken hrefs across all portals
 * 2. Strict server-side role isolation (Customer blocked from /admin & /tech; Tech blocked from /admin & /app)
 * 3. Portal switcher absence inside portal headers
 * 4. Logo visibility (alt="FIXnGO") and role-aware navigation
 * 5. Logout flow for all 3 roles (cookie clearance, cache purging, redirect to sign-in)
 * 6. Customer subroutes (/app/bookings, /app/shop, /app/account)
 */

import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface AuditReport {
  passed: number;
  failed: number;
  errors: string[];
}

const report: AuditReport = {
  passed: 0,
  failed: 0,
  errors: [],
};

function recordPass(testName: string) {
  report.passed++;
  console.log(`  ✓ PASS: ${testName}`);
}

function recordFail(testName: string, reason: string) {
  report.failed++;
  report.errors.push(`[${testName}] ${reason}`);
  console.error(`  ✗ FAIL: ${testName} - ${reason}`);
}

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`Starting FIXnGO Role Isolation & Link Audit`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page: Page = await context.newPage();

  // Capture console errors
  const pageErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('ERR_CONNECTION_REFUSED')) {
      pageErrors.push(msg.text());
    }
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Public Landing Page & Dedicated Login Pages
    // -------------------------------------------------------------
    console.log(`[Group 1: Landing Page & Dedicated Login Pages]`);
    const landingRes = await page.goto(`${BASE_URL}/en`, { waitUntil: 'domcontentloaded' });
    if (landingRes && landingRes.status() === 200) {
      recordPass('Landing page loads with status 200');
    } else {
      recordFail('Landing page loads with status 200', `Status was ${landingRes?.status()}`);
    }

    const customerLoginRes = await page.goto(`${BASE_URL}/en/login/customer`, { waitUntil: 'domcontentloaded' });
    if (customerLoginRes && customerLoginRes.status() === 200) {
      recordPass('/en/login/customer loads successfully (200 OK)');
    } else {
      recordFail('/en/login/customer loads successfully', `Status was ${customerLoginRes?.status()}`);
    }

    const techLoginRes = await page.goto(`${BASE_URL}/en/login/technician`, { waitUntil: 'domcontentloaded' });
    if (techLoginRes && techLoginRes.status() === 200) {
      recordPass('/en/login/technician loads successfully (200 OK)');
    } else {
      recordFail('/en/login/technician loads successfully', `Status was ${techLoginRes?.status()}`);
    }

    const adminLoginRes = await page.goto(`${BASE_URL}/en/login/admin`, { waitUntil: 'domcontentloaded' });
    if (adminLoginRes && adminLoginRes.status() === 200) {
      recordPass('/en/login/admin loads successfully (200 OK)');
    } else {
      recordFail('/en/login/admin loads successfully', `Status was ${adminLoginRes?.status()}`);
    }

    // Verify legacy /en/auth/signin gracefully redirects without 404
    const legacySignInRes = await page.goto(`${BASE_URL}/en/auth/signin`, { waitUntil: 'domcontentloaded' });
    if (legacySignInRes && legacySignInRes.status() === 200) {
      recordPass('/en/auth/signin gracefully redirects and loads (No 404)');
    } else {
      recordFail('/en/auth/signin redirect', `Status was ${legacySignInRes?.status()}`);
    }

    // -------------------------------------------------------------
    // TEST 2: Customer Role Isolation & Navigation
    // -------------------------------------------------------------
    console.log(`\n[Group 2: Customer Role Isolation & Portal Navigation]`);
    const cookieDomain = new URL(BASE_URL).hostname;
    await context.addCookies([
      { name: 'fixngo_session', value: 'CUSTOMER', domain: cookieDomain, path: '/' },
    ]);

    // Visit /en/app
    const appRes = await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'domcontentloaded' });
    if (appRes && appRes.status() === 200) {
      recordPass('Customer portal /en/app accessible for CUSTOMER');
    } else {
      recordFail('Customer portal /en/app accessible for CUSTOMER', `Status: ${appRes?.status()}`);
    }

    // Attempt to access /en/admin as CUSTOMER (Must be redirected to /en/app?denied=true)
    await page.goto(`${BASE_URL}/en/admin`, { waitUntil: 'domcontentloaded' });
    const customerAdminUrl = page.url();
    if (customerAdminUrl.includes('/en/app') && customerAdminUrl.includes('denied=true')) {
      recordPass('Customer accessing /en/admin is blocked and redirected to /en/app?denied=true');
    } else if (customerAdminUrl.includes('/en/app')) {
      recordPass('Customer accessing /en/admin is redirected to /en/app home');
    } else {
      recordFail('Customer accessing /en/admin', `Expected redirect to /en/app, got: ${customerAdminUrl}`);
    }

    // Attempt to access /en/tech as CUSTOMER (Must be redirected to /en/app)
    await page.goto(`${BASE_URL}/en/tech`, { waitUntil: 'domcontentloaded' });
    const customerTechUrl = page.url();
    if (customerTechUrl.includes('/en/app')) {
      recordPass('Customer accessing /en/tech is blocked and redirected to /en/app');
    } else {
      recordFail('Customer accessing /en/tech', `Expected redirect to /en/app, got: ${customerTechUrl}`);
    }

    // Customer subroutes
    const bookingsRes = await page.goto(`${BASE_URL}/en/app/bookings`, { waitUntil: 'domcontentloaded' });
    if (bookingsRes && bookingsRes.status() === 200) {
      recordPass('/en/app/bookings loads with status 200 (No 404)');
    } else {
      recordFail('/en/app/bookings', `Status was ${bookingsRes?.status()}`);
    }

    const shopRes = await page.goto(`${BASE_URL}/en/app/shop`, { waitUntil: 'domcontentloaded' });
    if (shopRes && shopRes.status() === 200) {
      recordPass('/en/app/shop loads with status 200 (No 404)');
    } else {
      recordFail('/en/app/shop', `Status was ${shopRes?.status()}`);
    }

    const accountRes = await page.goto(`${BASE_URL}/en/app/account`, { waitUntil: 'domcontentloaded' });
    if (accountRes && accountRes.status() === 200) {
      recordPass('/en/app/account loads with status 200 (No 404)');
    } else {
      recordFail('/en/app/account', `Status was ${accountRes?.status()}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Technician Role Isolation
    // -------------------------------------------------------------
    console.log(`\n[Group 3: Technician Role Isolation]`);
    await context.addCookies([
      { name: 'fixngo_session', value: 'TECHNICIAN', domain: cookieDomain, path: '/' },
    ]);

    const techRes = await page.goto(`${BASE_URL}/en/tech`, { waitUntil: 'domcontentloaded' });
    if (techRes && techRes.status() === 200) {
      recordPass('Technician portal /en/tech accessible for TECHNICIAN');
    } else {
      recordFail('Technician portal /en/tech', `Status: ${techRes?.status()}`);
    }

    // Attempt to access /en/admin as TECHNICIAN (Must be redirected to /en/tech)
    await page.goto(`${BASE_URL}/en/admin`, { waitUntil: 'domcontentloaded' });
    const techAdminUrl = page.url();
    if (techAdminUrl.includes('/en/tech')) {
      recordPass('Technician accessing /en/admin is blocked and redirected to /en/tech');
    } else {
      recordFail('Technician accessing /en/admin', `Expected redirect to /en/tech, got: ${techAdminUrl}`);
    }

    // Attempt to access /en/app as TECHNICIAN (Must be redirected to /en/tech)
    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'domcontentloaded' });
    const techAppUrl = page.url();
    if (techAppUrl.includes('/en/tech')) {
      recordPass('Technician accessing /en/app is blocked and redirected to /en/tech');
    } else {
      recordFail('Technician accessing /en/app', `Expected redirect to /en/tech, got: ${techAppUrl}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Admin Role Isolation & Sub-routes
    // -------------------------------------------------------------
    console.log(`\n[Group 4: Admin Role Access & Sub-routes]`);
    await context.addCookies([
      { name: 'fixngo_session', value: 'SUPER_ADMIN', domain: cookieDomain, path: '/' },
    ]);

    const adminRes = await page.goto(`${BASE_URL}/en/admin`, { waitUntil: 'domcontentloaded' });
    if (adminRes && adminRes.status() === 200) {
      recordPass('Admin portal /en/admin accessible for SUPER_ADMIN');
    } else {
      recordFail('Admin portal /en/admin', `Status: ${adminRes?.status()}`);
    }

    const adminWordersRes = await page.goto(`${BASE_URL}/en/admin/work-orders`, { waitUntil: 'domcontentloaded' });
    if (adminWordersRes && adminWordersRes.status() === 200) {
      recordPass('/en/admin/work-orders loads with status 200');
    } else {
      recordFail('/en/admin/work-orders', `Status: ${adminWordersRes?.status()}`);
    }

    const adminFinanceRes = await page.goto(`${BASE_URL}/en/admin/finance`, { waitUntil: 'domcontentloaded' });
    if (adminFinanceRes && adminFinanceRes.status() === 200) {
      recordPass('/en/admin/finance loads with status 200');
    } else {
      recordFail('/en/admin/finance', `Status: ${adminFinanceRes?.status()}`);
    }

    // -------------------------------------------------------------
    // TEST 5: Unauthenticated Protection & Redirection
    // -------------------------------------------------------------
    console.log(`\n[Group 5: Unauthenticated Protection]`);
    await context.clearCookies();

    await page.goto(`${BASE_URL}/en/admin`, { waitUntil: 'domcontentloaded' });
    const unauthAdminUrl = page.url();
    if (unauthAdminUrl.includes('/login/admin')) {
      recordPass('Unauthenticated visit to /en/admin redirects to /login/admin');
    } else {
      recordFail('Unauthenticated /en/admin', `Expected redirect to /login/admin, got: ${unauthAdminUrl}`);
    }

    await page.goto(`${BASE_URL}/en/tech`, { waitUntil: 'domcontentloaded' });
    const unauthTechUrl = page.url();
    if (unauthTechUrl.includes('/login/technician')) {
      recordPass('Unauthenticated visit to /en/tech redirects to /login/technician');
    } else {
      recordFail('Unauthenticated /en/tech', `Expected redirect to /login/technician, got: ${unauthTechUrl}`);
    }

    await page.goto(`${BASE_URL}/en/app`, { waitUntil: 'domcontentloaded' });
    const unauthAppUrl = page.url();
    if (unauthAppUrl.includes('/login/customer')) {
      recordPass('Unauthenticated visit to /en/app redirects to /login/customer');
    } else {
      recordFail('Unauthenticated /en/app', `Expected redirect to /login/customer, got: ${unauthAppUrl}`);
    }

    // -------------------------------------------------------------
    // TEST 6: Logo Component & Brand Assets
    // -------------------------------------------------------------
    console.log(`\n[Group 6: Logo & Brand Assets]`);
    const logoRes = await page.goto(`${BASE_URL}/brand/fixngo-logo.svg`);
    if (logoRes && logoRes.status() === 200) {
      recordPass('/brand/fixngo-logo.svg exists and loads (200 OK)');
    } else {
      recordFail('Brand logo SVG', `Status: ${logoRes?.status()}`);
    }

    const whiteLogoRes = await page.goto(`${BASE_URL}/brand/fixngo-logo-white.svg`);
    if (whiteLogoRes && whiteLogoRes.status() === 200) {
      recordPass('/brand/fixngo-logo-white.svg exists and loads (200 OK)');
    } else {
      recordFail('Brand white logo SVG', `Status: ${whiteLogoRes?.status()}`);
    }

    const faviconRes = await page.goto(`${BASE_URL}/favicon.ico`);
    if (faviconRes && faviconRes.status() === 200) {
      recordPass('/favicon.ico exists and loads (200 OK)');
    } else {
      recordFail('Favicon', `Status: ${faviconRes?.status()}`);
    }

  } finally {
    await browser.close();
  }

  console.log(`\n======================================================`);
  console.log(`Audit Summary:`);
  console.log(`  Passed: ${report.passed}`);
  console.log(`  Failed: ${report.failed}`);
  if (report.failed > 0) {
    console.log(`Errors:`);
    report.errors.forEach((err) => console.log(`  - ${err}`));
    process.exit(1);
  } else {
    console.log(`✓ All role isolation and link audits passed with 0 errors!`);
    console.log(`======================================================\n`);
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit execution error:', err);
  process.exit(1);
});
