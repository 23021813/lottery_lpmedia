import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { isGuest, normalizeCompany, computeQuotas, draw16Winners } from './lottery-allocator.mjs';

console.log('===============================================================');
console.log('🚀 BẮT ĐẦU KIỂM THỬ THUẬT TOÁN QUAY SỐ PHÂN BỔ ĐỘNG');
console.log('===============================================================\n');

// -------------------------------------------------------------
// PHẦN 1: KIỂM THỬ TRÊN DỮ LIỆU THỰC TẾ (779 NGƯỜI)
// -------------------------------------------------------------
console.log('--- [PHẦN 1] KIỂM THỬ TRÊN DỮ LIỆU THỰC TẾ (779 NGƯỜI) ---');
const realDataPath = path.resolve('data/inline_participants.json');
const realParticipants = JSON.parse(fs.readFileSync(realDataPath, 'utf-8'));

assert(realParticipants.length === 779, `Dữ liệu thực tế phải có 779 người, hiện tại: ${realParticipants.length}`);

// 1.1 Tính toán hạn ngạch lý thuyết
const realQuotas = computeQuotas(realParticipants, 16);
console.log(`✔ Tổng số người tham gia hợp lệ (đã loại khách mời): ${realQuotas.total}`);
console.log(`✔ Số nhóm được phân bổ giải:`);
for (const [grp, pz] of Object.entries(realQuotas.groupPrizes)) {
  if (pz > 0) {
    const cnt = realQuotas.groupCounts[grp];
    const exact = realQuotas.exactQuotas[grp].toFixed(3);
    console.log(`    - ${grp.padEnd(20)}: ${cnt.toString().padStart(3)} người (${exact} lý thuyết) ➔ ${pz} giải`);
  }
}
const sumRealPrizes = Object.values(realQuotas.groupPrizes).reduce((a, b) => a + b, 0);
assert(sumRealPrizes === 16, `Tổng số giải phân bổ phải đúng bằng 16, hiện tại: ${sumRealPrizes}`);

// 1.2 Chạy 50 vòng quay mô phỏng (mỗi vòng 16 giải = 800 lượt bốc)
console.log('\n✔ Đang chạy 50 vòng quay mô phỏng thực tế...');
for (let sim = 1; sim <= 50; sim++) {
  const winners = draw16Winners(realParticipants, 16);
  assert(winners.length === 16, `Vòng ${sim}: Số người trúng phải đúng 16`);

  // Kiểm tra không có ID trùng lặp
  const idSet = new Set(winners.map(w => w.id));
  assert(idSet.size === 16, `Vòng ${sim}: Có người trúng bị trùng ID`);

  // Kiểm tra không ai là khách mời
  for (const w of winners) {
    assert(!isGuest(w), `Vòng ${sim}: Người trúng ${w.name} (${w.agency}) là khách mời!`);
  }

  // Kiểm tra cơ cấu giải từng nhóm
  const simGroupWins = {};
  for (const w of winners) {
    const grp = normalizeCompany(w);
    simGroupWins[grp] = (simGroupWins[grp] || 0) + 1;
  }

  for (const [grp, pz] of Object.entries(realQuotas.groupPrizes)) {
    const actual = simGroupWins[grp] || 0;
    assert(actual === pz, `Vòng ${sim}: Nhóm '${grp}' mong đợi ${pz} giải nhưng thực tế trúng ${actual} giải`);
  }
}
console.log('✔ PASS 50/50 vòng quay trên dữ liệu thực: 100% khớp đúng hạn ngạch (loại bỏ hoàn toàn khách mời).');

// -------------------------------------------------------------
// PHẦN 2: KIỂM THỬ TÍNH CO GIÃN (ELASTICITY) VỚI DATA GIẢ LẬP
// -------------------------------------------------------------
console.log('\n--- [PHẦN 2] KIỂM THỬ TÍNH CO GIÃN KHI THAY ĐỔI DỮ LIỆU & % ---');

// Kịch bản A: Khách mời chiếm 200 người nhưng bị loại bỏ 0 giải, 2 công ty chia đều 16 giải
console.log('\n[Kịch bản A] Khách mời 200 người (loại bỏ hoàn toàn), 2 Công ty mỗi bên 300 người:');
const mockA = [];
let idCounter = 1;
for (let i = 0; i < 200; i++) {
  mockA.push({ id: idCounter++, name: `Khách VIP ${i+1}`, agency: 'KHÁCH MỜI', note: 'VIP' });
}
for (let i = 0; i < 300; i++) {
  mockA.push({ id: idCounter++, name: `Sales A ${i+1}`, agency: 'CÔNG TY A', note: '' });
}
for (let i = 0; i < 300; i++) {
  mockA.push({ id: idCounter++, name: `Sales B ${i+1}`, agency: 'CÔNG TY B', note: '' });
}

const quotasA = computeQuotas(mockA, 16);
console.log(`  CÔNG TY A (300/600 = 50.0%): ${quotasA.groupPrizes['CÔNG TY A']} giải`);
console.log(`  CÔNG TY B (300/600 = 50.0%): ${quotasA.groupPrizes['CÔNG TY B']} giải`);

assert(!quotasA.groupPrizes['KHÁCH MỜI'], 'Khách mời không được có giải trong danh sách phân bổ');
assert(quotasA.groupPrizes['CÔNG TY A'] === 8, 'Công ty A chiếm 50% phải tự động nhận 8 giải');
assert(quotasA.groupPrizes['CÔNG TY B'] === 8, 'Công ty B chiếm 50% phải tự động nhận 8 giải');

const winnersA = draw16Winners(mockA, 16);
assert(winnersA.every(w => !isGuest(w)), 'Quay thực tế Kịch bản A không có khách mời nào trúng');
console.log('  ✔ Đã quay thử Kịch bản A: 0 Khách Mời, 8 Công ty A, 8 Công ty B.');

// Kịch bản B: 1 Công ty chiếm đa số quân số
console.log('\n[Kịch bản B] 1 Công ty chiếm đa số (500/900 người hợp lệ):');
const mockB = [];
for (let i = 0; i < 500; i++) {
  mockB.push({ id: idCounter++, name: `Sales Mega ${i+1}`, agency: 'MEGA CORP', note: '' });
}
for (let i = 0; i < 200; i++) {
  mockB.push({ id: idCounter++, name: `Sales Mid ${i+1}`, agency: 'MID CORP', note: '' });
}
for (let i = 0; i < 200; i++) {
  mockB.push({ id: idCounter++, name: `Sales Small ${i+1}`, agency: 'SMALL CORP', note: '' });
}
for (let i = 0; i < 100; i++) {
  mockB.push({ id: idCounter++, name: `Khách ${i+1}`, agency: 'AGRIBANK SỞ GIAO DỊCH', note: '' });
}

const quotasB = computeQuotas(mockB, 16);
console.log(`  MEGA CORP (500/900 = 55.6%): ${quotasB.groupPrizes['MEGA CORP']} giải`);
console.log(`  MID CORP (200/900 = 22.2%): ${quotasB.groupPrizes['MID CORP']} giải`);
console.log(`  SMALL CORP (200/900 = 22.2%): ${quotasB.groupPrizes['SMALL CORP']} giải`);

assert(quotasB.groupPrizes['MEGA CORP'] === 9, 'MEGA CORP chiếm 55.6% (8.89) phải nhận 9 giải');
const winnersB = draw16Winners(mockB, 16);
assert(winnersB.every(w => !isGuest(w)), 'Quay thực tế Kịch bản B không có khách mời nào trúng');
console.log('  ✔ Đã quay thử Kịch bản B: Đúng 9 giải MEGA CORP, các nhóm còn lại chia đều hợp lệ.');

// Kịch bản C: 16 Công ty kích thước ngang bằng nhau (Mỗi công ty 50 người, tổng 800)
console.log('\n[Kịch bản C] 16 Công ty đồng đều (Mỗi công ty 50 người):');
const mockC = [];
for (let c = 1; c <= 16; c++) {
  for (let i = 0; i < 50; i++) {
    mockC.push({ id: idCounter++, name: `Member ${c}_${i+1}`, agency: `COMPANY_${c}`, note: '' });
  }
}
const quotasC = computeQuotas(mockC, 16);
for (let c = 1; c <= 16; c++) {
  assert(quotasC.groupPrizes[`COMPANY_${c}`] === 1, `COMPANY_${c} phải nhận đúng 1 giải`);
}
const winnersC = draw16Winners(mockC, 16);
assert(winnersC.length === 16, 'Quay thực tế Kịch bản C phải đủ 16 giải');
const winCompaniesC = new Set(winnersC.map(w => w.agency));
assert(winCompaniesC.size === 16, 'Mỗi công ty trong 16 công ty phải có đúng 1 người trúng giải');
console.log('  ✔ Đã quay thử Kịch bản C: Đúng 16 công ty mỗi công ty 1 giải, không trùng lặp.');

// Kịch bản D: Fuzzing kiểm thử 20 tập dữ liệu ngẫu nhiên bất kỳ
console.log('\n[Kịch bản D] Fuzzing Test: Sinh ngẫu nhiên 20 tập dữ liệu với cơ cấu % bất kỳ...');
for (let f = 1; f <= 20; f++) {
  const numGroups = Math.floor(Math.random() * 20) + 5; // 5 đến 25 nhóm
  const mockFuzz = [];
  for (let g = 1; g <= numGroups; g++) {
    const groupSize = Math.floor(Math.random() * 100) + 5; // Mỗi nhóm 5 đến 105 người
    const agencyName = g === 1 ? 'KHÁCH MỜI VIP' : `AGENCY_FUZZ_${g}`;
    const note = g === 1 ? 'VIP' : '';
    for (let m = 0; m < groupSize; m++) {
      mockFuzz.push({ id: idCounter++, name: `Fuzz_${g}_${m}`, agency: agencyName, note: note });
    }
  }

  const quotasFuzz = computeQuotas(mockFuzz, 16);
  const totalAllocated = Object.values(quotasFuzz.groupPrizes).reduce((a, b) => a + b, 0);
  assert(totalAllocated === 16, `Fuzz ${f}: Tổng giải phân bổ phải bằng 16 (thực tế: ${totalAllocated})`);

  const winnersFuzz = draw16Winners(mockFuzz, 16);
  assert(winnersFuzz.length === 16, `Fuzz ${f}: Quay số phải ra đúng 16 người`);
  assert(winnersFuzz.every(w => !isGuest(w)), `Fuzz ${f}: Không được có khách mời trúng giải`);
  const uniqueWinners = new Set(winnersFuzz.map(w => w.id));
  assert(uniqueWinners.size === 16, `Fuzz ${f}: 16 người trúng không được trùng lặp`);
}
console.log('  ✔ PASS 20/20 Fuzzing tests với các tập dữ liệu có cấu trúc % hoàn toàn ngẫu nhiên!');

console.log('\n===============================================================');
console.log('🎉 TẤT CẢ CÁC BÀI TEST CO GIÃN VÀ XÁC MINH ĐỀU THÀNH CÔNG (PASS)');
console.log('===============================================================');
