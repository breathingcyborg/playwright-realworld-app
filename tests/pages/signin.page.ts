import { Locator, Page } from "@playwright/test";
import { FRONTEND_URL } from "../constants";

export class SigninPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly usernameHelperText: Locator;
  private readonly passwordHelperText: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly submitButton: Locator;
  private readonly serverError: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = this.page.getByLabel("Username");
    this.passwordInput = this.page.getByLabel("Password");
    this.rememberMeCheckbox = this.page.getByLabel("Remember me");
    this.submitButton = this.page.getByTestId("signin-submit");
    this.usernameHelperText = this.page.locator("#username-helper-text");
    this.passwordHelperText = this.page.locator("#password-helper-text");
    this.serverError = this.page.getByTestId("signin-error");
  }

  async goto() {
    await this.page.goto("/signin");
  }

  async fillForm(username: string, password: string, rememberMe: boolean) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.setChecked(rememberMe);
  }

  async fillUsernameAndBlur(username: string) {
    await this.usernameInput.fill(username);
    await this.usernameInput.blur();
  }

  async fillPasswordAndBlur(password: string) {
    await this.passwordInput.fill(password);
    await this.passwordInput.blur();
  }

  getUsernameErrorText() {
    return this.usernameHelperText;
  }

  getPasswordErrorText() {
    return this.passwordHelperText;
  }

  getSubmitButon() {
    return this.submitButton;
  }

  getServerError() {
    return this.serverError;
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async getSessionCookie() {
    await this.page.waitForURL(FRONTEND_URL);
    const cookies = await this.page.context().cookies();
    return cookies.find((cookie) => cookie.name == "connect.sid");
  }
}
