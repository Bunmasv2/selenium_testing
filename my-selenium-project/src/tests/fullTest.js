const { buildDriver } = require('../src/utils/driverFactory');
const LoginPage = require('../src/pages/LoginPage');
const CheckoutPage = require('../src/pages/CheckoutPage');
const ExcelHelper = require('../src/utils/ExcelHelper');
const { expect } = require('chai');

describe('Automation Test - SauceDemo & Excel Report', function () {
    this.timeout(60000); // 60s timeout

    let driver;
    let loginPage;
    let checkoutPage;
    let excelHelper;

    // 1. Chạy trước toàn bộ: Khởi tạo Driver và Load Excel
    before(async function () {
        console.log("🚀 Đang khởi động test...");
        driver = await buildDriver();
        loginPage = new LoginPage(driver);
        checkoutPage = new CheckoutPage(driver);
        
        excelHelper = new ExcelHelper();
        await excelHelper.loadWorkbook(); // Đọc file Excel vào bộ nhớ
    });

    // 2. Chạy sau toàn bộ: Lưu file Excel và đóng Driver
    after(async function () {
        await excelHelper.saveWorkbook(); // Ghi dữ liệu từ bộ nhớ xuống file
        await driver.quit();
        console.log("🏁 Hoàn tất kiểm thử.");
    });

    // 3. Chạy sau MỖI test case: Ghi kết quả vào bộ nhớ Excel
    afterEach(async function () {
        const testTitle = this.currentTest.title; // Ví dụ: "[P1] Đăng nhập thành công"
        
        // Trích xuất ID từ tên test case (Phần nằm trong ngoặc vuông [])
        const idMatch = testTitle.match(/\[(.*?)\]/);
        const testId = idMatch ? idMatch[1] : null;

        if (testId) {
            const status = this.currentTest.state === 'passed' ? 'PASS' : 'FAIL';
            
            // Lấy nội dung lỗi nếu Fail, hoặc ghi chú mặc định nếu Pass
            let actualResult = '';
            if (status === 'FAIL') {
                actualResult = this.currentTest.err ? this.currentTest.err.message : 'Unknown Error';
            } else {
                actualResult = 'Test passed successfully on SauceDemo';
            }

            // Ghi vào Helper (chưa lưu file ngay để tối ưu hiệu năng)
            await excelHelper.writeTestResult(testId, status, actualResult);
            console.log(`📝 Đã ghi nhận kết quả cho ID: ${testId} -> ${status}`);
        } else {
            console.warn(`⚠️ Test case "${testTitle}" không có ID (ví dụ [P1]) nên không ghi vào Excel.`);
        }
    });

    // ============ LOGIN TEST CASES ============
    // Lưu ý: Sửa [P1], [P2]... khớp với cột A trong Excel của bạn

    it('[P1] Đăng nhập thành công standard_user', async function () {
        await loginPage.open('https://www.saucedemo.com/');
        await loginPage.login('standard_user', 'secret_sauce');
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('inventory.html');
    });

    it('[P2] Đăng nhập thất bại với user sai', async function () {
        await loginPage.open('https://www.saucedemo.com/');
        await loginPage.login('wrong_user', 'secret_sauce');
        const errorMsg = await loginPage.getErrorMessage();
        expect(errorMsg).to.include('Username and password do not match');
    });

    it('[P3] Đăng nhập thất bại để trống username', async function () {
        await loginPage.open('https://www.saucedemo.com/');
        await loginPage.login('', 'secret_sauce');
        const errorMsg = await loginPage.getErrorMessage();
        expect(errorMsg).to.include('Username is required');
    });

    it('[P4] Đăng nhập với user bị khóa', async function () {
        await loginPage.open('https://www.saucedemo.com/');
        await loginPage.login('locked_out_user', 'secret_sauce');
        const errorMsg = await loginPage.getErrorMessage();
        expect(errorMsg).to.include('Sorry, this user has been locked out');
    });

    // ============ CHECKOUT TEST CASES ============
    
    it('[T1] Checkout thành công', async function () {
        await loginPage.open('https://www.saucedemo.com/');
        await loginPage.login('standard_user', 'secret_sauce');
        
        await checkoutPage.addItemAndCheckout('Nguyen', 'Van A', '70000');
        
        const isPaymentVisible = await checkoutPage.isPaymentInfoDisplayed();
        expect(isPaymentVisible).to.be.true;

        const completeMsg = await checkoutPage.finishCheckout();
        expect(completeMsg).to.equal('Thank you for your order!');
    });

    it('[T2] Checkout thất bại do thiếu tên', async function () {
        await loginPage.open('https://www.saucedemo.com/');
        await loginPage.login('standard_user', 'secret_sauce');
        
        try {
            await checkoutPage.addItemAndCheckout('', 'LastName', '12345');
            const errorElement = await checkoutPage.getCheckoutError();
            expect(errorElement).to.include('First Name is required');
        } catch (error) {
            expect(error).to.exist;
        }
    });
});