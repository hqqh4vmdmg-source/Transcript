const { test, expect } = require('@playwright/test');

test.describe('Transcript Generator E2E', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Transcript/);
  });
});
