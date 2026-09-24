import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Quay Số Integration Test Suite', async (t) => {
  await t.test('1. Thư mục quay-so phải tồn tại với đầy đủ tệp tin cốt lõi', () => {
    assert.strictEqual(fs.existsSync('quay-so'), true, 'Thư mục quay-so phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/Final.html'), true, 'quay-so/Final.html phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/index.html'), true, 'quay-so/index.html phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/data/data.csv'), true, 'quay-so/data/data.csv phải tồn tại');
  });

  await t.test('2. Tệp video chuẩn bg-quayso-1344x576.mp4 phải tồn tại và có dung lượng hợp lệ', () => {
    const videoPath = 'quay-so/bg-quayso-1344x576.mp4';
    assert.strictEqual(fs.existsSync(videoPath), true, 'File video bg-quayso-1344x576.mp4 phải tồn tại');
    const stat = fs.statSync(videoPath);
    assert.ok(stat.size > 1024 * 1024, 'File video phải lớn hơn 1MB');
  });

  await t.test('3. Tệp Final.html phải loại bỏ hoàn toàn background ảnh tĩnh cũ và poster cũ', () => {
    const finalHtml = fs.readFileSync('quay-so/Final.html', 'utf8');
    assert.strictEqual(
      finalHtml.includes('background-image: url("msb-planet-arc-bg.jpg")') ||
      finalHtml.includes("background-image: url('msb-planet-arc-bg.jpg')"),
      false,
      'Final.html không được dùng msb-planet-arc-bg.jpg làm background-image'
    );
    assert.strictEqual(
      finalHtml.includes('poster="msb-planet-arc-bg.jpg"'),
      false,
      'Final.html không được đặt poster ảnh cũ cho video'
    );
  });

  await t.test('4. Tệp Final.html phải loại bỏ hoặc vô hiệu hóa hoàn toàn hiệu ứng sao rơi vũ trụ', () => {
    const finalHtml = fs.readFileSync('quay-so/Final.html', 'utf8');
    assert.strictEqual(
      finalHtml.includes('requestAnimationFrame(animateCosmos)'),
      false,
      'Final.html không được chạy vòng lặp animateCosmos vẽ sao rơi'
    );
  });

  await t.test('5. Tệp Final.html phải có thẻ <video> nền MP4 duy nhất với autoplay, loop, muted, playsinline', () => {
    const finalHtml = fs.readFileSync('quay-so/Final.html', 'utf8');
    assert.ok(
      finalHtml.includes('bg-quayso-1344x576.mp4'),
      'Final.html phải tham chiếu video bg-quayso-1344x576.mp4 (cropped cho man LED 1344x576)'
    );
    assert.ok(finalHtml.includes('autoplay'), 'Video phải có thuộc tính autoplay');
    assert.ok(finalHtml.includes('loop'), 'Video phải có thuộc tính loop');
    assert.ok(finalHtml.includes('muted'), 'Video phải có thuộc tính muted');
    assert.ok(finalHtml.includes('playsinline'), 'Video phải có thuộc tính playsinline');
  });

  await t.test('6. Tệp quay-so/index.html phải đồng bộ với Final.html', () => {
    const indexHtml = fs.readFileSync('quay-so/index.html', 'utf8');
    assert.strictEqual(
      indexHtml.includes('requestAnimationFrame(animateCosmos)'),
      false,
      'index.html không được chạy vòng lặp animateCosmos vẽ sao rơi'
    );
    assert.strictEqual(
      indexHtml.includes('poster="msb-planet-arc-bg.jpg"'),
      false,
      'index.html không được có poster ảnh tĩnh cũ'
    );
  });

  await t.test('7. Các tệp thừa (video gốc 37MB, ảnh tĩnh cũ, file server tạm) phải được loại bỏ', () => {
    assert.strictEqual(fs.existsSync('quay-so/BACKGROUND QUAY SO.mp4'), false, 'BACKGROUND QUAY SO.mp4 cũ phải được gỡ bỏ');
    assert.strictEqual(fs.existsSync('quay-so/msb-planet-arc-bg.jpg'), false, 'msb-planet-arc-bg.jpg phải được gỡ bỏ');
    assert.strictEqual(fs.existsSync('quay-so/QUAYSO.jpg'), false, 'QUAYSO.jpg không sử dụng phải được gỡ bỏ');
    assert.strictEqual(fs.existsSync('range_server.py'), false, 'range_server.py tạm phải được gỡ bỏ');
  });
});
