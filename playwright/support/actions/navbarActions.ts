import { Page } from '@playwright/test'

export function createNavbarActions(page: Page) {
  return {
    async orderLockupLink() {
      await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    },
  }
}
