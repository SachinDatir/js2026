import { APIRequestContext, Page } from "@playwright/test";

export const waitForApi = (page: Page, url: string) => {
  return page.waitForResponse((res) => res.url().includes(url));
};

export const generateLoginToken = async (
  request: APIRequestContext,
  email: string,
  password: string,
) => {
  const response = await request.post(
    "http://localhost:3000/v1/globals/auth/login",
    {
      failOnStatusCode: false,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      data: {
        email: email,
        password: password,
        rememberMe: false,
        uid: "250118664537361460005373651080192024",
      },
    },
  );

  const contentType = response.headers()["content-type"] ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON from login API, but received ${contentType || "unknown content-type"} with status ${response.status()}: ${await response.text()}`,
    );
  }

  let apiRes = await response.json();
  return apiRes.data?.token;
};


