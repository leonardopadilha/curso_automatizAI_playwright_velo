import { test, expect } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import { OrderDetails } from '../support/actions/orderLockupActions'

test.describe('Consulta de pedido', () => {

  test.beforeEach(async ({ app }) => {
    await app.landing.goto()
    await app.navbar.orderLockupLink()
    await app.orderLockup.validatePageLoaded()
  })

  test.skip('deve consultar um pedido aprovado (sem toMatchAriaSnapshot)', async ({ page }) => {
    const order = 'VLO-FB7D4E'

    await page.getByPlaceholder('Ex: VLO-ABC123').fill(order)
    await page.getByTestId('search-order-button').click()

    const containerPedido = page.getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..')

    await expect(containerPedido).toContainText(order, { timeout: 10_000 })
    await expect(page.getByText('APROVADO')).toBeVisible()
  })

  test('deve consultar um pedido aprovado utilizando toMatchAriaSnapshot', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-FB7D4E',
      status: 'APROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Leonardo Padilha',
        email: 'leonardo@velo.dev',
      },
      payment: 'À Vista',
    }

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado utilizando toMatchAriaSnapshot', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-0D0GW5',
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@velo.dev',
      },
      payment: 'À Vista',
    }

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise utilizando toMatchAriaSnapshot', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-YSJDBU',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Joao da Silva',
        email: 'joao@velo.dev',
      },
      payment: 'À Vista',
    }

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()

    await app.orderLockup.searchOrder(order)
    await app.orderLockup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'

    await app.orderLockup.searchOrder(orderCode)
    await app.orderLockup.validateOrderNotFound()
  })
})
