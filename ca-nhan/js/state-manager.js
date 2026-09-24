/**
 * AppStateManager - Quản lý trạng thái và luồng điều hướng SPA cho MSB Interactive LED
 * Thiết kế chuẩn Universal Module (hỗ trợ cả ES Module và Browser Global)
 */

export const VALID_SCREENS = [
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

export class AppStateManager {
  constructor(options = {}) {
    this.initialScreen = options.initialScreen || 'screen-idle';
    this.idleTimeoutMs = options.idleTimeoutMs ?? 300000; // 5 phút = 300.000 ms
    this.onTimeout = options.onTimeout || null;
    this.currentScreen = this.initialScreen;
    this.history = [];
    this.idleTimer = null;
    this.listeners = new Set();

    if (this.idleTimeoutMs > 0) {
      this.resetIdleTimer();
    }
  }

  isValidScreen(screenId) {
    return VALID_SCREENS.includes(screenId);
  }

  navigateTo(targetScreenId) {
    if (!this.isValidScreen(targetScreenId)) {
      console.warn(`[AppStateManager] Invalid screenId: ${targetScreenId}`);
      return false;
    }

    if (this.currentScreen === targetScreenId) {
      return false;
    }

    const previousScreen = this.currentScreen;
    this.history.push(previousScreen);
    this.currentScreen = targetScreenId;

    this.notifyListeners({
      type: 'navigate',
      from: previousScreen,
      to: targetScreenId,
      history: [...this.history]
    });

    if (this.idleTimeoutMs > 0) {
      this.resetIdleTimer();
    }

    return true;
  }

  getParentScreen(screenId) {
    if (screenId === 'screen-1-3-1' || screenId === 'screen-1-3-2') return 'screen-1-3';
    if (screenId === 'screen-1-4-1' || screenId === 'screen-1-4-2') return 'screen-1-4';
    if (typeof screenId === 'string' && screenId.startsWith('screen-1-')) return 'screen-main';
    return null;
  }

  goBack() {
    if (this.history.length === 0) {
      const parentScreen = this.getParentScreen(this.currentScreen);
      if (parentScreen) {
        this.navigateTo(parentScreen);
        return parentScreen;
      }
      return null;
    }

    const previousScreen = this.history.pop();
    const fromScreen = this.currentScreen;
    this.currentScreen = previousScreen;

    this.notifyListeners({
      type: 'back',
      from: fromScreen,
      to: previousScreen,
      history: [...this.history]
    });

    if (this.idleTimeoutMs > 0) {
      this.resetIdleTimer();
    }

    return previousScreen;
  }

  canGoBack() {
    if (this.currentScreen === 'screen-idle' || this.currentScreen === 'screen-main') {
      return false;
    }
    return this.history.length > 0 || this.getParentScreen(this.currentScreen) !== null;
  }

  isLevel3Screen(screenId = this.currentScreen) {
    if (!screenId || screenId === 'screen-idle' || screenId === 'screen-main') {
      return false;
    }
    const level3Screens = [
      'screen-1-3-1',
      'screen-1-3-2',
      'screen-1-4-1',
      'screen-1-4-2',
      'screen-demo'
    ];
    return level3Screens.includes(screenId);
  }


  getBackConfig(screenId = this.currentScreen, isDemoOpen = false) {
    if (!screenId || screenId === 'screen-idle' || screenId === 'screen-main') {
      return null;
    }

    // 1.1, 1.2, 1.3, 1.4: Cấp 1 (Hiệu năng, Cá nhân hóa, Tối ưu, Hệ sinh thái)
    // Nút ở góc dưới BÊN PHẢI -> [Quay lại trang chủ]
    if (screenId === 'screen-1-1' || screenId === 'screen-1-2' || screenId === 'screen-1-3' || screenId === 'screen-1-4') {
      return {
        targetScreen: 'screen-main',
        position: 'right',
        label: 'Quay lại trang chủ'
      };
    }

    // 1.3.1 & 1.3.2: Cấp 2 của Tối ưu (M-Sinh Lời, M-Triple)
    // Nút ở góc dưới BÊN TRÁI -> Quay về 1.3
    if (screenId === 'screen-1-3-1' || screenId === 'screen-1-3-2') {
      if (isDemoOpen) {
        return {
          targetScreen: 'screen-1-3',
          position: 'left',
          label: 'Quay lại trang 1.3.'
        };
      }
      return {
        targetScreen: 'screen-1-3',
        position: 'left',
        label: 'Quay về trang trước'
      };
    }

    // 1.4.1 & 1.4.2: Cấp 2 của Hệ sinh thái (Rewards, Marketplace)
    // Nút ở góc dưới BÊN TRÁI -> Quay về 1.4
    if (screenId === 'screen-1-4-1' || screenId === 'screen-1-4-2') {
      if (isDemoOpen) {
        return {
          targetScreen: 'screen-1-4',
          position: 'left',
          label: 'Quay lại trang 1.4.'
        };
      }
      return {
        targetScreen: 'screen-1-4',
        position: 'left',
        label: 'Quay về trang trước'
      };
    }

    const parent = this.getParentScreen(screenId) || 'screen-main';
    return {
      targetScreen: parent,
      position: 'right',
      label: parent === 'screen-main' ? 'Quay lại trang chủ' : 'Quay về trang trước'
    };
  }

  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (this.idleTimeoutMs > 0) {
      this.idleTimer = setTimeout(() => {
        const fromScreen = this.currentScreen;
        if (typeof this.onTimeout === 'function') {
          this.onTimeout(fromScreen);
        } else {
          this.resetToIdle();
        }
      }, this.idleTimeoutMs);
      if (this.idleTimer && typeof this.idleTimer.unref === 'function') {
        this.idleTimer.unref();
      }
    }
  }

  destroy() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.listeners.clear();
  }

  resetToIdle() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (this.currentScreen === 'screen-idle') {
      return;
    }

    const fromScreen = this.currentScreen;
    this.history = [];
    this.currentScreen = 'screen-idle';

    this.notifyListeners({
      type: 'idle-reset',
      from: fromScreen,
      to: 'screen-idle',
      history: []
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[AppStateManager] Listener error:', err);
      }
    }
  }
}

// Support browser environment attach
if (typeof window !== 'undefined') {
  window.AppStateManager = AppStateManager;
  window.VALID_SCREENS = VALID_SCREENS;
}
