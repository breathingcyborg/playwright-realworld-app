import { Page, test } from '@playwright/test';
import { User } from 'models';
import { getUsersForTest } from '../helpers/get-users-for-test';
import { loginUser } from '../helpers/login-user';
import { NewTransactionPage } from '../pages/new-transaction-page';
import { TransactionsListPage } from '../pages/transactions-list-page';
import { createTransaction } from '../helpers/create-transaction';
import { checkFirstTransaction } from '../helpers/check-first-transaction';
import { checkSuccessToast } from '../helpers/check-success-toast';
import { checkBalance } from '../helpers/check-balance';
import { TransactionDetailPage } from '../pages/transaction-detal-page';

test.describe.configure({ mode: 'serial' });

let sender : User;
let receiver : User;
let page : Page;
let newTransactionPage : NewTransactionPage;
let transactionsListPage : TransactionsListPage;
let transactionDetailPage : TransactionDetailPage;

test.beforeEach(async ({ page: browserPage }) => {
    [sender, receiver] = await getUsersForTest('new_transactions');
    await loginUser(sender, browserPage);
    page = browserPage;
    newTransactionPage = new NewTransactionPage(page);
    transactionsListPage = new TransactionsListPage(page);
    transactionDetailPage = new TransactionDetailPage(page);
})

test('user can submit payment', async ({ }) => {

    const amount = 10;
    const description = "For coffee";

    const startBalance = await newTransactionPage.getBalance();
    const expectedEndBalance = startBalance! - (amount * 100);

    // create transaction
    await createTransaction({
        page: newTransactionPage,
        amount,
        description,
        receiver,
        type: 'payment'
    })
    
    // check success toast
    await checkSuccessToast({
        page: newTransactionPage,
        text: 'Transaction Submitted!'
    });

    // check end balance
    await checkBalance({ page: newTransactionPage, balance: expectedEndBalance });

    // return to transactions list
    await newTransactionPage.clickReturnToTransactions();

    // check transaction is displayed
    await checkFirstTransaction({ 
        page: new TransactionsListPage(page),
        description
    })
});

test('user can submit request', async ({ }) => {
    const amount = 10;
    const description = "For Tea";

    await createTransaction({
        page: newTransactionPage,
        amount,
        description,
        receiver,
        type: 'request'
    });
 
    // check success toast
    await checkSuccessToast({
        page: newTransactionPage,
        text: 'Transaction Submitted!'
    });

    // return to transactions list
    await newTransactionPage.clickReturnToTransactions();

    // check transaction is displayed
    await checkFirstTransaction({ 
        page: new TransactionsListPage(page),
        description
    })
});

test('payment is displayed to the receiver', async () => {
     
    const amount = 10;
    const description = "For Vada";

    // expected account balance after transaction
    const expectedReceiverEndBalance = receiver.balance + (amount * 100);

    // create transaction
    await createTransaction({
        page: newTransactionPage,
        amount,
        description,
        receiver,
        type: 'payment'
    });

    // check success toast
    await checkSuccessToast({
        page: newTransactionPage,
        text: 'Transaction Submitted!'
    });

    // logout
    await newTransactionPage.forceLogout();

    // login as receiver
    await loginUser(receiver, page);

    // check receivers new balance
    await checkBalance({ page: newTransactionPage, balance: expectedReceiverEndBalance });
});

test('request is displayed to the receiver', async () => {
     
    const amount = 10;
    const description = "For Dosa";

    // create transaction
    await createTransaction({
        page: newTransactionPage,
        amount,
        description,
        receiver,
        type: 'request'
    });

    // check success toast
    await checkSuccessToast({
        page: newTransactionPage,
        text: 'Transaction Submitted!'
    });

    // logout
    await newTransactionPage.forceLogout();

    // login as receiver
    await loginUser(receiver, page);

    // go to transactions list page
    await transactionsListPage.goto();

    // click personal transactions tab
    await transactionsListPage.gotoPersonalTransactions();

    // check first personal transaction
    await checkFirstTransaction({ page: transactionsListPage, description });
});

test('receiver can accept request', async () => {
     
    const newTransactionPage = new NewTransactionPage(page);
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
        type: 'request'
    });

    // check success toast
    await checkSuccessToast({
        page: newTransactionPage,
        text: 'Transaction Submitted!'
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
    const receiverBalanceAfter = (receiverBalanceBefore || 0) - (amount * 100);
    await checkBalance({ page: transactionDetailPage, balance: receiverBalanceAfter });

    // login as request sender
    await newTransactionPage.forceLogout();
    await loginUser(sender, page);

    // check amount is credited to senders balance
    const senderBalanceAfter = (senderBalanceBefore || 0) + (amount * 100);
    await checkBalance({ page: transactionDetailPage, balance: senderBalanceAfter });
});

test('receiver can reject request', async () => {
     
    const newTransactionPage = new NewTransactionPage(page);
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
        type: 'request'
    });

    // check success toast
    await checkSuccessToast({
        page: newTransactionPage,
        text: 'Transaction Submitted!'
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

    // login as request sender
    await newTransactionPage.forceLogout();
    await loginUser(sender, page);

    // check amount is the same
    await checkBalance({ page: transactionDetailPage, balance: senderBalanceBefore || 0 });
});
