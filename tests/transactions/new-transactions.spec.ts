import { Page, test, expect } from '@playwright/test';
import { User } from 'models';
import { getUsersForTest } from '../helpers/get-users-for-test';
import { loginUser } from '../helpers/login-user';
import { NewTransactionPage } from '../pages/new-transaction-page';
import { TransactionsListPage } from '../pages/transactions-list-page';
import { createTransaction } from '../helpers/create-transaction';
import { checkFirstTransaction } from '../helpers/check-first-transaction';
import { checkSuccessToast } from '../helpers/check-success-toast';
import { checkBalance } from '../helpers/check-balance';

test.describe.configure({ mode: 'serial' });

let sender : User;
let receiver : User;
let page : Page;
let newTransactionPage : NewTransactionPage;
let transactionsListPage : TransactionsListPage;

test.beforeEach(async ({ page: browserPage }) => {
    [sender, receiver] = await getUsersForTest('new_transactions');
    await loginUser(sender, browserPage);
    page = browserPage;
    newTransactionPage = new NewTransactionPage(page);
    transactionsListPage = new TransactionsListPage(page);
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

test('search user by attributes (firstName, lastName, username, email, phoneNumber)', async () => {

    for (const attributeName of ['firstName', 'lastName', 'username', 'email', 'phoneNumber'] as const) {
        const attribute = receiver[attributeName];

        await newTransactionPage.clickNewTransactions();

        const search = page.waitForResponse(/users\/search/)

        await newTransactionPage.searchUser(attribute);
        
        await search;

        await expect(newTransactionPage.getUserListItemByUserId(receiver.id)).toBeVisible();
    }

});

test('when insufficient fund user can submit payment by withdrawing from bank', async ({ }) => {

    const startBalance = await newTransactionPage.getBalance() || 0;

    const amount = (startBalance/100) + 10;
    const description = "Free lunch";

    const expectedEndBalance = 0;

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

test('shows form errors', async ({ }) => {

    await newTransactionPage.clickNewTransactions();

    // select user
    await newTransactionPage.searchUser(receiver.username);
    await newTransactionPage.selectUser(receiver.username);
    
    await newTransactionPage.fillAndBlurAmount('');
    await expect(newTransactionPage.getAmountErrorMessage()).toBeVisible();

    await newTransactionPage.fillAndBlurDescription('');
    await expect(newTransactionPage.getDescriptionErrorMessage()).toBeVisible();

    await expect(newTransactionPage.getPayButton()).toBeDisabled();
    await expect(newTransactionPage.getRequestButton()).toBeDisabled();
});