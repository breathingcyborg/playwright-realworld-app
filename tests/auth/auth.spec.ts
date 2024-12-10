import { test, expect } from '@playwright/test';
import { SigninPage } from '../pages/signin.page';
import { DEFAULT_PASSWORD } from '../constants';
import { User } from 'models';
import { SignupPage } from '../pages/signup.page';
import { createFakeUser } from '../../scripts/seedDataUtils';
import { OnboardingPage } from '../pages/onboarding.page';
import { BankAccountFormPage } from '../pages/bank-account-form.page';
import faker from '@faker-js/faker';
import { HOME_URL_REGEX, SIGNIN_URL_REGEX } from '../regexes';
import { getUsersForTest } from '../helpers/get-users-for-test';

test.describe('Login', () => {

    let user : User;

    test.beforeAll(async () => {
        // find user
        const response = await getUsersForTest('login');
        user = response[0];
    });

    test('should redirect unauthenticated user to signin page', async ({ page }) => {
        await page.goto('/personal');
        await expect(page).toHaveURL(SIGNIN_URL_REGEX)
    });

    test('should redirect to the home page after login', async ({ page }) => {
        // go to signin page
        const signinPage = new SigninPage(page);
        await signinPage.goto();
        
        // submit form
        await signinPage.fillForm(user.username, DEFAULT_PASSWORD, false);
        await signinPage.submitForm();

        // check logged in
        await expect(signinPage.page).toHaveURL(HOME_URL_REGEX);
    });

    test('should remember a user for 30 days after login', async ({ page }) => {
        // go to signin page
        const signinPage = new SigninPage(page);
        await signinPage.goto();

        // submit form
        await signinPage.fillForm(user.username, DEFAULT_PASSWORD, true);
        await signinPage.submitForm();

        // check cookie
        const cookie = await signinPage.getSessionCookie();
        expect(cookie?.expires).toBeDefined();
    });

    test('should display client side errors', async ({ page }) => {
        // goto signin 
        const signinPage = new SigninPage(page);
        await signinPage.goto();

        // fill username, expect error
        await signinPage.fillUsernameAndBlur('');
        await expect(signinPage.getUsernameErrorText()).toBeVisible();

        // fill password, expect error
        await signinPage.fillPasswordAndBlur('123');
        await expect(signinPage.getPasswordErrorText()).toBeVisible();

        // button should be disabled
        await expect(signinPage.getSubmitButon()).toBeDisabled();
    });

    test('should error for an invalid user', async ({ page }) => {
        const signinPage = new SigninPage(page);
        await signinPage.goto();

        const invalidUserName = 'thisusernamedoesnotexist';
        await signinPage.fillForm(invalidUserName, DEFAULT_PASSWORD, false);

        await signinPage.submitForm();
        await expect(signinPage.getServerError()).toBeVisible();
    });

    test('should error for an invalid password for existing user', async ({ page }) => {
        const signinPage = new SigninPage(page);
        await signinPage.goto();

        const invalidPassword = 'thispasswordisinvalid';
        await signinPage.fillForm(user.username, invalidPassword, false);

        await signinPage.submitForm();
        await expect(signinPage.getServerError()).toBeVisible();
    });
});


test.describe('Signup', () => {

    test('lets a user signup, login, onboarding, logout', async ({ page }) => {
        const signupPage = new SignupPage(page);
        await signupPage.goto();

        const user = createFakeUser();
        await signupPage.fillAndBlurFirstName(user.firstName);
        await signupPage.fillAndBlurLastName(user.lastName);
        await signupPage.fillAndBlurUsername(user.username);
        await signupPage.fillAndBlurPassword(DEFAULT_PASSWORD);
        await signupPage.fillAndBlurConfirmPassword(DEFAULT_PASSWORD);

        await signupPage.submitForm();
        await page.waitForURL(SIGNIN_URL_REGEX);
        
        const signinPage = new SigninPage(page);
        await signinPage.fillUsernameAndBlur(user.username);
        await signinPage.fillPasswordAndBlur(DEFAULT_PASSWORD);
        await signinPage.submitForm();

        await expect(page).toHaveURL(HOME_URL_REGEX);

        const onboardingPage = new OnboardingPage(page);
        await onboardingPage.waitForTitle();
        await onboardingPage.clickNextButton();
        await expect(onboardingPage.getTitle()).toHaveText(/create bank account/i)

        const bankName = `${faker.company.companyName()} Bank`;
        const accountNumber = faker.finance.account(10);
        const routingNumber = faker.finance.account(9);

        const bankAccountForm = new BankAccountFormPage(page);
        await bankAccountForm.fillForm({
            bankName,
            accountNumber,
            routingNumber
        })
        await bankAccountForm.submitForm();
        await expect(onboardingPage.getTitle()).toHaveText(/finished/i);
        await expect(onboardingPage.getNextButton()).toHaveText(/done/i);
        await onboardingPage.clickNextButton();

        await onboardingPage.waitForPopupClose();
        await onboardingPage.forceLogout();

        await expect(page).toHaveURL(SIGNIN_URL_REGEX);
    });

    test('shows client side errors', async ({ page }) => {
        const signupPage = new SignupPage(page);
        await signupPage.goto();

        await signupPage.fillAndBlurFirstName('');
        await expect(signupPage.getFirstNameErrorText()).toBeVisible();

        await signupPage.fillAndBlurLastName('');
        await expect(signupPage.getLastNameErrorText()).toBeVisible();

        await signupPage.fillAndBlurPassword('123');
        await expect(signupPage.getLastNameErrorText()).toBeVisible();

        // password mismatch
        await signupPage.fillAndBlurPassword('password');
        await signupPage.fillAndBlurConfirmPassword('different_password');
        await expect(signupPage.getConfirmPasswordErrorText()).toBeVisible();
        await expect(signupPage.getPasswordErrorText()).not.toBeVisible();

        await expect(signupPage.getSubmitButton()).toBeDisabled();
    });
});