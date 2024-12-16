import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class TransactionsListPage extends AppPage {
    private publicTransactionsLink : Locator;
    private contactsTransactionsLink : Locator;
    private personalTransactionsLink : Locator;
    private transactionsList : Locator;

    constructor(protected page: Page) {
        super(page);

        this.publicTransactionsLink = this.page.getByTestId('nav-public-tab')
        this.contactsTransactionsLink = this.page.getByTestId('nav-contacts-tab')
        this.personalTransactionsLink = this.page.getByTestId('nav-personal-tab')
        this.transactionsList = this.page.getByTestId('transaction-list');
    }

    gotoPublicTransactions() {
        return this.publicTransactionsLink.click();
    }

    gotoContactsTransactions() {
        return this.contactsTransactionsLink.click();
    }

    gotoPersonalTransactions() {
        return this.personalTransactionsLink.click();
    }

    getTransactionsListItems() {
        return this.transactionsList.locator("li");
    }

    clickFirstTransaction() {
        return this.getTransactionsListItems().first().click();
    }

    async goto() {
        return this.page.goto('/');
    }
}