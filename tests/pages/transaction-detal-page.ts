import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class TransactionDetailPage extends AppPage {
  public acceptButton: Locator;
  public rejectButton: Locator;
  public senderName: Locator;
  public receiverName: Locator;
  public senderAvatar: Locator;
  public receiverAvatar: Locator;
  public amount: Locator;
  public description: Locator;
  private likeButton: Locator;
  public likeCount: Locator;
  private commentInput: Locator;
  public commentsTitle: Locator;
  public commentsList: Locator;

  constructor(protected page: Page) {
    super(page);
    this.acceptButton = page.locator('[data-test^="transaction-accept-request"]');
    this.rejectButton = page.locator('[data-test^="transaction-reject-request"]');
    this.senderName = page.locator('.TransactionTitle-titleName[data-test^="transaction-sender"]');
    this.senderAvatar = page.getByTestId("transaction-sender-avatar");
    this.receiverName = page.locator(
      '.TransactionTitle-titleName[data-test^="transaction-receiver"]'
    );
    this.receiverAvatar = page.getByTestId("transaction-receiver-avatar");
    this.amount = page.locator('[data-test^="transaction-amount-"]');
    this.description = page.getByTestId("transaction-description");
    this.likeButton = page.locator('[data-test^="transaction-like-button-"]');
    this.likeCount = page.locator('[data-test^="transaction-like-count-"]');
    this.commentInput = page.locator('[data-test^="transaction-comment-input-"]');
    this.commentsTitle = page.getByRole("heading", { name: "Comments" });
    this.commentsList = page.getByTestId("comments-list");
  }

  acceptRequest() {
    return this.acceptButton.click();
  }

  rejectRequest() {
    return this.rejectButton.click();
  }

  likeTransaction(force = false) {
    return this.likeButton.click({ force });
  }

  gotoTransaction(id: string) {
    return this.page.goto(`/transaction/${id}`);
  }

  getLastComment() {
    return this.commentsList.last();
  }

  async comment(text: string) {
    await this.commentInput.fill(text);
    await this.page.keyboard.press("Enter");
  }
}
