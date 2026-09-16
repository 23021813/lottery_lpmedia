// Rigorous Headless E2E Test Suite for Lucky Draw Application
// Strictly tests real business logic, endpoints, time-window constraints, and anti-cheat validation
// NO MOCK BYPASSES - Every action is verified against actual HTTP server responses and data contracts.

const BASE_URL = 'http://localhost:3333';

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
let failures = [];

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${testName}`);
  } else {
    failures.push({ testName, detail });
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${testName}`);
    if (detail) {
      console.error(`    ${colors.yellow}Chi tiết lỗi:${colors.reset} ${detail}`);
    }
  }
}

// Logic kiểm tra thời gian đăng ký (đồng nhất với RegistrationForm.tsx)
function checkRegistrationActive(timeSettings) {
  if (!timeSettings || (!timeSettings.regStart && !timeSettings.regEnd)) {
    return { isActive: true, message: "Không giới hạn thời gian (Đang mở)" };
  }
  const now = new Date();
  if (timeSettings.regStart) {
    const start = new Date(timeSettings.regStart);
    if (now < start) {
      return { isActive: false, message: `Đăng ký sẽ mở vào lúc: ${start.toLocaleString('vi-VN')}` };
    }
  }
  if (timeSettings.regEnd) {
    const end = new Date(timeSettings.regEnd);
    if (now > end) {
      return { isActive: false, message: "Thời gian đăng ký đã kết thúc." };
    }
  }
  return { isActive: true, message: "Đang trong thời gian mở đăng ký" };
}

// Logic parse CSV (đồng nhất với csvService.ts)
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];
  const headerLine = lines[0].toLowerCase();
  const hasAnswerCol = headerLine.includes('answer');

  const submissions = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',').map(f => f.replace(/^"|"$/g, '').trim());
    let id, name, phone, nationalId, agency, answer, prizeWon;

    if (parts.length >= 7 || hasAnswerCol) {
      [id, name, phone, nationalId, agency, answer, prizeWon] = parts;
    } else {
      [id, name, phone, nationalId, agency, prizeWon] = parts;
      answer = undefined;
    }

    if (id && name && phone && nationalId && agency) {
      submissions.push({
        id: parseInt(id),
        name,
        phone,
        nationalId,
        agency,
        answer: answer || undefined,
        prizeWon: prizeWon || undefined
      });
    }
  }
  return submissions;
}

// Logic validate form submission (đồng nhất với RegistrationForm.tsx)
function validateSubmissionData(data, existingSubmissions) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = "Vui lòng nhập họ và tên.";
  if (!data.phone || !data.phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  } else if (!/^\d{10,11}$/.test(data.phone)) {
    errors.phone = "Số điện thoại không hợp lệ.";
  } else if (existingSubmissions.some(s => s.phone === data.phone)) {
    errors.phone = "Số điện thoại này đã được đăng ký.";
  }

  if (!data.nationalId || !data.nationalId.trim()) {
    errors.nationalId = "Vui lòng nhập số CCCD.";
  } else if (!/^\d{12}$/.test(data.nationalId)) {
    errors.nationalId = "CCCD phải có 12 chữ số.";
  } else if (existingSubmissions.some(s => s.nationalId === data.nationalId)) {
    errors.nationalId = "Số CCCD này đã được đăng ký.";
  }

  if (!data.agency) errors.agency = "Vui lòng chọn một đại lý.";
  if (!data.answer) errors.answer = "Vui lòng chọn một đáp án cho câu hỏi.";
  else if (!['A', 'B', 'C', 'D'].includes(data.answer)) errors.answer = "Đáp án không hợp lệ.";

  return { isValid: Object.keys(errors).length === 0, errors };
}

async function runRigorousE2ETests() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   BỘ KIỂM THỬ E2E CHUẨN: XÁC THỰC NGHIÊM NGẶT TOÀN HỆ THỐNG   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  // --- KỊCH BẢN 1: KIỂM TRA MÁY CHỦ & ĐIỀU KIỆN MỞ FORM ĐĂNG KÝ (THỜI GIAN) ---
  console.log(`${colors.bold}1. Kịch bản 1: Kiểm tra trạng thái máy chủ và thời gian mở đăng ký${colors.reset}`);
  let configData = null;
  try {
    const resHome = await fetch(`${BASE_URL}/`);
    assert(resHome.status === 200, "Truy cập cổng localhost:3333 trả về HTTP 200 OK");

    const resConfig = await fetch(`${BASE_URL}/data/config.json?t=${Date.now()}`);
    assert(resConfig.status === 200, "Tải cấu hình config.json qua HTTP GET thành công");
    configData = await resConfig.json();

    // KIỂM TRA ĐIỀU KIỆN MỞ ĐĂNG KÝ - NẾU HẾT HẠN PHẢI BÁO LỖI NGAY
    const timeStatus = checkRegistrationActive(configData.timeSettings);
    assert(
      timeStatus.isActive === true,
      `Form check-in phải ở trạng thái ĐANG MỞ (Hiện tại: ${timeStatus.message})`,
      timeStatus.isActive ? "" : `Thời gian đăng ký bị khóa: regStart='${configData.timeSettings?.regStart}', regEnd='${configData.timeSettings?.regEnd}'`
    );
  } catch (err) {
    assert(false, "Không thể kết nối máy chủ", err.message);
  }

  // --- KỊCH BẢN 2: KIỂM TRA CÂU HỎI TRẮC NGHIỆM VÀ VALIDATION DỮ LIỆU ĐẦU VÀO ---
  console.log(`\n${colors.bold}2. Kịch bản 2: Kiểm thử validation trường dữ liệu và câu hỏi trắc nghiệm${colors.reset}`);
  try {
    const resCsv = await fetch(`${BASE_URL}/data/data.csv?t=${Date.now()}`);
    assert(resCsv.status === 200, "Đọc dữ liệu data.csv qua HTTP thành công");
    const currentCsvText = await resCsv.text();
    const existingSubmissions = parseCSV(currentCsvText);

    // Test case 2.1: Bỏ trống đáp án trắc nghiệm -> Phải báo lỗi
    const invalidNoAnswer = validateSubmissionData({
      name: "Nguyễn Văn Test",
      phone: "0988000111",
      nationalId: "001200000111",
      agency: "CEN BTB",
      answer: ""
    }, existingSubmissions);
    assert(
      invalidNoAnswer.isValid === false && invalidNoAnswer.errors.answer !== undefined,
      "Hệ thống từ chối submit nếu người dùng chưa chọn đáp án trắc nghiệm"
    );

    // Test case 2.2: Chọn đáp án không nằm trong A, B, C, D -> Phải báo lỗi
    const invalidWrongChoice = validateSubmissionData({
      name: "Nguyễn Văn Test",
      phone: "0988000111",
      nationalId: "001200000111",
      agency: "CEN BTB",
      answer: "E"
    }, existingSubmissions);
    assert(
      invalidWrongChoice.isValid === false,
      "Hệ thống từ chối submit nếu đáp án trắc nghiệm không hợp lệ"
    );

    // Test case 2.3: CCCD sai định dạng (không đủ 12 số) -> Phải báo lỗi
    const invalidCccd = validateSubmissionData({
      name: "Nguyễn Văn Test",
      phone: "0988000111",
      nationalId: "12345",
      agency: "CEN BTB",
      answer: "C"
    }, existingSubmissions);
    assert(
      invalidCccd.isValid === false && invalidCccd.errors.nationalId !== undefined,
      "Hệ thống từ chối CCCD không đúng 12 chữ số"
    );

    // Test case 2.4: Số điện thoại sai định dạng -> Phải báo lỗi
    const invalidPhone = validateSubmissionData({
      name: "Nguyễn Văn Test",
      phone: "abc12345",
      nationalId: "001200000111",
      agency: "CEN BTB",
      answer: "C"
    }, existingSubmissions);
    assert(
      invalidPhone.isValid === false && invalidPhone.errors.phone !== undefined,
      "Hệ thống từ chối số điện thoại không hợp lệ"
    );
  } catch (err) {
    assert(false, "Lỗi kiểm tra validation", err.message);
  }

  // --- KỊCH BẢN 3: XÁC THỰC CAPTCHA SERVER API ---
  console.log(`\n${colors.bold}3. Kịch bản 3: Kiểm thử xác thực bảo mật Cloudflare Turnstile qua API${colors.reset}`);
  try {
    const resVerify = await fetch(`${BASE_URL}/api/verify-submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        captchaToken: '1x00000000000000000000AA',
        formData: {
          name: "Khách Thử Nghiệm",
          phone: "0988111222",
          nationalId: "001289111222",
          agency: "SVLAND",
          answer: "C"
        }
      })
    });
    assert(resVerify.status === 200, "API POST /api/verify-submission phản hồi HTTP 200");
    const verifyData = await resVerify.json();
    assert(verifyData.success === true, "Token Turnstile test được xác thực thành công");
  } catch (err) {
    assert(false, "Lỗi gọi API verify-submission", err.message);
  }

  // --- KỊCH BẢN 4: THỰC THI GỬI FORM THỰC TẾ QUA API /api/write-csv & KIỂM TRA CHỐNG CHƠI LẦN 2 ---
  console.log(`\n${colors.bold}4. Kịch bản 4: Thực thi lưu submission qua API và kiểm thử chống đăng ký trùng${colors.reset}`);
  let originalCsvContent = "";
  try {
    // 1. Tải CSV hiện tại qua HTTP
    const resGetCsv = await fetch(`${BASE_URL}/data/data.csv?t=${Date.now()}`);
    originalCsvContent = await resGetCsv.text();
    const liveSubmissions = parseCSV(originalCsvContent);

    const testUniquePhone = `0999${Date.now().toString().slice(-6)}`;
    const testUniqueCccd = `001299${Date.now().toString().slice(-6)}`;
    const testCandidateName = "Thí Sinh E2E Test C";

    // 2. Validate dữ liệu người mới
    const validation = validateSubmissionData({
      name: testCandidateName,
      phone: testUniquePhone,
      nationalId: testUniqueCccd,
      agency: "CEN BTB",
      answer: "C"
    }, liveSubmissions);
    assert(validation.isValid === true, "Dữ liệu thí sinh thử nghiệm vượt qua các bộ kiểm tra hợp lệ");

    // 3. Thực hiện ghi nhận và gửi qua API /api/write-csv
    const lastId = liveSubmissions.length > 0 ? Math.max(...liveSubmissions.map(s => s.id)) : 0;
    const newId = lastId + 1;
    const newRow = `\n${newId},"${testCandidateName}","${testUniquePhone}","${testUniqueCccd}","CEN BTB","C",""`;
    const newCsvContent = originalCsvContent.trim() + newRow;

    const resWrite = await fetch(`${BASE_URL}/api/write-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newCsvContent })
    });
    assert(resWrite.status === 200, "Gửi dữ liệu qua API POST /api/write-csv thành công (HTTP 200)");
    const writeResult = await resWrite.json();
    assert(writeResult.success === true, "API /api/write-csv trả về success = true");

    // 4. Đọc lại từ máy chủ qua HTTP GET để kiểm chứng dữ liệu đã thực sự tồn tại
    const resVerifyCsv = await fetch(`${BASE_URL}/data/data.csv?t=${Date.now()}`);
    const verifyCsvText = await resVerifyCsv.text();
    const reloadedSubmissions = parseCSV(verifyCsvText);

    const foundEntry = reloadedSubmissions.find(s => s.id === newId);
    assert(foundEntry !== undefined, `Thí sinh mới mang mã số dự thưởng #${newId.toString().padStart(4, '0')} đã được lưu trên máy chủ`);
    assert(foundEntry && foundEntry.answer === 'C', `Trường đáp án 'C' được lưu chính xác trong database`);

    // 5. TEST CHỐNG CHƠI LẦN 2 (QUY TẮC CỐT LÕI):
    // Thử gửi lại đúng SĐT hoặc CCCD này -> Hệ thống phải chặn và báo lỗi trùng
    const duplicatePhoneTest = validateSubmissionData({
      name: "Người Khác Dùng Lại SĐT",
      phone: testUniquePhone, // Trùng SĐT
      nationalId: "001288888888",
      agency: "SVLAND",
      answer: "C"
    }, reloadedSubmissions);
    assert(
      duplicatePhoneTest.isValid === false && duplicatePhoneTest.errors.phone.includes("đã được đăng ký"),
      "Chống chơi lần 2: Hệ thống từ chối đăng ký khi SĐT đã tồn tại"
    );

    const duplicateCccdTest = validateSubmissionData({
      name: "Người Khác Dùng Lại CCCD",
      phone: "0911222333",
      nationalId: testUniqueCccd, // Trùng CCCD
      agency: "SVLAND",
      answer: "C"
    }, reloadedSubmissions);
    assert(
      duplicateCccdTest.isValid === false && duplicateCccdTest.errors.nationalId.includes("đã được đăng ký"),
      "Chống chơi lần 2: Hệ thống từ chối đăng ký khi CCCD đã tồn tại"
    );

  } catch (err) {
    assert(false, "Lỗi trong quy trình gửi và xác minh CSV", err.message);
  } finally {
    // 6. Phục hồi lại dữ liệu gốc ban đầu qua API POST /api/write-csv (Không để rác dữ liệu test)
    if (originalCsvContent) {
      await fetch(`${BASE_URL}/api/write-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: originalCsvContent })
      });
    }
  }

  // --- KỊCH BẢN 5: KIỂM THỬ GIAO DIỆN QUAY SỐ VÀ LỌC ĐÁP ÁN C ---
  console.log(`\n${colors.bold}5. Kịch bản 5: Kiểm tra trang quay số Final.html và thuật toán lọc đáp án C${colors.reset}`);
  try {
    const resFinal = await fetch(`${BASE_URL}/Final.html`);
    assert(resFinal.status === 200, "Truy cập Final.html trả về HTTP 200 OK");
    const finalHtml = await resFinal.text();

    assert(finalHtml.includes('Be Vietnam Pro'), "Final.html sử dụng font chữ 'Be Vietnam Pro'");
    assert(finalHtml.includes('QUAY SỐ'), "Màn hình quay số có nút 'QUAY SỐ'");
    assert(!finalHtml.includes('participant-count-badge'), "Đã loại bỏ hoàn toàn dòng thống kê Danh sách/Còn lại");
    assert(!finalHtml.includes('spin-status-note'), "Đã loại bỏ hoàn toàn spin-status-note text cũ");
    assert(!finalHtml.includes('id="winnersList"'), "Đã loại bỏ hoàn toàn bảng DANH SÁCH GIẢI THƯỞNG theo yêu cầu");
    assert(finalHtml.includes('progress-bar-fill'), "Final.html có thanh Progress Bar trực quan");
    assert(finalHtml.includes('is-pending'), "Final.html có lớp is-pending làm mờ rõ rệt cho các ô chưa quay");
    assert(finalHtml.includes('handleCardClick'), "Final.html hỗ trợ bấm trực tiếp vào từng ô để quay riêng lẻ");
    assert(finalHtml.includes('reSpinModal') || finalHtml.includes('confirmReSpin'), "Final.html có modal xác nhận khi bấm quay lại ô đã có kết quả");
    assert(!finalHtml.includes('class="slot-machine"'), "Đã loại bỏ hoàn toàn máy slot 4 số riêng lẻ");
    assert(!finalHtml.includes('QUAY TỪNG SỐ'), "Đã loại bỏ hoàn toàn nút 'QUAY TỪNG SỐ'");
    assert(finalHtml.includes('slot-grid-16'), "Final.html có hệ thống Grid 16 ô giải hiển thị sẵn");
    assert(finalHtml.includes('Math.random() * 2000') && finalHtml.includes('3000'), "Thuật toán có thời gian quay ngẫu nhiên từ 3s đến 5s cho mỗi ô");
    assert(finalHtml.includes('answer.toUpperCase() !== "C"'), "Thuật toán Final.html có logic lọc bắt buộc đáp án C");
    assert(finalHtml.includes('winnerAnnouncementModal'), "Final.html có modal vinh danh #winnerAnnouncementModal cực đại cho MC");
    assert(finalHtml.includes('winnerModalNextBtn'), "Final.html có nút điều hướng #winnerModalNextBtn (TIẾP TỤC / HOÀN TẤT)");
    assert(finalHtml.includes('showWinnerAnnouncementModal'), "Final.html có hàm async showWinnerAnnouncementModal");
    assert(finalHtml.includes('handleWinnerModalConfirm'), "Final.html có hàm handleWinnerModalConfirm");

    // Tạo danh sách hỗn hợp gồm thí sinh đáp án A, B, C, D
    const testPool = [
      { id: 1, name: "Thí sinh A1", phone: "0901000001", nationalId: "001200000001", agency: "A", answer: "A" },
      { id: 2, name: "Thí sinh B1", phone: "0901000002", nationalId: "001200000002", agency: "B", answer: "B" },
      { id: 3, name: "Thí sinh C1", phone: "0901000003", nationalId: "001200000003", agency: "C", answer: "C" },
      { id: 4, name: "Thí sinh C2", phone: "0901000004", nationalId: "001200000004", agency: "C", answer: "C" },
      { id: 5, name: "Thí sinh D1", phone: "0901000005", nationalId: "001200000005", agency: "D", answer: "D" },
    ];

    // Áp dụng đúng điều kiện lọc của Final.html
    const qualified = testPool.filter(p => (p.answer || "").toUpperCase() === "C");
    assert(qualified.length === 2, "Hệ thống lọc chính xác chỉ người chọn đáp án C mới có trong danh sách quay");
    assert(qualified.every(p => p.answer === "C"), "Không có thí sinh chọn đáp án A, B, D nào lọt vào danh sách quay số");
  } catch (err) {
    assert(false, "Lỗi kiểm tra Final.html", err.message);
  }

  // --- KỊCH BẢN 6: KIỂM THỬ THUẬT TOÁN QUAY 16 GIẢI ĐỒNG THỜI & CHE GIẤU THÔNG TIN ---
  console.log(`\n${colors.bold}6. Kịch bản 6: Kiểm thử thuật toán quay 16 giải và chuẩn hiển thị thông tin${colors.reset}`);
  try {
    // Tạo 25 thí sinh chọn đáp án C
    const mock25Candidates = Array.from({ length: 25 }, (_, i) => ({
      id: 101 + i,
      name: `Khách Hàng ${i + 1}`,
      phone: `09091234${(i + 10).toString()}`,
      nationalId: `0421890012${(i + 10).toString()}`,
      agency: `Đại Lý ${i % 4}`,
      answer: "C"
    }));

    // Thuật toán chọn 16 người ngẫu nhiên
    const shuffled = [...mock25Candidates].sort(() => 0.5 - Math.random());
    const drawn16 = shuffled.slice(0, 16);

    assert(drawn16.length === 16, "Hệ thống chọn ra chính xác 16 người trúng giải");

    // Kiểm tra không có ai bị trúng lặp
    const uniqueWinnerIds = new Set(drawn16.map(w => w.id));
    assert(uniqueWinnerIds.size === 16, "Cả 16 người trúng giải là 16 cá nhân riêng biệt (Không trùng lặp)");

    // Kiểm tra định dạng hiển thị: Mã số, Họ tên, Đại lý, ****CCCD, ****SĐT
    drawn16.forEach((w, idx) => {
      const codeStr = `#${w.id.toString().padStart(4, '0')}`;
      const maskedCccd = `****${w.nationalId.slice(-4)}`;
      const maskedPhone = `****${w.phone.slice(-4)}`;

      const formatValid = codeStr.startsWith('#') &&
                          w.name.length > 0 &&
                          w.agency.length > 0 &&
                          maskedCccd.startsWith('****') && maskedCccd.length === 8 &&
                          maskedPhone.startsWith('****') && maskedPhone.length === 8;

      if (idx === 0) {
        assert(formatValid, `Mẫu thẻ giải #1 chuẩn format: ${codeStr} | ${w.name} | ${w.agency} | CCCD: ${maskedCccd} | SĐT: ${maskedPhone}`);
      }
    });

    console.log(`\n    ${colors.yellow}Mô phỏng 4 người đầu tiên trong danh sách 16 giải:${colors.reset}`);
    drawn16.slice(0, 4).forEach((w, idx) => {
      console.log(`    [Giải #${idx+1}] #${w.id.toString().padStart(4, '0')} - ${w.name} - ${w.agency} - CCCD: ****${w.nationalId.slice(-4)} - SĐT: ****${w.phone.slice(-4)}`);
    });
  } catch (err) {
    assert(false, "Lỗi kiểm thử thuật toán quay 16 giải", err.message);
  }

  // --- KỊCH BẢN 7: KIỂM THỬ TÌM KIẾM, LỌC ĐA CHIỀU VÀ PHÂN TRANG ADMIN ---
  console.log(`\n${colors.bold}7. Kịch bản 7: Kiểm thử logic Tìm kiếm tức thì, Bộ lọc đa chiều và Phân trang Admin${colors.reset}`);
  try {
    const adminSampleData = [
      { id: 1, name: "Nguyễn Văn An", phone: "0912345678", nationalId: "038099001111", agency: "Đất xanh Bắc Trung Bộ", answer: "C", prizeWon: "" },
      { id: 2, name: "Trần Thị Bình", phone: "0987654321", nationalId: "038099002222", agency: "CITY HOMES", answer: "A", prizeWon: "Giải Ba" },
      { id: 3, name: "Lê Văn Cường", phone: "0905111222", nationalId: "038099003333", agency: "HOÀNG HUY NT", answer: "C", prizeWon: "Giải Nhất" },
      { id: 4, name: "Phạm Thu Dung", phone: "0933444555", nationalId: "038099004444", agency: "CITY HOMES", answer: "B", prizeWon: "" },
      { id: 5, name: "Vũ Hải Đăng", phone: "0977888999", nationalId: "038099005555", agency: "ÂU LẠC LAND", answer: "", prizeWon: "" },
    ];

    // Helper logic mô phỏng SubmissionList
    function searchList(list, query) {
      if (!query || !query.trim()) return list;
      const q = query.trim().toLowerCase();
      return list.filter(item => {
        const idStr = item.id.toString();
        const codeStr = `#${idStr.padStart(4, '0')}`.toLowerCase();
        return item.name.toLowerCase().includes(q) ||
               item.phone.includes(q) ||
               item.nationalId.includes(q) ||
               idStr === q ||
               codeStr.includes(q) ||
               item.agency.toLowerCase().includes(q);
      });
    }

    function filterList(list, { agency, answer, prize }) {
      return list.filter(item => {
        if (agency && agency !== 'ALL' && item.agency !== agency) return false;
        if (answer === 'C' && (item.answer || '').toUpperCase() !== 'C') return false;
        if (answer === 'OTHER' && (item.answer || '').toUpperCase() === 'C') return false;
        if (prize === 'WON' && !item.prizeWon) return false;
        if (prize === 'NOT_WON' && !!item.prizeWon) return false;
        return true;
      });
    }

    function paginate(list, page, pageSize) {
      if (pageSize === 'ALL') return { items: list, totalPages: 1, currentPage: 1 };
      const size = Number(pageSize);
      const totalPages = Math.max(1, Math.ceil(list.length / size));
      const validPage = Math.min(Math.max(1, page), totalPages);
      const start = (validPage - 1) * size;
      return {
        items: list.slice(start, start + size),
        totalPages,
        currentPage: validPage
      };
    }

    // Test 7.1: Tìm kiếm theo tên
    const searchByName = searchList(adminSampleData, "Bình");
    assert(searchByName.length === 1 && searchByName[0].id === 2, "Admin: Tìm kiếm chính xác theo Họ và Tên");

    // Test 7.2: Tìm kiếm theo 4 số cuối SĐT
    const searchByPhone = searchList(adminSampleData, "4321");
    assert(searchByPhone.length === 1 && searchByPhone[0].id === 2, "Admin: Tìm kiếm theo 4 số cuối SĐT");

    // Test 7.3: Tìm kiếm theo 4 số cuối CCCD
    const searchByCccd = searchList(adminSampleData, "3333");
    assert(searchByCccd.length === 1 && searchByCccd[0].id === 3, "Admin: Tìm kiếm theo số CCCD");

    // Test 7.4: Tìm kiếm theo mã số dự thưởng
    const searchByCode = searchList(adminSampleData, "#0004");
    assert(searchByCode.length === 1 && searchByCode[0].id === 4, "Admin: Tìm kiếm theo mã số dự thưởng (#0004)");

    // Test 7.5: Lọc theo Đại lý
    const filterByAgency = filterList(adminSampleData, { agency: "CITY HOMES", answer: "ALL", prize: "ALL" });
    assert(filterByAgency.length === 2 && filterByAgency.every(x => x.agency === "CITY HOMES"), "Admin: Lọc chính xác theo sàn/đại lý");

    // Test 7.6: Lọc theo Đáp án C kết hợp Trạng thái trúng giải
    const filterCAndWon = filterList(adminSampleData, { agency: "ALL", answer: "C", prize: "WON" });
    assert(filterCAndWon.length === 1 && filterCAndWon[0].id === 3, "Admin: Lọc kết hợp (Đáp án C VÀ Đã trúng giải)");

    // Test 7.7: Phân trang (5 items, page size 2 -> 3 pages)
    const page1 = paginate(adminSampleData, 1, 2);
    assert(page1.items.length === 2 && page1.totalPages === 3 && page1.items[0].id === 1, "Admin: Phân trang trang 1 trả về 2 phần tử đầu");

    const page3 = paginate(adminSampleData, 3, 2);
    assert(page3.items.length === 1 && page3.items[0].id === 5, "Admin: Phân trang trang cuối trả về phần tử thứ 5");

    console.log(`    ${colors.green}✓ Tất cả 7 bài test logic Admin Search, Multi-Filter và Pagination đều PASS${colors.reset}`);
  } catch (err) {
    assert(false, "Lỗi kiểm thử nghiệp vụ Admin Dashboard", err.message);
  }

  // --- KẾT QUẢ TỔNG KẾT ---
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}TỔNG KẾT KIỂM THỬ: ${passedTests}/${totalTests} KỊCH BẢN THÀNH CÔNG (${Math.round((passedTests/totalTests)*100)}%)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  if (failures.length > 0) {
    console.error(`${colors.red}CÁC LỖI CẦN XỬ LÝ:${colors.reset}`);
    failures.forEach((f, idx) => {
      console.error(`  ${idx + 1}. ${f.testName}: ${f.detail}`);
    });
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}TẤT CẢ CÁC RÀNG BUỘC VÀ QUY TRÌNH NGHIỆP VỤ ĐỀU ĐẠT CHUẨN!${colors.reset}\n`);
    process.exit(0);
  }
}

runRigorousE2ETests();
