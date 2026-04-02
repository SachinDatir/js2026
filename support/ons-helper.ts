import { Page } from "@playwright/test";

export const waitForApi = (page: Page, url: string) => {
  return page.waitForResponse(res =>
    res.url().includes(url)
  );
};