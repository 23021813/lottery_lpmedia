import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Import or mock the Core State Machine that will power app.js
import { AppStateManager } from '../ca-nhan/js/state-manager.js';

describe('AppStateManager - SPA Navigation & History Stack', () => {
  let state;

  beforeEach(() => {
    state = new AppStateManager({
      initialScreen: 'screen-idle',
      idleTimeoutMs: 60000
    });
  });

  test('should initialize with screen-idle and empty history', () => {
    assert.equal(state.currentScreen, 'screen-idle');
    assert.deepEqual(state.history, []);
  });

  test('should navigate from idle to screen-main', () => {
    state.navigateTo('screen-main');
    assert.equal(state.currentScreen, 'screen-main');
    assert.deepEqual(state.history, ['screen-idle']);
  });

  test('should navigate through hierarchy: idle -> main -> 1.3 -> 1.3.1 -> demo', () => {
    state.navigateTo('screen-main');
    state.navigateTo('screen-1-3');
    state.navigateTo('screen-1-3-1');
    state.navigateTo('screen-demo');

    assert.equal(state.currentScreen, 'screen-demo');
    assert.deepEqual(state.history, [
      'screen-idle',
      'screen-main',
      'screen-1-3',
      'screen-1-3-1'
    ]);
  });

  test('should goBack correctly through history stack', () => {
    state.navigateTo('screen-main');
    state.navigateTo('screen-1-1');
    state.navigateTo('screen-demo');

    const prev1 = state.goBack();
    assert.equal(prev1, 'screen-1-1');
    assert.equal(state.currentScreen, 'screen-1-1');

    const prev2 = state.goBack();
    assert.equal(prev2, 'screen-main');
    assert.equal(state.currentScreen, 'screen-main');
  });

  test('should reset to screen-idle on timeout and clear history', () => {
    state.navigateTo('screen-main');
    state.navigateTo('screen-1-3-2');
    
    state.resetToIdle();
    assert.equal(state.currentScreen, 'screen-idle');
    assert.deepEqual(state.history, []);
  });

  test('should prevent navigating to same active screen', () => {
    state.navigateTo('screen-main');
    const result = state.navigateTo('screen-main');
    assert.equal(result, false);
    assert.deepEqual(state.history, ['screen-idle']);
  });

  test('should validate allowed screen IDs', () => {
    const validScreens = [
      'screen-idle',
      'screen-main',
      'screen-1-1',
      'screen-1-2',
      'screen-1-3',
      'screen-1-3-1',
      'screen-1-3-2',
      'screen-1-4',
      'screen-1-4-1',
      'screen-1-4-2',
      'screen-demo'
    ];
    validScreens.forEach(id => {
      assert.ok(state.isValidScreen(id), `Screen ${id} should be valid`);
    });
    assert.equal(state.isValidScreen('invalid-screen'), false);
  });

  test('should navigate to screen-1-4-2 (Marketplace) and go back to screen-1-4', () => {
    state.navigateTo('screen-main');
    state.navigateTo('screen-1-4');
    state.navigateTo('screen-1-4-2');
    assert.equal(state.currentScreen, 'screen-1-4-2');

    const prev = state.goBack();
    assert.equal(prev, 'screen-1-4');
    assert.equal(state.currentScreen, 'screen-1-4');
  });

  test('should correctly report canGoBack for idle/main vs sub-screens', () => {
    assert.equal(state.canGoBack(), false, 'Idle screen should not have back button');
    state.navigateTo('screen-main');
    assert.equal(state.canGoBack(), false, 'Main screen should not have back button');

    state.navigateTo('screen-1-1');
    assert.equal(state.canGoBack(), true, 'Subscreen 1.1 should have back button');

    state.navigateTo('screen-demo');
    assert.equal(state.canGoBack(), true, 'Demo screen should have back button');

    state.goBack();
    assert.equal(state.currentScreen, 'screen-1-1');
    assert.equal(state.canGoBack(), true);

    state.goBack();
    assert.equal(state.currentScreen, 'screen-main');
    assert.equal(state.canGoBack(), false);
  });
});

