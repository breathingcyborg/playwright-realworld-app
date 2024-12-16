import { Page, test as base, expect } from '@playwright/test';
import { getUsersForTest } from '../helpers/get-users-for-test';
import { loginUser } from '../helpers/login-user';
import { BankAccountFormPage } from '../pages/bank-account-form.page';
import { BankAccountListPage } from '../pages/bank-account-list.page';
import { CREATE_BANK_ACCOUNT_URL_REGEX, LIST_BANK_ACCOUNTS_URL_REGEX } from '../regexes';
import faker from '@faker-js/faker';
import { OnboardingPage } from '../pages/onboarding.page';

/**
 * Common setup login, and create pages
 */
const test = base.extend<{ pages: { page: Page, formPage: BankAccountFormPage, listPage: BankAccountListPage } }>({
    pages: async ({ page }, use) => {
        const users = await getUsersForTest('bank_accounts');
        const user = users[0];
        await loginUser(user, page);
        const formPage = new BankAccountFormPage(page);
        const listPage = new BankAccountListPage(page);
        await use({ formPage, page, listPage });
    },
})

test('create bank account', async ({ pages: { formPage, listPage, page } }) => {
    // Click create button
    await listPage.goto();
    await listPage.clickCreateButton();

    await expect(page).toHaveURL(CREATE_BANK_ACCOUNT_URL_REGEX);
    
    // Submit form
    const bankName = `${faker.company.companyName()} Bank`;
    const accountNumber = faker.finance.account(10);
    const routingNumber = faker.finance.account(9);
    await formPage.fillForm({ bankName, accountNumber, routingNumber });
    await formPage.submitForm();

    // wait for list page
    await expect(page).toHaveURL(LIST_BANK_ACCOUNTS_URL_REGEX);

    // check bank was created
    await expect(listPage.getLastBankRow({ bankName, deleted: false })).toBeVisible();
});


test('soft delete bank account', async ({ pages: { page, listPage, formPage } }) => {
    // Click create button
    await listPage.goto();
    await listPage.clickCreateButton();

    await expect(page).toHaveURL(CREATE_BANK_ACCOUNT_URL_REGEX);
    
    // Submit form
    const bankName = `${faker.company.companyName()} Bank`;
    const accountNumber = faker.finance.account(10);
    const routingNumber = faker.finance.account(9);
    await formPage.fillForm({ bankName, accountNumber, routingNumber });
    await formPage.submitForm();

    // wait for list page
    await expect(page).toHaveURL(LIST_BANK_ACCOUNTS_URL_REGEX);

    // check bank was created
    await expect(listPage.getLastBankRow({ bankName, deleted: false })).toBeVisible();

    // listen for delete and list
    const deleteApiCall = page.waitForResponse((response) => {
        const request = response.request();
        return request.url().includes("/graphql")
            && request.postDataJSON()?.operationName === 'DeleteBankAccount'
    });

    // Click delete button
    await listPage.deleteBank(bankName);

    // Check delete and list were called
    await deleteApiCall;

    // Check bank account was deleted
    await expect(listPage.getLastBankRow({ bankName, deleted: true })).toBeVisible();
});


test('should display bank account form errors', async ({ pages: { formPage, listPage, page } }) => {
    // Click create button
    await listPage.goto();
    await listPage.clickCreateButton();

    await expect(page).toHaveURL(CREATE_BANK_ACCOUNT_URL_REGEX);
    
    // Bank name
    await formPage.fillAndBlurBankName('');
    await expect(formPage.getBankNameErrorText()).toBeVisible();
    await expect(formPage.getSubmitButton()).toBeDisabled();

    // Routing number
    await formPage.fillAndBlurRoutingNumber('');
    await expect(formPage.getRoutingNumberErrorText()).toBeVisible();
    await expect(formPage.getSubmitButton()).toBeDisabled();

    await formPage.fillAndBlurRoutingNumber('123');
    await expect(formPage.getRoutingNumberErrorText()).toBeVisible();
    await expect(formPage.getSubmitButton()).toBeDisabled();

    // Account number
    await formPage.fillAndBlurAccountNumber('');
    await expect(formPage.getAccountNumberErrorText()).toBeVisible();
    await expect(formPage.getSubmitButton()).toBeDisabled();

    // min 9 digits
    await formPage.fillAndBlurAccountNumber('123');
    await expect(formPage.getAccountNumberErrorText()).toBeVisible();
    await expect(formPage.getSubmitButton()).toBeDisabled();

    // max 12 digits
    await formPage.fillAndBlurAccountNumber('1234567891230');
    await expect(formPage.getAccountNumberErrorText()).toBeVisible();
    await expect(formPage.getSubmitButton()).toBeDisabled();

});

test('show onboarding modal when no bank accounts', async ({ pages: { listPage, page } }) => {
    // mock list routes to return empty list
    page.route(/graphql\/?$/, (route, request) => {
        const isListAccountsRequest = request.postDataJSON()?.operationName === 'ListBankAccount';
        if (!isListAccountsRequest) {
            return route.continue();
        }
        return route.fulfill({ status: 200, json: { data: { listBankAccount: null } } });
    });

    await listPage.goto();

    // check onboarding page is visible
    const onboardingPage = new OnboardingPage(page);
    await onboardingPage.waitForTitle();
});