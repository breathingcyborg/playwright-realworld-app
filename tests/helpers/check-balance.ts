import { expect } from '@playwright/test';
import Dinero from 'dinero.js';
import { AppPage } from '../pages/app.page';

export async function checkBalance({ page, balance }: { page: AppPage; balance: number; }) {
    const formattedBalance = Dinero({ amount: balance }).toFormat();
    await expect(page.getUserBalanceLocator()).toHaveText(formattedBalance);
}
