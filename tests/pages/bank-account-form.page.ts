import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class BankAccountFormPage extends AppPage {
    private readonly bankNameInput : Locator;
    private readonly routingNumberInput : Locator;
    private readonly accountNumberInput : Locator;
    private readonly submitButton : Locator;

    constructor(protected readonly page: Page) {
        super(page);
        this.bankNameInput = page.getByTestId("bankaccount-bankName-input").locator("input");
        this.routingNumberInput = page.getByTestId("bankaccount-routingNumber-input").locator("input");
        this.accountNumberInput = page.getByTestId("bankaccount-accountNumber-input").locator("input");
        this.submitButton = page.getByTestId("bankaccount-submit");
    }

    async fillForm({ bankName, routingNumber, accountNumber } : { bankName: string, routingNumber: string, accountNumber: string }) {
        await this.bankNameInput.fill(bankName);
        await this.routingNumberInput.fill(routingNumber);
        await this.accountNumberInput.fill(accountNumber);
    }

    async submitForm() {
        await this.submitButton.click()
    }
}