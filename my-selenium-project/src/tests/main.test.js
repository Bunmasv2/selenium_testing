const { buildDriver } = require('../../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ExcelHelper = require('../../utils/ExcelHelper');
const { expect } = require('chai');

describe('Automation Test - Chia sẻ Project', function () {
    this.timeout(60000);
    
    let driver, loginPage, excelHelper;
    // Biến này dùng để lưu dòng chữ lấy được từ Web
    let testActualResult = ""; 

    before(async function () {
        excelHelper = new ExcelHelper();
        await excelHelper.loadWorkbook();
        driver = await buildDriver();
        loginPage = new LoginPage(driver);
    });

    after(async function () {
        await excelHelper.saveWorkbook();
        if (driver) await driver.quit();
    });

    // Reset biến chứa kết quả trước mỗi test case
    beforeEach(function() {
        testActualResult = "Chưa thực hiện / Lỗi script";
    });

    afterEach(async function () {
        const testTitle = this.currentTest.title;
        const idMatch = testTitle.match(/\[(.*?)\]/);
        const testId = idMatch ? idMatch[1] : null;

        if (testId) {
            const status = this.currentTest.state === 'passed' ? 'PASS' : 'FAIL';
            
            // Nếu Test Fail do lỗi code (VD: không tìm thấy element), ta ghi lỗi code
            // Nếu Test chạy xong (dù sai logic), ta ghi dòng chữ lấy được từ màn hình (testActualResult)
            
            let finalNote = testActualResult;
            
            // Nếu có lỗi nghiêm trọng (crash), ghi đè bằng lỗi đó
            if (this.currentTest.err && !testActualResult.includes("Hiển thị:")) {
                 finalNote = "Script Error: " + this.currentTest.err.message;
            }

            await excelHelper.writeTestResult(testId, status, finalNote);
            console.log(`📝 [${testId}] Ghi vào Excel: "${finalNote}" -> ${status}`);
        }
    });

    // --- HÀM TEST LOGIC ---
    async function executeTest(testId) {
        // 1. Đọc data
        const data = excelHelper.getData(testId);
        
        if (!data.username && !data.password) {
            testActualResult = "Thiếu Test Data trong Excel (username/password)";
            throw new Error(testActualResult);
        }

        // 2. Thao tác Web
        await loginPage.open('https://www.saucedemo.com/');
        if (data.username) await loginPage.enterUsername(data.username);
        if (data.password) await loginPage.enterPassword(data.password);
        await loginPage.clickLogin();

        // 3. LẤY THÔNG BÁO THỰC TẾ (QUAN TRỌNG)
        // Đoạn này giúp bạn lấy text về DÙ PASS HAY FAIL
        try {
            const currentUrl = await driver.getCurrentUrl();
            if (currentUrl.includes('inventory.html')) {
                testActualResult = "Hiển thị: Đăng nhập thành công (Vào trang Inventory)";
            } else {
                const errorText = await loginPage.getErrorMessage();
                testActualResult = `Hiển thị lỗi: ${errorText}`;
            }
        } catch (e) {
            testActualResult = "Không lấy được thông báo lỗi trên màn hình";
        }

        // 4. So sánh (Assertion)
        const expected = data.expected || '';
        if (expected.includes('inventory.html')) {
            const url = await driver.getCurrentUrl();
            expect(url).to.include('inventory.html');
        } else {
            const errorMsg = await loginPage.getErrorMessage();
            const cleanExpected = expected.replace('Hiển thị lỗi:', '').trim();
            expect(errorMsg).to.include(cleanExpected);
        }
    }

    // ============ TEST CASES (ID phải khớp Sheet "Chia sẻ project") ============
    // Lưu ý: Nếu sheet Chia sẻ dự án dùng ID là S1, S2 thì bạn phải sửa tên test case lại thành [S1], [S2]

    it('[S1] Test Case 1', async function () { await executeTest('S1'); });
    it('[S2] Test Case 2', async function () { await executeTest('S2'); });
    it('[S3] Test Case 3', async function () { await executeTest('S3'); });
    it('[S4] Test Case 4', async function () { await executeTest('S4'); });
});