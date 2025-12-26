const { until } = require('selenium-webdriver');

class BasePage {
    constructor(driver) {
        this.driver = driver;
        this.delayMs = 800; // Delay 800ms giữa các thao tác để dễ quan sát
    }

    // Hàm sleep để delay
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms || this.delayMs));
    }

    async open(url) {
        await this.driver.get(url);
        await this.sleep();
    }

    async find(locator) {
        // Chờ element xuất hiện tối đa 10s trước khi lấy
        await this.driver.wait(until.elementLocated(locator), 10000);
        return await this.driver.findElement(locator);
    }

    async type(locator, text) {
        const element = await this.find(locator);
        await this.sleep();
        await element.sendKeys(text);
    }

    async click(locator) {
        const element = await this.find(locator);
        await this.sleep();
        await element.click();
    }

    async getText(locator) {
        const element = await this.find(locator);
        return await element.getText();
    }
}

module.exports = BasePage;