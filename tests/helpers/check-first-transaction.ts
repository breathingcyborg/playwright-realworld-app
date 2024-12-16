import { expect } from "@playwright/test";
import { TransactionsListPage } from "../pages/transactions-list-page";

export async function checkFirstTransaction({
  page,
  description,
}: {
  page: TransactionsListPage;
  description: string;
}) {
  await expect(page.getTransactionsListItems().first()).toContainText(description);
}
