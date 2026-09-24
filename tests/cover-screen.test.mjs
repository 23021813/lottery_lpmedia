import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

describe('Cover Screen Integration Test Suite', () => {
  const caNhanCoverImg = path.join(ROOT_DIR, 'ca-nhan/images/COVER.jpg');
  const doanhNghiepCoverImg = path.join(ROOT_DIR, 'doanh-nghiep/images/COVER.jpg');
  const caNhanCoverHtml = path.join(ROOT_DIR, 'ca-nhan/cover.html');
  const doanhNghiepCoverHtml = path.join(ROOT_DIR, 'doanh-nghiep/cover.html');
  const caNhanCss = path.join(ROOT_DIR, 'ca-nhan/css/style.css');
  const doanhNghiepCss = path.join(ROOT_DIR, 'doanh-nghiep/css/style.css');
  const caNhanIndex = path.join(ROOT_DIR, 'ca-nhan/index.html');
  const doanhNghiepIndex = path.join(ROOT_DIR, 'doanh-nghiep/index.html');

  test('1. COVER.jpg assets must exist and have valid size for LED 1536x576', () => {
    assert.ok(fs.existsSync(caNhanCoverImg), 'ca-nhan/images/COVER.jpg must exist');
    assert.ok(fs.existsSync(doanhNghiepCoverImg), 'doanh-nghiep/images/COVER.jpg must exist');
    assert.ok(fs.statSync(caNhanCoverImg).size > 100000, 'ca-nhan/images/COVER.jpg must be non-empty high quality');
    assert.ok(fs.statSync(doanhNghiepCoverImg).size > 100000, 'doanh-nghiep/images/COVER.jpg must be non-empty high quality');
  });

  test('2. Standalone cover.html pages must exist and have stage with cover-screen class', () => {
    assert.ok(fs.existsSync(caNhanCoverHtml), 'ca-nhan/cover.html must exist');
    assert.ok(fs.existsSync(doanhNghiepCoverHtml), 'doanh-nghiep/cover.html must exist');

    const caNhanCoverContent = fs.readFileSync(caNhanCoverHtml, 'utf8');
    const doanhNghiepCoverContent = fs.readFileSync(doanhNghiepCoverHtml, 'utf8');

    assert.ok(caNhanCoverContent.includes('cover-screen'), 'ca-nhan/cover.html must include cover-screen class');
    assert.ok(doanhNghiepCoverContent.includes('cover-screen'), 'doanh-nghiep/cover.html must include cover-screen class');
  });

  test('3. CSS files must declare .cover-screen and #screen-idle using COVER.jpg', () => {
    const cnCss = fs.readFileSync(caNhanCss, 'utf8');
    const dnCss = fs.readFileSync(doanhNghiepCss, 'utf8');

    // Kiểm tra .cover-screen
    assert.ok(cnCss.includes('.cover-screen'), 'ca-nhan style.css must declare .cover-screen');
    assert.ok(/COVER\.jpg/i.test(cnCss), 'ca-nhan style.css must reference COVER.jpg');

    assert.ok(dnCss.includes('.cover-screen'), 'doanh-nghiep style.css must declare .cover-screen');
    assert.ok(/COVER\.jpg/i.test(dnCss), 'doanh-nghiep style.css must reference COVER.jpg');

    // Kiểm tra #screen-idle áp dụng COVER.jpg
    assert.ok(
      /#screen-idle[\s\S]*?COVER\.jpg/i.test(cnCss) || cnCss.includes(".cover-screen, #screen-idle") || cnCss.includes("#screen-idle.cover-screen"),
      'ca-nhan style.css must style #screen-idle with COVER.jpg'
    );
    assert.ok(
      /#screen-idle[\s\S]*?COVER\.jpg/i.test(dnCss) || dnCss.includes(".cover-screen, #screen-idle") || dnCss.includes("#screen-idle.cover-screen"),
      'doanh-nghiep style.css must style #screen-idle with COVER.jpg'
    );
  });

  test('4. SPA index.html files must integrate cover screen cleanly on #screen-idle', () => {
    const cnHtml = fs.readFileSync(caNhanIndex, 'utf8');
    const dnHtml = fs.readFileSync(doanhNghiepIndex, 'utf8');

    // ca-nhan/index.html: Không còn inline draft styles (radial-gradient cam đỏ inline hay SVG MSB inline cũ)
    assert.ok(cnHtml.includes('id="screen-idle"'), 'ca-nhan/index.html must have screen-idle');
    assert.ok(!cnHtml.includes('Màn hình chờ MSB (Nháp)'), 'ca-nhan/index.html must remove draft idle description');
    assert.ok(!cnHtml.includes('#db2900'), 'ca-nhan/index.html must remove old draft inline gradients');

    // doanh-nghiep/index.html: screen-idle phải được cấu hình dùng cover-screen
    assert.ok(dnHtml.includes('id="screen-idle"'), 'doanh-nghiep/index.html must have screen-idle');
  });
});
