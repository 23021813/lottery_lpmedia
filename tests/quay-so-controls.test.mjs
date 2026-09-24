import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Quay Số Controls and Speed Test Suite', async (t) => {
  const finalHtml = fs.readFileSync('quay-so/Final.html', 'utf8');

  await t.test('1. Final.html phải có nút điều khiển #lotteryControlBtn và không có onclick vào slotMachineContainer', () => {
    assert.ok(
      finalHtml.includes('id="lotteryControlBtn"'),
      'Final.html phải có nút bấm với id lotteryControlBtn'
    );
    assert.ok(
      finalHtml.includes('QUAY SỐ'),
      'Nút điều khiển ban đầu phải có nhãn QUAY SỐ'
    );
    assert.strictEqual(
      finalHtml.includes('onclick="handleSlotClick()"'),
      false,
      'slotMachineContainer không được gán onclick="handleSlotClick()"'
    );
  });

  await t.test('2. Final.html phải loại bỏ hoàn toàn thanh hướng dẫn phím Space và gợi ý phím tắt modal', () => {
    assert.strictEqual(
      finalHtml.includes('id="spaceHintBar"'),
      false,
      'Final.html không được chứa thẻ #spaceHintBar'
    );
    assert.strictEqual(
      finalHtml.includes('class="modal-keyboard-hints"'),
      false,
      'Final.html không được chứa phần hướng dẫn phím tắt modal'
    );
  });

  await t.test('3. Final.html phải loại bỏ lắng nghe sự kiện bàn phím keydown', () => {
    assert.strictEqual(
      finalHtml.includes('window.addEventListener("keydown"'),
      false,
      'Final.html không được đăng ký sự kiện keydown'
    );
    assert.strictEqual(
      finalHtml.includes("window.addEventListener('keydown'"),
      false,
      'Final.html không được đăng ký sự kiện keydown'
    );
  });

  await t.test('4. Final.html phải giảm tốc độ quay cơ sở baseSpeed (tất cả <= 30 px/frame)', () => {
    const match = finalHtml.match(/const\s+baseSpeed\s*=\s*\[([^\]]+)\]/);
    assert.ok(match, 'Phải tìm thấy khai báo baseSpeed trong Final.html');
    const speeds = match[1].split(',').map((s) => parseFloat(s.trim()));
    assert.strictEqual(speeds.length, 4, 'baseSpeed phải có 4 phần tử cho 4 cột');
    speeds.forEach((spd, idx) => {
      assert.ok(
        spd <= 30,
        `Tốc độ cột ${idx} (${spd}) phải chậm lại (<= 30 px/frame)`
      );
    });
  });

  await t.test('5. Final.html không được tự động dừng sau 5-7 giây (bỏ spinTimeoutId trong startSpin)', () => {
    const startSpinMatch = finalHtml.match(/function\s+startSpin\s*\(\)\s*\{([\s\S]*?)\n\s*function\s+/);
    assert.ok(startSpinMatch, 'Phải tìm thấy hàm startSpin trong Final.html');
    const startSpinBody = startSpinMatch[1];
    assert.strictEqual(
      startSpinBody.includes('spinTimeoutId = setTimeout'),
      false,
      'startSpin không được đặt timeout tự động dừng'
    );
  });

  await t.test('6. Final.html không được tự động quay tiếp khi bấm VẮNG MẶT', () => {
    const absentMatch = finalHtml.match(/function\s+handleWinnerAbsent\s*\(\)\s*\{([\s\S]*?)\n\s*function\s+/);
    assert.ok(absentMatch, 'Phải tìm thấy hàm handleWinnerAbsent trong Final.html');
    const absentBody = absentMatch[1];
    assert.strictEqual(
      absentBody.includes('startSpin()'),
      false,
      'handleWinnerAbsent không được tự động gọi startSpin()'
    );
  });
});
