const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
    constructor(driver) {
        super(driver);
        this.addToCartBtn = By.id('add-to-cart-sauce-labs-backpack');
        this.cartLink = By.className('shopping_cart_link');
        this.checkoutBtn = By.id('checkout');
        this.firstName = By.id('first-name');
        this.lastName = By.id('last-name');
        this.postalCode = By.id('postal-code');
        this.continueBtn = By.id('continue');
        this.paymentInfoLabel = By.css('.summary_info_label:nth-child(1)'); // Label Payment Info
        this.finishBtn = By.id('finish');
        this.completeHeader = By.className('complete-header');
        this.errorMessage = By.css('h3[data-test="error"]');
    }

    async addItemAndCheckout(fName, lName, zip) {
        await this.click(this.addToCartBtn);
        await this.click(this.cartLink);
        await this.click(this.checkoutBtn);
        await this.type(this.firstName, fName);
        await this.type(this.lastName, lName);
        await this.type(this.postalCode, zip);
        await this.click(this.continueBtn);
    }

    async isPaymentInfoDisplayed() {
        try {
            const text = await this.getText(this.paymentInfoLabel);
            return text.includes('Payment Information');
        } catch (e) {
            return false;
        }
    }

    async finishCheckout() {
        await this.click(this.finishBtn);
        return await this.getText(this.completeHeader);
    }

    async getCheckoutError() {
        return await this.getText(this.errorMessage);
    }
}

module.exports = CheckoutPage;