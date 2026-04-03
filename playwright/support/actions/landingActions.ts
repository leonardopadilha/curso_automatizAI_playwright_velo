import { Page, expect } from '@playwright/test'

export function createLandingActions(page: Page) {
  return {
    async goto() {
      await page.goto('/')
      const title = page.getByTestId('hero-section').getByRole('heading')
      await expect(title).toContainText('Velô Sprint')
    },
  }
}
