import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES  = path.join(__dirname, '..', 'fixtures');

const NEXO   = `file://${path.join(FIXTURES, 'nexoVetPremium.html')}`;
const LEX    = `file://${path.join(FIXTURES, 'lexNova.html')}`;
const AURA   = `file://${path.join(FIXTURES, 'studioAura.html')}`;

// ─── Nexo Vet Premium ────────────────────────────────────────────────────────

test.describe('Nexo Vet Premium — Runtime', () => {
  test.beforeEach(async ({ page }) => { await page.goto(NEXO); });

  test('page renders without blank screen', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('title contains Nexo', async ({ page }) => {
    await expect(page).toHaveTitle(/Nexo/);
  });

  test('has lang="es"', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('es');
  });

  test('vertical attribute is veterinary', async ({ page }) => {
    const v = await page.locator('html').getAttribute('data-vertical');
    expect(v).toBe('veterinary');
  });

  test('typography profile is WARM_HUMANIST', async ({ page }) => {
    const p = await page.locator('html').getAttribute('data-profile');
    expect(p).toBe('WARM_HUMANIST');
  });
});

test.describe('Nexo Vet Premium — Navigation', () => {
  test.beforeEach(async ({ page }) => { await page.goto(NEXO); });

  test('nav is present and has role=navigation', async ({ page }) => {
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
  });

  test('skip link exists in DOM', async ({ page }) => {
    const skip = page.locator('.skip-link');
    await expect(skip).toHaveCount(1);
  });

  test('hamburger button has aria-expanded attribute', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const btn = page.locator('#hamburger');
    await expect(btn).toHaveAttribute('aria-expanded');
  });

  test('hamburger opens mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#hamburger').click();
    await expect(page.locator('#mobileMenu')).toHaveClass(/open/);
    const aria = await page.locator('#hamburger').getAttribute('aria-expanded');
    expect(aria).toBe('true');
  });
});

test.describe('Nexo Vet Premium — Accessibility', () => {
  test.beforeEach(async ({ page }) => { await page.goto(NEXO); });

  test('all images have alt text', async ({ page }) => {
    const imgs = await page.locator('img').all();
    for (const img of imgs) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('all form inputs have labels', async ({ page }) => {
    const inputs = await page.locator('form input[id], form select[id], form textarea[id]').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toHaveCount(1);
    }
  });

  test('nav has aria-label', async ({ page }) => {
    const count = await page.locator('nav[aria-label]').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('h1 heading is visible', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Nexo Vet Premium — Responsive', () => {
  test('no horizontal scroll at 390px (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(NEXO);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(390);
  });

  test('no horizontal scroll at 768px (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(NEXO);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(768);
  });

  test('no horizontal scroll at 1280px (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(NEXO);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(1280);
  });

  test('mobile bottom nav is present', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(NEXO);
    await expect(page.locator('.mobile-nav')).toBeVisible();
  });
});

test.describe('Nexo Vet Premium — Form', () => {
  test.beforeEach(async ({ page }) => { await page.goto(NEXO); });

  test('contact form is present', async ({ page }) => {
    await expect(page.locator('#contactForm')).toBeVisible();
  });

  test('form submit shows success state', async ({ page }) => {
    await page.fill('#nombre', 'Test User');
    await page.fill('#telefono', '600000000');
    await page.fill('#mascota', 'Coco');
    await page.selectOption('#especie', 'perro');
    await page.click('button[type="submit"]');
    await expect(page.locator('#formSuccess')).toHaveClass(/visible/);
  });
});

test.describe('Nexo Vet Premium — Services', () => {
  test.beforeEach(async ({ page }) => { await page.goto(NEXO); });

  test('6 service cards are present', async ({ page }) => {
    await expect(page.locator('.service-card')).toHaveCount(6);
  });

  test('services section has heading', async ({ page }) => {
    await expect(page.locator('#services-heading')).toBeVisible();
  });
});

// ─── LexNova Legal ───────────────────────────────────────────────────────────

test.describe('LexNova Legal — Runtime', () => {
  test.beforeEach(async ({ page }) => { await page.goto(LEX); });

  test('page renders without blank screen', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('title contains LexNova', async ({ page }) => {
    await expect(page).toHaveTitle(/LexNova/);
  });

  test('vertical is legal', async ({ page }) => {
    const v = await page.locator('html').getAttribute('data-vertical');
    expect(v).toBe('legal');
  });

  test('surface profile is NEUTRAL_MINIMAL', async ({ page }) => {
    const s = await page.locator('html').getAttribute('data-surface');
    expect(s).toBe('NEUTRAL_MINIMAL');
  });

  test('typography profile is SERIF_AUTHORITY', async ({ page }) => {
    const p = await page.locator('html').getAttribute('data-profile');
    expect(p).toBe('SERIF_AUTHORITY');
  });
});

test.describe('LexNova Legal — Navigation', () => {
  test.beforeEach(async ({ page }) => { await page.goto(LEX); });

  test('nav has role=navigation', async ({ page }) => {
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
  });

  test('hamburger opens mobile menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#hamburger').click();
    await expect(page.locator('#mobileMenu')).toHaveClass(/open/);
  });
});

test.describe('LexNova Legal — Accessibility', () => {
  test.beforeEach(async ({ page }) => { await page.goto(LEX); });

  test('h1 heading visible', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('all form inputs have labels', async ({ page }) => {
    const inputs = await page.locator('form input[id], form select[id], form textarea[id]').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toHaveCount(1);
    }
  });

  test('skip link exists', async ({ page }) => {
    await expect(page.locator('.skip-link')).toHaveCount(1);
  });
});

test.describe('LexNova Legal — Responsive', () => {
  test('no horizontal scroll at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(LEX);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(390);
  });

  test('no horizontal scroll at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(LEX);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(1280);
  });
});

test.describe('LexNova Legal — Content', () => {
  test.beforeEach(async ({ page }) => { await page.goto(LEX); });

  test('6 practice areas present', async ({ page }) => {
    await expect(page.locator('.area-card')).toHaveCount(6);
  });

  test('form submit shows confirmation', async ({ page }) => {
    await page.fill('#nombre', 'Test Cliente');
    await page.fill('#telefono', '600000000');
    await page.selectOption('#area', 'mercantil');
    await page.fill('#consulta', 'Consulta de prueba');
    await page.click('button[type="submit"]');
    await expect(page.locator('#formSuccess')).toHaveClass(/visible/);
  });
});

// ─── Studio Aura ─────────────────────────────────────────────────────────────

test.describe('Studio Aura — Runtime', () => {
  test.beforeEach(async ({ page }) => { await page.goto(AURA); });

  test('page renders without blank screen', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('title contains Studio Aura', async ({ page }) => {
    await expect(page).toHaveTitle(/Studio Aura/);
  });

  test('vertical is beauty', async ({ page }) => {
    const v = await page.locator('html').getAttribute('data-vertical');
    expect(v).toBe('beauty');
  });

  test('surface profile is PREMIUM_GLASS', async ({ page }) => {
    const s = await page.locator('html').getAttribute('data-surface');
    expect(s).toBe('PREMIUM_GLASS');
  });

  test('typography profile is ELEGANT_DISPLAY', async ({ page }) => {
    const p = await page.locator('html').getAttribute('data-profile');
    expect(p).toBe('ELEGANT_DISPLAY');
  });
});

test.describe('Studio Aura — Navigation', () => {
  test.beforeEach(async ({ page }) => { await page.goto(AURA); });

  test('nav with role=navigation present', async ({ page }) => {
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
  });

  test('hamburger opens mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#hamburger').click();
    await expect(page.locator('#mobileMenu')).toHaveClass(/open/);
  });
});

test.describe('Studio Aura — Accessibility', () => {
  test.beforeEach(async ({ page }) => { await page.goto(AURA); });

  test('h1 heading visible', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('all form inputs labeled', async ({ page }) => {
    const inputs = await page.locator('form input[id], form select[id]').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toHaveCount(1);
    }
  });

  test('gallery items have aria-label', async ({ page }) => {
    const items = await page.locator('.gallery-item[aria-label]').all();
    expect(items.length).toBeGreaterThan(0);
  });

  test('skip link exists', async ({ page }) => {
    await expect(page.locator('.skip-link')).toHaveCount(1);
  });
});

test.describe('Studio Aura — Responsive', () => {
  test('no horizontal scroll at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(AURA);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(390);
  });

  test('no horizontal scroll at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(AURA);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(1280);
  });
});

test.describe('Studio Aura — Booking Form', () => {
  test.beforeEach(async ({ page }) => { await page.goto(AURA); });

  test('booking form is present', async ({ page }) => {
    await expect(page.locator('#bookingForm')).toBeVisible();
  });

  test('6 services in select', async ({ page }) => {
    const options = await page.locator('#servicio option').all();
    expect(options.length).toBe(7); // includes placeholder "Selecciona"
  });

  test('form submit shows confirmation', async ({ page }) => {
    await page.fill('#nombre', 'Test');
    await page.fill('#telefono', '600000000');
    await page.selectOption('#servicio', 'facial');
    await page.click('button[type="submit"]');
    await expect(page.locator('#bookingSuccess')).toHaveClass(/visible/);
  });
});

test.describe('Studio Aura — Services', () => {
  test.beforeEach(async ({ page }) => { await page.goto(AURA); });

  test('6 service cards present', async ({ page }) => {
    await expect(page.locator('.service-card')).toHaveCount(6);
  });

  test('gallery items present', async ({ page }) => {
    const items = page.locator('.gallery-item');
    await expect(items).not.toHaveCount(0);
  });
});

// ─── Differentiation ─────────────────────────────────────────────────────────

test.describe('Fixture Differentiation', () => {
  test('3 fixtures have different verticals', async ({ browser }) => {
    const verticals = [];
    for (const url of [NEXO, LEX, AURA]) {
      const page = await browser.newPage();
      await page.goto(url);
      verticals.push(await page.locator('html').getAttribute('data-vertical'));
      await page.close();
    }
    const unique = new Set(verticals);
    expect(unique.size).toBe(3);
  });

  test('3 fixtures have different surface profiles', async ({ browser }) => {
    const surfaces = [];
    for (const url of [NEXO, LEX, AURA]) {
      const page = await browser.newPage();
      await page.goto(url);
      surfaces.push(await page.locator('html').getAttribute('data-surface'));
      await page.close();
    }
    const unique = new Set(surfaces);
    expect(unique.size).toBe(3);
  });

  test('3 fixtures have different typography profiles', async ({ browser }) => {
    const profiles = [];
    for (const url of [NEXO, LEX, AURA]) {
      const page = await browser.newPage();
      await page.goto(url);
      profiles.push(await page.locator('html').getAttribute('data-profile'));
      await page.close();
    }
    const unique = new Set(profiles);
    expect(unique.size).toBe(3);
  });

  test('each fixture has its own distinct title', async ({ browser }) => {
    const titles = [];
    for (const url of [NEXO, LEX, AURA]) {
      const page = await browser.newPage();
      await page.goto(url);
      titles.push(await page.title());
      await page.close();
    }
    const unique = new Set(titles);
    expect(unique.size).toBe(3);
  });
});
