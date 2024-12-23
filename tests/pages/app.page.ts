import { Locator, Page } from "@playwright/test";

export class AppPage {
  private readonly hamMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly newTransactionButton: Locator;
  private readonly userBalance: Locator;
  private readonly successToast: Locator;
  private readonly userSettings: Locator;
  public readonly sidebarFullName : Locator;

  constructor(protected readonly page: Page) {
    this.hamMenu = page.getByTestId("sidenav-toggle");
    this.logoutButton = page.getByTestId("sidenav-signout");
    this.newTransactionButton = page.getByTestId("nav-top-new-transaction");
    this.userBalance = page.getByTestId("sidenav-user-balance");
    this.userSettings = page.getByTestId("sidenav-user-settings");
    this.successToast = page.getByTestId("alert-bar-success");
    this.sidebarFullName = page.getByTestId('sidenav-user-full-name');
  }

  getSuccessToast() {
    return this.successToast;
  }

  forceLogout() {
    return this.logoutButton.click({ force: true });
  }

  getHamMenu() {
    return this.hamMenu;
  }

  clickNewTransactions() {
    return this.newTransactionButton.click({ force: true });
  }

  clickUserSettings() {
    return this.userSettings.click({ force: true });
  }

  async getBalance() {
    await this.userBalance.waitFor({ state: "attached" });
    const text = await this.userBalance.textContent();
    if (!text) {
      return null;
    }
    const balance = parseFloat(text.replace("$", "").replace(",", ""));
    if (isNaN(balance) || !isFinite(balance)) {
      return null;
    }
    return Math.floor(balance * 100);
  }

  getUserBalanceLocator() {
    return this.userBalance;
  }
}
