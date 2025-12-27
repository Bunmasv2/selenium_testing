const { buildDriver } = require('../utils/driverFactory');
const ExcelHelper = require('../utils/ExcelHelper');
const LoginPage = require('../pages/LoginPage');
const { expect } = require('chai');

// 1. Khai báo danh sách các Test Case ID bạn muốn chạy
const testCaseIds = ['P1', 'P2'];

describe('Excel Keyword Driven Test', function () {
    // Tăng timeout tổng cho mỗi test case lên 60s để tránh bị ngắt
    this.timeout(60000);

    let driver, loginPage, excel;

    before(async () => {
        // Khởi tạo và load file Excel
        excel = new ExcelHelper();
        await excel.loadWorkbook();

        // Khởi tạo Driver và Page Object
        driver = await buildDriver();
        loginPage = new LoginPage(driver);
    });

    after(async () => {
        // Tắt driver sau khi chạy xong tất cả các test case
        if (driver) {
            await driver.quit();
        }
    });

    // 2. Vòng lặp chạy từng Test Case
    testCaseIds.forEach(testId => {

        it(`Run TestCase ${testId} from Excel`, async () => {

            // Lấy danh sách steps và dữ liệu từ ExcelHelper
            // (Đảm bảo bạn đã dùng file ExcelHelper mới nhất để fix lỗi Hyperlink)
            const steps = excel.getStepsByTestId(testId);

            let username = '';
            let password = '';
            let actual = '';
            let isPass = false;
            let errorOccurred = null; // Biến cờ để đánh dấu nếu có lỗi sập test (crash)

            console.log(`\n🔹 STARTING TEST CASE: ${testId}`);

            // 🔴 BẮT ĐẦU TRY...CATCH
            // Mục đích: Bắt mọi lỗi (như Timeout, Element not found) để chương trình không dừng đột ngột
            // giúp code luôn chạy xuống đoạn lưu file Excel bên dưới
            try {
                for (const s of steps) {
                    const step = String(s.step).toLowerCase();
                    const currentExpected = s.expected; // Lấy expected output của dòng hiện tại

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

                        console.log(`   🔎 Checking Logic with Expected: '${currentExpected}'`);

                        // 🧠 LOGIC THÔNG MINH:
                        // Nếu cột Expected chứa 'inventory' hoặc 'thành công' => Đây là Happy Case (P1)
                        // Ngược lại => Đây là Negative Case (P2) - cần check lỗi
                        const isSuccessCase = currentExpected && (
                            currentExpected.includes('inventory') ||
                            currentExpected.toLowerCase().includes('thành công')
                        );

                        if (isSuccessCase) {
                            // Kiểm tra xem URL có chuyển sang trang inventory không
                            const currentUrl = await driver.getCurrentUrl();
                            isPass = currentUrl.includes('inventory.html');
                        }
                        else {
                            console.log('   👉 Logic: Check Error Message (Fail Case)');
                            // Kiểm tra xem URL có chuyển sang trang inventory không
                            const currentUrl = await driver.getCurrentUrl();
                            isPass = currentUrl.includes('inventory.html');
                        }
                    }
                }
            } catch (err) {
                // ⚠️ Xử lý khi gặp lỗi nghiêm trọng (ví dụ: Timeout do không tìm thấy element)
                console.error(`❌ LỖI NGHIÊM TRỌNG TRONG TEST ${testId}:`, err.message);
                isPass = false;
                actual = `CRASH/TIMEOUT: ${err.message}`; // Ghi lý do lỗi vào Excel
                errorOccurred = err;
            }

            // 🟢 ĐOẠN NÀY LUÔN CHẠY DÙ PASS HAY FAIL (nhờ try-catch phía trên)
            console.log(`💾 Saving result for ${testId}...`);
            excel.writeResult(testId, isPass, actual);
            await excel.saveWorkbook(); // Lưu file ngay lập tức

            // Nếu nãy có lỗi thì giờ mới throw ra để Mocha báo đỏ trong Terminal
            if (errorOccurred) throw errorOccurred;

            // Assertion cuối cùng để chốt trạng thái Pass/Fail với Mocha
            expect(isPass, `Test Case ${testId} Failed. Actual output: ${actual}`).to.equal(true);
        });
    });
});