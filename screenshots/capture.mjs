import { chromium } from 'playwright';

const BASE = 'https://phyat-paing.vercel.app';
const DIR = new URL('./', import.meta.url).pathname;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

async function snap(name, wait = 1500) {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${DIR}${name}`, fullPage: false });
  console.log(`✓ ${name}`);
}

// Login via API first — set cookie, then visit pages
const loginRes = await page.request.post(`${BASE}/api/v1/auth/login`, {
  data: { email: 'you@gmail.com', password: '111111@vV' },
});
console.log('Login response status:', loginRes.status());

// Get cookies from the response
const setCookie = loginRes.headers()['set-cookie'];
if (setCookie) {
  console.log('Got set-cookie header, applying...');
  // Parse and set the cookie
  const cookieMatch = setCookie.match(/token=([^;]+)/);
  if (cookieMatch) {
    const token = cookieMatch[1];
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.evaluate((t) => {
      document.cookie = `token=${t}; path=/; max-age=86400`;
    }, token);
  }
}
await page.waitForTimeout(3000);
await snap('02-dashboard.png', 2000);

// Other pages
await page.goto(`${BASE}/bills`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await snap('03-bills.png', 2000);

await page.goto(`${BASE}/upload`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await snap('04-upload.png', 1500);

await page.goto(`${BASE}/analytics`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await snap('05-analytics.png', 2000);

await page.goto(`${BASE}/calendar`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await snap('06-calendar.png', 2000);

await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await snap('07-settings.png', 1500);

await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await snap('08-profile.png', 1500);

await browser.close();
console.log('\n✅ Done');
