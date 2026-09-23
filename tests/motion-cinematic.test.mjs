import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('MSB Cinematic Zoom & Snap Focus Motion Logic', () => {
  const appJsPath = path.resolve(process.cwd(), 'ca-nhan/js/app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf-8');

  test('animMainToLevel1 should contain blur/out-of-focus and transparent fade for bgMain', () => {
    // bgMain must zoom out with blur and fade
    assert.match(appJsContent, /filter:\s*['"]blur\(\d+px\)['"]/i, 'bgMain should have blur filter when zooming out');
    assert.match(appJsContent, /x:\s*['"]-12\.7%['"]/, 'bgMain must shift by -12.7% to center globe');
  });

  test('animMainToLevel1 should snap bgDetail to focus with 100% opacity and clear blur', () => {
    // bgDetail should snap into 100% sharp focus
    assert.match(appJsContent, /filter:\s*['"]blur\(0px\)['"]/, 'bgDetail must clear blur to 100% sharp');
    assert.match(appJsContent, /ease:\s*['"](back\.out|power3\.out)/i, 'bgDetail must use snap easing (back.out or power3.out)');
  });

  test('Static content should have delay to appear after globe snaps to center', () => {
    // Ensure delay/timeline position is applied to static text/cards (after globe snaps, >= 0.8s)
    const animMainToLevel1Section = appJsContent.substring(
      appJsContent.indexOf('animMainToLevel1(fromEl, toEl)'),
      appJsContent.indexOf('animLevel1ToMain(fromEl, toEl)')
    );
    assert.match(animMainToLevel1Section, /(1\.[1-9]|0\.[8-9])/, 'Static elements must wait for globe animation');
  });

  test('animLevel1ToMain should cleanly reverse motion back to right side with sharp focus', () => {
    const animLevel1ToMainSection = appJsContent.substring(
      appJsContent.indexOf('animLevel1ToMain('),
      appJsContent.indexOf('animSubToDemo(')
    );
    assert.match(animLevel1ToMainSection, /x:\s*['"]0%['"]/, 'bgMain should return to x: 0%');
    assert.match(animLevel1ToMainSection, /filter:\s*['"]blur\(0px\)['"]|filter:\s*['"]none['"]/, 'bgMain should return to sharp focus');
  });
});
