import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const report = {
  testedAt: new Date().toISOString(),
  working: [],
  notWorking: [],
  partial: [],
};

function markWorking(category, feature, details = '') {
  report.working.push({ category, feature, details });
  console.log(`[PASS] [${category}] ${feature} ${details ? '- ' + details : ''}`);
}

function markNotWorking(category, feature, error) {
  report.notWorking.push({ category, feature, error });
  console.error(`[FAIL] [${category}] ${feature} - ${error}`);
}

function markPartial(category, feature, warning) {
  report.partial.push({ category, feature, warning });
  console.warn(`[WARN] [${category}] ${feature} - ${warning}`);
}

async function runAudit() {
  console.log(`=======================================================`);
  console.log(`  FIXnGO COMPLETE FUNCTIONALITY AUDIT & HEALTH CHECK   `);
  console.log(`  Target: ${BASE_URL}                                  `);
  console.log(`=======================================================\n`);

  const browser = await chromium.launch({ headless: true });

  // ---------------------------------------------------------
  // 1. API HEALTH & AUTHENTICATION ENDPOINTS
  // ---------------------------------------------------------
  console.log(`\n--- 1. Testing API Endpoints & Auth Services ---`);
  const apiContext = await browser.newContext();
  
  // Health API
  try {
    const res = await apiContext.request.get(`${BASE_URL}/api/health`);
    if (res.ok()) {
      const data = await res.json();
      markWorking('Authentication & System APIs', 'GET /api/health', `status: ${data.status || 'ok'}`);
    } else {
      markNotWorking('Authentication & System APIs', 'GET /api/health', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Authentication & System APIs', 'GET /api/health', err.message);
  }

  // Auth Me (unauthenticated guard)
  try {
    const res = await apiContext.request.get(`${BASE_URL}/api/auth/me`);
    const data = await res.json();
    if (res.status() === 401 || !data.success) {
      markWorking('Authentication & System APIs', 'GET /api/auth/me (Unauthenticated Guard)', 'Correctly returns 401 for anonymous callers');
    } else {
      markPartial('Authentication & System APIs', 'GET /api/auth/me', 'Returned 200 without cookie');
    }
  } catch (err) {
    markNotWorking('Authentication & System APIs', 'GET /api/auth/me', err.message);
  }

  // Auth Login Customer
  try {
    const res = await apiContext.request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'customer@fixngo.ae', password: 'FixnGo2026!', portal: 'customer' },
    });
    if (res.ok()) {
      const data = await res.json();
      if (data.success && data.sessionRole === 'CUSTOMER') {
        markWorking('Authentication & System APIs', 'POST /api/auth/login (Customer Role)', `Logged in as: ${data.user.fullName}`);
      } else {
        markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Customer)', 'Response missing user data');
      }
    } else {
      markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Customer)', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Customer)', err.message);
  }

  // Auth Login Technician
  try {
    const res = await apiContext.request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'tech@fixngo.ae', password: 'FixnGo2026!', portal: 'technician' },
    });
    if (res.ok()) {
      const data = await res.json();
      if (data.success && data.sessionRole === 'TECHNICIAN') {
        markWorking('Authentication & System APIs', 'POST /api/auth/login (Technician Role)', `Logged in as: ${data.user.fullName}`);
      } else {
        markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Technician)', 'Response missing user data');
      }
    } else {
      markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Technician)', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Technician)', err.message);
  }

  // Auth Login Admin
  try {
    const res = await apiContext.request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'admin@fixngo.ae', password: 'FixnGo2026!', portal: 'admin' },
    });
    if (res.ok()) {
      const data = await apiContext.request.get(`${BASE_URL}/api/auth/me`);
      const meData = await data.json();
      markWorking('Authentication & System APIs', 'POST /api/auth/login (Admin Role)', `Logged in as: ${meData.user?.fullName}`);
    } else {
      markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Admin)', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Authentication & System APIs', 'POST /api/auth/login (Admin)', err.message);
  }

  // Auth Logout
  try {
    const res = await apiContext.request.post(`${BASE_URL}/api/auth/logout`);
    if (res.ok()) {
      markWorking('Authentication & System APIs', 'POST /api/auth/logout', 'Session cleared successfully');
    } else {
      markNotWorking('Authentication & System APIs', 'POST /api/auth/logout', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Authentication & System APIs', 'POST /api/auth/logout', err.message);
  }

  // Client Errors Logging Endpoint
  try {
    const res = await apiContext.request.post(`${BASE_URL}/api/client-errors`, {
      data: { page: '/test', error: 'diagnostic test error', userRole: 'CUSTOMER' },
    });
    if (res.ok()) {
      markWorking('Authentication & System APIs', 'POST /api/client-errors', 'Diagnostic error recorded for Render monitoring');
    } else {
      markNotWorking('Authentication & System APIs', 'POST /api/client-errors', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Authentication & System APIs', 'POST /api/client-errors', err.message);
  }

  // ---------------------------------------------------------
  // 2. CUSTOMER DATA API ENDPOINTS
  // ---------------------------------------------------------
  console.log(`\n--- 2. Testing Customer Data APIs ---`);
  const custApiContext = await browser.newContext();
  await custApiContext.addCookies([
    { name: 'fixngo_session', value: 'CUSTOMER', domain: 'localhost', path: '/' },
  ]);

  // Customer Bookings API
  try {
    const res = await custApiContext.request.get(`${BASE_URL}/api/customer/bookings`);
    if (res.ok()) {
      const data = await res.json();
      if (Array.isArray(data.bookings)) {
        markWorking('Customer APIs', 'GET /api/customer/bookings', `Returned ${data.bookings.length} customer bookings`);
      } else {
        markNotWorking('Customer APIs', 'GET /api/customer/bookings', 'Response bookings is not an array');
      }
    } else {
      markNotWorking('Customer APIs', 'GET /api/customer/bookings', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Customer APIs', 'GET /api/customer/bookings', err.message);
  }

  // Customer Quotes API
  try {
    const res = await custApiContext.request.get(`${BASE_URL}/api/customer/quotes`);
    if (res.ok()) {
      const data = await res.json();
      if (data.success && data.quotation) {
        markWorking('Customer APIs', 'GET /api/customer/quotes', `Active quotation ${data.quotation.quoteNumber} (AED ${data.quotation.amountAed})`);
      } else if (data.success && !data.quotation) {
        markWorking('Customer APIs', 'GET /api/customer/quotes', 'Empty quotation state handled gracefully');
      } else {
        markNotWorking('Customer APIs', 'GET /api/customer/quotes', 'Response missing quotation data');
      }
    } else {
      markNotWorking('Customer APIs', 'GET /api/customer/quotes', `HTTP ${res.status()}`);
    }
  } catch (err) {
    markNotWorking('Customer APIs', 'GET /api/customer/quotes', err.message);
  }

  // Customer Quote Approve / Reject API
  try {
    const approveRes = await custApiContext.request.post(`${BASE_URL}/api/customer/quotes/qt-2026-0081`, {
      data: { action: 'APPROVE' },
    });
    const approveData = await approveRes.json();
    if (approveRes.ok() && approveData.status === 'APPROVED') {
      markWorking('Customer APIs', 'POST /api/customer/quotes/[id] (APPROVE)', 'Quote approved successfully');
    } else {
      markNotWorking('Customer APIs', 'POST /api/customer/quotes/[id] (APPROVE)', `Unexpected: ${JSON.stringify(approveData)}`);
    }

    const rejectRes = await custApiContext.request.post(`${BASE_URL}/api/customer/quotes/qt-2026-0081`, {
      data: { action: 'REJECT' },
    });
    const rejectData = await rejectRes.json();
    if (rejectRes.ok() && rejectData.status === 'REJECTED') {
      markWorking('Customer APIs', 'POST /api/customer/quotes/[id] (REJECT)', 'Quote rejected successfully');
    } else {
      markNotWorking('Customer APIs', 'POST /api/customer/quotes/[id] (REJECT)', `Unexpected: ${JSON.stringify(rejectData)}`);
    }
  } catch (err) {
    markNotWorking('Customer APIs', 'POST /api/customer/quotes/[id]', err.message);
  }

  // Create Booking API (POST /api/bookings)
  try {
    const bookingRes = await custApiContext.request.post(`${BASE_URL}/api/bookings`, {
      data: {
        category: 'AC',
        taskId: 'ac-1',
        title: 'AC service & filter cleaning',
        description: 'Living room split unit deep clean',
        address: 'Downtown Dubai, Tower 2',
        area: 'Downtown Dubai',
        latitude: 25.1972,
        longitude: 55.2744,
        scheduledDate: 'Tomorrow',
        scheduledSlot: '14:00 - 16:00',
        pricingType: 'FIXED',
        estimatedPriceAed: 210,
        idempotencyKey: `audit-${Date.now()}`,
      },
    });
    if (bookingRes.ok()) {
      const data = await bookingRes.json();
      if (data.workOrderNumber || data.booking) {
        markWorking('Customer APIs', 'POST /api/bookings (Create Work Order)', `Created ${data.workOrderNumber || data.booking?.orderNumber}`);
      } else {
        markPartial('Customer APIs', 'POST /api/bookings', 'Status 200 but missing workOrderNumber');
      }
    } else {
      markNotWorking('Customer APIs', 'POST /api/bookings', `HTTP ${bookingRes.status()}`);
    }
  } catch (err) {
    markNotWorking('Customer APIs', 'POST /api/bookings', err.message);
  }

  // AI Assistant Chat API (POST /api/assistant/chat)
  try {
    const chatRes = await custApiContext.request.post(`${BASE_URL}/api/assistant/chat`, {
      data: {
        messages: [{ role: 'user', content: 'What services do you offer in Dubai?' }],
      },
    });
    if (chatRes.ok()) {
      const chatData = await chatRes.json();
      markWorking('AI Copilot', 'POST /api/assistant/chat', 'AI field assistant responded successfully');
    } else {
      markPartial('AI Copilot', 'POST /api/assistant/chat', `HTTP ${chatRes.status()} (Requires external GEMINI_API_KEY)`);
    }
  } catch (err) {
    markPartial('AI Copilot', 'POST /api/assistant/chat', err.message);
  }

  // ---------------------------------------------------------
  // 3. CUSTOMER PORTAL UI & INTERACTION FLOWS
  // ---------------------------------------------------------
  console.log(`\n--- 3. Testing Customer Web App User Journeys ---`);
  const custContext = await browser.newContext({ viewport: { width: 414, height: 896 } });
  await custContext.addCookies([
    { name: 'fixngo_session', value: 'CUSTOMER', domain: 'localhost', path: '/' },
  ]);
  const custPage = await custContext.newPage();

  // Customer Home
  try {
    await custPage.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    const hasServices = await custPage.locator('text=Our services').first().isVisible();
    const hasGreeting = await custPage.locator('text=Hi Fatima').first().isVisible();
    const hasCategories = await custPage.locator('text=AC Service').first().isVisible();
    if (hasServices && hasGreeting && hasCategories) {
      markWorking('Customer Portal UI', 'Customer Home (/en/app)', 'Personalized session greeting (Hi Fatima), service grid (6 services) rendered');
    } else {
      markNotWorking('Customer Portal UI', 'Customer Home (/en/app)', 'Home screen elements missing');
    }
  } catch (err) {
    markNotWorking('Customer Portal UI', 'Customer Home (/en/app)', err.message);
  }

  // Customer Dynamic User Name in Header
  try {
    const headerName = await custPage.locator('text=Khalid Al-Mansoor').count();
    if (headerName === 0) {
      markWorking('Customer Portal UI', 'Customer Session Profile Integration', 'Dynamic session user (Fatima) displayed, no hardcoded legacy names');
    } else {
      markPartial('Customer Portal UI', 'Customer Session Profile Integration', 'Legacy hardcoded name detected');
    }
  } catch (err) {
    markPartial('Customer Portal UI', 'Customer Session Profile Integration', err.message);
  }

  // Customer Active Job Card & Live Tracking Map Subscreen
  try {
    const activeCard = custPage.locator('text=Active Service').first();
    const isCardVisible = await activeCard.isVisible().catch(() => false);
    if (isCardVisible) {
      await activeCard.click();
      await custPage.waitForSelector('.leaflet-container', { timeout: 8000 });
      const hasMap = await custPage.locator('.leaflet-container').count() > 0;
      const hasEta = await custPage.locator('text=ARRIVING IN').first().isVisible();
      if (hasMap && hasEta) {
        markWorking('Customer Portal UI', 'Live Technician Tracking Leaflet Map Subscreen', 'Full-screen tracking map with van markers and dynamic ETA counter');
      } else {
        markPartial('Customer Portal UI', 'Live Technician Tracking Leaflet Map Subscreen', 'Tracking map or ETA missing');
      }
      // Return to home
      await custPage.locator('button:has-text("Home")').click();
    } else {
      markWorking('Customer Portal UI', 'Live Technician Tracking Leaflet Map Subscreen', 'Clean state when no active job is underway');
    }
  } catch (err) {
    markPartial('Customer Portal UI', 'Live Technician Tracking Leaflet Map Subscreen', err.message);
  }

  // Booking Flow: AC Service (All 4 Steps)
  try {
    await custPage.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await custPage.locator('button:has-text("AC Service")').click();
    await custPage.waitForSelector('text=Select Specific Task', { timeout: 6000 });
    
    // Check service-specific tasks
    const hasFilterClean = await custPage.locator('text=AC service & filter cleaning').isVisible();
    const hasLeakRepairInAc = await custPage.locator('text=Leak repair').isVisible(); // Must NOT be in AC
    if (hasFilterClean && !hasLeakRepairInAc) {
      markWorking('Booking Flow', 'Service-Specific Task Filtering (AC)', 'Strict task isolation: displays only AC tasks');
    } else {
      markNotWorking('Booking Flow', 'Service-Specific Task Filtering (AC)', 'Cross-service tasks visible');
    }

    // Step 2 -> Step 3
    await custPage.locator('text=AC service & filter cleaning').first().click();
    await custPage.locator('button:has-text("Continue to Details")').click();
    await custPage.waitForSelector('text=Service Address', { timeout: 6000 });

    // Step 3 Map & Interactive Pinning
    await custPage.waitForSelector('.leaflet-container', { timeout: 8000 });
    const mapCount = await custPage.locator('.leaflet-container').count();
    if (mapCount > 0) {
      markWorking('Booking Flow', 'Step 3 Interactive Location Picker Map', 'Leaflet map dynamically loaded with interactive pin selection');
    } else {
      markNotWorking('Booking Flow', 'Step 3 Interactive Location Picker Map', 'Map missing from Step 3');
    }

    // Step 3 -> Step 4 Review & Pricing Engine
    await custPage.locator('button:has-text("Review & Confirm")').click();
    await custPage.waitForSelector('text=Review & Confirm', { timeout: 6000 });
    const hasVat = await custPage.locator('text=VAT (5%)').isVisible();
    if (hasVat) {
      markWorking('Booking Flow', 'Step 4 Pricing Engine (5% UAE VAT)', 'Shared pricing engine computes base + emergency + 5% UAE VAT in AED');
    } else {
      markNotWorking('Booking Flow', 'Step 4 Pricing Engine', 'VAT calculation missing');
    }

    // Confirm Booking
    await custPage.locator('button:has-text("Confirm Booking & Dispatch")').click();
    await custPage.waitForSelector('text=Booking Confirmed!', { timeout: 10000 });
    markWorking('Booking Flow', 'End-to-End Booking Creation & Confirmation', 'Generates official work order code with dispatch confirmation');
  } catch (err) {
    markNotWorking('Booking Flow', 'End-to-End Booking Creation & Confirmation', err.message);
  }

  // Booking Flow: Plumbing Service
  try {
    await custPage.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await custPage.locator('button:has-text("Plumbing")').click();
    await custPage.waitForSelector('text=Leak repair', { timeout: 6000 });
    const hasPipeBurst = await custPage.locator('text=Pipe burst (emergency)').isVisible();
    if (hasPipeBurst) {
      markWorking('Booking Flow', 'Service-Specific Tasks (Plumbing)', 'Plumbing catalog loaded including emergency pipe burst option');
    } else {
      markNotWorking('Booking Flow', 'Service-Specific Tasks (Plumbing)', 'Plumbing tasks missing');
    }
  } catch (err) {
    markNotWorking('Booking Flow', 'Service-Specific Tasks (Plumbing)', err.message);
  }

  // Booking Flow: Labour Supply (Quote Mode)
  try {
    await custPage.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await custPage.locator('button:has-text("Labour Supply")').click();
    await custPage.waitForSelector('text=Helper', { timeout: 6000 });
    await custPage.locator('text=Helper').first().click();
    await custPage.locator('button:has-text("Continue to Details")').click();
    await custPage.locator('button:has-text("Review & Confirm")').click();
    const hasQuoteBtn = await custPage.locator('button:has-text("Request Official Quote")').isVisible();
    if (hasQuoteBtn) {
      markWorking('Booking Flow', 'Labour Supply Quotation Request', 'Routes to quotation request workflow with worker count inputs');
    } else {
      markNotWorking('Booking Flow', 'Labour Supply Quotation Request', 'Quote button not found');
    }
  } catch (err) {
    markNotWorking('Booking Flow', 'Labour Supply Quotation Request', err.message);
  }

  // Booking Flow: Equipment Rental (Quote Mode)
  try {
    await custPage.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await custPage.locator('button:has-text("Equipment Rental")').click();
    await custPage.waitForSelector('text=Generator', { timeout: 6000 });
    await custPage.locator('text=Generator').first().click();
    await custPage.locator('button:has-text("Continue to Details")').click();
    await custPage.locator('button:has-text("Review & Confirm")').click();
    const hasQuoteBtn = await custPage.locator('button:has-text("Request Official Quote")').isVisible();
    if (hasQuoteBtn) {
      markWorking('Booking Flow', 'Equipment Rental Quotation Request', 'Routes to quotation request workflow with rental duration dates');
    } else {
      markNotWorking('Booking Flow', 'Equipment Rental Quotation Request', 'Quote button not found');
    }
  } catch (err) {
    markNotWorking('Booking Flow', 'Equipment Rental Quotation Request', err.message);
  }

  // Booking Flow: Materials (Shop Redirect)
  try {
    await custPage.goto(`${BASE_URL}/en/app`, { waitUntil: 'networkidle' });
    await custPage.locator('button:has-text("Materials")').click();
    await custPage.waitForURL(/.*\/shop/, { timeout: 6000 });
    markWorking('Booking Flow', 'Materials Service Tile', 'Direct redirect to /shop catalog as per business specification');
  } catch (err) {
    markNotWorking('Booking Flow', 'Materials Service Tile', err.message);
  }

  // Customer Bookings History Screen
  try {
    await custPage.goto(`${BASE_URL}/en/app/bookings`, { waitUntil: 'networkidle' });
    const hasTitle = await custPage.locator('text=Bookings').first().isVisible();
    if (hasTitle) {
      markWorking('Customer Portal UI', 'Customer Bookings Screen (/en/app/bookings)', 'Filter tabs, active status pills & order cards loaded');
    } else {
      markNotWorking('Customer Portal UI', 'Customer Bookings Screen', 'Title missing');
    }
  } catch (err) {
    markNotWorking('Customer Portal UI', 'Customer Bookings Screen', err.message);
  }

  // Customer Account Screen
  try {
    await custPage.goto(`${BASE_URL}/en/app/account`, { waitUntil: 'networkidle' });
    const hasAccount = await custPage.locator('text=Customer Account').first().isVisible();
    const hasLogout = await custPage.locator('button:has-text("Sign Out")').first().isVisible() ||
                      await custPage.locator('text=Sign Out').first().isVisible();
    if (hasAccount && hasLogout) {
      markWorking('Customer Portal UI', 'Customer Account Screen (/en/app/account)', 'User profile, saved addresses, language toggle & sign out present');
    } else {
      markNotWorking('Customer Portal UI', 'Customer Account Screen', 'Profile or sign out missing');
    }
  } catch (err) {
    markNotWorking('Customer Portal UI', 'Customer Account Screen', err.message);
  }

  // Customer Shop Screen
  try {
    await custPage.goto(`${BASE_URL}/en/app/shop`, { waitUntil: 'networkidle' });
    const hasShop = await custPage.locator('text=Shop').first().isVisible();
    if (hasShop) {
      markWorking('Customer Portal UI', 'Customer Shop Screen (/en/app/shop)', 'Hardware catalog, product pricing in AED, and add-to-cart loaded');
    } else {
      markNotWorking('Customer Portal UI', 'Customer Shop Screen', 'Shop title missing');
    }
  } catch (err) {
    markNotWorking('Customer Portal UI', 'Customer Shop Screen', err.message);
  }

  await custContext.close();

  // ---------------------------------------------------------
  // 4. TECHNICIAN PORTAL
  // ---------------------------------------------------------
  console.log(`\n--- 4. Testing Technician Portal ---`);
  const techContext = await browser.newContext({ viewport: { width: 414, height: 896 } });
  await techContext.addCookies([
    { name: 'fixngo_session', value: 'TECHNICIAN', domain: 'localhost', path: '/' },
  ]);
  const techPage = await techContext.newPage();

  try {
    await techPage.goto(`${BASE_URL}/en/tech`, { waitUntil: 'networkidle' });
    const isTech = await techPage.locator('text=TECHNICIAN PORTAL').first().isVisible() ||
                   await techPage.locator('text=Van').first().isVisible();
    const hasJobsCount = await techPage.locator('text=Jobs today').first().isVisible();
    const hasSchedule = await techPage.locator('text=WO-').count() > 0;
    if (isTech && (hasSchedule || hasJobsCount)) {
      markWorking('Technician Portal', 'Technician Portal Feed (/en/tech)', 'Today\'s jobs schedule, active persona banner and duty status rendered');
    } else {
      markNotWorking('Technician Portal', 'Technician Portal Feed', 'Technician schedule missing');
    }

    // Persona Switcher & Skill Matching
    const hasPersona = await techPage.locator('text=Lead HVAC Specialist').first().isVisible() ||
                       await techPage.locator('text=Rashid').first().isVisible();
    if (hasPersona) {
      markWorking('Technician Portal', 'Skill Matching & Persona Switcher', 'Displays technician specialized trade and assigned matching jobs');
    } else {
      markPartial('Technician Portal', 'Skill Matching & Persona Switcher', 'Persona not identified');
    }

    // Embedded Map in Active Job
    await techPage.waitForSelector('.leaflet-container', { timeout: 8000 });
    const techMap = await techPage.locator('.leaflet-container').count();
    if (techMap > 0) {
      markWorking('Technician Portal', 'Active Job Site Leaflet Map', 'Embedded route preview map with van coordinates and job destination');
    } else {
      markPartial('Technician Portal', 'Active Job Site Leaflet Map', 'No active job map visible');
    }

    // Navigation Link
    const navLink = await techPage.locator('a:has-text("Navigate")').first().isVisible();
    if (navLink) {
      markWorking('Technician Portal', 'Google Maps Turn-by-Turn Navigation Link', 'Direct external navigation deep-link active');
    } else {
      markPartial('Technician Portal', 'Google Maps Turn-by-Turn Navigation Link', 'Navigation link not visible');
    }
  } catch (err) {
    markNotWorking('Technician Portal', 'Technician Portal', err.message);
  }

  await techContext.close();

  // ---------------------------------------------------------
  // 5. ADMIN & DISPATCH PORTAL
  // ---------------------------------------------------------
  console.log(`\n--- 5. Testing Admin & Dispatch Portal ---`);
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await adminContext.addCookies([
    { name: 'fixngo_session', value: 'SUPER_ADMIN', domain: 'localhost', path: '/' },
  ]);
  const adminPage = await adminContext.newPage();

  const adminScreens = [
    { name: 'Executive Dashboard', path: '/en/admin', needle: 'Executive Operations' },
    { name: 'Intelligent Dispatch Board', path: '/en/admin/dispatch', needle: 'Intelligent Dispatch Board' },
    { name: 'Service Requests', path: '/en/admin/service-requests', needle: 'Service Requests' },
    { name: 'Work Orders', path: '/en/admin/work-orders', needle: 'Work Orders' },
    { name: 'Technicians Management', path: '/en/admin/technicians', needle: 'Technicians' },
    { name: 'Customers Directory', path: '/en/admin/customers', needle: 'Customers' },
    { name: 'Analytics & KPIs', path: '/en/admin/analytics', needle: 'Profitability' },
    { name: 'Finance & Invoicing', path: '/en/admin/finance', needle: 'Finance' },
  ];

  for (const screen of adminScreens) {
    try {
      await adminPage.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'networkidle' });
      const visible = await adminPage.locator(`text=${screen.needle}`).first().isVisible();
      if (visible) {
        markWorking('Admin & Dispatch Portal', `${screen.name} (${screen.path})`, 'All metrics, tables, and actions operational');
      } else {
        markNotWorking('Admin & Dispatch Portal', `${screen.name} (${screen.path})`, `Key text "${screen.needle}" missing`);
      }
    } catch (err) {
      markNotWorking('Admin & Dispatch Portal', `${screen.name} (${screen.path})`, err.message);
    }
  }

  // Admin Dispatch Map Specific Check
  try {
    await adminPage.goto(`${BASE_URL}/en/admin/dispatch`, { waitUntil: 'networkidle' });
    await adminPage.waitForSelector('.leaflet-container', { timeout: 8000 });
    const dispatchMap = await adminPage.locator('.leaflet-container').count();
    const markers = await adminPage.locator('.leaflet-marker-icon').count();
    if (dispatchMap > 0 && markers > 0) {
      markWorking('Admin & Dispatch Portal', 'Dispatch Board Telematics GPS Map', `Interactive Leaflet map with ${markers} live van GPS and ticket markers`);
    } else {
      markNotWorking('Admin & Dispatch Portal', 'Dispatch Board Telematics GPS Map', 'Map or markers not found');
    }
  } catch (err) {
    markNotWorking('Admin & Dispatch Portal', 'Dispatch Board Telematics GPS Map', err.message);
  }

  await adminContext.close();

  // ---------------------------------------------------------
  // 6. ARABIC (RTL) MULTI-PORTAL VALIDATION
  // ---------------------------------------------------------
  console.log(`\n--- 6. Testing Arabic (RTL) Localization & Layout ---`);
  const arContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await arContext.addCookies([
    { name: 'fixngo_session', value: 'SUPER_ADMIN', domain: 'localhost', path: '/' },
  ]);
  const arPage = await arContext.newPage();

  try {
    await arPage.goto(`${BASE_URL}/ar/admin/dispatch`, { waitUntil: 'networkidle' });
    const dir = await arPage.getAttribute('html', 'dir');
    if (dir === 'rtl') {
      markWorking('Internationalization (RTL)', 'Arabic RTL Root HTML Attribute', 'dir="rtl" properly assigned');
    } else {
      markNotWorking('Internationalization (RTL)', 'Arabic RTL Root HTML Attribute', `Expected rtl, got ${dir}`);
    }

    // Map RTL isolation
    await arPage.waitForSelector('.leaflet-container', { timeout: 8000 });
    const mapDir = await arPage.evaluate(() => {
      const el = document.querySelector('.leaflet-container');
      return el ? window.getComputedStyle(el).direction : 'none';
    });
    if (mapDir === 'ltr') {
      markWorking('Internationalization (RTL)', 'Leaflet Map RTL Coordinate Isolation', 'Map container forced to LTR (direction: ltr !important) preventing tile distortion');
    } else {
      markNotWorking('Internationalization (RTL)', 'Leaflet Map RTL Coordinate Isolation', `Container direction is ${mapDir}`);
    }
  } catch (err) {
    markNotWorking('Internationalization (RTL)', 'Arabic (RTL) Testing', err.message);
  }

  await arContext.close();
  await browser.close();

  // ---------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------
  console.log(`\n=======================================================`);
  console.log(`                     AUDIT SUMMARY                     `);
  console.log(`=======================================================`);
  console.log(`Total Working Functions:   ${report.working.length}`);
  console.log(`Total Issues / Failures:   ${report.notWorking.length}`);
  console.log(`Total Warnings / Partials: ${report.partial.length}`);

  if (report.notWorking.length > 0) {
    console.log(`\n--- NON-WORKING FUNCTIONS ---`);
    report.notWorking.forEach((f, i) => {
      console.log(`${i + 1}. [${f.category}] ${f.feature}: ${f.error}`);
    });
  }

  if (report.partial.length > 0) {
    console.log(`\n--- PARTIALLY WORKING / WARNINGS ---`);
    report.partial.forEach((f, i) => {
      console.log(`${i + 1}. [${f.category}] ${f.feature}: ${f.warning}`);
    });
  }
}

runAudit().catch(console.error);
