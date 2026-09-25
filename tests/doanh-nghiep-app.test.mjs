import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appPath = path.resolve(__dirname, '../doanh-nghiep/js/app.js');

test('Doanh Nghiệp Motion & Controller Test Suite', async (t) => {
  assert.ok(fs.existsSync(appPath), 'doanh-nghiep/js/app.js must exist');
  const code = fs.readFileSync(appPath, 'utf8');

  await t.test('should import DoanhNghiepStateManager', () => {
    assert.match(code, /import\s+\{\s*DoanhNghiepStateManager\s*\}\s+from\s+['"]\.\/state-manager\.js['"]/);
  });

  await t.test('should configure 5-minute idle timeout (300000ms auto timeout back to idle)', () => {
    assert.match(code, /idleTimeoutMs:\s*300000/);
  });

  await t.test('should define all required animation methods', () => {
    assert.match(code, /animIdleToMain\s*\(/);
    assert.match(code, /animMainToLevel1\s*\(/);
    assert.match(code, /animLevel1ToMain\s*\(/);
    assert.match(code, /animPanHorizontal\s*\(/);
    assert.match(code, /openDemo\s*\(/);
    assert.match(code, /closeDemo\s*\(/);
    assert.match(code, /handleBackAction\s*\(/);
  });

  await t.test('should implement globe zoom to center in animMainToLevel1', () => {
    // Globe should shift from right (62.7%) to center (50% or -12.7% offset)
    assert.match(code, /62\.7%/);
    assert.match(code, /-12\.7%/);
  });

  await t.test('should support both desktop and phone demo modals', () => {
    assert.match(code, /modalDesktop/);
    assert.match(code, /modalPhone/);
  });

  await t.test('should maintain kiosk shortcuts (ESC, prevent contextmenu) and ensure swipe back is removed', () => {
    assert.doesNotMatch(code, /onSwipeEnd/, 'Swipe back gesture must be removed to avoid accidental back on Kiosk LED');
    assert.doesNotMatch(code, /onSwipeStart/, 'onSwipeStart must be removed');
    assert.match(code, /contextmenu/);
    assert.match(code, /dragstart/);
    assert.match(code, /Escape/);
  });

  await t.test('handleBackAction must only close demo and stay on current screen without navigating to screen-main when isDemoOpen', () => {
    assert.match(
      code,
      /handleBackAction\s*\(\)\s*\{[\s\S]*?if\s*\(\s*this\.isDemoOpen\s*\)\s*\{\s*this\.closeDemo\(\);\s*return;\s*\}[\s\S]*?this\.goBack\(\);/,
      'handleBackAction must only call this.closeDemo() and return when isDemoOpen is true'
    );
  });

  await t.test('navigateTo must call animLevel1ToMain when navigating to screen-main from inner screens (Home button behavior)', () => {
    assert.match(
      code,
      /else\s+if\s*\(\s*targetId\s*===\s*['"]screen-main['"]\s*&&\s*fromId\.startsWith\(['"]screen-1-['"]\)\s*\)\s*\{\s*this\.animLevel1ToMain\(/,
      'navigateTo must call animLevel1ToMain when target is screen-main from screen-1-*'
    );
  });
});
