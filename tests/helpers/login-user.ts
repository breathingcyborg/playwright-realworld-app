import { Page } from "@playwright/test";
import { User } from "models";
import { SigninPage } from "../pages/signin.page";
import { DEFAULT_PASSWORD } from "../constants";
import { AppPage } from "../pages/app.page";

export async function loginUser(user: User, page: Page) {
  const loginPage = new SigninPage(page);
  await loginPage.goto();
  await loginPage.fillForm(user.username, DEFAULT_PASSWORD, false);
  await loginPage.submitForm();

  const appPage = new AppPage(page);
  await appPage.getHamMenu().waitFor({ state: "attached" });
}
