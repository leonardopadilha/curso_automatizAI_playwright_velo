import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'

test.describe('Consulta de pedido', () => {

  test.beforeEach(async ({ page }) => {
        // Arrange
        await page.goto('http://localhost:5173/')
        await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
      
        // São parte da preparação pois podem ser reaproveitados em outros testes
        await page.getByRole('link', { name: 'Consultar Pedido' }).click()
        await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })
  
  test('deve consultar um pedido aprovado', async ({ page }) => {

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

  test('deve consultar um pedido aprovado - Validação com toMatchAriaSnapshot', async ({ page }) => {
    // Test Data
   const order = 'VLO-FB7D4E'
 
   await page.getByPlaceholder('Ex: VLO-ABC123').fill(order)
   await page.getByTestId('search-order-button').click()

   await expect(page.getByTestId(`order-result-${order}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order}
      - img
      - text: APROVADO
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: Midnight Black
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: sport Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: Leonardo Padilha
      - paragraph: Email
      - paragraph: leonardo@velo.dev
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: À Vista
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `);
  })

  test('deve consultar um pedido reprovado - Validação com toMatchAriaSnapshot', async ({ page }) => {
    // Test Data
   const order = 'VLO-0D0GW5'
 
   await page.getByPlaceholder('Ex: VLO-ABC123').fill(order)
   await page.getByTestId('search-order-button').click()

   await expect(page.getByTestId(`order-result-${order}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order}
      - img
      - text: REPROVADO
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: Midnight Black
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: sport Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: Steve Jobs
      - paragraph: Email
      - paragraph: jobs@velo.dev
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: À Vista
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `);
  })
  
  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {
    const order = generateOrderCode()
    
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()
  
    const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
    await expect(title).toBeVisible()
    await expect(page.locator('#root')).toContainText('Pedido não encontrado') // #root é o id da div principal da página
  
    //const message = page.locator('//p[text()="Verifique o número do pedido e tente novamente"]')
  
    const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
    await expect(message).toBeVisible()
    await expect(page.locator('#root')).toContainText('Verifique o número do pedido e tente novamente')
  
    // utilizando assert snapshot do codegen do playwright
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
    `)
  })
})