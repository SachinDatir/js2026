import {type Page, type Locator } from "@playwright/test";

export class AutomationExercise{
    private readonly page: Page
    readonly emailField : Locator
    readonly passwordField:Locator
    readonly loginButton :Locator
    readonly logoutButton :string

    constructor(page:Page){
        this.page = page
        this.emailField = page.locator('[data-qa="login-email"]')
        this.passwordField = page.locator('[data-qa="login-password"]')
        this.loginButton = page.locator('[data-qa="login-button"]')
        this.logoutButton = '[href="/logout"]'

    }
}