import { test, expect } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import { OrderDetails } from '../support/actions/orderLookupActions'
import { insertOrder, deleteOrderByNumber } from '../support/database/orderRepository'
import testData from '../support/fixtures/orders.json' with { type: 'json' }

test.describe('Consulta de pedido', () => {

  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
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
    const order: OrderDetails = testData.aprovado as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado utilizando toMatchAriaSnapshot', async ({ app }) => {
    const order: OrderDetails = testData.reprovado as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise utilizando toMatchAriaSnapshot', async ({ app }) => {
    const order: OrderDetails = testData.em_analise as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()

    await app.orderLookup.searchOrder(order)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'

    await app.orderLookup.searchOrder(orderCode)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve manter o botão de busca desabilitado com campo vazio ou apenas espaços', async ({ app }) => {
    const button = app.orderLookup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLookup.elements.orderInput.fill('   ')
    await expect(button).toBeDisabled()
  })
})
