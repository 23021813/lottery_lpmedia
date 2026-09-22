import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('\n--- BẮT ĐẦU KIỂM THỬ DỮ LIỆU MỚI CHO QUAYSO.HTML ---');

const projectRoot = path.resolve('.');
const importCsvPath = path.join(projectRoot, 'data', 'data_import.csv');
const jsonPath = path.join(projectRoot, 'data', 'inline_participants.json');
const quaysoHtmlPath = path.join(projectRoot, 'quayso.html');

// 1. Kiểm tra file data_import.csv (chỉ dành cho quayso.html)
assert(fs.existsSync(importCsvPath), 'File data/data_import.csv không tồn tại');
const importCsvContent = fs.readFileSync(importCsvPath, 'utf-8').trim();
const importCsvLines = importCsvContent.split('\n').map(l => l.trim()).filter(Boolean);
console.log(`- data/data_import.csv: ${importCsvLines.length} dòng (kỳ vọng 497 dòng)`);
assert.strictEqual(importCsvLines.length, 497, `data_import.csv phải có 497 dòng, thực tế: ${importCsvLines.length}`);

// 3. Kiểm tra file data/inline_participants.json
assert(fs.existsSync(jsonPath), 'File data/inline_participants.json không tồn tại');
const participants = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`- data/inline_participants.json: ${participants.length} người (kỳ vọng 496 người)`);
assert.strictEqual(participants.length, 496, `inline_participants.json phải có 496 người, thực tế: ${participants.length}`);

// 4. Kiểm tra chuẩn hóa tên và mã số 4 chữ số
let nameWithPrefixCount = 0;
let invalidCodeCount = 0;
let invalidPaddedCccdCount = 0;

for (const p of participants) {
  if (/^(ÔNG|BÀ)\s+/i.test(p.name)) {
    nameWithPrefixCount++;
  }
  if (!/^\d{4}$/.test(p.code)) {
    invalidCodeCount++;
  }
  const rawId = (p.nationalId || '').trim();
  if (rawId.length >= 9 && rawId.length <= 11 && /^\d+$/.test(rawId)) {
    invalidPaddedCccdCount++;
  }
}

console.log(`- Tên còn tiền tố ÔNG/BÀ: ${nameWithPrefixCount} (kỳ vọng 0)`);
assert.strictEqual(nameWithPrefixCount, 0, 'Không được còn tiền tố ÔNG/BÀ trong họ tên');

console.log(`- Mã số không hợp lệ 4 số: ${invalidCodeCount} (kỳ vọng 0)`);
assert.strictEqual(invalidCodeCount, 0, '100% mã số code phải là 4 chữ số');

console.log(`- CCCD chưa được bù 0 đủ 12 số: ${invalidPaddedCccdCount} (kỳ vọng 0)`);
assert.strictEqual(invalidPaddedCccdCount, 0, 'Tất cả CCCD 9-11 số phải được bù 0 thành 12 số');

// 5. Kiểm tra logic lọc khách mời & điều kiện quay số của quayso.html
const BANK_KEYWORDS = [
  'AGRIBANK', 'ACB', 'PVCOMBANK', 'MB ', 'MB THUẬN AN', 'MB TÂN THUẬN', 
  'VIETCOMBANK', 'PUBLIC BANK', 'OCB'
];
const PARTNER_KEYWORDS = [
  'NAGECCO', 'HONA-G', 'P&K', 'SAE CONSTRUCTION', 'NAM LỘC TIẾN', 
  'OBC HOLDINGS', 'GIA NGHĨA HOME'
];

function isGuest(p) {
  const note = (p.note || '').toString().trim().toUpperCase();
  const agency = (p.agency || '').toString().trim().toUpperCase();
  if (note.includes('VIP') || !agency) return true;
  for (const b of BANK_KEYWORDS) {
    if (agency.includes(b)) return true;
  }
  for (const pt of PARTNER_KEYWORDS) {
    if (agency.includes(pt)) return true;
  }
  return false;
}

function hasValidCCCD(p) {
  const cccd = (p.nationalId || '').toString().trim();
  return cccd.length > 0;
}

const invalidCccdList = participants.filter(p => !hasValidCCCD(p));
const guestList = participants.filter(p => isGuest(p));
const eligibleList = participants.filter(p => !isGuest(p) && hasValidCCCD(p));

console.log(`- Số người thiếu CCCD: ${invalidCccdList.length} (kỳ vọng 32)`);
assert.strictEqual(invalidCccdList.length, 32, `Số người thiếu CCCD phải là 32, thực tế: ${invalidCccdList.length}`);

console.log(`- Số người là khách mời / VIP: ${guestList.length} (kỳ vọng 48)`);
assert.strictEqual(guestList.length, 48, `Số khách mời phải là 48, thực tế: ${guestList.length}`);

console.log(`- Số người ĐỦ ĐIỀU KIỆN QUAY SỐ: ${eligibleList.length} (kỳ vọng 444)`);
assert.strictEqual(eligibleList.length, 444, `Số người đủ điều kiện quay phải là 444, thực tế: ${eligibleList.length}`);

// 6. Kiểm tra quayso.html đã được nhúng dữ liệu mới
assert(fs.existsSync(quaysoHtmlPath), 'File quayso.html không tồn tại');
const quaysoHtml = fs.readFileSync(quaysoHtmlPath, 'utf-8');
const inlineMatch = quaysoHtml.match(/const INLINE_IMPORT_PARTICIPANTS = (\[.*?\]);/s);
assert(inlineMatch, 'Không tìm thấy INLINE_IMPORT_PARTICIPANTS trong quayso.html');
const embeddedParticipants = JSON.parse(inlineMatch[1]);
console.log(`- quayso.html embedded inline participants: ${embeddedParticipants.length} (kỳ vọng 496)`);
assert.strictEqual(embeddedParticipants.length, 496, `quayso.html phải nhúng đủ 496 người`);

console.log('\n✔ TẤT CẢ KIỂM THỬ XÁC MINH DỮ LIỆU ĐÃ PASS HOÀN TOÀN!\n');
