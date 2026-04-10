import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {

    return {
        async open() {
            await page.goto('/configure')
        },

        async selectColor(name: string) {
            await page.getByRole('button', { name }).click()
        },

        async selectWheels(name: string | RegExp) {
            await page.getByRole('button', { name }).click()
        },

        async expectPrice(price: string) {
            const priceElement = page.getByTestId('total-price')
            await expect(priceElement).toBeVisible()
            await expect(priceElement).toHaveText(price)
        },

        async toggleOptional(name: string | RegExp) {
            await page.getByRole('checkbox', { name }).click()
        },

        async expectOptionalChecked(name: string | RegExp, checked: boolean) {
            const optional = page.getByRole('checkbox', { name })

            await expect(optional).toBeVisible()
            await expect(optional).toHaveAttribute('aria-checked', checked ? 'true' : 'false')
        },

        async proceedToCheckout() {
            await page.getByRole('button', { name: 'Monte o Seu' }).click()
        },

        async expectCarImageSrc(src: string) {
            const carImage = page.locator('img[alt^="Velô Sprint"]')
            await expect(carImage).toHaveAttribute('src', src)
        }
    }
}