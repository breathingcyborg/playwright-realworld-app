import { Page, test, expect } from "@playwright/test";
import { User } from "models";
import { getUsersForTest } from "../helpers/get-users-for-test";
import { loginUser } from "../helpers/login-user";
import { NewTransactionPage } from "../pages/new-transaction-page";
import { TransactionsListPage } from "../pages/transactions-list-page";
import { createTransaction } from "../helpers/create-transaction";
import { checkFirstTransaction } from "../helpers/check-first-transaction";
import { checkSuccessToast } from "../helpers/check-success-toast";
import { checkBalance } from "../helpers/check-balance";
import { TransactionDetailPage } from "../pages/transaction-detal-page";
import { checkTransactionInfo } from "../helpers/check-transaction-info";
import faker from "@faker-js/faker";

test.describe.configure({ mode: "serial" });

let sender: User;
let receiver: User;
let otherUser: User;
let page: Page;
let newTransactionPage: NewTransactionPage;
let transactionsListPage: TransactionsListPage;
let transactionDetailPage: TransactionDetailPage;

test.beforeEach(async ({ page: browserPage }) => {
  [sender, receiver, otherUser] = await getUsersForTest("transaction_details");
  await loginUser(sender, browserPage);
  page = browserPage;
  newTransactionPage = new NewTransactionPage(page);
  transactionsListPage = new TransactionsListPage(page);
  transactionDetailPage = new TransactionDetailPage(page);
});

test("displays payment transaction correctly to sender, receiver & other user", async () => {
  const amount = 50;
  const description = "16gb ram";

  // create transaction
  await createTransaction({
    page: newTransactionPage,
    amount,
    description,
    receiver,
    type: "payment",
  });

  // return to transactions list
  await newTransactionPage.clickReturnToTransactions();

  await transactionsListPage.gotoPersonalTransactions();

  // check transaction is displayed
  await checkFirstTransaction({
    page: transactionsListPage,
    description,
  });

  // click first transaction
  await transactionsListPage.clickFirstTransaction();

  // Check senders view
  await checkTransactionInfo({
    sender,
    receiver,
    transactionType: "payment",
    amount,
    description,
    page: transactionDetailPage,
    viewerId: sender.id,
  });

  // login as receiver
  await transactionDetailPage.forceLogout();
  await loginUser(receiver, page);

  // goto transaction detal page
  await transactionsListPage.gotoPersonalTransactions();
  await transactionsListPage.clickFirstTransaction();

  // Check receivers view
  await checkTransactionInfo({
    sender,
    receiver,
    transactionType: "payment",
    amount,
    description,
    page: transactionDetailPage,
    viewerId: receiver.id,
  });

  // login as viewer
  await transactionDetailPage.forceLogout();
  await loginUser(otherUser, page);

  // goto transaction detal page
  await transactionsListPage.gotoPublicTransactions();
  await transactionsListPage.clickFirstTransaction();

  // Check receivers view
  await checkTransactionInfo({
    sender,
    receiver,
    transactionType: "payment",
    amount,
    description,
    page: transactionDetailPage,
    viewerId: otherUser.id,
  });
});

test("displays request transaction correctly to sender, receiver & other user", async () => {
  const amount = 80;
  const description = "32gb ram";

  // create transaction
  await createTransaction({
    page: newTransactionPage,
    amount,
    description,
    receiver,
    type: "request",
  });

  // return to transactions list
  await newTransactionPage.clickReturnToTransactions();

  await transactionsListPage.gotoPersonalTransactions();

  // check transaction is displayed
  await checkFirstTransaction({
    page: transactionsListPage,
    description,
  });

  // click first transaction
  await transactionsListPage.clickFirstTransaction();

  // Check senders view
  await checkTransactionInfo({
    sender,
    receiver,
    transactionType: "request",
    amount,
    description,
    page: transactionDetailPage,
    viewerId: sender.id,
  });

  // login as receiver
  await transactionDetailPage.forceLogout();
  await loginUser(receiver, page);

  // goto transaction detal page
  await transactionsListPage.gotoPersonalTransactions();
  await transactionsListPage.clickFirstTransaction();

  // Check receivers view
  await checkTransactionInfo({
    sender,
    receiver,
    transactionType: "request",
    amount,
    description,
    page: transactionDetailPage,
    viewerId: receiver.id,
  });

  // login as viewer
  await transactionDetailPage.forceLogout();
  await loginUser(otherUser, page);

  // goto transaction detal page
  await transactionsListPage.gotoPublicTransactions();
  await transactionsListPage.clickFirstTransaction();

  // Check receivers view
  await checkTransactionInfo({
    sender,
    receiver,
    transactionType: "request",
    amount,
    description,
    page: transactionDetailPage,
    viewerId: otherUser.id,
  });
});

test("can accept payment request", async () => {
  const amount = 10;
  const description = "For Grocery";

  // store senders balance
  const senderBalanceBefore = await newTransactionPage.getBalance();

  // create transaction
  await createTransaction({
    page: newTransactionPage,
    amount,
    description,
    receiver,
    type: "request",
  });

  // check success toast
  await checkSuccessToast({
    page: newTransactionPage,
    text: "Transaction Submitted!",
  });

  // logout
  await newTransactionPage.forceLogout();

  // login as receiver
  await loginUser(receiver, page);

  const receiverBalanceBefore = await newTransactionPage.getBalance();

  // go to transactions list page
  await transactionsListPage.goto();

  // click personal transactions tab
  transactionsListPage.gotoPersonalTransactions();

  // check first transaction
  await checkFirstTransaction({ page: transactionsListPage, description });

  // click first transaction
  await transactionsListPage.clickFirstTransaction();

  // accept request
  await transactionDetailPage.acceptRequest();

  // check amount is debited from receivers balance
  const receiverBalanceAfter = (receiverBalanceBefore || 0) - amount * 100;
  await checkBalance({ page: transactionDetailPage, balance: receiverBalanceAfter });

  // check accept / reject buttons removed
  await expect(transactionDetailPage.acceptButton).not.toBeVisible();
  await expect(transactionDetailPage.rejectButton).not.toBeVisible();

  // login as request sender
  await newTransactionPage.forceLogout();
  await loginUser(sender, page);

  // check amount is credited to senders balance
  const senderBalanceAfter = (senderBalanceBefore || 0) + amount * 100;
  await checkBalance({ page: transactionDetailPage, balance: senderBalanceAfter });
});

test("can reject payment request", async () => {
  const amount = 10;
  const description = "For Milk";

  // store senders balance
  const senderBalanceBefore = await newTransactionPage.getBalance();

  // create transaction
  await createTransaction({
    page: newTransactionPage,
    amount,
    description,
    receiver,
    type: "request",
  });

  // check success toast
  await checkSuccessToast({
    page: newTransactionPage,
    text: "Transaction Submitted!",
  });

  // logout
  await newTransactionPage.forceLogout();

  // login as receiver
  await loginUser(receiver, page);

  const receiverBalanceBefore = await newTransactionPage.getBalance();

  // go to transactions list page
  await transactionsListPage.goto();

  // click personal transactions tab
  transactionsListPage.gotoPersonalTransactions();

  // check first transaction
  await checkFirstTransaction({ page: transactionsListPage, description });

  // click first transaction
  await transactionsListPage.clickFirstTransaction();

  // reject request
  await transactionDetailPage.rejectRequest();

  // check amount is the same
  await checkBalance({ page: transactionDetailPage, balance: receiverBalanceBefore || 0 });

  // check accept / reject buttons removed
  await expect(transactionDetailPage.acceptButton).not.toBeVisible();
  await expect(transactionDetailPage.rejectButton).not.toBeVisible();

  // login as request sender
  await newTransactionPage.forceLogout();
  await loginUser(sender, page);

  // check amount is the same
  await checkBalance({ page: transactionDetailPage, balance: senderBalanceBefore || 0 });
});

test("anyone can like transaction once", async () => {
  const amount = 50;
  const description = "16gb ram";

  const createTransactionEvent = page.waitForResponse((response) => {
    const request = response.request();
    return /transactions/.test(request.url()) && request.method() === "POST";
  });

  // create transaction
  await createTransaction({
    page: newTransactionPage,
    amount,
    description,
    receiver,
    type: "payment",
  });

  const response = await createTransactionEvent;
  const responseData = await response.json();
  const transactionId = responseData.transaction.id as string;

  // logout
  await newTransactionPage.forceLogout();

  let likes = 0;

  for (let user of [sender, receiver, otherUser]) {
    await loginUser(user, page);

    // goto transaction detail page
    await transactionDetailPage.gotoTransaction(transactionId);

    // like transaction
    await transactionDetailPage.likeTransaction();
    likes = likes + 1;

    // expect transaction count to increase
    await expect(transactionDetailPage.likeCount).toHaveText(`${likes}`);

    // like transaction again by force clicking
    await transactionDetailPage.likeTransaction(true);

    // expect transaction count to stay the same
    await expect(transactionDetailPage.likeCount).toHaveText(`${likes}`);

    // logout
    await transactionDetailPage.forceLogout();
  }
});

test("anyone can comment on a transaction", async () => {
  const amount = 50;
  const description = "16gb ram";

  const createTransactionEvent = page.waitForResponse((response) => {
    const request = response.request();
    return /transactions/.test(request.url()) && request.method() === "POST";
  });

  // create transaction
  await createTransaction({
    page: newTransactionPage,
    amount,
    description,
    receiver,
    type: "payment",
  });

  const response = await createTransactionEvent;
  const responseData = await response.json();
  const transactionId = responseData.transaction.id as string;

  // logout
  await newTransactionPage.forceLogout();

  for (let user of [sender, receiver, otherUser]) {
    await loginUser(user, page);

    // goto transaction detail page
    await transactionDetailPage.gotoTransaction(transactionId);

    // comment
    const commentText = faker.random.words(10);
    await transactionDetailPage.comment(commentText);

    // check comment is visible
    await expect(transactionDetailPage.commentsTitle).toBeVisible();
    await expect(transactionDetailPage.getLastComment()).toContainText(commentText);

    // logout
    await transactionDetailPage.forceLogout();
  }
});
