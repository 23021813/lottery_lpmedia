/**
 * DoanhNghiepStateManager - Router & State Machine for MSB Business Banking LED SPA
 * Đảm nhận: Quản lý màn hình hiện tại, ngăn spam click, lưu stack lịch sử,
 * xác thực ID màn hình, hỗ trợ Back điều hướng và phân loại Demo Modal.
 * Đặc biệt: Bỏ tự động quay về trang chờ (idleTimeoutMs = 0).
 */
export class DoanhNghiepStateManager {
  constructor(options = {}) {
    this.initialScreen = options.initialScreen || 'screen-idle';
    this.idleTimeoutMs = options.idleTimeoutMs ?? 0; // 0 = disabled auto timeout
    this.onTimeout = options.onTimeout || null;

    this.currentScreen = this.initialScreen;
    this.history = [];
    this.idleTimer = null;

    // Danh sách 10 màn hình hợp lệ của phân hệ Doanh nghiệp
    this.validScreens = new Set([
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
    ]);

    // Bảng ánh xạ loại Demo Modal cho từng màn hình
    this.demoTypeMap = {
      'screen-1-1': 'desktop',
      'screen-1-2': 'desktop',
      'screen-1-3-1': 'desktop',
      'screen-1-3-2': 'phone',
      'screen-1-3-3': 'phone',
      'screen-1-3-4': 'desktop',
      'screen-1-3-5': 'phone'
    };

    if (this.idleTimeoutMs > 0) {
      this.resetIdleTimer();
    }
  }

  isValidScreen(screenId) {
    return this.validScreens.has(screenId);
  }

  getDemoTypeForScreen(screenId) {
    return this.demoTypeMap[screenId] || null;
  }

  navigateTo(targetScreenId) {
    if (!this.isValidScreen(targetScreenId)) {
      return false;
    }

    if (this.currentScreen === targetScreenId) {
      return false;
    }

    // Đẩy màn hình hiện tại vào stack lịch sử
    this.history.push(this.currentScreen);
    this.currentScreen = targetScreenId;

    if (this.idleTimeoutMs > 0) {
      this.resetIdleTimer();
    }

    return true;
  }

  getParentScreen(screenId) {
    if (typeof screenId === 'string' && screenId.startsWith('screen-1-3-')) return 'screen-1-3';
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

    if (!this.canGoBack()) {
      return null;
    }

    // Lấy màn hình trước đó từ lịch sử
    const previousScreen = this.history.pop();
    this.currentScreen = previousScreen;

    if (this.idleTimeoutMs > 0) {
      this.resetIdleTimer();
    }

    return previousScreen;
  }

  canGoBack() {
    // Không cho phép nút Back ở Trang Chờ hoặc Trang Chính
    if (this.currentScreen === 'screen-idle' || this.currentScreen === 'screen-main') {
      return false;
    }
    return this.history.length > 0 || this.getParentScreen(this.currentScreen) !== null;
  }

  getBackConfig(screenId = this.currentScreen, isDemoOpen = false) {
    if (!screenId || screenId === 'screen-idle' || screenId === 'screen-main') {
      return null;
    }

    // 1.1, 1.2, 1.3: Cấp 1 (Linh hoạt, Liền mạch, Tối ưu)
    // Nút ở góc dưới BÊN PHẢI -> [Quay lại trang chủ]
    if (screenId === 'screen-1-1' || screenId === 'screen-1-2' || screenId === 'screen-1-3') {
      return {
        targetScreen: 'screen-main',
        position: 'right',
        label: 'Quay lại trang chủ'
      };
    }

    // 1.3.1 đến 1.3.5: Cấp 2 (Tín dụng, Tái cấp, Thẻ TD, Chứng chỉ, Rewards)
    // Nút ở góc dưới BÊN TRÁI
    if (typeof screenId === 'string' && screenId.startsWith('screen-1-3-')) {
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

    // Fallback mặc định
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
    this.currentScreen = 'screen-idle';
    this.history = [];
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  reset() {
    this.resetToIdle();
  }
}
