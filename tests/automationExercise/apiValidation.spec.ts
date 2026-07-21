import { test, expect } from "@playwright/test";

test.describe("Validate the api requests", () => {
  test("Verify the get https request", async ({ page, request }) => {
    const getListOfProducts = await request.get(
      " https://automationexercise.com/api/productsList",
    );

    const res = await getListOfProducts.json();

    expect(res.responseCode).toBe(200);

    res.products.forEach((element: any) => {
      if (element.name == "Blue Top") {
        console.log(element.price, ">>>>>>>>>>>>");
      }
    });

    //using wrong https method
    const postListOFProducts = await request.post(
      "https://automationexercise.com/api/productsList",
    );

    const postRes = await postListOFProducts.json();
    console.log(postRes, ">>>>>>>>>>");
    expect(postRes.responseCode).toBe(405);
    expect(postRes.message).toBe("This request method is not supported.");

    // get all brands

    const getAllBrands = await request.get(
      "https://automationexercise.com/api/brandsList",
    );
    const getAllBrandsRes = await getAllBrands.json();
    console.log(getAllBrandsRes, ">>>>>>>>>>");
    expect(res.responseCode).toBe(200);
    getAllBrandsRes.brands.forEach((element: any) => {
      if (element.id == 19) {
        expect(element.brand).toEqual("Allen Solly Junior");
      }
    });
  });

  test("Verify the post request output", async ({ request }) => {
    const postReq = await request.post(
      " https://automationexercise.com/api/searchProduct",
      {
        failOnStatusCode: false,

        form: {
          search_product: "tshirt",
        },
      },
    );
    const resOfSearchProd = await postReq.json();
    console.log(resOfSearchProd, "/////");
    expect(resOfSearchProd.responseCode).toBe(200);
    resOfSearchProd.products.forEach((element: any) => {
      if (element.brand == "Mast & Harbour") {
        expect(element.name).toBe("GRAPHIC DESIGN MEN T SHIRT - BLUE");
      }
    });
  });

  test("Verify the login api request", async ({ request }) => {
    const loginApi = await request.post(
      "https://automationexercise.com/api/verifyLogin",
      {
        failOnStatusCode: false,
        form: {
          email: "Skdtest@example.com",
          password: "Test@123",
        },
      },
    );

    const loginApiRes = await loginApi.json();
    console.log(loginApiRes);
    expect(loginApiRes.message).toBe("User exists!");
    expect(loginApiRes.responseCode).toBe(200);

    const loginWithoutEmail = await request.post(
      "https://automationexercise.com/api/verifyLogin",
      {
        failOnStatusCode: false,
        form: {
          password: "Test@123",
        },
      },
    );

    const login = await loginWithoutEmail.json();
    expect(login.message).toBe(
      "Bad request, email or password parameter is missing in POST request.",
    );
  });

  test.skip("POST To Create/Register User Account", async ({ request }) => {
    const email = "Sachin12213@gmail.com";
    const password = "Sachin@123";
    const postReq = await request.post(
      "https://automationexercise.com/api/createAccount",
      {
        failOnStatusCode: false,
        form: {
          name: "Sachin",
          email: email,
          password: "Sachin@123",
          title: "Mr",
          birth_date: "12",
          birth_month: "12",
          birth_year: "1919",
          firstname: "Sachin",
          lastname: "khedekar",
          company: "google",
          address1: "mumbai",
          address2: "pune",
          country: "India",
          zipcode: "422108",
          state: "MH",
          city: "Mumbai",
          mobile_number: "76956778567",
        },
      },
    );

    const resOfRegister = await postReq.json();
    expect(resOfRegister.message).toBe("User created!");

    const deleteReq = await request.delete(
      " https://automationexercise.com/api/deleteAccount",
      {
        failOnStatusCode: false,
        form: {
          email: email,
          password: password,
        },
      },
    );

    const deleteReqRes = await deleteReq.json();
    expect(deleteReqRes.message).toBe("Account deleted!");
  });

  test("GET user account detail by email", async ({ request }) => {
    const userDetails = await request.get(
      "https://automationexercise.com/api/getUserDetailByEmail",
      {
        failOnStatusCode: false,
        params: {
          email: "Skdtest@example.com",
        },
      },
    );
    const res = await userDetails.json();
    expect(res.user.name).toBe("testUser");
    expect(res.responseCode).toBe(200);
  });
});
