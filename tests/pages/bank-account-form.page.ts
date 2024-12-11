import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class BankAccountFormPage extends AppPage {
    private readonly bankNameInput : Locator;
    private readonly bankNameHelperText : Locator;

    private readonly routingNumberInput : Locator;
    private readonly routingNumberHelperText : Locator;

    private readonly accountNumberInput : Locator;
    private readonly accountNumberHelperText : Locator;

    private readonly submitButton : Locator;
    private readonly form : Locator;

    constructor(protected readonly page: Page) {
        super(page);
        this.form = page.getByTestId("bankaccount-form")

        this.bankNameInput = this.form.getByTestId("bankaccount-bankName-input").locator("input");
        this.bankNameHelperText = this.form.locator("#bankaccount-bankName-input-helper-text");
        
        this.routingNumberInput = this.form.getByTestId("bankaccount-routingNumber-input").locator("input");
        this.routingNumberHelperText = this.form.locator("#bankaccount-routingNumber-input-helper-text");

        this.accountNumberInput = this.form.getByTestId("bankaccount-accountNumber-input").locator("input");
        this.accountNumberHelperText = this.form.locator("#bankaccount-accountNumber-input-helper-text");

        this.submitButton = this.form.getByTestId("bankaccount-submit");
    }

    async fillForm({ bankName, routingNumber, accountNumber } : { bankName: string, routingNumber: string, accountNumber: string }) {
        await this.bankNameInput.fill(bankName);
        await this.routingNumberInput.fill(routingNumber);
        await this.accountNumberInput.fill(accountNumber);
    }

    async fillAndBlurBankName(bankName: string) {
        await this.bankNameInput.fill(bankName);
        await this.bankNameInput.blur();
    }

    async fillAndBlurAccountNumber(accountNumber: string) {
        await this.accountNumberInput.fill(accountNumber);
        await this.accountNumberInput.blur();
    }

    async fillAndBlurRoutingNumber(routingNumber: string) {
        await this.routingNumberInput.fill(routingNumber);
        await this.routingNumberInput.blur();
    }

    async submitForm() {
        await this.submitButton.click()
    }

    async waitForLoad() {
        return this.form.waitFor({ state: 'visible' });
    }

    getBankNameErrorText() {
        return this.bankNameHelperText;
    }

    getRoutingNumberErrorText() {
        return this.routingNumberHelperText;
    }

    getAccountNumberErrorText() {
        return this.accountNumberHelperText;
    }

    getSubmitButton() {
        return this.submitButton;
    }
}