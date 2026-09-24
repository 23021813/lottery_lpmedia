import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppStateManager } from '../ca-nhan/js/state-manager.js';
import { DoanhNghiepStateManager } from '../doanh-nghiep/js/state-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Idle Timeout & Recovery Test Suite', () => {
  test('1. AppStateManager onTimeout should trigger callback with currentScreen context before forced wipe', (t, done) => {
    let capturedFromScreen = null;
    const state = new AppStateManager({
      initialScreen: 'screen-idle',
      idleTimeoutMs: 30,
      onTimeout: (fromScreen) => {
        capturedFromScreen = fromScreen;
      }
    });

    state.navigateTo('screen-main');
    state.navigateTo('screen-1-2');

    setTimeout(() => {
      assert.equal(capturedFromScreen, 'screen-1-2');
      done();
    }, 60);
  });

  test('2. DoanhNghiepStateManager onTimeout should pass fromScreen context before reset', (t, done) => {
    let capturedFromScreen = null;
    const state = new DoanhNghiepStateManager({
      initialScreen: 'screen-idle',
      idleTimeoutMs: 30,
      onTimeout: (fromScreen) => {
        capturedFromScreen = fromScreen;
      }
    });

    state.navigateTo('screen-main');
    state.navigateTo('screen-1-3');

    setTimeout(() => {
      assert.equal(capturedFromScreen, 'screen-1-3');
      done();
    }, 60);
  });

  test('3. AppStateManager self-healing goBack should safely fallback when history is unexpectedly empty', () => {
    const state = new AppStateManager({ initialScreen: 'screen-idle' });
    
    // Simulate navigation then corrupted / wiped history while on subscreen level 1
    state.currentScreen = 'screen-1-2';
    state.history = [];
    assert.equal(state.canGoBack(), true, 'Should allow back when stuck on subscreen');
    const back1 = state.goBack();
    assert.equal(back1, 'screen-main', 'Should self-heal back to screen-main');
    assert.equal(state.currentScreen, 'screen-main');

    // Simulate corrupted history on level 2 subscreen (1.3.1)
    state.currentScreen = 'screen-1-3-1';
    state.history = [];
    assert.equal(state.canGoBack(), true);
    const back2 = state.goBack();
    assert.equal(back2, 'screen-1-3', 'Should self-heal back to parent screen-1-3');
    assert.equal(state.currentScreen, 'screen-1-3');

    // Simulate corrupted history on level 2 subscreen (1.4.2)
    state.currentScreen = 'screen-1-4-2';
    state.history = [];
    const back3 = state.goBack();
    assert.equal(back3, 'screen-1-4', 'Should self-heal back to parent screen-1-4');

    // On main screen or idle screen, back should be null
    state.currentScreen = 'screen-main';
    state.history = [];
    assert.equal(state.canGoBack(), false);
    assert.equal(state.goBack(), null);

    state.currentScreen = 'screen-idle';
    state.history = [];
    assert.equal(state.canGoBack(), false);
    assert.equal(state.goBack(), null);
  });

  test('4. DoanhNghiepStateManager self-healing goBack should safely fallback when history is unexpectedly empty', () => {
    const state = new DoanhNghiepStateManager({ initialScreen: 'screen-idle' });

    // Level 1 subscreen (screen-1-2) with empty history
    state.currentScreen = 'screen-1-2';
    state.history = [];
    assert.equal(state.canGoBack(), true, 'Should allow back when stuck on subscreen');
    const back1 = state.goBack();
    assert.equal(back1, 'screen-main', 'Should self-heal back to screen-main');
    assert.equal(state.currentScreen, 'screen-main');

    // Level 2 subscreen (screen-1-3-3) with empty history
    state.currentScreen = 'screen-1-3-3';
    state.history = [];
    assert.equal(state.canGoBack(), true);
    const back2 = state.goBack();
    assert.equal(back2, 'screen-1-3', 'Should self-heal back to parent screen-1-3');
    assert.equal(state.currentScreen, 'screen-1-3');

    // On main or idle screen with empty history
    state.currentScreen = 'screen-main';
    state.history = [];
    assert.equal(state.canGoBack(), false);
    assert.equal(state.goBack(), null);

    state.currentScreen = 'screen-idle';
    state.history = [];
    assert.equal(state.canGoBack(), false);
    assert.equal(state.goBack(), null);
  });

  test('5. ca-nhan/js/app.js controller must implement screen cleanup, watchdog, and forceNavigateToIdle', () => {
    const code = fs.readFileSync(path.join(rootDir, 'ca-nhan/js/app.js'), 'utf8');

    // 1. forceNavigateToIdle and onTimeout connection
    assert.match(code, /forceNavigateToIdle\s*\(/, 'Must define forceNavigateToIdle');
    assert.match(code, /this\.forceNavigateToIdle\(\)/, 'onTimeout must call forceNavigateToIdle');

    // 2. cleanupScreens method
    assert.match(code, /cleanupScreens\s*\(\s*activeId\s*\)/, 'Must define cleanupScreens');

    // 3. Watchdog timers
    assert.match(code, /startAnimWatchdog\s*\(/, 'Must define startAnimWatchdog');
    assert.match(code, /clearAnimWatchdog\s*\(/, 'Must define clearAnimWatchdog');

    // 4. getActiveScreenIdFromDOM self-healing
    assert.match(code, /getActiveScreenIdFromDOM\s*\(/, 'Must define getActiveScreenIdFromDOM');

    // 5. All GSAP transitions must call cleanupScreens
    assert.match(code, /animIdleToMain[\s\S]*?cleanupScreens/, 'animIdleToMain must invoke cleanupScreens');
    assert.match(code, /animMainToLevel1[\s\S]*?cleanupScreens/, 'animMainToLevel1 must invoke cleanupScreens');
    assert.match(code, /animLevel1ToMain[\s\S]*?cleanupScreens/, 'animLevel1ToMain must invoke cleanupScreens');
    assert.match(code, /animPanHorizontal[\s\S]*?cleanupScreens/, 'animPanHorizontal must invoke cleanupScreens');
    assert.match(code, /animDefaultCrossfade[\s\S]*?cleanupScreens/, 'animDefaultCrossfade must invoke cleanupScreens');
  });

  test('6. doanh-nghiep/js/app.js controller must implement screen cleanup, watchdog, and forceNavigateToIdle', () => {
    const code = fs.readFileSync(path.join(rootDir, 'doanh-nghiep/js/app.js'), 'utf8');

    // 1. forceNavigateToIdle and onTimeout connection
    assert.match(code, /forceNavigateToIdle\s*\(/, 'Must define forceNavigateToIdle');
    assert.match(code, /this\.forceNavigateToIdle\(\)/, 'onTimeout must call forceNavigateToIdle');

    // 2. cleanupScreens method
    assert.match(code, /cleanupScreens\s*\(\s*activeId\s*\)/, 'Must define cleanupScreens');

    // 3. Watchdog timers
    assert.match(code, /startAnimWatchdog\s*\(/, 'Must define startAnimWatchdog');
    assert.match(code, /clearAnimWatchdog\s*\(/, 'Must define clearAnimWatchdog');

    // 4. getActiveScreenIdFromDOM self-healing
    assert.match(code, /getActiveScreenIdFromDOM\s*\(/, 'Must define getActiveScreenIdFromDOM');

    // 5. All GSAP transitions must call cleanupScreens
    assert.match(code, /animIdleToMain[\s\S]*?cleanupScreens/, 'animIdleToMain must invoke cleanupScreens');
    assert.match(code, /animMainToLevel1[\s\S]*?cleanupScreens/, 'animMainToLevel1 must invoke cleanupScreens');
    assert.match(code, /animLevel1ToMain[\s\S]*?cleanupScreens/, 'animLevel1ToMain must invoke cleanupScreens');
    assert.match(code, /animPanHorizontal[\s\S]*?cleanupScreens/, 'animPanHorizontal must invoke cleanupScreens');
    assert.match(code, /animDefaultCrossfade[\s\S]*?cleanupScreens/, 'animDefaultCrossfade must invoke cleanupScreens');
  });
});
