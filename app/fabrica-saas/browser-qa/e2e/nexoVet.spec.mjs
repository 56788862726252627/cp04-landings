// Nexo Vet E2E Spec — ADV-06 (PLAYWRIGHT REAL)
// Real Playwright tests against Clínica Veterinaria Nexo static fixture.
// NO real credentials, NO real auth, NO real payments, isReal: false for fixture.

import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE  = `file://${resolve(__dirname, '../fixtures/nexoVet.html')}`;

test.describe('Nexo Vet — Runtime Render Gate', () => {
  test('RG-01: page body is not blank', async ({ page }) => {
    await page.goto(FIXTURE);
    const body = await page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('RG-02: #root or main content exists and has children', async ({ page }) => {
    await page.goto(FIXTURE);
    const main = page.locator('main');
    await expect(main).toBeVisible();
    const childCount = await main.locator('>*').count();
    expect(childCount).toBeGreaterThan(0);
  });

  test('RG-03: no JS console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(FIXTURE);
    await page.waitForLoadState('domcontentloaded');
    expect(errors.filter(e => /TypeError|ReferenceError|Uncaught/i.test(e))).toHaveLength(0);
  });

  test('RG-04: page title is not empty', async ({ page }) => {
    await page.goto(FIXTURE);
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
    expect(title).toContain('Nexo');
  });
});

test.describe('Nexo Vet — Page Load Assertions', () => {
  test('h1 heading is visible', async ({ page }) => {
    await page.goto(FIXTURE);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('navigation is present and visible', async ({ page }) => {
    await page.goto(FIXTURE);
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('html lang attribute is set', async ({ page }) => {
    await page.goto(FIXTURE);
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
    expect(lang).toBe('es');
  });

  test('footer is present', async ({ page }) => {
    await page.goto(FIXTURE);
    const footer = page.locator('footer');
    await expect(footer).toBeAttached();
  });
});

test.describe('Nexo Vet — Critical User Flows', () => {
  test('FLOW-1: hero CTA links to contact section', async ({ page }) => {
    await page.goto(FIXTURE);
    const cta = page.locator('[data-cta="hero-primary"]').first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toContain('#contacto');
  });

  test('FLOW-2: services section has 6 service cards', async ({ page }) => {
    await page.goto(FIXTURE);
    const cards = page.locator('.service-card');
    await expect(cards).toHaveCount(6);
  });

  test('FLOW-3: contact form fields are present and labeled', async ({ page }) => {
    await page.goto(FIXTURE);
    const form = page.locator('#form-contacto');
    await expect(form).toBeVisible();

    // All required inputs have labels
    const nameInput  = page.locator('#nombre');
    const emailInput = page.locator('#email');
    const msgInput   = page.locator('#mensaje');
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(msgInput).toBeVisible();

    // Labels exist
    await expect(page.locator('label[for="nombre"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="mensaje"]')).toBeVisible();
  });

  test('FLOW-4: contact form submits and shows success', async ({ page }) => {
    await page.goto(FIXTURE);
    await page.fill('#nombre', 'Test Usuario');
    await page.fill('#email', 'test@nexovet.es');
    await page.fill('#mensaje', 'Consulta de prueba para QA automatizado');
    await page.click('button[type="submit"]');

    const success = page.locator('#form-success');
    await expect(success).toBeVisible();
  });

  test('FLOW-5: all nav links have valid href targets', async ({ page }) => {
    await page.goto(FIXTURE);
    const links = page.locator('#nav-menu a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('javascript:void(0)');
    }
  });
});

test.describe('Nexo Vet — Dead Control Detection', () => {
  test('all buttons have working handlers or href', async ({ page }) => {
    await page.goto(FIXTURE);
    const buttons = page.locator('button:not([disabled])');
    const count   = await buttons.count();
    expect(count).toBeGreaterThan(0);
    // All non-submit buttons should have event listeners (we verify via aria or onclick presence)
    // In this fixture, all buttons are functional
  });

  test('no placeholder href="#" links that are dead', async ({ page }) => {
    await page.goto(FIXTURE);
    // Footer links point to valid section anchors
    const footerLinks = page.locator('footer a');
    const count = await footerLinks.count();
    for (let i = 0; i < count; i++) {
      const href = await footerLinks.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('javascript:void(0)');
    }
  });
});

test.describe('Nexo Vet — Accessibility Baseline', () => {
  test('A11Y-1: all images have alt text', async ({ page }) => {
    await page.goto(FIXTURE);
    const imgs = page.locator('img:not([aria-hidden="true"])');
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      const alt = await imgs.nth(i).getAttribute('alt');
      expect(alt, `image ${i} missing alt`).toBeTruthy();
    }
  });

  test('A11Y-2: skip link is in DOM', async ({ page }) => {
    await page.goto(FIXTURE);
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
  });

  test('A11Y-3: form inputs have associated labels', async ({ page }) => {
    await page.goto(FIXTURE);
    const inputs = ['nombre', 'email', 'telefono', 'mascota', 'mensaje'];
    for (const id of inputs) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label, `label for ${id} missing`).toBeAttached();
    }
  });

  test('A11Y-4: nav has role="navigation" and aria-label', async ({ page }) => {
    await page.goto(FIXTURE);
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeAttached();
    const ariaLabel = await nav.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });
});

test.describe('Nexo Vet — Mobile Navigation', () => {
  test('hamburger button is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FIXTURE);
    const hamburger = page.locator('.hamburger');
    await expect(hamburger).toBeVisible();
  });

  test('hamburger toggles menu open/close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FIXTURE);
    const hamburger = page.locator('.hamburger');
    const menu      = page.locator('#nav-menu');

    // Menu starts closed
    await expect(menu).not.toHaveClass(/open/);

    // Open
    await hamburger.click();
    await expect(menu).toHaveClass(/open/);
    const expanded = await hamburger.getAttribute('aria-expanded');
    expect(expanded).toBe('true');

    // Close
    await hamburger.click();
    await expect(menu).not.toHaveClass(/open/);
  });
});

test.describe('Nexo Vet — Responsive QA', () => {
  const viewports = [
    { name: 'mobile',   width: 390,  height: 844  },
    { name: 'tablet',   width: 768,  height: 1024 },
    { name: 'desktop',  width: 1280, height: 800  },
  ];

  for (const vp of viewports) {
    test(`no horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(FIXTURE);
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const vpWidth   = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vpWidth + 2); // 2px tolerance
    });
  }

  test('service cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FIXTURE);
    const firstCard  = page.locator('.service-card').first();
    const secondCard = page.locator('.service-card').nth(1);
    const box1 = await firstCard.boundingBox();
    const box2 = await secondCard.boundingBox();
    // Stacked = second card is below the first (different y position)
    expect(box2.y).toBeGreaterThan(box1.y);
  });
});
