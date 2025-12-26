const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Locators giả định cho flow checkout saucedemo
        this.addToCartBtn = By.css('.inventory_item button');
        this.cartLink = By.className('shopping_cart_link');
        this.checkoutBtn = By.id('checkout');
        this.firstNameInput = By.id('first-name');
        this.lastNameInput = By.id('last-name');
        this.postalCodeInput = By.id('postal-code');
        this.continueBtn = By.id('continue');
        this.finishBtn = By.id('finish');
        this.completeHeader = By.className('complete-header');
        this.summaryInfo = By.className('summary_info');
        this.errorMsg = By.css('h3[data-test="error"]');
    }

    async addItemAndCheckout(first, last, zip) {
        await this.click(this.addToCartBtn); // Thêm món đầu tiên
        await this.click(this.cartLink);
        await this.click(this.checkoutBtn);
        await this.type(this.firstNameInput, first);
        await this.type(this.lastNameInput, last);
        await this.type(this.postalCodeInput, zip);
        await this.click(this.continueBtn);
    }

    async isPaymentInfoDisplayed() {
        try {
            await this.find(this.summaryInfo);
            return true;
        } catch (e) {
            return false;
        }
    }

    async finishCheckout() {
        await this.click(this.finishBtn);
        return await this.getText(this.completeHeader);
    }

    async getCheckoutError() {
        return await this.getText(this.errorMsg);
    }
}

module.exports = CheckoutPage;