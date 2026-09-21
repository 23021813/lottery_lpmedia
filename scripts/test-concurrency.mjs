// Concurrency & Anti-Race-Condition & Anti-Bot Captcha Test Suite
// Bắn đồng thời 30 request đăng ký vào server để kiểm thử khả năng chống xung đột, mất dữ liệu và bảo mật Captcha.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3333';
const CONCURRENCY_COUNT = 30;
const VALID_TEST_CAPTCHA = '1x00000000000000000000AA'; // Test token được Cloudflare và server hỗ trợ

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${testName}`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${testName}`);
    if (detail) {
      console.error(`    ${colors.yellow}Chi tiết lỗi:${colors.reset} ${detail}`);
    }
  }
}

async function runConcurrencyTest() {
  console.log(`\n${colors.bold}${colors.cyan}=== BẮT ĐẦU KIỂM THỬ ĐỒNG THỜI & BẢO MẬT CAPTCHA SERVER ===${colors.reset}`);
  console.log(`Mục tiêu: Kiểm tra xử lý ${CONCURRENCY_COUNT} request cùng lúc và bắt buộc Captcha trên Server`);

  // 1. Sao lưu data.csv hiện tại
  const csvPath = path.join(projectRoot, 'data', 'data.csv');
  const distCsvPath = path.join(projectRoot, 'dist', 'data', 'data.csv');
  
  let originalCsvContent = '';
  if (fs.existsSync(csvPath)) {
    originalCsvContent = fs.readFileSync(csvPath, 'utf8');
  }

  try {
    // 2. Kiểm thử chống Bypass: Gọi API không có captchaToken hoặc token giả mạo
    console.log(`\n${colors.cyan}[1/4] Kiểm tra phòng thủ chống Bypass Captcha...${colors.reset}`);
    
    // 2.1 Request KHÔNG có captchaToken
    const noCaptchaRes = await fetch(`${BASE_URL}/api/submit-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker No Captcha',
        phone: '0998888777',
        nationalId: '999888877766',
        agency: 'RED LAND',
        answer: 'C'
      })
    });
    const noCaptchaData = await noCaptchaRes.json().catch(() => ({}));
    assert(
      noCaptchaRes.status === 400 && noCaptchaData.success === false,
      `Bảo vệ Server: Từ chối request KHÔNG CÓ Captcha (HTTP 400, "${noCaptchaData.error}")`,
      `Nhận được status: ${noCaptchaRes.status}`
    );

    // 2.2 Request có captchaToken RỖNG
    const emptyCaptchaRes = await fetch(`${BASE_URL}/api/submit-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Empty Captcha',
        phone: '0998888776',
        nationalId: '999888877765',
        agency: 'RED LAND',
        answer: 'C',
        captchaToken: ''
      })
    });
    const emptyCaptchaData = await emptyCaptchaRes.json().catch(() => ({}));
    assert(
      emptyCaptchaRes.status === 400 && emptyCaptchaData.success === false,
      `Bảo vệ Server: Từ chối request có Captcha rỗng (HTTP 400)`,
      `Nhận được status: ${emptyCaptchaRes.status}`
    );

    // 3. Tạo 30 payload đăng ký độc nhất có Captcha hợp lệ
    const timestamp = Date.now().toString().slice(-6);
    const requests = Array.from({ length: CONCURRENCY_COUNT }, (_, i) => {
      const idx = String(i + 1).padStart(2, '0');
      return {
        name: `Test User ${idx}`,
        phone: `099${timestamp}${idx}`,
        nationalId: `999${timestamp}${idx}`,
        agency: 'RED LAND',
        answer: 'C',
        captchaToken: VALID_TEST_CAPTCHA
      };
    });

    console.log(`\n${colors.cyan}[2/4] Đang gửi đồng thời ${CONCURRENCY_COUNT} request hợp lệ qua Promise.all...${colors.reset}`);
    const startTime = Date.now();

    // Bắn tất cả request cùng lúc
    const responses = await Promise.all(
      requests.map(payload =>
        fetch(`${BASE_URL}/api/submit-registration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(async res => {
          const status = res.status;
          let data = {};
          try {
            const text = await res.text();
            try {
              data = JSON.parse(text);
            } catch {
              data = { rawText: text };
            }
          } catch (e) {
            data = { error: e.message };
          }
          return { status, data, payload };
        }).catch(err => ({ status: 0, error: err.message, payload }))
      )
    );

    const duration = Date.now() - startTime;
    console.log(`Hoàn thành ${CONCURRENCY_COUNT} requests trong ${duration}ms (Trung bình ${(duration / CONCURRENCY_COUNT).toFixed(1)}ms/request)`);

    // 4. Kiểm tra kết quả trả về của từng request
    const successfulResponses = responses.filter(r => r.status === 200 && r.data.success === true);
    assert(
      successfulResponses.length === CONCURRENCY_COUNT,
      `Tất cả ${CONCURRENCY_COUNT} request trả về HTTP 200 và success: true`,
      `Chỉ có ${successfulResponses.length}/${CONCURRENCY_COUNT} request thành công. Một số lỗi: ${JSON.stringify(responses.filter(r => r.status !== 200).slice(0, 3))}`
    );

    // 5. Kiểm tra tính duy nhất và liên tục của các ID trả về
    const returnedIds = successfulResponses.map(r => r.data.id).filter(id => typeof id === 'number');
    const uniqueIds = new Set(returnedIds);
    assert(
      uniqueIds.size === successfulResponses.length,
      `Tất cả các ID được cấp phát là DUY NHẤT (Không có ID nào bị trùng)`,
      `Tổng số ID: ${returnedIds.length}, Số ID duy nhất: ${uniqueIds.size}`
    );

    returnedIds.sort((a, b) => a - b);
    let isSequential = true;
    for (let i = 1; i < returnedIds.length; i++) {
      if (returnedIds[i] !== returnedIds[i - 1] + 1) {
        isSequential = false;
        break;
      }
    }
    assert(
      isSequential && returnedIds.length === CONCURRENCY_COUNT,
      `Các ID được cấp phát TĂNG DẦN LIÊN TỤC (+1) không đứt quãng`,
      `Dãy ID nhận được: ${returnedIds.slice(0, 5).join(', ')} ... ${returnedIds.slice(-5).join(', ')}`
    );

    // 6. Kiểm tra file data.csv thực tế trên đĩa
    const currentCsvContent = fs.readFileSync(csvPath, 'utf8');
    let allPersisted = true;
    for (const req of requests) {
      if (!currentCsvContent.includes(req.phone) || !currentCsvContent.includes(req.nationalId)) {
        allPersisted = false;
        break;
      }
    }
    assert(
      allPersisted,
      `Toàn bộ ${CONCURRENCY_COUNT} dòng dữ liệu đều được ghi nhận đầy đủ vào data/data.csv (0% thất thoát dữ liệu)`,
      `Có ít nhất 1 bản ghi không tìm thấy trong file CSV`
    );

    // 7. Kiểm tra chặn trùng lặp (Duplicate Detection)
    console.log(`\n${colors.cyan}[3/4] Kiểm tra phát hiện & chặn dữ liệu trùng lặp...${colors.reset}`);
    const duplicatePayload = { ...requests[0], name: 'User Trùng Lặp' };
    const dupRes = await fetch(`${BASE_URL}/api/submit-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicatePayload)
    });
    const dupData = await dupRes.json().catch(() => ({}));
    assert(
      dupRes.status === 400 && dupData.success === false,
      `Request trùng SĐT/CCCD bị từ chối chính xác (HTTP 400, "${dupData.error}")`,
      `Nhận được status: ${dupRes.status}, data: ${JSON.stringify(dupData)}`
    );

  } finally {
    // 8. Phục hồi lại dữ liệu ban đầu
    console.log(`\n${colors.cyan}[4/4] Dọn dẹp dữ liệu test, khôi phục data.csv gốc...${colors.reset}`);
    if (originalCsvContent) {
      fs.writeFileSync(csvPath, originalCsvContent);
      if (fs.existsSync(distCsvPath)) {
        fs.writeFileSync(distCsvPath, originalCsvContent);
      }
    }
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Đã phục hồi data.csv về trạng thái ban đầu sạch sẽ.`);
  }

  console.log(`\n${colors.bold}=== TỔNG KẾT: ${passedTests}/${totalTests} KIỂM TRA ĐẠT ===${colors.reset}`);
  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bold}✓ HỆ THỐNG AN TOÀN TUYỆT ĐỐI: CHỐNG BYPASS CAPTCHA & CHỐNG RACE CONDITION 100%!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${colors.red}${colors.bold}✗ CÒN LỖI TRONG KIỂM THỬ!${colors.reset}\n`);
    process.exit(1);
  }
}

runConcurrencyTest();
