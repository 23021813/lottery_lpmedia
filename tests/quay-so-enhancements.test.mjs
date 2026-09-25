import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Quay Số Enhancements Test Suite', async (t) => {
  const finalHtml = fs.readFileSync('quay-so/Final.html', 'utf8');

  await t.test('1. Thứ tự giải thưởng trong Dropdown và PRIZE_CONFIG phải là: Vũ Trụ -> Ngân Hà -> Tinh Tú', () => {
    // 1.1 Kiểm tra thứ tự trong PRIZE_CONFIG
    const vuTruIndex = finalHtml.indexOf('"Vũ Trụ":');
    const nganHaIndex = finalHtml.indexOf('"Ngân Hà":');
    const tinhTuIndex = finalHtml.indexOf('"Tinh Tú":');

    assert.ok(vuTruIndex !== -1, 'PRIZE_CONFIG phải có giải Vũ Trụ');
    assert.ok(nganHaIndex !== -1, 'PRIZE_CONFIG phải có giải Ngân Hà');
    assert.ok(tinhTuIndex !== -1, 'PRIZE_CONFIG phải có giải Tinh Tú');
    assert.ok(
      vuTruIndex < nganHaIndex && nganHaIndex < tinhTuIndex,
      'Thứ tự trong PRIZE_CONFIG phải là Vũ Trụ -> Ngân Hà -> Tinh Tú'
    );

    // 1.2 Kiểm tra thứ tự trong #prizeDropdownMenu
    const menuMatch = finalHtml.match(/id="prizeDropdownMenu"[^>]*>([\s\S]*?)<\/div>/);
    assert.ok(menuMatch, 'Phải tìm thấy thẻ #prizeDropdownMenu trong Final.html');
    const menuHtml = menuMatch[1];
    const vuTruBtnIdx = menuHtml.indexOf('data-tier="Vũ Trụ"');
    const nganHaBtnIdx = menuHtml.indexOf('data-tier="Ngân Hà"');
    const tinhTuBtnIdx = menuHtml.indexOf('data-tier="Tinh Tú"');

    assert.ok(
      vuTruBtnIdx < nganHaBtnIdx && nganHaBtnIdx < tinhTuBtnIdx,
      'Thứ tự các nút trong #prizeDropdownMenu phải từ trên xuống: Vũ Trụ -> Ngân Hà -> Tinh Tú'
    );

    // 1.3 Mặc định ban đầu chọn Giải Vũ Trụ
    assert.ok(
      finalHtml.includes('currentSelectedTier = "Vũ Trụ"') ||
      finalHtml.includes("currentSelectedTier = 'Vũ Trụ'"),
      'currentSelectedTier ban đầu phải là Vũ Trụ'
    );
    assert.ok(
      finalHtml.includes('id="currentPrizeTitle">\n            GIẢI VŨ TRỤ') ||
      finalHtml.includes('id="currentPrizeTitle">GIẢI VŨ TRỤ') ||
      finalHtml.includes('GIẢI VŨ TRỤ\n          </div>'),
      'Tiêu đề ban đầu ở Trigger phải là GIẢI VŨ TRỤ'
    );
  });

  await t.test('2. Khung quay số phải to lên hơn nữa (ô số width >= 220px, height >= 280px, font >= 170px)', () => {
    // 2.1 Kiểm tra kích thước .slot-cell trong CSS
    const cellMatch = finalHtml.match(/\.slot-cell\s*\{([\s\S]*?)\}/);
    assert.ok(cellMatch, 'Phải tìm thấy class .slot-cell trong CSS');
    const cellCss = cellMatch[1];
    const wMatch = cellCss.match(/width:\s*(\d+)px/);
    const hMatch = cellCss.match(/height:\s*(\d+)px/);
    assert.ok(wMatch && parseInt(wMatch[1], 10) >= 220, '.slot-cell width phải to lên >= 220px');
    assert.ok(hMatch && parseInt(hMatch[1], 10) >= 280, '.slot-cell height phải to lên >= 280px');

    // 2.2 Kiểm tra kích thước .digit-item
    const digitMatch = finalHtml.match(/\.digit-item\s*\{([\s\S]*?)\}/);
    assert.ok(digitMatch, 'Phải tìm thấy class .digit-item trong CSS');
    const digitCss = digitMatch[1];
    const fontMatch = digitCss.match(/font-size:\s*(\d+)px/);
    assert.ok(fontMatch && parseInt(fontMatch[1], 10) >= 170, '.digit-item font-size phải to lên >= 170px');
  });

  await t.test('3. Modal trúng giải phải to tỷ lệ theo (max-width >= 650px, số trúng >= 65px, tên >= 30px)', () => {
    const cardMatch = finalHtml.match(/\.modal-card\s*\{([\s\S]*?)\}/);
    assert.ok(cardMatch, 'Phải tìm thấy class .modal-card trong CSS');
    const cardCss = cardMatch[1];
    const maxWMatch = cardCss.match(/max-width:\s*(\d+)px/);
    assert.ok(maxWMatch && parseInt(maxWMatch[1], 10) >= 650, '.modal-card max-width phải to lên >= 650px');

    const badgeMatch = finalHtml.match(/\.modal-code-badge\s*\{([\s\S]*?)\}/);
    assert.ok(badgeMatch, 'Phải tìm thấy class .modal-code-badge trong CSS');
    const badgeCss = badgeMatch[1];
    const badgeFontMatch = badgeCss.match(/font-size:\s*(\d+)px/);
    assert.ok(badgeFontMatch && parseInt(badgeFontMatch[1], 10) >= 65, '.modal-code-badge font-size phải >= 65px');

    const nameMatch = finalHtml.match(/\.modal-winner-name\s*\{([\s\S]*?)\}/);
    assert.ok(nameMatch, 'Phải tìm thấy class .modal-winner-name trong CSS');
    const nameCss = nameMatch[1];
    const nameFontMatch = nameCss.match(/font-size:\s*(\d+)px/);
    assert.ok(nameFontMatch && parseInt(nameFontMatch[1], 10) >= 30, '.modal-winner-name font-size phải >= 30px');
  });

  await t.test('4. Cơ chế dừng số phải có Watchdog Fallback Timer và chống lơ lửng số', () => {
    // 4.1 Kiểm tra stopSingleStrip có fallback timer đảm bảo snap số
    assert.ok(
      finalHtml.includes('stopFallbackTimer') ||
      finalHtml.includes('snapWatchdog') ||
      (finalHtml.includes('setTimeout') && finalHtml.includes('setStripTransform(col, targetY)')),
      'Phải có cơ chế đảm bảo setStripTransform(col, targetY) khi kết thúc animation'
    );
    // 4.2 STRIP_REPEAT phải lớn (>= 30) để không bao giờ bị tràn dải số
    const repeatMatch = finalHtml.match(/const\s+STRIP_REPEAT\s*=\s*(\d+)/);
    assert.ok(repeatMatch, 'Phải có khai báo STRIP_REPEAT');
    assert.ok(
      parseInt(repeatMatch[1], 10) >= 30,
      'STRIP_REPEAT phải >= 30 để dải số đủ dài'
    );
  });
});
