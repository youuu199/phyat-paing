import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const BASE = 'http://localhost:5173';
const DIR = new URL('./', import.meta.url).pathname;

await mkdir(DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

async function snap(name, wait = 1000) {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${DIR}${name}`, fullPage: false });
  console.log(`✓ ${name}`);
}

// ===== 1. Login page =====
await page.goto(BASE);
await page.waitForSelector('#auth-email', { timeout: 10000 });
await snap('01-login.png');

// ===== Login =====
await page.locator('#auth-email').fill('demo@pyatpaing.com');
await page.locator('#auth-password').fill('demo1234');
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(3000);

// ===== 2. Dashboard with empty state =====
await snap('02-dashboard-empty.png', 2000);

// ===== 3. Upload section =====
await page.evaluate(() => {
  document.querySelector('.bill-uploader')?.scrollIntoView({ behavior: 'instant' });
});
await snap('03-upload-section.png', 500);

// ===== 4. Empty state close-up =====
await page.evaluate(() => {
  document.querySelector('.empty-state')?.scrollIntoView({ behavior: 'instant', block: 'center' });
});
await snap('04-empty-state.png', 500);

// ===== 5. Category tabs =====
await page.evaluate(() => {
  document.querySelector('.category-tabs')?.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await snap('05-category-tabs.png', 500);

// ===== 6. Sidebar (date filter) =====
// Open sidebar on mobile, or just capture it if visible
const sidebar = page.locator('.sidebar');
if (await sidebar.isVisible()) {
  await snap('06-sidebar.png', 500);
} else {
  // Try clicking sidebar toggle
  const toggle = page.locator('.sidebar-toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await snap('06-sidebar.png', 1000);
    await page.locator('.sidebar__close').click().catch(() => {});
  }
}

// ===== 7. Search bar =====
await page.evaluate(() => {
  document.querySelector('.dashboard__search')?.scrollIntoView({ behavior: 'instant', block: 'center' });
});
const searchInput = page.locator('.dashboard__search-input');
if (await searchInput.isVisible()) {
  await searchInput.fill('electricity');
  await snap('07-search.png', 1000);
  await searchInput.clear();
}

// ===== 8. Theme toggle (dark mode) =====
const themeBtn = page.locator('.theme-toggle').first();
if (await themeBtn.isVisible()) {
  await themeBtn.click();
  await snap('08-dark-mode.png', 1000);
  await themeBtn.click(); // switch back
  await page.waitForTimeout(500);
}

// ===== 9. Mobile nav (resize to mobile first) =====
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1000);
await snap('09-mobile-view.png', 1000);

// Open hamburger menu
const hamburger = page.locator('.hamburger');
if (await hamburger.isVisible()) {
  await hamburger.click();
  await snap('10-mobile-nav.png', 1000);
}

await browser.close();
console.log('\n✅ All screenshots saved to', DIR);
