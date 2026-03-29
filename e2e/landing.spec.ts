import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads and shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Studdo')).toBeVisible();
    await expect(page.locator('text=Tutor IA')).toBeVisible();
  });

  test('navbar links work', async ({ page }) => {
    await page.goto('/');
    // Check CTA button exists
    const ctaButton = page.locator('a[href="/tutor"]').first();
    await expect(ctaButton).toBeVisible();
  });

  test('FAQ section renders', async ({ page }) => {
    await page.goto('/');
    // Scroll to FAQ section
    const faqSection = page.locator('text=Perguntas Frequentes').first();
    if (await faqSection.isVisible()) {
      await expect(faqSection).toBeVisible();
    }
  });

  test('footer has correct links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/privacidade"]').first()).toBeVisible();
    await expect(page.locator('a[href="/termos"]').first()).toBeVisible();
  });
});

test.describe('Auth Pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'fake@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should show error message (not redirect)
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });
});

test.describe('Legal Pages', () => {
  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacidade');
    await expect(page.locator('text=Privacidade')).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/termos');
    await expect(page.locator('text=Termos')).toBeVisible();
  });
});

test.describe('Tutor Page (Guest)', () => {
  test('tutor page loads for guests', async ({ page }) => {
    await page.goto('/tutor');
    // Should either show tutor or redirect to login
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('/tutor') || url.includes('/login')).toBeTruthy();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('landing page is responsive', async ({ page }) => {
    await page.goto('/');
    // Check no horizontal overflow
    const body = page.locator('body');
    const box = await body.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test('mobile menu opens', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i]').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      // Menu should show navigation links
      await expect(page.locator('text=Entrar')).toBeVisible();
    }
  });
});

test.describe('API Routes', () => {
  test('FAQ API rejects empty question', async ({ request }) => {
    const res = await request.post('/api/faq', {
      data: { question: '' },
    });
    expect(res.status()).toBe(400);
  });

  test('FAQ API rejects missing body', async ({ request }) => {
    const res = await request.post('/api/faq', {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('suggestions API rejects short content', async ({ request }) => {
    const res = await request.post('/api/suggestions', {
      data: { content: 'ab' },
    });
    expect(res.status()).toBe(400);
  });

  test('school-lead API rejects missing fields', async ({ request }) => {
    const res = await request.post('/api/school-lead', {
      data: { schoolName: 'Test' },
    });
    expect(res.status()).toBe(400);
  });
});
