const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelHelper {
    constructor() {
        this.filePath = path.join(process.cwd(), 'test-reports', 'TemplateTest.xlsx');
        this.workbook = new ExcelJS.Workbook();
        this.sheetName = 'Chia sẻ project';
    }

    async loadWorkbook() {
        if (!fs.existsSync(this.filePath)) {
            throw new Error('❌ Không tìm thấy file Excel');
        }
        await this.workbook.xlsx.readFile(this.filePath);
    }
    getStepsByTestId(testId) {
        const sheet = this.workbook.getWorksheet(this.sheetName);
        let steps = [];

        console.log(`\n📘 Đọc STEP cho Test ID: ${testId}`);

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 1) return;

            const id = row.getCell(1).value;
            if (id && id.toString().trim() === testId) {
                const stepText = row.getCell(6).value?.toString();
                const data = row.getCell(8).value?.toString();

                if (stepText) {
                    console.log(`➡️ Row ${rowNumber} | Step: ${stepText} | Data: ${data || '(none)'}`);

                    steps.push({
                        step: stepText.toLowerCase(),
                        data: data || '',
                        rowNumber
                    });
                }
            }
        });

        return steps;
    }

    // 🔹 Expected Result (cột G)
    getExpected(testId) {
        const sheet = this.workbook.getWorksheet(this.sheetName);
        let expected = '';

        sheet.eachRow((row) => {
            if (row.getCell(1).value?.toString() === testId) {
                expected = row.getCell(7).value?.toString() || '';
            }
        });
        return expected;
    }

    // 🔹 Ghi K – Q – R
    async writeResult(testId, isPass, actualResult) {
        const sheet = this.workbook.getWorksheet(this.sheetName);

        console.log(`\n📝 Ghi kết quả vào Excel`);
        console.log(`🆔 Test ID: ${testId}`);
        console.log(`✅ PASS?: ${isPass}`);
        console.log(`📌 Actual Result: ${actualResult}`);

        sheet.eachRow((row) => {
            if (row.getCell(1).value?.toString() === testId) {
                row.getCell(11).value = isPass;      // K
                row.getCell(17).value = new Date();  // Q
                row.getCell(19).value = actualResult; // R
            }
        });
    }


    async saveWorkbook() {
        await this.workbook.xlsx.writeFile(this.filePath);
    }
}

module.exports = ExcelHelper;
