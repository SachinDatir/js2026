import { type Page, type Response } from "@playwright/test";

export const waitForApi = (page: Page, url: string) => {
  return page.waitForResponse((res) => res.url().includes(url));
};

export async function submitAndWaitForResponse(
  action: () => Promise<unknown>,
  page: Page,
  urlPart: string,
): Promise<Response> {
  const [response] = await Promise.all([
    page.waitForResponse(
      (apiResponse) =>
        apiResponse.url().includes(urlPart) && apiResponse.status() === 200,
    ),
    action(),
  ]);

  return response;
}
