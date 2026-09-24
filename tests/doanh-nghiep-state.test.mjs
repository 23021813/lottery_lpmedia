import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DoanhNghiepStateManager } from '../doanh-nghiep/js/state-manager.js';

describe('DoanhNghiepStateManager - Router & Navigation Stack (No Auto Timeout)', () => {
  let state;

  beforeEach(() => {
    state = new DoanhNghiepStateManager({
      initialScreen: 'screen-idle',
      idleTimeoutMs: 300000 // 5 phút tự động quay về trang chờ
    });
  });

  test('should initialize with screen-idle, empty history, and 5-minute timeout', () => {
    assert.equal(state.currentScreen, 'screen-idle');
    assert.deepEqual(state.history, []);
    assert.equal(state.idleTimeoutMs, 300000);
    assert.ok(state.idleTimer !== null);
  });

  test('should navigate from idle to screen-main', () => {
    state.navigateTo('screen-main');
    assert.equal(state.currentScreen, 'screen-main');
    assert.deepEqual(state.history, ['screen-idle']);
  });

  test('should navigate to all 3 level-1 screens (1.1, 1.2, 1.3)', () => {
    state.navigateTo('screen-main');
    state.navigateTo('screen-1-1');
    assert.equal(state.currentScreen, 'screen-1-1');

    const back1 = state.goBack();
    assert.equal(back1, 'screen-main');

    state.navigateTo('screen-1-2');
    assert.equal(state.currentScreen, 'screen-1-2');

    const back2 = state.goBack();
    assert.equal(back2, 'screen-main');

    state.navigateTo('screen-1-3');
    assert.equal(state.currentScreen, 'screen-1-3');
  });

  test('should navigate through 1.3 to all 5 level-2 sub-screens and back to 1.3', () => {
    const subScreens = [
      'screen-1-3-1',
      'screen-1-3-2',
      'screen-1-3-3',
      'screen-1-3-4',
      'screen-1-3-5'
    ];

    for (const sub of subScreens) {
      state.navigateTo('screen-main');
      state.navigateTo('screen-1-3');
      state.navigateTo(sub);
      assert.equal(state.currentScreen, sub);

      const prev = state.goBack();
      assert.equal(prev, 'screen-1-3');
      assert.equal(state.currentScreen, 'screen-1-3');

      const prevMain = state.goBack();
      assert.equal(prevMain, 'screen-main');
      state.reset();
    }
  });

  test('should validate allowed screen IDs for Doanh nghiệp', () => {
    const validScreens = [
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
    validScreens.forEach(id => {
      assert.ok(state.isValidScreen(id), `Screen ${id} should be valid`);
    });
    assert.equal(state.isValidScreen('screen-1-4'), false, '1-4 should not exist in Doanh nghiệp');
    assert.equal(state.isValidScreen('invalid-screen'), false);
  });

  test('should correctly report canGoBack for idle/main vs sub-screens', () => {
    assert.equal(state.canGoBack(), false, 'Idle screen cannot go back');
    state.navigateTo('screen-main');
    assert.equal(state.canGoBack(), false, 'Main screen cannot go back');

    state.navigateTo('screen-1-1');
    assert.equal(state.canGoBack(), true, '1.1 can go back');

    state.goBack();
    assert.equal(state.canGoBack(), false);

    state.navigateTo('screen-1-3');
    assert.equal(state.canGoBack(), true);
    state.navigateTo('screen-1-3-1');
    assert.equal(state.canGoBack(), true);
  });

  test('should identify demo modal type correctly (desktop vs phone)', () => {
    // 1.1, 1.2, 1.3.1, 1.3.4 use desktop screen (man-hinh.png)
    assert.equal(state.getDemoTypeForScreen('screen-1-1'), 'desktop');
    assert.equal(state.getDemoTypeForScreen('screen-1-2'), 'desktop');
    assert.equal(state.getDemoTypeForScreen('screen-1-3-1'), 'desktop');
    assert.equal(state.getDemoTypeForScreen('screen-1-3-4'), 'desktop');

    // 1.3.2, 1.3.3, 1.3.5 use phone mockup (my-phone.png)
    assert.equal(state.getDemoTypeForScreen('screen-1-3-2'), 'phone');
    assert.equal(state.getDemoTypeForScreen('screen-1-3-3'), 'phone');
    assert.equal(state.getDemoTypeForScreen('screen-1-3-5'), 'phone');
  });

  test('should auto timeout and reset to screen-idle when idle timer fires', (t, done) => {
    // Khởi tạo state test với timeout ngắn 50ms
    const shortTimerState = new DoanhNghiepStateManager({
      initialScreen: 'screen-idle',
      idleTimeoutMs: 50
    });

    shortTimerState.navigateTo('screen-main');
    shortTimerState.navigateTo('screen-1-3-1');
    assert.equal(shortTimerState.currentScreen, 'screen-1-3-1');

    // Sau 80ms phải tự động về screen-idle
    setTimeout(() => {
      assert.equal(shortTimerState.currentScreen, 'screen-idle', 'Should auto reset to screen-idle after timeout');
      done();
    }, 80);
  });
});
