import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class NewTransactionPage extends AppPage {
  private userListSearchInput: Locator;
  private usersList: Locator;
  private amountInput: Locator;
  private descriptionInput: Locator;
  private requestButton: Locator;
  private payButton: Locator;
  private returnToTransactionsButton: Locator;
  private amountErrorMessage: Locator;
  private descriptionErrorMessage: Locator;

  constructor(protected page: Page) {
    super(page);
    this.userListSearchInput = this.page.getByTestId("user-list-search-input");
    this.usersList = this.page.getByTestId("users-list");
    this.amountInput = this.page.locator("#amount");
    this.amountErrorMessage = this.page.locator("#transaction-create-amount-input-helper-text");
    this.descriptionInput = this.page.locator("#transaction-create-description-input");
    this.descriptionErrorMessage = this.page.locator(
      "#transaction-create-description-input-helper-text"
    );
    this.requestButton = this.page.getByTestId("transaction-create-submit-request");
    this.payButton = this.page.getByTestId("transaction-create-submit-payment");
    this.returnToTransactionsButton = this.page.getByTestId(
      "new-transaction-return-to-transactions"
    );
  }

  searchUser(input: string) {
    return this.userListSearchInput.fill(input);
  }

  selectUser(input: string) {
    return this.usersList.locator("li").filter({ hasText: input }).click();
  }

  getUserListItemByUserId(userId: string) {
    return this.usersList.getByTestId(`user-list-item-${userId}`);
  }

  async fillAndBlurAmount(value: string) {
    await this.amountInput.fill(value);
    await this.amountInput.blur();
  }

  async fillAndBlurDescription(value: string) {
    await this.descriptionInput.fill(value);
    await this.descriptionInput.blur();
  }

  clickRequestButton() {
    return this.requestButton.click();
  }

  clickPayButton() {
    return this.payButton.click();
  }

  clickReturnToTransactions() {
    return this.returnToTransactionsButton.click();
  }

  getAmountErrorMessage() {
    return this.amountErrorMessage;
  }

  getDescriptionErrorMessage() {
    return this.descriptionErrorMessage;
  }

  getRequestButton() {
    return this.requestButton;
  }

  getPayButton() {
    return this.payButton;
  }
}
