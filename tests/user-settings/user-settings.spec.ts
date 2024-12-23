import test, { Page, expect } from "@playwright/test";
import { UserSettingsPage } from "../pages/user-settings.page";
import { getUsersForTest } from "../helpers/get-users-for-test";
import { User } from "models";
import { loginUser } from "../helpers/login-user";
import faker from "@faker-js/faker";

let userSettingsPage : UserSettingsPage;
let page: Page;
let user: User;

test.beforeEach(async ({ page: beforeEachPage }) => {
    const users = await getUsersForTest('user_settings');
    user = users[0];
    page = beforeEachPage;
    await loginUser(user, page);
    userSettingsPage = new UserSettingsPage(page);
});

test('renders form', async () => {
    await userSettingsPage.clickUserSettings();
    await expect(userSettingsPage.form).toBeVisible();
});

test('shows form errors', async () => {
    await userSettingsPage.clickUserSettings();

    await userSettingsPage.fillAndBlurFirstName('');
    await expect(userSettingsPage.firstNameError).toBeVisible();

    await userSettingsPage.fillAndBlurLastName('');
    await expect(userSettingsPage.lastNameError).toBeVisible();

    await userSettingsPage.fillAndBlurEmail('');
    await expect(userSettingsPage.emailError).toBeVisible();

    const invalidPhoneNumbers = ['', '1238', '+1 234 567 890', '+1-23-45', 'abc-def-ghij', '123-456-789-01', '++123 456 7890', '(1234) 567-890'];
    for (let phoneNumber of invalidPhoneNumbers) {
        await userSettingsPage.fillAndBlurPhone(phoneNumber);
        await expect(userSettingsPage.phoneError).toBeVisible();
    }

    const validPhoneNumbers = ['123-456-7890', '1234567890'];
    for (let phoneNumber of validPhoneNumbers) {
        await userSettingsPage.fillAndBlurPhone(phoneNumber);
        await expect(userSettingsPage.phoneError).not.toBeVisible();
    }

    await expect(userSettingsPage.submitButton).toBeDisabled();
});


test('updates information', async () => {
    await userSettingsPage.clickUserSettings();
    let firstName = faker.name.firstName();
    let lastName = faker.name.firstName();
    let email = faker.internet.email();
    let phone = faker.phone.phoneNumberFormat(0);

    await userSettingsPage.fillAndBlurFirstName(firstName);
    await userSettingsPage.fillAndBlurLastName(lastName);
    await userSettingsPage.fillAndBlurEmail(email);
    await userSettingsPage.fillAndBlurPhone(phone);
    await userSettingsPage.submitForm();

    await page.reload();

    await expect(userSettingsPage.firstNameInput).toHaveValue(firstName);
    await expect(userSettingsPage.lastNameInput).toHaveValue(lastName);
    await expect(userSettingsPage.emailInput).toHaveValue(email);
    await expect(userSettingsPage.phoneInput).toHaveValue(phone);
    
    const fullNameShort = `${firstName} ${lastName.slice(0, 1)}`;
    await expect(userSettingsPage.sidebarFullName).toHaveText(fullNameShort);

});