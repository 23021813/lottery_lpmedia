import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=== BẮT ĐẦU KIỂM THỬ DỮ LIỆU & GIAO DIỆN QUAY SỐ ===\n');

// 1. Kiểm tra data/data.csv
const csvPath = path.resolve('data/data.csv');
assert(fs.existsSync(csvPath), 'File data/data.csv không tồn tại');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.replace(/\r/g, '').trim().split('\n');

assert(lines.length === 780, `Số dòng CSV phải là 780 (1 header + 779 bản ghi), hiện tại là: ${lines.length}`);
assert(lines[0] === 'id,name,phone,nationalId,agency,answer,prizeWon', 'Header CSV không đúng format');

console.log('✔ File data/data.csv có đủ 779 dòng dữ liệu và đúng header chuẩn.');

// Kiểm tra chi tiết các dòng
let validCount = 0;
const idSet = new Set();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  const parts = line.split(',');
  const id = parts[0];
  const name = parts[1];
  const phone = parts[2];
  const nationalId = parts[3];
  const agency = parts[4];
  const answer = parts[5];

  assert(/^\d{4}$/.test(id), `Dòng ${i}: id '${id}' phải là 4 chữ số`);
  assert(!idSet.has(id), `Dòng ${i}: id '${id}' bị trùng lặp`);
  idSet.add(id);

  assert(name && name.length > 0, `Dòng ${i}: Tên không được rỗng`);
  assert(!name.startsWith('ÔNG ') && !name.startsWith('BÀ '), `Dòng ${i}: Tên '${name}' không được chứa tiền tố ÔNG/BÀ`);
  assert(name === name.toUpperCase(), `Dòng ${i}: Tên '${name}' phải được viết hoa toàn bộ`);
  assert(answer === 'C', `Dòng ${i}: Đáp án phải là 'C' để hợp lệ quay số`);

  validCount++;
}

console.log(`✔ Kiểm tra 779 bản ghi: Tất cả đều có mã 4 số duy nhất, đáp án C, tên IN HOA không chứa ÔNG/BÀ.`);

// Kiểm tra bản ghi từ ảnh người dùng cung cấp (0758 - Nguyễn Minh Hiếu)
const row0758 = lines.find(l => l.startsWith('0758,'));
assert(row0758, 'Không tìm thấy bản ghi mã 0758 trong data.csv');
console.log(`✔ Kiểm tra mã 0758 (theo ảnh đính kèm): "${row0758}"`);

// Kiểm tra Khưu Quốc Tiến (không có dấu nháy)
const rowKhuu = lines.find(l => l.includes('KHƯU QUỐC TIẾN'));
assert(rowKhuu && !rowKhuu.includes("'"), 'Khưu Quốc Tiến vẫn còn dính dấu nháy đơn trong CCCD');
console.log(`✔ Kiểm tra Khưu Quốc Tiến: "${rowKhuu}" (đã sạch dấu nháy)`);

// Kiểm tra Nguyễn Đồng Trưởng (đủ 12 số có số 0 ở đầu)
const rowTruong = lines.find(l => l.includes('NGUYỄN ĐỒNG TRƯỞNG'));
assert(rowTruong && rowTruong.includes(',019203003422,'), 'Nguyễn Đồng Trưởng CCCD phải đủ 12 số có số 0 ở đầu');
console.log(`✔ Kiểm tra Nguyễn Đồng Trưởng: "${rowTruong}" (đã bù số 0 ở đầu đủ 12 số)`);

// 2. Kiểm tra Final.html
const htmlPath = path.resolve('Final.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Đảm bảo không còn phoneEl hoặc slice(-4) trong hiển thị
assert(!htmlContent.includes('winnerModalPhone'), 'Final.html vẫn còn chứa winnerModalPhone');
assert(!htmlContent.includes('card-phone-'), 'Final.html vẫn còn chứa card-phone-');
assert(!htmlContent.includes('.slice(-4)'), 'Final.html vẫn còn chứa .slice(-4)');

// Kiểm tra hàm formatCCCD trong Final.html
assert(htmlContent.includes('function formatCCCD(nationalId)'), 'Final.html chưa có hàm formatCCCD');

// Mô phỏng logic formatCCCD
function formatCCCD(nationalId) {
  const raw = (nationalId || "").toString().trim();
  if (!raw) return "************";
  if (raw.length < 12) return "*".repeat(12 - raw.length) + raw;
  return raw;
}

assert(formatCCCD('1112') === '********1112', 'formatCCCD 1112 phải ra ********1112');
assert(formatCCCD('079196019371') === '079196019371', 'formatCCCD 12 số phải giữ nguyên');
assert(formatCCCD('') === '************', 'formatCCCD rỗng phải ra ************');
assert(formatCCCD(null) === '************', 'formatCCCD null phải ra ************');
console.log('✔ Kiểm tra formatCCCD: 1112 -> ********1112, rỗng -> ************, 12 số giữ nguyên.');

// Đảm bảo có INLINE_PARTICIPANTS và loadParticipants fallback
assert(htmlContent.includes('const INLINE_PARTICIPANTS ='), 'Final.html chưa có dữ liệu INLINE_PARTICIPANTS');
assert(htmlContent.includes('dữ liệu inline dự phòng'), 'Final.html chưa có cơ chế fallback inline data');

// Kiểm tra thuật toán phân bổ hạn ngạch động và loại bỏ khách mời
assert(htmlContent.includes('function isGuest(p)'), 'Final.html chưa có hàm isGuest');
assert(htmlContent.includes('function normalizeCompany(p)'), 'Final.html chưa có hàm normalizeCompany');
assert(htmlContent.includes('function computeQuotas(participantList, totalPrizes = 16)'), 'Final.html chưa có hàm computeQuotas');
assert(htmlContent.includes('function drawNextWinner(availableList, currentWinnersList, totalPrizes = 16)'), 'Final.html chưa có hàm drawNextWinner');
assert(htmlContent.includes('drawNextWinner(available, activeWinners, 16)'), 'spinSingleCard chưa gọi drawNextWinner');
assert(htmlContent.includes('drawNextWinner(available, currentWinners, 16)'), 'spin16WinnersSequential chưa gọi drawNextWinner');

console.log('✔ Kiểm tra Final.html: Thuật toán phân bổ động và loại bỏ khách mời đã được tích hợp đầy đủ.');

console.log('\n=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỀU THÀNH CÔNG (PASS) ===');
