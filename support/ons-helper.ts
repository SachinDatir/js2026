import { APIRequestContext } from "@playwright/test";

export { waitForApi } from "./utils/wait-utils";

export const generateLoginToken = async (
  request: APIRequestContext,
  email: string,
  password: string,
) => {
  const response = await request.post(
    "https://api.development.oneselect.global/v1/globals/auth/login",
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

  const apiRes = await response.json();
  if (!response.ok() || !apiRes.data?.token) {
    throw new Error(
      `Login failed (${response.status()}): ${JSON.stringify(apiRes)}`,
    );
  }

  return apiRes.data.token;
};
