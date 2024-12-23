import { test, expect, Page, Locator } from '@playwright/test';
import { Transaction, TransactionStatus, User } from 'models';
import { TransactionsListPage } from '../pages/transactions-list-page';
import { getUsersForTest } from '../helpers/get-users-for-test';
import { loginUser } from '../helpers/login-user';
import { getAllTransactions } from '../helpers/database';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import { selectDateRange } from '../helpers/select-date-range';
import { fillRangeInput } from '../helpers/fill-range-input';
import mockTransactions from './mock-transactions';
import Dinero from 'dinero.js';

let user: User;
let page : Page;
let transactionsListPage : TransactionsListPage;

test.beforeEach(async ({ page: browserPage  }) => {
  [user] = await getUsersForTest('transactions_feed');
  await loginUser(user, browserPage);
  page = browserPage;
  transactionsListPage = new TransactionsListPage(page);
});

const tabs = [
  { code: 'personal', apiUrlRegex: /transactions/, privacyLevel: 'personal' },
  { code: 'public', apiUrlRegex: /transactions\/public/, privacyLevel: 'public' },
  { code: 'contact', apiUrlRegex: /transactions\/contacts/, privacyLevel: 'contacts' },
] as const;

test.describe('pagination', () => {
  tabs.forEach(tab => {

    test(`pagination works for ${tab.code} transactions`, async () => {
  
      let requestCount = 0;
  
      page.route(
        (url) => tab.apiUrlRegex.test(url.pathname),
        async (route, request) => {
          requestCount += 1;
    
          const url = new URL(request.url());
    
          const response = await route.fetch();
    
          const body = await response.json();
    
          const page = url.searchParams.get('page') !== null
            ? parseInt(url.searchParams.get('page') as string)
            : 1;
    
          // only 3 pages
          body.pageData.totalPages = 3;
    
          // set has next to false on third page
          if (page === 3) {
            body.pageData.hasNextPages = false;
          }
    
          return route.fulfill({
            response,
            json: body
          })
      });
  
      // Loads first page
      const initialLoad = page.waitForResponse(tab.apiUrlRegex);
      
      // For public tab we reload to fetch data again 
      // and for other tabs we click tab to navigate.
      // Reloading public tab ensures we have the same request count for each tab.
      if (tab.code === 'public') {
        await page.reload();
      } else {
        await transactionsListPage.gotoTab(tab.code, true);
      }
  
      await initialLoad;
  
      // tab selected
      await expect(transactionsListPage.getTabButton(tab.code) as Locator).toHaveClass(/Mui-selected/);
  
      // loading skeleton hidden
      await expect(transactionsListPage.listSkleton).not.toBeVisible();
  
      // list visible
      await expect(transactionsListPage.transactionsList).toBeVisible();
  
      // Load next page
      const nextPageLoad = page.waitForResponse(tab.apiUrlRegex);
      await transactionsListPage.scrollToBottom();
      await nextPageLoad;
  
      // Load last page
      const lastPageLoad = page.waitForResponse(tab.apiUrlRegex);
      await transactionsListPage.scrollToBottom();
      await lastPageLoad;
  
      // Dont load after last page
      await transactionsListPage.scrollToBottom();
      await page.waitForTimeout(5000);
      expect(requestCount).toEqual(3);
  
    });
  
  });    
});

test.describe('filters', () => {

  let latestTransaction: Transaction;

  // pre fetch transactions
  test.beforeAll(async () => {
    const response = await getAllTransactions();
    let transactions = response.results;
    latestTransaction = transactions[transactions.length - 1];
  });

  tabs.forEach(tab => {

    test(`Shows ${tab.code} transactions within date range & lets clear date filter`, async () => {
      // filter dates
      const startDate = startOfDay(new Date(latestTransaction.createdAt));
      const endDate = endOfDay(addDays(startDate, 10));
  
      // navigate to tab
      await transactionsListPage.gotoTab(tab.code);

      // wait until data is loaded
      await expect(transactionsListPage.listSkleton).not.toBeVisible();
      
      // select date
      const query = page.waitForResponse(tab.apiUrlRegex)
      await selectDateRange(page, transactionsListPage.dateRangeButton, startDate, endDate);

      // wait for response
      const response = await query;
      const responseData = await response.json();
      const transactions = responseData.results as Transaction[];

      // check dates
      transactions.forEach(transaction => {
        const createdAt = startOfDay(new Date(transaction.createdAt));
        expect(createdAt.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(createdAt.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });

      // check button text
      const dateFormat = "MMM, d yyyy"
      await expect(transactionsListPage.dateRangeButton).toHaveText(`Date: ${format(startDate, dateFormat)} - ${format(endDate, dateFormat)}`);

      // query to clear date filter
      const clearQuery = page.waitForResponse(tab.apiUrlRegex)

      // clear filter
      await transactionsListPage.clearDateRange();

      // check query is made
      await clearQuery;

      // check date range reset
      await expect(transactionsListPage.dateRangeButton).toHaveText(/All/i);
    });

    test(`Shows ${tab.code} transactions within amount range & lets clear date filter`, async () => {
  
      // navigate to tab
      await transactionsListPage.gotoTab(tab.code);

      // wait until data is loaded
      await expect(transactionsListPage.listSkleton).not.toBeVisible();
      

      const latestTransactionAmountCents = latestTransaction.amount;
  
      // min amount we would enter in the filter (in cents)
      const minAmountCents = latestTransactionAmountCents - 30*100;

      // max amount we would enter in the filter (in cents)
      const maxAmountCents = latestTransactionAmountCents + 30*100;
    
      // open amount filter
      await transactionsListPage.amountRangeButton.click();

      const query = page.waitForResponse(tab.apiUrlRegex)

      // select range
      await fillRangeInput(
        transactionsListPage.amountRangeInput,
        minAmountCents,
        maxAmountCents,
        0, // filter has hardcoded $0 as min value
        1000*100, // filter has hardcoded $1000 as max value
      );

      // wait for response
      const response = await query;
      const responseData = await response.json();
      const transactions = responseData.results as Transaction[];

      // check transaction amounts
      transactions.forEach(transaction => {
        expect(transaction.amount).toBeGreaterThanOrEqual(minAmountCents);
        expect(transaction.amount).toBeLessThanOrEqual(maxAmountCents);
      });

      // open amount filter
      await transactionsListPage.amountRangeButton.click();

      // clear amount range
      await transactionsListPage.clearAmountRange();

      // check filter text
      await expect(transactionsListPage.amountRangeText).toHaveText('Amount Range: $0 - $1,000');
    });

  });
});

test.describe('transaction items', () => {

  tabs.forEach(tab => {
    test(`${tab.code} displays items correctly`, async () => {  

      // mock api response
      page.route(tab.apiUrlRegex, (route) => {
        return route.fulfill({
          json: mockTransactions,
          status: 200
        });
      });
      
      // reload page
      // because public transactions might have already loaded before we setup mock response
      await page.reload();

      // navigate to tab
      await transactionsListPage.gotoTab(tab.code);
      
      // wait for data to load
      await expect(transactionsListPage.listSkleton).not.toBeVisible();

      const transactions = mockTransactions['results'];

      for (let transaction of transactions) {
        const expectedAmount = Dinero({ amount: transaction.amount }).toFormat();
        
        await expect(transactionsListPage.getTransactionAmount(transaction.id))
          .toHaveText(expectedAmount);
        
        await expect(transactionsListPage.getTransactionSenderName(transaction.id))
          .toHaveText(transaction.senderName);

        await expect(transactionsListPage.getTransactionReceiverName(transaction.id))
          .toHaveText(transaction.receiverName);

        await expect(transactionsListPage.getTransactionLikesCount(transaction.id))
          .toHaveText(transaction.likes.length.toString());

        await expect(transactionsListPage.getTransactionCommentsCount(transaction.id))
          .toHaveText(transaction.likes.length.toString());

        // not sure this is the right logic but looks good enough
        const expectedAction = {
          '': transaction.status === TransactionStatus.complete ? 'paid' : 'pending',
          'accepted': 'charged',
          'pending': 'requested'
        }[transaction.requestStatus];

        await expect(transactionsListPage.getTransactionAction(transaction.id))
          .toHaveText(expectedAction!);
      }
    });
  })
});