import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class UserSettingsPage extends AppPage {
  public form: Locator;
  public firstNameError: Locator;
  public lastNameError: Locator;
  public emailError: Locator;
  public phoneError: Locator;
  public firstNameInput: Locator;
  public lastNameInput: Locator;
  public emailInput: Locator;
  public phoneInput: Locator;
  public submitButton: Locator;

  constructor(protected page: Page) {
    super(page);
    this.form = page.getByTestId("user-settings-form");
    this.firstNameInput = page.getByTestId("user-settings-firstName-input");
    this.firstNameError = page.locator("#user-settings-firstName-input-helper-text");
    this.lastNameInput = page.getByTestId("user-settings-lastName-input");
    this.lastNameError = page.locator("#user-settings-lastName-input-helper-text");
    this.emailInput = page.getByTestId("user-settings-email-input");
    this.emailError = page.locator("#user-settings-email-input-helper-text");
    this.phoneInput = page.getByTestId("user-settings-phoneNumber-input");
    this.phoneError = page.locator("#user-settings-phoneNumber-input-helper-text");
    this.submitButton = page.getByTestId("user-settings-submit");
  }

  async fillAndBlurFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.firstNameInput.blur();
  }

  async fillAndBlurLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
    await this.lastNameInput.blur();
  }

  async fillAndBlurEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.emailInput.blur();
  }

  async fillAndBlurPhone(phoneNumber: string): Promise<void> {
    await this.phoneInput.fill(phoneNumber);
    await this.phoneInput.blur();
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }
}
