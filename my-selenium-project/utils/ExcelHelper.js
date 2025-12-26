const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelHelper {
    constructor() {
        this.fileName = 'TemplateTest.xlsx';
        this.filePath = path.join(process.cwd(), 'test-reports', this.fileName);
        this.workbook = new ExcelJS.Workbook();
        
        // --- CẤU HÌNH TÊN SHEET ---
        this.sheetName = 'Chia sẻ project'; 
    }

    async loadWorkbook() {
        if (fs.existsSync(this.filePath)) {
            try {
                await this.workbook.xlsx.readFile(this.filePath);
                console.log(`✅ Đã load file Excel: ${this.filePath}`);
            } catch (error) {
                // Kiểm tra lỗi nếu file có password
                if (error.message.includes('password') || error.message.includes('encrypted')) {
                    throw new Error("❌ LỖI: File Excel đang có mật khẩu! Thư viện ExcelJS không đọc được file có mật khẩu. Vui lòng mở Excel và xóa mật khẩu (File > Info > Protect Workbook > Encrypt with Password > Xóa trống).");
                }
                if (error.code === 'EBUSY') {
                    throw new Error("❌ File Excel đang mở! Vui lòng đóng lại.");
                }
                throw error;
            }
        } else {
            throw new Error(`❌ Không tìm thấy file Excel tại: ${this.filePath}`);
        }
    }

    // --- ĐỌC DỮ LIỆU ---
    getData(testId) {
        let data = {};
        const sheet = this.workbook.getWorksheet(this.sheetName);

        if (!sheet) {
            console.error(`❌ LỖI: Không tìm thấy sheet tên "${this.sheetName}"`);
            return data;
        }

        let foundRow = null;
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 1) return;
            const idCell = row.getCell(1).value; 
            if (idCell && idCell.toString().trim() === testId) {
                foundRow = row;
            }
        });

        if (foundRow) {
            // --- CỘT 6 (F): Expected Output (Key nằm ở đây?) ---
            // Nếu bạn nói "Key nằm ở cột 6", thì có thể bạn muốn lấy giá trị cột 6 làm key?
            // Nhưng theo logic code cũ, cột 6 là 'expected' result.
            // Tôi giữ nguyên logic cũ: Cột 6 là Expected.
            data.expected = foundRow.getCell(6).value ? foundRow.getCell(6).value.toString() : '';

            // --- CỘT 8 (H): Test Data (Value nằm ở đây) ---
            // Dữ liệu dạng: "username: admin"
            const rawData = foundRow.getCell(8).value ? foundRow.getCell(8).value.toString() : '';
            
            // Debug xem đọc được gì từ cột 8
            // console.log(`[DEBUG ${testId}] Raw Col 8:`, rawData);

            if (rawData) {
                const lines = rawData.split(/\r?\n/);
                lines.forEach(line => {
                    if (line.includes(':')) {
                        const parts = line.split(':');
                        const key = parts[0].trim().toLowerCase(); // Key (vd: username)
                        const value = parts.slice(1).join(':').trim(); // Value (vd: admin)
                        data[key] = value;
                    }
                });
            }
        }
        return data;
    }

    // --- GHI KẾT QUẢ ---
    async writeTestResult(testId, status, actualResult) {
        const sheet = this.workbook.getWorksheet(this.sheetName);
        if (!sheet) return;

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 1) return;
            const idCell = row.getCell(1).value;
            if (idCell && idCell.toString().trim() === testId) {
                
                // Ghi Status (Cột K - 11)
                const statusCell = row.getCell(11);
                statusCell.value = status;
                statusCell.font = { bold: true, color: { argb: status === 'PASS' ? 'FF008000' : 'FFFF0000' } };

                // Ghi Date (Cột Q - 17)
                row.getCell(17).value = new Date();

                // Ghi Note/Actual Result vào Cột S (19)
                // Lưu ý: Cột 19 tương ứng với cột S trong Excel
                const noteCell = row.getCell(19); 
                noteCell.value = actualResult; 
                noteCell.alignment = { wrapText: true };
            }
        });
    }

    async saveWorkbook() {
        try {
            await this.workbook.xlsx.writeFile(this.filePath);
            console.log("💾 Đã lưu kết quả vào file Excel.");
        } catch (error) {
            console.error("❌ Lỗi lưu file:", error.message);
        }
    }
}

module.exports = ExcelHelper;