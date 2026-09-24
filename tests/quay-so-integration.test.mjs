import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Quay Số Integration Test Suite', async (t) => {
  await t.test('1. Thư mục quay-so phải tồn tại với đầy đủ tệp tin cốt lõi', () => {
    assert.strictEqual(fs.existsSync('quay-so'), true, 'Thư mục quay-so phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/index.html'), true, 'quay-so/index.html phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/msb-planet-arc-bg.jpg'), true, 'msb-planet-arc-bg.jpg phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/data/data.csv'), true, 'quay-so/data/data.csv phải tồn tại');
  });

  await t.test('2. Tệp data/data.csv phải có dữ liệu hợp lệ', () => {
    const csvContent = fs.readFileSync('quay-so/data/data.csv', 'utf8');
    assert.ok(csvContent.length > 100, 'data.csv không được rỗng');
    assert.ok(csvContent.includes('\n'), 'data.csv phải có nhiều dòng');
  });

  await t.test('3. Tệp quay-so/index.html phải tham chiếu tài nguyên tương đối chính xác', () => {
    const html = fs.readFileSync('quay-so/index.html', 'utf8');
    assert.ok(html.includes('msb-planet-arc-bg.jpg'), 'Phải chứa hình nền msb-planet-arc-bg.jpg');
    assert.ok(html.includes('data/data.csv'), 'Phải fetch data/data.csv qua đường dẫn tương đối');
  });

  await t.test('4. Portal index.html phải chứa liên kết trỏ tới quay-so', () => {
    const portalHtml = fs.readFileSync('index.html', 'utf8');
    assert.ok(portalHtml.includes('quay-so/index.html') || portalHtml.includes('quay-so/'), 'Portal phải liên kết tới quay-so');
    assert.ok(portalHtml.includes('Quay Số') || portalHtml.includes('Lucky Draw'), 'Portal phải có tiêu đề Quay Số');
  });
});
