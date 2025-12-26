const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

class CSVReporter {
    constructor() {
        // Tạo tên file với timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
        const csvPath = path.join(__dirname, '../test-reports', `test-report-${timestamp}.csv`);
        
        this.csvWriter = createCsvWriter({
            path: csvPath,
            header: [
                { id: 'testCase', title: 'Test Case' },
                { id: 'description', title: 'Description' },
                { id: 'status', title: 'Status' },
                { id: 'duration', title: 'Duration (ms)' },
                { id: 'timestamp', title: 'Timestamp' },
                { id: 'errorMessage', title: 'Error Message' }
            ]
        });
        
        this.records = [];
        console.log(`\n📊 CSV Report sẽ được lưu tại: ${csvPath}\n`);
    }

    addTestResult(testCase, description, status, duration, errorMessage = '') {
        this.records.push({
            testCase,
            description,
            status,
            duration,
            timestamp: new Date().toISOString(),
            errorMessage
        });
    }

    async writeReport() {
        try {
            await this.csvWriter.writeRecords(this.records);
            console.log('\n✅ Đã xuất kết quả test ra file CSV thành công!\n');
        } catch (error) {
            console.error('❌ Lỗi khi ghi file CSV:', error);
        }
    }
}

module.exports = CSVReporter;
