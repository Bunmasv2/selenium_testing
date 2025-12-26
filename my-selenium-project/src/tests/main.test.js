const { buildDriver } = require('../utils/driverFactory');
const ExcelHelper = require('../utils/ExcelHelper');
const LoginPage = require('../pages/LoginPage');
const { expect } = require('chai');

// 1. Khai báo danh sách các Test Case ID bạn muốn chạy
const testCaseIds = ['P1', 'P2'];

describe('Excel Keyword Driven Test', function () {
    this.timeout(60000);

    let driver, loginPage, excel;

    before(async () => {
        excel = new ExcelHelper();
        await excel.loadWorkbook();

        driver = await buildDriver();
        loginPage = new LoginPage(driver);
    });

    after(async () => {
        await excel.saveWorkbook();
        await driver.quit();
    });

    // 2. Dùng vòng lặp forEach để tạo ra từng `it` block cho mỗi Test Case
    testCaseIds.forEach(testId => {

        it(`Run TestCase ${testId} from Excel`, async () => {

            // Lấy steps dựa trên testId hiện tại trong vòng lặp
            const steps = excel.getStepsByTestId(testId);

            let username = '';
            let password = '';
            const expected = excel.getExpected(testId);
            let actual = '';
            let isPass = false;

            console.log(`\n🔹 STARTING TEST CASE: ${testId}`);

            for (const s of steps) {
                const step = String(s.step).toLowerCase();
                console.log(`➡️ STEP: ${step} | DATA: ${s.data}`);

                if (step.includes('mở trang')) {
                    await driver.get(s.data);
                }
                else if (step.includes('nhập username')) {
                    username = s.data;
                }
                else if (step.includes('nhập password')) {
                    password = s.data;
                }
                else if (step.includes('click login')) {
                    await loginPage.login(username, password);
                }
                else if (step.includes('chuyển đến trang')) {
                    if (expected.trim() === 'Đăng nhập thành công') {
                        actual = await driver.getCurrentUrl();
                        isPass = actual.trim() === 'https://www.saucedemo.com/inventory.html';
                    }
                    else {
                        actual = await loginPage.getErrorMessage();
                        isPass = actual.trim() === expected.trim();
                    }
                }
            }

            // Ghi kết quả vào Excel cho đúng ID đang chạy
            excel.writeResult(testId, isPass, actual);

            expect(isPass).to.equal(true);
        });
    });
});