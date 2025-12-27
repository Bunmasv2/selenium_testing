const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Locators: Định vị các phần tử trên trang
        this.usernameInput = By.id('user-name');
        this.passwordInput = By.id('password');
        this.loginButton = By.id('login-button');
        this.errorMessage = By.css('h3[data-test="error"]');
    }

    async login(username, password) {
        await this.type(this.usernameInput, username);
        await this.type(this.passwordInput, password);
        await this.click(this.loginButton);
    }

    async getErrorMessage() {
        console.log('\n📘 Lấy thông báo lỗi đăng nhập nếu có',await this.getText(this.errorMessage) );

        return await this.getText(this.errorMessage);
    }
}

module.exports = LoginPage;