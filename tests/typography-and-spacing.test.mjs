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

  await t.test('5. ca-nhan: screen-1-2 must have unified flow spacing for cards and CTA button', () => {
    assert.ok(
      caNhanCss.includes('#screen-1-2 .detail-cards-container'),
      'ca-nhan must define #screen-1-2 .detail-cards-container'
    );
    assert.ok(
      caNhanCss.includes('#screen-1-2 .detail-action-container'),
      'ca-nhan must define #screen-1-2 .detail-action-container'
    );
  });
});
