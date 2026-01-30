import { test, expect } from '@playwright/test'

test('deve consultar um pedido aprovado', async ({ page }) => {

    // AAA - Arrange, Act, Assert
    // Arrange - Preparar o cenário
    // Act - Agir/Executar a ação
    // Assert - Verificar o resultado

  // Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

  // São parte da preparação pois podem ser reaproveitados em outros testes
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  // Act
  //await page.getByTestId('search-order-id').fill('VLO-RG8VZ7')
  //await page.locator('//label[text()="Número do Pedido"]/..//input').fill('VLO-RG8VZ7')
  //await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-RG8VZ7')
  //await page.getByLabel('Número do Pedido').fill('VLO-RG8VZ7')
  await page.getByPlaceholder('Ex: VLO-ABC123').fill('VLO-RG8VZ7')
  await page.getByTestId('search-order-button').click()


  //const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-RG8VZ7"]')
  // await expect(orderCode).toBeVisible({ timeout: 10_000 })

  // Assert
  const containerPedido = page.getByRole('paragraph')
            .filter({ hasText: /^Pedido$/})
            .locator('..') // Sobe para o elemento pai (a div que agrupa ambos)

  await expect(containerPedido).toContainText('VLO-RG8VZ7')
  await expect(page.getByText('APROVADO')).toBeVisible()
})