import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

type Tab = 'personal' | 'public' | 'contact';

export class TransactionsListPage extends AppPage {
  private publicTransactionsLink: Locator;
  private contactsTransactionsLink: Locator;
  private personalTransactionsLink: Locator;
  public transactionsList: Locator;
  public listSkleton : Locator;
  public dateRangeButton : Locator;
  private dateRangeClearButton : Locator;
  public amountRangeButton : Locator;
  public amountRangeInput : Locator
  public amountRangeText: Locator;
  private clearAmountRangeButton : Locator;

  constructor(protected page: Page) {
    super(page);

    this.publicTransactionsLink = this.page.getByTestId("nav-public-tab");
    this.contactsTransactionsLink = this.page.getByTestId("nav-contacts-tab");
    this.personalTransactionsLink = this.page.getByTestId("nav-personal-tab");
    this.transactionsList = this.page.getByTestId("transaction-list");
    this.listSkleton = this.page.getByTestId('list-skeleton');
    this.dateRangeButton = this.page.getByTestId("transaction-list-filter-date-range-button");
    this.dateRangeClearButton = this.page.getByTestId("transaction-list-filter-date-clear-button");
    this.amountRangeButton = this.page.getByTestId('transaction-list-filter-amount-range-button');
    this.amountRangeInput = this.page.getByTestId('transaction-list-filter-amount-range');
    this.amountRangeText = this.page.getByTestId("transaction-list-filter-amount-range-text");
    this.clearAmountRangeButton = this.page.getByTestId('transaction-list-filter-amount-clear-button');
  }

  gotoPublicTransactions(force = false) {
    return this.publicTransactionsLink.click({ force });
  }

  gotoContactsTransactions(force = false) {
    return this.contactsTransactionsLink.click({ force });
  }

  gotoPersonalTransactions(force = false) {
    return this.personalTransactionsLink.click({ force });
  }

  gotoTab(tab: Tab, force = false) {
    if (tab === 'personal') {
      return this.gotoPersonalTransactions(force);
    }
    if (tab === 'public') {
      return this.gotoPublicTransactions(force);
    }
    if (tab === 'contact') {
      return this.gotoContactsTransactions(force);
    }
  }

  getTabButton(tab: Tab) {
    if (tab === 'personal') {
      return this.personalTransactionsLink;
    }
    if (tab === 'public') {
      return this.publicTransactionsLink
    }
    if (tab === 'contact') {
      return this.contactsTransactionsLink;
    }
  }

  getTransactionsListItems() {
    return this.transactionsList.locator("li");
  }

  clickFirstTransaction() {
    return this.getTransactionsListItems().first().click();
  }

  scrollToBottom() {
    return this.transactionsList.evaluate((list) => {
      list.querySelector("div")?.scrollTo({ top: list.querySelector("div")?.scrollHeight })
    })
  }

  clearDateRange() {
    return this.dateRangeClearButton.click();
  }

  clearAmountRange() {
    return this.clearAmountRangeButton.click();
  }

  getTransactionSenderName(transactionId: string) {
    return this.page.getByTestId(`transaction-sender-${transactionId}`);
  }

  getTransactionReceiverName(transactionId: string) {
    return this.page.getByTestId(`transaction-receiver-${transactionId}`);
  }

  getTransactionAction(transactionId: string) {
    return this.page.getByTestId(`transaction-action-${transactionId}`);
  }

  getTransactionLikesCount(transactionId: string) {
    return this.page.getByTestId(`transaction-item-${transactionId}`).getByTestId('transaction-like-count');
  }

  getTransactionCommentsCount(transactionId: string) {
    return this.page.getByTestId(`transaction-item-${transactionId}`).getByTestId('transaction-comment-count');
  }

  getTransactionAmount(transactionId: string) {
    return this.page.getByTestId(`transaction-amount-${transactionId}`);
  }

  async goto() {
    return this.page.goto("/");
  }
}
