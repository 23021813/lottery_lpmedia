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

  goBack() {
    if (this.history.length === 0) {
      if (this.currentScreen !== 'screen-main' && this.currentScreen !== 'screen-idle') {
        this.navigateTo('screen-main');
        return 'screen-main';
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
    return this.currentScreen !== 'screen-idle' && this.currentScreen !== 'screen-main';
  }

  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (this.idleTimeoutMs > 0) {
      this.idleTimer = setTimeout(() => {
        this.resetToIdle();
        if (typeof this.onTimeout === 'function') {
          this.onTimeout();
        }
      }, this.idleTimeoutMs);
    }
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
