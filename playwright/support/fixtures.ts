import { test as base } from '@playwright/test'
import { createLandingActions } from './actions/landingActions'
import { createNavbarActions } from './actions/navbarActions'
import { createOrderLockupActions } from './actions/orderLockupActions'

type App = {
  landing: ReturnType<typeof createLandingActions>
  navbar: ReturnType<typeof createNavbarActions>
  orderLockup: ReturnType<typeof createOrderLockupActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      landing: createLandingActions(page),
      navbar: createNavbarActions(page),
      orderLockup: createOrderLockupActions(page),
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'
