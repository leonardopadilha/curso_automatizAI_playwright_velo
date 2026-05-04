import { test, expect } from '../support/fixtures';
import { deleteOrderByNumber, deleteOrderByEmail } from '../support/database/orderRepository'

test.describe('Checkout', () => {

    test.describe('Validações de campos obrigatórios', () => {
        let alerts: any

        test.beforeEach(async ({ page, app }) => {
            await page.goto('/order')
            await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

            alerts = app.checkout.elements.alerts
        })

        test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
            await app.checkout.submit()

            await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
            await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
            await expect(alerts.email).toHaveText('Email inválido')
            await expect(alerts.phone).toHaveText('Telefone inválido')
            await expect(alerts.document).toHaveText('CPF inválido')
            await expect(alerts.store).toHaveText('Selecione uma loja')
            await expect(alerts.terms).toHaveText('Aceite os termos')
        })

        test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

            const customer = {
                name: 'A',
                lastname: 'B',
                email: 'leonardo@teste.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            await app.checkout.submit()

            await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
            await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
        })

        test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {

            const customer = {
                name: 'Leonardo',
                lastname: 'Padilha',
                email: 'leonardo@.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            await app.checkout.submit()

            await expect(alerts.email).toHaveText('Email inválido')
        })

        test('deve exibir erro para CPF inválido', async ({ app }) => {

            const customer = {
                name: 'Leonardo',
                lastname: 'Padilha',
                email: 'leonardo@teste.com',
                document: '00000014199',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            await app.checkout.submit()

            await expect(alerts.document).toHaveText('CPF inválido')
        })

        test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

            const customer = {
                name: 'Leonardo',
                lastname: 'Padilha',
                email: 'leonardo@teste.com',
                document: '00000014199',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore('Velô Paulista')
            
            await expect(app.checkout.elements.terms).not.toBeChecked()

            await app.checkout.submit()

            await expect(alerts.terms).toHaveText('Aceite os termos')
        })
    })

    test.describe('Pagamento e confirmação', () => {
        test('deve criar um pedido com sucesso para pagamento à vista', async ({ page, app }) => {
            const customer = {
                name: 'Leonardo',
                lastname: 'Padilha',
                email: 'teste@sucesso.com',
                document: '75194564040',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'À Vista',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByEmail(customer.email)

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfiguration()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.expectSummaryTotal(customer.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()

            /*
            Código gerado para praticar o locator('..)
            const orderCode = await page.getByText('Número do Pedido')
                                .locator('..')
                                .getByRole('paragraph').nth(1).innerText()

            deleteOrderByNumber(orderCode)
            */
        })

        test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ page, app }) => {
            const customer = {
                name: 'Steve',
                lastname: 'Woz',
                email: 'woz@velo.dev',
                document: '65493881047',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByEmail(customer.email)

            await page.route('**/functions/v1/credit-analysis', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 710
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfiguration()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore(customer.store)
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            //await app.checkout.expectSummaryTotal(customer.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
        })

        test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ page, app }) => {
            const customer = {
                name: 'Tony',
                lastname: 'Stark',
                email: 'tony@stark.com',
                document: '74690251037',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByEmail(customer.email)

            await page.route('**/functions/v1/credit-analysis', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 600
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfiguration()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Pedido em Análise!' })).toBeVisible()
        })

        test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ page, app }) => {
            const customer = {
                name: 'Clark',
                lastname: 'Kent',
                email: 'clark@dailyplanet.com',
                document: '52998224725',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByEmail(customer.email)

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 500
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfiguration()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Crédito Reprovado' })).toBeVisible()
        })

        test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ page, app }) => {
            const customer = {
                name: 'Diana',
                lastname: 'Prince',
                email: 'diana@themiscira.com',
                document: '11144477735',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '10000'
            }

            await deleteOrderByEmail(customer.email)

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 500
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfiguration()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Crédito Reprovado' })).toBeVisible()
        })

        test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ page, app }) => {
            const customer = {
                name: 'Richard',
                lastname: 'Fortus',
                email: 'richard@gmail.com',
                document: '39434745004',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '20000'
            }

            await deleteOrderByEmail(customer.email)

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 450
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfiguration()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
        })

        test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%', async ({ page, app }) => {
            const customer = {
                name: 'Axl',
                lastname: 'Rose',
                email: 'alx@gnr.com',
                document: '79327557000',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '30000'
            }

            await deleteOrderByEmail(customer.email)

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 300
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfiguration()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
        })
    })
})