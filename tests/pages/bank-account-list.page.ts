import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class BankAccountListPage extends AppPage {
  private readonly list: Locator;
  private readonly createButton: Locator;

  constructor(protected page: Page) {
    super(page);
    this.list = page.getByTestId("bankaccount-list");
    this.createButton = page.getByTestId("bankaccount-new");
  }

  async goto() {
    await this.page.goto("/bankaccounts");
  }

  async clickCreateButton() {
    return this.createButton.click();
  }

  async waitForLoad() {
    await this.list.waitFor({ state: "visible" });
  }

  private getBankRowLocator() {
    return this.page.locator('[data-test^="bankaccount-list-item"]');
  }

  deleteBank(name: string) {
    return this.page
      .locator('[data-test^="bankaccount-list-item"]')
      .filter({ hasText: name, hasNotText: /\(deleted\)/i })
      .getByTestId("bankaccount-delete")
      .click();
  }

  getLastBankRow({ bankName, deleted = false }: { deleted?: boolean; bankName: string }) {
    const hasText = deleted ? bankName + " (Deleted)" : bankName;
    const hasNotText = deleted ? undefined : /\(deleted\)/i;

    return this.getBankRowLocator().filter({ hasText, hasNotText }).last();
  }
}
