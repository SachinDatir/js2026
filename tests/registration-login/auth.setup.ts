import { test as setup, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { defaultUser } from "../../test-data/auth-users";

const apiBaseUrl = (
  process.env.API_BASE_URL ?? "http://localhost:3000/v1"
).replace(/\/$/, "");
const appOrigin = new URL(
  process.env.BASE_URL ??
    process.env.DEV_BASE_URL ??
    "https://development.oneselect.global",
).origin;
const authFile = path.resolve(
  `playwright/.auth/${process.env.TEST_ENV ?? "local"}.json`,
);

async function jsonResponse(request: APIRequestContext, url: string, options = {}) {
  const response = await request.fetch(url, options);
  if (!response.ok()) {
    throw new Error(
      `Request failed (${response.status()}) for ${url}: ${await response.text()}`,
    );
  }
  return response.json();
}

setup("authenticate through the API", async ({ request }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const login = await jsonResponse(request, `${apiBaseUrl}/globals/auth/login`, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    data: {
      email: defaultUser.email,
      password: defaultUser.password,
      rememberMe: false,
      uid: `playwright-${randomUUID()}`,
      deviceInfo: { browser: "Playwright" },
    },
  });

  const { token, userId, uid, timestamp } = login.data;
  if (!token || !userId || !uid) {
    throw new Error("The login API response is missing token, userId, or uid.");
  }

  const headers = { authorization: `Bearer ${token}` };
  const profileResponse = await jsonResponse(
    request,
    `${apiBaseUrl}/globals/profile/${userId}`,
    { headers },
  );
  const user = profileResponse.data;
  if (user.UsersData !== undefined) {
    Object.assign(user, user.UsersData);
    delete user.UsersData;
  }

  const roles = user.Roles ?? [];
  const auth = [...new Set(
    roles.flatMap((role: any) =>
      (role.RolePermissions ?? [])
        .map((rolePermission: any) => {
          const isBasic = role.UsersRoles?.isRoleBasic;
          return isBasic || rolePermission.Permission?.module === "Applications"
            ? rolePermission.Permission?.permissionCode
            : undefined;
        })
        .filter(Boolean),
    ),
  )];
  const rolePermissions = roles.map((role: any) => ({
    productionFacilityId: role.productionFacilityId,
    roleId: role.roleId,
    roleName: role.roleName,
    permissions: (role.RolePermissions ?? []).map(
      (rolePermission: any) => rolePermission.Permission?.permissionCode,
    ),
  }));
  const productionFacilityIds = roles
    .map((role: any) => role.ProductionFacility?.productionFacilityId)
    .filter(Boolean)
    .join(",");
  if (!productionFacilityIds) {
    throw new Error("The profile API response contains no production facilities.");
  }

  const productLinesResponse = await jsonResponse(
    request,
    `${apiBaseUrl}/globals/getAllApplicationProductLines?productionFacilityIds=${productionFacilityIds}`,
    { headers },
  );

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: appOrigin,
        localStorage: [
          ["access_token", token],
          ["id", userId],
          ["uid", uid],
          ["timestamp", timestamp],
          ["user", user],
          ["auth", auth],
          ["rolePermissions", rolePermissions],
          ["allProductlineData", productLinesResponse.data],
        ].map(([name, value]) => ({ name, value: JSON.stringify(value) })),
      },
    ],
  };

  fs.writeFileSync(authFile, JSON.stringify(storageState));
});
