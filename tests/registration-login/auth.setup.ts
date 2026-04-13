// import { test as setup } from "@playwright/test";
// import { generateLoginToken } from "../../support/api/auth-api";
// import { defaultUser } from "../../test-data/auth-users";

// const { email, password } = defaultUser;

// setup('Authenticate once', async ({ page, request }) => {
//   // 1. Destructure using the same name returned by the API helper
//   const { token, user, uid, rolePermissions, auth, id, allProductlineData, modelSelectors } = await generateLoginToken(request, email, password);

//   await page.goto('/');

//   // 2. Add 'modelSelectors' to the argument list below
//   await page.evaluate(({ token, user, uid, rolePermissions, auth, id, allProductlineData, modelSelectors }) => {
//     localStorage.setItem('access_token', token);
//     localStorage.setItem('id', String(id || 6));
//     localStorage.setItem('uid', uid);
    
//     if (user) {
//       localStorage.setItem('user', JSON.stringify(user));
//     }
    
//     if (auth) {
//       localStorage.setItem('auth', JSON.stringify(auth));
//     }

//     if (rolePermissions) {
//       localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
//     }

//     localStorage.setItem('rememberMe', 'false');
//     localStorage.setItem('userLang', 'en');
//     localStorage.setItem('isMasterEditDb', 'false');

//     // 3. Stringify modelSelectors because localStorage only accepts strings
//     if (modelSelectors) {
//       localStorage.setItem('modelSelector', JSON.stringify(modelSelectors));
//     }

//     if (allProductlineData) {
//        localStorage.setItem('allProductlineData', JSON.stringify(allProductlineData));
//     }

//     // 4. Pass the full object into evaluate
//   }, { token, user, uid, rolePermissions, auth, id, allProductlineData, modelSelectors });

//   await page.reload();
//   await page.context().storageState({ path: 'auth.json' });

//   await page.pause()
// });