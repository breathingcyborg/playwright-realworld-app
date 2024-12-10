import { Locator, Page } from "@playwright/test";
import { FRONTEND_URL } from "../constants";

export class SignupPage {

    private readonly firstNameInput: Locator;
    private readonly firstNameHelperText: Locator;

    private readonly lastNameInput: Locator;
    private readonly lastNameHelperText: Locator;

    private readonly usernameInput: Locator;
    private readonly usernameHelperText: Locator;

    private readonly passwordInput: Locator;
    private readonly passwordHelperText: Locator;

    private readonly confirmPasswordInput: Locator;
    private readonly confirmPasswordHelperText: Locator;

    private readonly submitButton: Locator;

    constructor(readonly page: Page) {

        this.firstNameInput = page.getByTestId('signup-first-name').locator('input');
        this.firstNameHelperText = page.getByTestId('signup-first-name').locator('#firstName-helper-text');

        this.lastNameInput = page.getByTestId('signup-last-name').locator('input');
        this.lastNameHelperText = page.getByTestId('signup-last-name').locator('#lastName-helper-text');

        this.usernameInput = page.getByTestId('signup-username').locator('input');
        this.usernameHelperText = page.getByTestId('signup-username').locator('#username-helper-text');


        this.passwordInput = page.getByTestId('signup-password').locator('input');
        this.passwordHelperText = page.getByTestId('signup-password').locator('#password-helper-text');

        this.confirmPasswordInput = page.getByTestId('signup-confirmPassword').locator('input');
        this.confirmPasswordHelperText = page.getByTestId('signup-confirmPassword').locator('#confirmPassword-helper-text');

        this.submitButton = page.getByTestId('signup-submit');
    }

    async fillAndBlurFirstName(value: string) {
        await this.firstNameInput.fill(value);
        await this.firstNameInput.blur();
    }

    async fillAndBlurLastName(value: string) {
        await this.lastNameInput.fill(value);
        await this.lastNameInput.blur();
    }

    async fillAndBlurUsername(value: string) {
        await this.usernameInput.fill(value);
        await this.usernameInput.blur();
    }

    async fillAndBlurPassword(value: string) {
        await this.passwordInput.fill(value);
        await this.passwordInput.blur();
    }

    async fillAndBlurConfirmPassword(value: string) {
        await this.confirmPasswordInput.fill(value);
        await this.confirmPasswordInput.blur();
    }

    async submitForm() {
        await this.submitButton.click();
    }

    getSubmitButton() {
        return this.submitButton;
    }

    getFirstNameErrorText() {
        return this.firstNameHelperText;
    }

    getLastNameErrorText() {
        return this.lastNameHelperText;
    }

    getUsernameErrorText() {
        return this.usernameHelperText;
    }

    getPasswordErrorText() {
        return this.passwordHelperText;
    }

    getConfirmPasswordErrorText() {
        return this.confirmPasswordHelperText;
    }

    async goto() {
        await this.page.goto("/signup");
    }
}