import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.resolve(__dirname, '../doanh-nghiep/index.html');

test('Doanh Nghiệp Markup & SPA Structure Test Suite', async (t) => {
  assert.ok(fs.existsSync(htmlPath), 'doanh-nghiep/index.html must exist');
  const html = fs.readFileSync(htmlPath, 'utf8');

  await t.test('should have proper viewport and title for LED Kiosk 1535x576', () => {
    assert.match(html, /<meta\s+name=["']viewport["']/i);
    assert.match(html, /<title>.*MSB.*<\/title>/i);
    assert.match(html, /css\/style\.css/);
    assert.match(html, /js\/gsap\.min\.js/);
    assert.match(html, /js\/app\.js/);
  });

  await t.test('should contain all 10 required screen sections', () => {
    const requiredScreens = [
      'screen-idle',
      'screen-main',
      'screen-1-1',
      'screen-1-2',
      'screen-1-3',
      'screen-1-3-1',
      'screen-1-3-2',
      'screen-1-3-3',
      'screen-1-3-4',
      'screen-1-3-5'
    ];

    for (const screenId of requiredScreens) {
      const regex = new RegExp(`id=["']${screenId}["']`, 'i');
      assert.ok(regex.test(html), `Must contain screen section with id="${screenId}"`);
    }
  });

  await t.test('should contain both desktop and phone demo modals', () => {
    assert.match(html, /id=["']screen-demo-desktop["']/);
    assert.match(html, /id=["']screen-demo-phone["']/);
    assert.match(html, /man-hinh\.png/);
    assert.match(html, /my-phone\.png/);
  });

  await t.test('should contain background layers for globe and detail transition', () => {
    assert.match(html, /id=["']bgLayerMain["']/);
    assert.match(html, /id=["']bgLayerDetail["']/);
  });

  await t.test('should contain side navigation docks on both sides with Home and Back buttons', () => {
    assert.match(html, /id=["']navDockLeft["']/);
    assert.match(html, /id=["']navDockRight["']/);
    assert.match(html, /class=["'][^"']*\bnav-dock-side\b[^"']*["']/);
    assert.match(html, /data-nav=["']home["']/);
    assert.match(html, /data-nav=["']back["']/);
  });

  await t.test('should enforce kiosk touchscreen checklist in HTML', () => {
    // 1. Viewport must prevent pinch zoom
    assert.match(html, /user-scalable\s*=\s*no/i);
    assert.match(html, /maximum-scale\s*=\s*1\.0/i);

    // 2. No tabindex="0" on informative toiuu-card elements
    assert.doesNotMatch(html, /class=["'][^"']*\btoiuu-card\b[^"']*["'][^>]*tabindex=["']0["']/i);
    assert.doesNotMatch(html, /tabindex=["']0["'][^>]*class=["'][^"']*\btoiuu-card\b[^"']*["']/i);

    // 3. Images must have draggable="false"
    assert.match(html, /draggable=["']false["']/);
  });

  await t.test('should configure touchpoints correctly: only buttons trigger navigation/modals', () => {
    // Check main screen 3 cards
    assert.match(html, /data-screen=["']screen-1-3["']/); // card-toiuu
    assert.match(html, /data-screen=["']screen-1-1["']/); // card-linhhoat
    assert.match(html, /data-screen=["']screen-1-2["']/); // card-lienmach

    // Check 1.3 sub-links
    assert.match(html, /data-screen=["']screen-1-3-1["']/);
    assert.match(html, /data-screen=["']screen-1-3-2["']/);
    assert.match(html, /data-screen=["']screen-1-3-3["']/);
    assert.match(html, /data-screen=["']screen-1-3-4["']/);
    assert.match(html, /data-screen=["']screen-1-3-5["']/);

    // Check demo triggers have data-demo-type or demo trigger action
    assert.match(html, /class=["'][^"']*rewards-action-container[^"']*["']/);
  });

  await t.test('should enable full clicking on toiuu-card on screen-1-3 to navigate to sub-screens', () => {
    // Verify each toiuu-card on screen-1-3 has data-screen and role="button"
    assert.match(html, /class=["'][^"']*\btoiuu-card\b[^"']*["'][^>]*data-screen=["']screen-1-3-1["'][^>]*role=["']button["']/);
    assert.match(html, /class=["'][^"']*\btoiuu-card\b[^"']*["'][^>]*data-screen=["']screen-1-3-2["'][^>]*role=["']button["']/);
    assert.match(html, /class=["'][^"']*\btoiuu-card\b[^"']*["'][^>]*data-screen=["']screen-1-3-3["'][^>]*role=["']button["']/);
    assert.match(html, /class=["'][^"']*\btoiuu-card\b[^"']*["'][^>]*data-screen=["']screen-1-3-4["'][^>]*role=["']button["']/);
    assert.match(html, /class=["'][^"']*\btoiuu-card\b[^"']*["'][^>]*data-screen=["']screen-1-3-5["'][^>]*role=["']button["']/);

    // Verify toiuu-card-link also has data-screen
    assert.match(html, /class=["'][^"']*\btoiuu-card-link\b[^"']*["'][^>]*data-screen=["']screen-1-3-1["']/);
    assert.match(html, /class=["'][^"']*\btoiuu-card-link\b[^"']*["'][^>]*data-screen=["']screen-1-3-5["']/);
  });

  await t.test('should contain divider-line in all 5 sub-screens of Tối ưu (screen-1-3-1 to screen-1-3-5)', () => {
    const subScreens = ['screen-1-3-1', 'screen-1-3-2', 'screen-1-3-3', 'screen-1-3-4', 'screen-1-3-5'];
    for (const subId of subScreens) {
      const sectionRegex = new RegExp(`<section[^>]*id=["']${subId}["'][\\s\\S]*?<\\/section>`, 'i');
      const match = html.match(sectionRegex);
      assert.ok(match, `Section with id="${subId}" must exist`);
      assert.match(match[0], /<div\s+class=["']divider-line["']\s+aria-hidden=["']true["']\s*><\/div>/, `${subId} must contain divider-line`);
    }
  });

  await t.test('ca-nhan should contain bgLayerMarketplace and proper card dimensions', () => {
    const caNhanHtmlPath = path.resolve(__dirname, '../ca-nhan/index.html');
    const caNhanCssPath = path.resolve(__dirname, '../ca-nhan/css/style.css');
    const caNhanHtml = fs.readFileSync(caNhanHtmlPath, 'utf8');
    const caNhanCss = fs.readFileSync(caNhanCssPath, 'utf8');

    assert.match(caNhanHtml, /id=["']bgLayerMarketplace["']/);
    assert.match(caNhanCss, /#bgLayerMarketplace\s*{[^}]*bg_marketplace\.jpg/);
    assert.match(caNhanCss, /\.detail-card\s*{[^}]*width:\s*clamp\(180px,\s*20cqw,\s*300px\)/);
    assert.match(caNhanCss, /\.rewards-cards-container\s+\.rewards-card\s*{[^}]*width:\s*clamp\(160px,\s*16\.2cqw,\s*250px\)/);
  });
});

