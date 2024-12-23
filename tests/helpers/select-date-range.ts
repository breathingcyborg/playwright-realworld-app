import { Locator, Page } from "@playwright/test";
import { format } from "date-fns";

export async function selectDateRange(page: Page, button: Locator, startDate: Date, endDate: Date) {
  const initialTime = await page.evaluate(() => new Date());
  await page.clock.setFixedTime(startDate);
  await button.click();
  await page.locator(`[data-date="${format(startDate, "yyyy-MM-dd")}"]`).click();
  await page.locator(`[data-date="${format(endDate, "yyyy-MM-dd")}"]`).click();
  await page.clock.setFixedTime(initialTime);
}
