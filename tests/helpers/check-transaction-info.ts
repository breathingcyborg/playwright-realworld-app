import { User } from "models";
import { TransactionDetailPage } from "../pages/transaction-detal-page";
import { expect } from "@playwright/test";
import Dinero from "dinero.js";

export async function checkTransactionInfo({
  page,
  sender,
  receiver,
  viewerId,
  amount,
  description,
  transactionType,
}: {
  page: TransactionDetailPage;
  sender: User;
  receiver: User;
  viewerId: string;
  amount: number; // in usd
  description: string;
  transactionType: "payment" | "request";
}) {
  const isSender = viewerId === sender.id;
  const isReceiver = viewerId === receiver.id;
  const isOtherUser = !isSender && !isReceiver;
  const isRequest = transactionType === "request";

  const sign = isOtherUser ? "" : isRequest ? (isSender ? "+" : "-") : isSender ? "-" : "+";

  const amountString = sign + Dinero({ amount: amount * 100 }).toFormat();

  // sender
  await expect(page.senderName).toHaveText(`${sender.firstName} ${sender.lastName}`);
  await expect(page.senderAvatar).toBeVisible();

  // receiver
  await expect(page.receiverName).toHaveText(`${receiver.firstName} ${receiver.lastName}`);
  await expect(page.receiverAvatar).toBeVisible();

  // amount
  await expect(page.amount).toHaveText(amountString);

  // description
  await expect(page.description).toHaveText(description);
}
