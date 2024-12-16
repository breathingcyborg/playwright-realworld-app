import { User } from "models";
import { NewTransactionPage } from "../pages/new-transaction-page";

export async function createTransaction({
  page,
  amount,
  description,
  receiver,
  type,
}: {
  page: NewTransactionPage;
  amount: number;
  description: string;
  receiver: User;
  type: "payment" | "request";
}) {
  // click new transaction button
  await page.clickNewTransactions();

  // select user
  await page.searchUser(receiver.username);
  await page.selectUser(receiver.username);

  // fill form
  await page.fillAndBlurAmount(amount.toString());
  await page.fillAndBlurDescription(description);

  // click submit button
  if (type === "payment") {
    await page.clickPayButton();
  }

  if (type === "request") {
    await page.clickRequestButton();
  }
}
