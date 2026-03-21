import { Page } from '@playwright/test'

export function generateOrderCode() {
    const prefix = "VLO-";
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
  
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
  
    return prefix + code;
  }

export async function searchOrder(page: Page, orderNumber: string) {
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
}