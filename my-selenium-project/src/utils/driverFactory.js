const { Builder } = require('selenium-webdriver');
require('chromedriver'); // Tự động load path của chromedriver

async function buildDriver() {
    const driver = await new Builder().forBrowser('chrome').build();
    // Có thể thêm cấu hình maximize window ở đây
    await driver.manage().window().maximize();
    return driver;
}

module.exports = { buildDriver };