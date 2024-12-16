import { expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

export async function checkSuccessToast({ page, text }: { page: AppPage; text: string; }) {
    const successToast = page.getSuccessToast().filter({ hasText: text });
    await expect(successToast).toBeVisible();
}
