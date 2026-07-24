import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const DIR = new URL('./', import.meta.url).pathname;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

async function snap(name, wait = 1500) {
  try {
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${DIR}${name}`, fullPage: false });
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
  }
}

// ── Step 1: Navigate to login page and capture ──
console.log('📸 Capturing screenshots at 1280×800\n');

// 1. Login page
await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('01-login.png', 1500);

// ── Step 2: Log in via API ──
console.log('\n🔑 Logging in via API...');
const loginRes = await page.request.post(`${BASE}/api/auth/login`, {
  data: { email: 'you@gmail.com', password: '111111@vV' },
});
const loginData = await loginRes.json();
console.log(`  Status: ${loginRes.status()}, Token: ${loginData.token ? '✓' : '✗'}`);

if (!loginData.token) {
  console.error('❌ Login failed — trying form-based login');

  // Fall back to filling the form
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'you@gmail.com');
  await page.fill('input[type="password"], input[name="password"]', '111111@vV');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
} else {
  // Set token in localStorage and navigate
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await page.evaluate((token) => {
    localStorage.setItem('bill_organizer_token', token);
  }, loginData.token);
}

// ── Step 3: Capture authenticated pages ──
// Wait for dashboard to render
await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('02-dashboard.png', 2500);

// Bills page
await page.goto(`${BASE}/bills`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('03-bills.png', 2000);

// Upload page
await page.goto(`${BASE}/upload`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('04-upload.png', 1500);

// Analytics
await page.goto(`${BASE}/analytics`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('05-analytics.png', 2000);

// Calendar
await page.goto(`${BASE}/calendar`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('06-calendar.png', 2000);

// Settings
await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('07-settings.png', 1500);

// Profile
await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await snap('08-profile.png', 1500);

await browser.close();
console.log('\n✅ All screenshots captured');
