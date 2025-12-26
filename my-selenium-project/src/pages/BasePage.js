const { until } = require('selenium-webdriver');

class BasePage {
    constructor(driver) {
        this.driver = driver;
    }

    async open(url) {
        await this.driver.get(url);
    }

    async find(locator) {
        await this.driver.wait(until.elementLocated(locator), 10000);
        return await this.driver.findElement(locator);
    }

    async type(locator, text) {
        const element = await this.find(locator);
        await element.clear();
        await element.sendKeys(text);
    }

    async click(locator) {
        const element = await this.find(locator);
        await element.click();
    }

    async getText(locator) {
        const element = await this.find(locator);
        return await element.getText();
    }
}

module.exports = BasePage;