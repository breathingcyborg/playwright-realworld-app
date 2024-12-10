import { Locator, Page } from "@playwright/test";

export class AppPage {
    private readonly hamMenu : Locator;
    private readonly logoutButton : Locator;

    constructor(protected readonly page: Page) {
        this.hamMenu = page.getByTestId('sidenav-toggle');
        this.logoutButton = page.getByTestId('sidenav-signout');
    }

    forceLogout() {
        return this.logoutButton.click({ force: true })
    }

    getHamMenu() {
        return this.hamMenu;
    }
}