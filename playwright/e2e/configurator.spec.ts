import { test, expect } from '../support/fixtures';

test.describe('Configuração do Veículo', () => {

  const value = {
    basePrice: 'R$ 40.000,00',
    sportWheelsPrice: 'R$ 42.000,00',
    precisionParkPrice: {
      withAdditionalPrice: 'R$ 45.500,00',
      withoutAdditionalPrice: 'R$ 45.000,00',
    },
    fluxCapacitorPrice: 'R$ 50.500,00',
  }

  
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar a imagem e manter o preço base ao trocar a cor do veículo', async ({ app }) => {
    await app.configurator.expectPrice(value.basePrice)

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectPrice(value.basePrice)
    await app.configurator.expectCarImageSrc('/src/assets/midnight-black-aero-wheels.png')
  })

  test('deve atualizar o preço e a imagem ao alterar as rodas, e restaurar os valores padrão', async ({ app }) => {
    await app.configurator.expectPrice(value.basePrice)

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectPrice(value.sportWheelsPrice)
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-sport-wheels.png')

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.expectPrice(value.basePrice)
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-aero-wheels.png')
  })

  test('deve somar os opcionais e persistir o preço base ao seguir para o checkout após removê-los', async ({ app, page }) => {
    await app.configurator.expectPrice(value.basePrice)
    await app.configurator.expectOptionalChecked(/Precision Park/, false)
    await app.configurator.expectOptionalChecked(/Flux Capacitor/, false)

    await app.configurator.toggleOptional(/Precision Park/)
    await app.configurator.expectOptionalChecked(/Precision Park/, true)
    await app.configurator.expectPrice(value.precisionParkPrice.withAdditionalPrice)

    await app.configurator.toggleOptional(/Flux Capacitor/)
    await app.configurator.expectOptionalChecked(/Flux Capacitor/, true)
    await app.configurator.expectPrice(value.fluxCapacitorPrice)

    await app.configurator.toggleOptional(/Precision Park/)
    await app.configurator.expectOptionalChecked(/Precision Park/, false)
    await app.configurator.expectPrice(value.precisionParkPrice.withoutAdditionalPrice)

    await app.configurator.toggleOptional(/Flux Capacitor/)
    await app.configurator.expectOptionalChecked(/Flux Capacitor/, false)
    await app.configurator.expectPrice(value.basePrice)

    await app.configurator.proceedToCheckout()
    await expect(page).toHaveURL(/\/order$/)
    await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

    const summary = page.getByRole('heading', { name: 'Resumo' }).locator('..')

    await expect(summary).toContainText('Glacier Blue')
    await expect(summary).toContainText('aero Wheels')
    await expect(summary).toContainText(value.basePrice)
  })
})