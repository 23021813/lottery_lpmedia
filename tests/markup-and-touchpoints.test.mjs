import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('MSB Interactive LED Touchpoints & Markup Integrity', () => {
  const htmlPath = path.resolve(process.cwd(), 'ca-nhan/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  test('detail-card and rewards-card must NOT have data-target or data-demo attributes', () => {
    // Check that neither detail-card nor rewards-card carries touch action attributes
    const cardWithActionRegex = /<article[^>]*class=["'][^"']*\b(detail-card|rewards-card)\b[^"']*["'][^>]*\b(data-target|data-demo)=/g;
    const matches = htmlContent.match(cardWithActionRegex);
    assert.equal(matches, null, `Found card with touch action: ${matches}`);
  });

  test('main screen feature cards must have data-target pointing to all 4 level-1 screens', () => {
    const featureCardMatches = [...htmlContent.matchAll(/<div[^>]*class=["'][^"']*\bfeature-card\b[^"']*["'][^>]*data-target=["']([^"']+)["']/g)];
    const targets = featureCardMatches.map(m => m[1]).sort();
    assert.deepEqual(targets, ['screen-1-1', 'screen-1-2', 'screen-1-3', 'screen-1-4']);
  });

  test('CTAs and action buttons in sub-screens must retain data-target or data-demo', () => {
    assert.ok(htmlContent.includes('data-demo="true"'), 'Should contain demo trigger buttons');
    assert.ok(htmlContent.includes('data-target="screen-1-3-1"'), 'Action button should point to 1-3-1');
    assert.ok(htmlContent.includes('data-target="screen-1-3-2"'), 'Action button should point to 1-3-2');
    assert.ok(htmlContent.includes('data-target="screen-1-4-1"'), 'Action button should point to 1-4-1');
    assert.ok(htmlContent.includes('data-target="screen-1-4-2"'), 'Action button should point to 1-4-2');
  });

  test('SPA has universal Back Button (btn-back #btnGlobalBack)', () => {
    assert.ok(htmlContent.includes('id="btnGlobalBack"'), 'Must have #btnGlobalBack element');
    assert.ok(htmlContent.includes('class="btn-back"'), 'Must have .btn-back class');
    assert.ok(htmlContent.includes('images/icon-back2.png'), 'Must use icon-back2.png');
  });
});
