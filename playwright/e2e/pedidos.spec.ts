import { test } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'
import { Navbar } from '../support/components/Navbar'
import { LandingPage } from '../support/pages/LandingPage'
import { OrderLockupPage, OrderDetails } from '../support/pages/OrderLockupPage'


test.describe('Consulta de pedido', () => {

  let orderLockupPage: OrderLockupPage

  test.beforeEach(async ({ page }) => {
    await new LandingPage(page).goto()
    await new Navbar(page).orderLockupLink()

    orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.validatePageLoaded()
  })
  
  test.skip('deve consultar um pedido aprovado', async ({ page }) => {
     // AAA - Arrange, Act, Assert
    // Arrange - Preparar o cenário
    // Act - Agir/Executar a ação
    // Assert - Verificar o resultado

    // Test Data
    const order = 'VLO-FB7D4E'
  
    // Act
    //await page.getByTestId('search-order-id').fill('VLO-RG8VZ7')
    //await page.locator('//label[text()="Número do Pedido"]/..//input').fill('VLO-RG8VZ7')
    //await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-RG8VZ7')
    //await page.getByLabel('Número do Pedido').fill('VLO-RG8VZ7')
    await page.getByPlaceholder('Ex: VLO-ABC123').fill(order)
    await page.getByTestId('search-order-button').click()
  
  
    //const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-RG8VZ7"]')
    // await expect(orderCode).toBeVisible({ timeout: 10_000 })
  
    // Assert
    const containerPedido = page.getByRole('paragraph')
              .filter({ hasText: /^Pedido$/})
              .locator('..') // Sobe para o elemento pai (a div que agrupa ambos) assim como acontece com o xpath
  
    await expect(containerPedido).toContainText(order, { timeout: 10_000 })
    await expect(page.getByText('APROVADO')).toBeVisible()
  })

  test('deve consultar um pedido aprovado utilizando toMatchAriaSnapshot', async ({ page }) => {
    const order: OrderDetails = {
      number: 'VLO-FB7D4E',
      status: 'APROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Leonardo Padilha',
        email: 'leonardo@velo.dev'
      },
      payment: 'À Vista'
    }

    await orderLockupPage.searchOrder(order.number)

    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado utilizando toMatchAriaSnapshot', async ({ page }) => {
    const order: OrderDetails = {
      number: 'VLO-0D0GW5',
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@velo.dev'
      },
      payment: 'À Vista'
    }

    await orderLockupPage.searchOrder(order.number)

    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise utilizando toMatchAriaSnapshot', async ({ page }) => {
    const order: OrderDetails = {
      number: 'VLO-YSJDBU',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Joao da Silva',
        email: 'joao@velo.dev'
      },
      payment: 'À Vista'
    }

    await orderLockupPage.searchOrder(order.number)

    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

    const order = generateOrderCode()

    await orderLockupPage.searchOrder(order)
    await orderLockupPage.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ page }) => {
    const orderCode = 'XYZ-999-INVALIDO'
    await orderLockupPage.searchOrder(orderCode)

    await orderLockupPage.validateOrderNotFound()
  })
})