import { Locator, Page } from "@playwright/test";
import { AppPage } from "./app.page";

export class OnboardingPage extends AppPage {
    private readonly title : Locator;
    private readonly nextButton : Locator;
    private readonly contentContainer : Locator;

    constructor(protected readonly page : Page) {
        super(page);
        this.title = page.getByTestId("user-onboarding-dialog-title");
        this.nextButton = page.getByTestId("user-onboarding-next");
        this.contentContainer = page.getByTestId("user-onboarding-dialog-content");
    }

    async waitForTitle() {
        await this.title.waitFor({ state: 'visible' });
    }

    async clickNextButton() {
        this.nextButton.click();
    }

    getTitle() {
        return this.title;
    }

    getNextButton() {
        return this.nextButton;
    }

    async waitForPopupClose() {
        return this.contentContainer.waitFor({ state: 'detached' })
    }
}