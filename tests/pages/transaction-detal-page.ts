import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class TransactionDetailPage extends AppPage {
    private acceptButton : Locator;
    private rejectButton : Locator;

    constructor(protected page : Page) {
        super(page);
        this.acceptButton = page.locator('[data-test^="transaction-accept-request"]');
        this.rejectButton = page.locator('[data-test^="transaction-reject-request"]');
    }

    acceptRequest() {
        return this.acceptButton.click();
    }

    rejectRequest() {
        return this.rejectButton.click();
    }
}