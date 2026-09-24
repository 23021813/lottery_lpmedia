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

  test('should return correct Back button configuration based on user requirement matrix', () => {
    // 1. Trang chủ: không có back
    assert.equal(state.getBackConfig('screen-main'), null);
    assert.equal(state.getBackConfig('screen-idle'), null);

    // 1.1. Linh hoạt: góc dưới bên phải, quay lại trang chủ
    assert.deepEqual(state.getBackConfig('screen-1-1', false), {
      targetScreen: 'screen-main',
      position: 'right',
      label: 'Quay lại trang chủ'
    });
    // 1.1.1: góc dưới bên phải, quay lại trang chủ
    assert.deepEqual(state.getBackConfig('screen-1-1', true), {
      targetScreen: 'screen-main',
      position: 'right',
      label: 'Quay lại trang chủ'
    });

    // 1.2. Liền mạch: góc dưới bên phải, quay lại trang chủ
    assert.deepEqual(state.getBackConfig('screen-1-2', false), {
      targetScreen: 'screen-main',
      position: 'right',
      label: 'Quay lại trang chủ'
    });
    // 1.2.1: góc dưới bên phải, quay lại trang chủ
    assert.deepEqual(state.getBackConfig('screen-1-2', true), {
      targetScreen: 'screen-main',
      position: 'right',
      label: 'Quay lại trang chủ'
    });

    // 1.3. Tối ưu: góc dưới bên phải, quay lại trang chủ
    assert.deepEqual(state.getBackConfig('screen-1-3', false), {
      targetScreen: 'screen-main',
      position: 'right',
      label: 'Quay lại trang chủ'
    });

    // 1.3.1 đến 1.3.5: góc dưới bên trái, quay về trang trước (1.3)
    const level2Screens = ['screen-1-3-1', 'screen-1-3-2', 'screen-1-3-3', 'screen-1-3-4', 'screen-1-3-5'];
    level2Screens.forEach(id => {
      // Khi không mở demo: quay về trang trước
      assert.deepEqual(state.getBackConfig(id, false), {
        targetScreen: 'screen-1-3',
        position: 'left',
        label: 'Quay về trang trước'
      }, `Screen ${id} should have left button navigating to screen-1-3`);

      // Khi mở demo (1.3.x.1): quay lại trang 1.3.
      assert.deepEqual(state.getBackConfig(id, true), {
        targetScreen: 'screen-1-3',
        position: 'left',
        label: 'Quay lại trang 1.3.'
      }, `Demo for ${id} should have left button navigating to screen-1-3`);
    });
  });

  test('Doanh nghiệp: should identify Level 3 screens correctly for top Home button visibility', () => {
    const state = new DoanhNghiepStateManager();
    // Level 1 & 2 screens must return false
    assert.strictEqual(state.isLevel3Screen('screen-idle'), false);
    assert.strictEqual(state.isLevel3Screen('screen-main'), false);
    assert.strictEqual(state.isLevel3Screen('screen-1-1'), false);
    assert.strictEqual(state.isLevel3Screen('screen-1-2'), false);
    assert.strictEqual(state.isLevel3Screen('screen-1-3'), false);

    // Level 3 screens must return true
    assert.strictEqual(state.isLevel3Screen('screen-1-1-1'), true);
    assert.strictEqual(state.isLevel3Screen('screen-1-2-1'), true);
    assert.strictEqual(state.isLevel3Screen('screen-1-3-1'), true);
    assert.strictEqual(state.isLevel3Screen('screen-1-3-2'), true);
    assert.strictEqual(state.isLevel3Screen('screen-1-3-3'), true);
    assert.strictEqual(state.isLevel3Screen('screen-1-3-4'), true);
    assert.strictEqual(state.isLevel3Screen('screen-1-3-5'), true);
  });
});

