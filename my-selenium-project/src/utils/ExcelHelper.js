const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelHelper {
    constructor() {
        // Đảm bảo đường dẫn file đúng với máy của bạn
        this.filePath = path.join(process.cwd(), 'test-reports', 'TemplateTest.xlsx');
        this.workbook = new ExcelJS.Workbook();
        this.sheetName = 'Thêm dự án'; 
    }

    async loadWorkbook() {
        if (!fs.existsSync(this.filePath)) {
            throw new Error(`Không tìm thấy file Excel tại: ${this.filePath}`);
        }
        await this.workbook.xlsx.readFile(this.filePath);
    }

    // ⭐ HÀM QUAN TRỌNG NHẤT: Bóc tách text từ mọi loại ô Excel
    getCellValue(cell) {
        const val = cell.value;
        if (!val) return '';

        // 1. Xử lý ô Hyperlink (Nguyên nhân chính gây lỗi P1 của bạn)
        // Khi Excel có link, nó trả về object { text: '...', hyperlink: '...' }
        if (typeof val === 'object' && val.text) {
            return val.text.toString().trim();
        }
        
        // 2. Xử lý ô Rich Text (nhiều màu sắc/font)
        if (typeof val === 'object' && val.richText) {
            return val.richText.map(t => t.text).join('').trim();
        }
        
        // 3. Xử lý ô Công thức
        if (typeof val === 'object' && val.result) {
            return val.result.toString().trim();
        }
        
        // 4. Các trường hợp còn lại (String, Number)
        return val.toString().trim();
    }

    getStepsByTestId(testId) {
        const sheet = this.workbook.getWorksheet(this.sheetName);
        if (!sheet) throw new Error(`Không tìm thấy sheet tên: ${this.sheetName}`);
        
        const steps = [];

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 1) return; 

            const id = this.getCellValue(row.getCell('A'));

            if (id === testId) {
                // Dùng hàm getCellValue cho tất cả các ô để đảm bảo không bị lỗi object
                const stepText = this.getCellValue(row.getCell('F')); 
                const data = this.getCellValue(row.getCell('H'));     
                
                // 🔥 QUAN TRỌNG: Lấy Expected Output chuẩn xác
                const expectedVal = this.getCellValue(row.getCell('G')); 

                if (stepText) {
                    steps.push({
                        rowNumber,
                        step: stepText.toLowerCase(),
                        data: data,
                        expected: expectedVal // Giá trị này giờ sẽ là string chuẩn, không bị rỗng nữa
                    });
                }
            }
        });

        return steps;
    }

    // Các hàm ghi file giữ nguyên logic nhưng dùng getCellValue để check ID cho an toàn
    writeResult(testId, isPass, actualResult) {
        const sheet = this.workbook.getWorksheet(this.sheetName);
        sheet.eachRow(row => {
            const id = this.getCellValue(row.getCell('A'));
            if (id === testId) {
                row.getCell('K').value = isPass;        
                row.getCell('Q').value = new Date();    
                row.getCell('S').value = actualResult;  
            }
        });
    }

    async saveWorkbook() {
        await this.workbook.xlsx.writeFile(this.filePath);
    }
}

module.exports = ExcelHelper;