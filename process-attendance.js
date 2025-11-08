// 文件名：scripts/process-attendance.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function processAttendance() {
  try {
    // 1. 检查输入文件是否存在
    const inputPath = path.join(__dirname, '../data/input.json');
    if (!fs.existsSync(inputPath)) {
      console.log('输入文件不存在，创建示例文件...');
      const exampleData = [
        { name: "学生A", time: new Date().toISOString(), status: "present" },
        { name: "学生B", time: new Date().toISOString(), status: "absent" }
      ];
      fs.writeFileSync(inputPath, JSON.stringify(exampleData, null, 2));
    }
    
    // 2. 读取输入数据
    const attendanceData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    // 3. 处理数据
    const processedData = {
      lastUpdated: new Date().toISOString(),
      attendance: attendanceData,
      total: attendanceData.length,
      present: attendanceData.filter(s => s.status === 'present').length,
      absent: attendanceData.filter(s => s.status === 'absent').length
    };
    
    // 4. 确保输出目录存在
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 5. 写入输出文件
    const outputPath = path.join(__dirname, '../data/output.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
    
    // 6. 提交更改回仓库
    execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
    execSync('git config --global user.name "github-actions[bot]"');
    execSync('git add data/');
    execSync('git commit -m "Auto-update attendance data"');
    execSync('git push');
    
    console.log('Attendance data updated successfully!');
    console.log(`Processed ${processedData.total} records`);
    
  } catch (error) {
    console.error('Error processing attendance:', error);
    process.exit(1);
  }
}

processAttendance();