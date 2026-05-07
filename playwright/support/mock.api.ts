import { Page } from '@playwright/test'

export const mockCreditAnalysis = async (page: Page, score: number) => {
    await page.route('**/credit-analysis', async (route) => {
        await route.fulfill({
            status: 200,
            body: JSON.stringify({
                status: 'Done',
                score
            })
        })
    })
}