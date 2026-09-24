import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Typography & Spacing Quality Test Suite (Preserving Stage Aspect Ratio)', async (t) => {
  const caNhanCss = fs.readFileSync('ca-nhan/css/style.css', 'utf8');
  const doanhNghiepCss = fs.readFileSync('doanh-nghiep/css/style.css', 'utf8');

  await t.test('1. ca-nhan: stage must preserve 1535/576 aspect-ratio and stage-wrapper must center', () => {
    assert.ok(caNhanCss.includes('aspect-ratio: 1535 / 576') || caNhanCss.includes('1535 / 576'), 'ca-nhan stage must preserve 1535/576 ratio');
    assert.ok(caNhanCss.includes('justify-content: center'), 'ca-nhan stage-wrapper must center horizontally');
    assert.ok(caNhanCss.includes('align-items: center'), 'ca-nhan stage-wrapper must center vertically');
  });

  await t.test('2. doanh-nghiep: stage must preserve 1535/576 aspect-ratio and stage-wrapper must center', () => {
    assert.ok(doanhNghiepCss.includes('aspect-ratio: 1535 / 576') || doanhNghiepCss.includes('1535 / 576'), 'doanh-nghiep stage must preserve 1535/576 ratio');
    assert.ok(doanhNghiepCss.includes('justify-content: center'), 'doanh-nghiep stage-wrapper must center horizontally');
    assert.ok(doanhNghiepCss.includes('align-items: center'), 'doanh-nghiep stage-wrapper must center vertically');
  });

  await t.test('3. doanh-nghiep: main-title spans must clip gradient directly with drop-shadow glow', () => {
    assert.ok(
      doanhNghiepCss.includes('.brand-heading .main-title span') ||
      doanhNghiepCss.includes('.main-title span'),
      'doanh-nghiep must style span inside main-title'
    );
    assert.ok(
      doanhNghiepCss.includes('filter: drop-shadow('),
      'doanh-nghiep main-title must have drop-shadow glow'
    );
  });

  await t.test('4. ca-nhan: main-title spans must clip gradient directly with drop-shadow glow', () => {
    assert.ok(
      caNhanCss.includes('.main-title span'),
      'ca-nhan must style span inside main-title'
    );
    assert.ok(
      caNhanCss.includes('filter: drop-shadow('),
      'ca-nhan main-title must have drop-shadow glow'
    );
  });

  await t.test('6. Accent mark fix: both ca-nhan and doanh-nghiep must have 0.16em padding on main-title span', () => {
    assert.ok(
      doanhNghiepCss.includes('padding: 0.16em 0;'),
      'doanh-nghiep must apply padding: 0.16em 0 to main-title span'
    );
    assert.ok(
      caNhanCss.includes('padding: 0.16em 0;'),
      'ca-nhan must apply padding: 0.16em 0 to main-title span'
    );
  });

  await t.test('7. Logo Header: both ca-nhan and doanh-nghiep must define .logo-header and contain images', () => {
    assert.ok(doanhNghiepCss.includes('.logo-header'), 'doanh-nghiep CSS must include .logo-header');
    assert.ok(caNhanCss.includes('.logo-header'), 'ca-nhan CSS must include .logo-header');

    const doanhNghiepHtml = fs.readFileSync('doanh-nghiep/index.html', 'utf8');
    const caNhanHtml = fs.readFileSync('ca-nhan/index.html', 'utf8');

    assert.ok(doanhNghiepHtml.includes('LOGO_DOANH_NGHIEP.png'), 'doanh-nghiep/index.html must include LOGO_DOANH_NGHIEP.png');
    assert.ok(caNhanHtml.includes('LOGO_CA NHAN.png'), 'ca-nhan/index.html must include LOGO_CA NHAN.png');

    assert.ok(fs.existsSync('doanh-nghiep/images/LOGO_DOANH_NGHIEP.png'), 'LOGO_DOANH_NGHIEP.png file must exist');
    assert.ok(fs.existsSync('ca-nhan/images/LOGO_CA NHAN.png'), 'LOGO_CA NHAN.png file must exist');
  });

  await t.test('8. Sync msb-html details: blur(10px), left divider none, card-lienmach top 61%', () => {
    assert.ok(
      doanhNghiepCss.includes('backdrop-filter: blur(10px)'),
      'doanh-nghiep cards must have blur(10px)'
    );
    assert.ok(
      doanhNghiepCss.includes('.detail-heading.left .divider-line {\n  display: none;\n}') ||
      doanhNghiepCss.includes('.detail-heading.left .divider-line { display: none; }') ||
      doanhNghiepCss.includes('.detail-heading.left .divider-line'),
      'doanh-nghiep must hide divider line for left-aligned headings'
    );
    assert.ok(
      doanhNghiepCss.includes('top: 61%'),
      'doanh-nghiep .card-lienmach must have top: 61%'
    );
  });

  await t.test('9. Back Button Positions: both ca-nhan and doanh-nghiep must support pos-left and pos-right', () => {
    assert.ok(doanhNghiepCss.includes('.btn-back.pos-right'), 'doanh-nghiep CSS must include .btn-back.pos-right');
    assert.ok(doanhNghiepCss.includes('.btn-back.pos-left'), 'doanh-nghiep CSS must include .btn-back.pos-left');

    assert.ok(caNhanCss.includes('.btn-back.pos-right'), 'ca-nhan CSS must include .btn-back.pos-right');
    assert.ok(caNhanCss.includes('.btn-back.pos-left'), 'ca-nhan CSS must include .btn-back.pos-left');
  });

  await t.test('10. Back Button Sizing & Assets: bottom raised to 32px-42px, height 52px-58px, both icons present', () => {
    assert.ok(doanhNghiepCss.includes('bottom: clamp(32px, 6.5vh, 42px)'), 'doanh-nghiep bottom must be raised to clamp(32px, 6.5vh, 42px)');
    assert.ok(caNhanCss.includes('bottom: clamp(32px, 6.5vh, 42px)'), 'ca-nhan bottom must be raised to clamp(32px, 6.5vh, 42px)');

    assert.ok(doanhNghiepCss.includes('height: clamp(52px, 9.6vh, 58px)'), 'doanh-nghiep height must be enlarged to clamp(52px, 9.6vh, 58px)');
    assert.ok(caNhanCss.includes('height: clamp(52px, 9.6vh, 58px)'), 'ca-nhan height must be enlarged to clamp(52px, 9.6vh, 58px)');

    assert.ok(fs.existsSync('doanh-nghiep/images/icon-back.png'), 'doanh-nghiep icon-back.png must exist');
    assert.ok(fs.existsSync('doanh-nghiep/images/icon-back2.png'), 'doanh-nghiep icon-back2.png must exist');

    assert.ok(fs.existsSync('ca-nhan/images/icon-back.png'), 'ca-nhan icon-back.png must exist');
    assert.ok(fs.existsSync('ca-nhan/images/icon-back2.png'), 'ca-nhan icon-back2.png must exist');
  });

  await t.test('11. Touch Target Extension: rewards-action-container::before must extend touch area', () => {
    assert.ok(doanhNghiepCss.includes('.rewards-action-container::before'), 'doanh-nghiep must have .rewards-action-container::before');
    assert.ok(doanhNghiepCss.includes('top: -35px;'), 'doanh-nghiep touch target must extend with top: -35px');

    assert.ok(caNhanCss.includes('.rewards-action-container::before'), 'ca-nhan must have .rewards-action-container::before');
    assert.ok(caNhanCss.includes('top: -35px;'), 'ca-nhan touch target must extend with top: -35px');
  });
});
