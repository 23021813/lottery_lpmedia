// Standalone Lottery Allocator Module (Thuật toán Phân bổ Hạn ngạch Động)

export const BANK_KEYWORDS = [
  'AGRIBANK', 'ACB', 'PVCOMBANK', 'MB ', 'MB THUẬN AN', 'MB TÂN THUẬN', 
  'VIETCOMBANK', 'PUBLIC BANK', 'OCB'
];

export const PARTNER_KEYWORDS = [
  'NAGECCO', 'HONA-G', 'P&K', 'SAE CONSTRUCTION', 'NAM LỘC TIẾN', 
  'OBC HOLDINGS', 'GIA NGHĨA HOME'
];

/**
 * Kiểm tra xem một người có phải là Khách Mời / VIP / Đối Tác / Ngân Hàng hay không
 */
export function isGuest(p) {
  const note = (p.note || '').toString().trim().toUpperCase();
  const agency = (p.agency || '').toString().trim().toUpperCase();

  if (note.includes('VIP') || !agency) {
    return true;
  }
  for (const b of BANK_KEYWORDS) {
    if (agency.includes(b)) return true;
  }
  for (const pt of PARTNER_KEYWORDS) {
    if (agency.includes(pt)) return true;
  }
  return false;
}

/**
 * Chuẩn hóa tên công ty/sàn phân phối
 */
export function normalizeCompany(p) {
  const agency = (p.agency || '').toString().trim().toUpperCase();

  if (agency.includes('REDLAND')) return 'REDLAND';
  if (agency.includes('A&T')) return 'A&T SERVICES';
  if (agency.includes('KPH') || agency.includes('KIM PEAK')) return 'KPH';
  if (agency.includes('EASTERN')) return 'EASTERN HOLDINGS';
  if (agency.includes('NAM VIỆT')) return 'NAM VIỆT GROUP';
  if (agency.includes('EMG')) return 'EMG';
  if (agency.includes('UNI INVEST')) return 'UNI INVEST';
  if (agency.includes('WINTON')) return 'WINTON HOMES';
  if (agency.includes('MASTER REALTY')) return 'MASTER REALTY';
  if (agency.includes('RED GROUP')) return 'RED GROUP';
  if (agency.includes('ART PROPERTY')) return 'ART PROPERTY';
  if (agency.includes('VISIONARY')) return 'VISIONARY HOMES';
  if (agency.includes('HS HOLDING')) return 'HS HOLDING';
  if (agency.includes('SKY REAL')) return 'SKY REAL';
  if (agency.includes('VIỆT TRUNG')) return 'VIỆT TRUNG TV';
  if (agency.includes('HAYHOMES')) return 'HAYHOMES';
  if (agency.includes('NC LAND')) return 'NC LAND';
  if (agency.includes('KHỞI MINH')) return 'BDS KHỞI MINH';
  if (agency.includes('FIRELAND')) return 'FIRELAND';
  if (agency.includes('BVM')) return 'BVM HOLDINGS';
  if (agency.includes('AEON')) return 'AEON LAND';
  if (agency.includes('TRG')) return 'TRG';
  if (agency.includes('QTP')) return 'QTP';
  if (agency.includes('ANB')) return 'ANB';
  if (agency.includes('KNR')) return 'KNR';

  return agency || 'KHÁC';
}

/**
 * Tính toán hạn ngạch (quota) giải thưởng theo tỷ lệ thực tế (Hamilton / Largest Remainder)
 * Có cơ chế bảo đảm giải cho nhóm Khách mời và nhóm các sàn nhỏ.
 * @param {Array} participants Danh sách toàn bộ người chơi
 * @param {number} totalPrizes Tổng số giải (mặc định 16)
 * @returns {Object} { groupCounts, quotas, groupPrizes }
 */
/**
 * Tính toán hạn ngạch (quota) giải thưởng theo tỷ lệ thực tế (Hamilton / Largest Remainder)
 * LOẠI BỎ TOÀN BỘ KHÁCH MỜI KHỎI QUAY THƯỞNG, CHỈ PHÂN BỔ CHO CÁC SÀN/CÔNG TY.
 * @param {Array} participants Danh sách toàn bộ người chơi
 * @param {number} totalPrizes Tổng số giải (mặc định 16)
 * @returns {Object} { eligible, total, groupCounts, exactQuotas, groupPrizes }
 */
export function computeQuotas(participants, totalPrizes = 16) {
  // Lọc bỏ khách mời, chỉ giữ nhân viên các sàn
  const eligible = participants.filter(p => !isGuest(p));
  const total = eligible.length;
  if (total === 0) return { eligible: [], total: 0, groupCounts: {}, exactQuotas: {}, groupPrizes: {} };

  // 1. Đếm số lượng theo từng công ty
  const groupCounts = {};
  for (const p of eligible) {
    const comp = normalizeCompany(p);
    groupCounts[comp] = (groupCounts[comp] || 0) + 1;
  }

  // 2. Tính số giải lý thuyết chính xác (exact quota)
  const exactQuotas = {};
  const remainders = [];
  const groupPrizes = {};
  let allocatedCount = 0;

  for (const [comp, cnt] of Object.entries(groupCounts)) {
    const exact = (cnt / total) * totalPrizes;
    const base = Math.floor(exact);
    exactQuotas[comp] = exact;
    groupPrizes[comp] = base;
    allocatedCount += base;
    remainders.push({ group: comp, remainder: exact - base, count: cnt });
  }

  // 3. Phân bổ các suất còn lại cho nhóm có phần dư lớn nhất
  remainders.sort((a, b) => b.remainder - a.remainder);
  let slotsLeft = totalPrizes - allocatedCount;

  for (let i = 0; i < slotsLeft && i < remainders.length; i++) {
    groupPrizes[remainders[i].group] += 1;
  }

  return {
    eligible,
    total,
    groupCounts,
    exactQuotas,
    groupPrizes
  };
}

/**
 * Thuật toán quay số phân bổ thông minh (Smart Spin Draw):
 * Quay 16 người trúng giải thỏa mãn 100% hạn ngạch phân bổ theo tỷ lệ (đã loại khách mời).
 * @param {Array} participants Danh sách thí sinh
 * @param {number} totalPrizes Số giải (16)
 * @param {Set} usedIds Danh sách ID đã trúng trước đó
 * @returns {Array} 16 người trúng giải
 */
export function draw16Winners(participants, totalPrizes = 16, usedIds = new Set()) {
  const { eligible, groupPrizes } = computeQuotas(participants, totalPrizes);
  const currentGroupWins = {};
  for (const grp of Object.keys(groupPrizes)) {
    currentGroupWins[grp] = 0;
  }

  // Gom các ứng viên khả dụng theo công ty
  const poolByGroup = {};
  for (const p of eligible) {
    if (usedIds.has(p.id)) continue;
    const grp = normalizeCompany(p);
    if (!poolByGroup[grp]) poolByGroup[grp] = [];
    poolByGroup[grp].push(p);
  }

  const winners = [];

  // Quay từng giải một cách ngẫu nhiên có điều phối
  for (let round = 0; round < totalPrizes; round++) {
    // Tìm các nhóm vẫn còn hạn ngạch giải và còn người chưa trúng
    const eligibleGroups = Object.keys(groupPrizes).filter(
      grp => currentGroupWins[grp] < groupPrizes[grp] && poolByGroup[grp] && poolByGroup[grp].length > 0
    );

    if (eligibleGroups.length === 0) {
      // Fallback nếu có nhóm hết người
      const anyRemaining = eligible.filter(p => !usedIds.has(p.id) && !winners.some(w => w.id === p.id));
      if (anyRemaining.length > 0) {
        const rand = anyRemaining[Math.floor(Math.random() * anyRemaining.length)];
        winners.push(rand);
      }
      continue;
    }

    // Chọn nhóm ngẫu nhiên có trọng số theo số giải còn lại của nhóm đó
    const weightedGroups = [];
    for (const grp of eligibleGroups) {
      const remainingQuota = groupPrizes[grp] - currentGroupWins[grp];
      for (let w = 0; w < remainingQuota; w++) {
        weightedGroups.push(grp);
      }
    }
    const chosenGroup = weightedGroups[Math.floor(Math.random() * weightedGroups.length)];

    // Bốc ngẫu nhiên 1 người trong nhóm được chọn
    const groupPool = poolByGroup[chosenGroup];
    const pickedIdx = Math.floor(Math.random() * groupPool.length);
    const winner = groupPool.splice(pickedIdx, 1)[0];

    currentGroupWins[chosenGroup] += 1;
    winners.push({
      ...winner,
      assignedGroup: chosenGroup,
      rankIndex: round + 1
    });
  }

  return winners;
}
