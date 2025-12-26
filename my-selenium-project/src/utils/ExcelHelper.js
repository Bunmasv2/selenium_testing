const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelHelper {
    constructor() {
        this.filePath = path.join(process.cwd(), 'test-reports', 'TemplateTest.xlsx');
        this.workbook = new ExcelJS.Workbook();
        this.sheetName = 'Thêm dự án'; // ⚠️ đúng tên sheet của bạn
    }

    async loadWorkbook() {
        if (!fs.existsSync(this.filePath)) {
            throw new Error('Không tìm thấy file Excel');
        }
        await this.workbook.xlsx.readFile(this.filePath);
    }

    // 🔹 Lấy step theo Test ID (P1, P2…)
    getStepsByTestId(testId) {
        const sheet = this.workbook.getWorksheet(this.sheetName);
        const steps = [];

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 1) return;

            const id = row.getCell('A').value;
            if (id && id.toString().trim() === testId) {
                const stepText = row.getCell('F').value;
                const data = row.getCell('H').value;

                if (stepText) {
                    steps.push({
                        rowNumber,
                        step: stepText.toString().toLowerCase(),
                        data: data ? data.toString() : ''
                    });
                }
            }
        });

        return steps;
    }

    getExpected(testId) {
        const sheet = this.workbook.getWorksheet(this.sheetName);
        let expected = '';

        sheet.eachRow(row => {
            if (row.getCell('A').value?.toString() === testId) {
                expected = row.getCell('G').value?.toString() || '';
            }
        });

        return expected;
    }

    writeResult(testId, isPass, actualResult) {
        const sheet = this.workbook.getWorksheet(this.sheetName);

        sheet.eachRow(row => {
            if (row.getCell('A').value?.toString() === testId) {
                row.getCell('K').value = isPass;        // TRUE / FALSE
                row.getCell('Q').value = new Date();    // Date
                row.getCell('R').value = actualResult;  // Actual
            }
        });
    }

    async saveWorkbook() {
        await this.workbook.xlsx.writeFile(this.filePath);
    }
}

module.exports = ExcelHelper;
