/**
 * MSB Digital Universe - Interactive LED Single Page Application
 * Motion Engine powered by GSAP 3.x & AppStateManager
 * Resolution: 1535 x 576 px
 */

import { AppStateManager } from './state-manager.js';

class AppMotionController {
  constructor() {
    this.state = new AppStateManager({
      initialScreen: 'screen-idle',
      idleTimeoutMs: 300000, // 5 phút = 300.000 ms
      onTimeout: () => {
        this.forceNavigateToIdle();
      }
    });

    this.isAnimating = false;
    this.animWatchdog = null;
    this.isDemoOpen = false;
    this.isScrubbing = false;
    this.controlsTimer = null;

    // Bản đồ video ánh xạ trực tiếp theo ID màn hình con
    this.screenVideoMap = {
      'screen-1-1': 'video/security.webm',
      'screen-1-2': 'video/thay-doi-giao-dien.webm',
      'screen-1-3-1': 'video/m-sinh-loi.webm',
      'screen-1-3-2': 'video/m-triple.webm',
      'screen-1-4-1': 'video/m-rewards.webm',
      'screen-1-4-2': 'video/marketplace.webm'
    };

    // DOM Elements Cache
    this.dom = {
      stage: document.getElementById('screenStage'),
      bgMain: document.getElementById('bgLayerMain'),
      bgDetail: document.getElementById('bgLayerDetail'),
      bgMarketplace: document.getElementById('bgLayerMarketplace'),
      bgIdle: document.getElementById('bgLayerIdle'),
      demoModal: document.getElementById('screen-demo'),
      demoBackdrop: document.getElementById('demoBackdrop'),
      demoPhoneContainer: document.getElementById('demoPhoneContainer'),
      btnBack: document.getElementById('btnGlobalBack'),
      btnHome: document.getElementById('btnGlobalHome'),

      // Video Presentation Modal Elements
      demoVideoModal: document.getElementById('screenDemoVideo'),
      videoWrapper: document.getElementById('videoPresentationWrapper'),
      video: document.getElementById('presentationVideo'),
      videoControls: document.getElementById('videoTouchControls'),
      btnPlayToggle: document.getElementById('btnPlayToggle'),
      iconPlay: document.querySelector('#btnPlayToggle .icon-play'),
      iconPause: document.querySelector('#btnPlayToggle .icon-pause'),
      videoScrubBar: document.getElementById('videoScrubBar'),
      videoScrubProgress: document.getElementById('videoScrubProgress'),
      videoScrubBuffer: document.getElementById('videoScrubBuffer'),
      videoScrubThumb: document.getElementById('videoScrubThumb'),
      btnVideoBack: document.getElementById('btnVideoBack'),
      btnVideoHome: document.getElementById('btnVideoHome'),

      screens: new Map()
    };

    // Cache all screen elements
    document.querySelectorAll('.screen-view').forEach(screen => {
      this.dom.screens.set(screen.id, screen);
    });

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupVideoControls();
    this.applyInitialState();
    this.updateBackButtonVisibility();

    // Hỗ trợ mở trực tiếp màn hình qua URL hash hoặc query param ?screen=...
    const urlParams = new URLSearchParams(window.location.search);
    const targetScreen = urlParams.get('screen') || window.location.hash.replace('#', '');
    if (targetScreen && this.dom.screens.has(targetScreen)) {
      setTimeout(() => {
        this.navigateTo(targetScreen);
      }, 150);
    }
  }

  applyInitialState() {
    // Hide all screens except screen-idle
    this.dom.screens.forEach((el, id) => {
      if (id === 'screen-idle') {
        el.classList.add('is-active');
        gsap.set(el, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      } else {
        el.classList.remove('is-active');
        gsap.set(el, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      }
    });

    // Background layers initial state
    gsap.set(this.dom.bgIdle, { opacity: 1, scale: 1 });
    gsap.set(this.dom.bgMain, { opacity: 0, scale: 1, x: '0%', transformOrigin: '62.7% 47%', filter: 'blur(0px)' });
    gsap.set(this.dom.bgDetail, { opacity: 0, scale: 1, transformOrigin: '50% 50%', filter: 'blur(0px)' });
    if (this.dom.bgMarketplace) {
      gsap.set(this.dom.bgMarketplace, { opacity: 0, scale: 1, transformOrigin: '50% 50%', filter: 'blur(0px)' });
    }

    // Demo phone modal initial state (Hoàn toàn ẩn và không cản trở tương tác)
    if (this.dom.demoModal) {
      gsap.set(this.dom.demoModal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
    }
    if (this.dom.demoBackdrop) {
      gsap.set(this.dom.demoBackdrop, { opacity: 0 });
    }
    if (this.dom.demoPhoneContainer) {
      gsap.set(this.dom.demoPhoneContainer, { y: '100%' });
    }

    // Modal video trình chiếu full màn hình
    if (this.dom.demoVideoModal) {
      this.dom.demoVideoModal.classList.remove('is-active', 'active');
      gsap.set(this.dom.demoVideoModal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
    }

    // Trạng thái nút Back ban đầu (ẩn ở trang chờ / trang chính)
    this.updateBackButtonVisibility();
  }

  updateBackButtonVisibility() {
    this.updateNavigationDocks();

    if (!this.dom.btnBack) {
      return;
    }

    const config = typeof this.state.getBackConfig === 'function'
      ? this.state.getBackConfig(this.state.currentScreen, this.isDemoOpen)
      : null;

    if (config) {
      this.dom.btnBack.classList.add('is-visible');
      const imgBack = this.dom.btnBack.querySelector('.img-back') || this.dom.btnBack.querySelector('img');
      if (imgBack) {
        if (config.direction === 'right') {
          this.dom.btnBack.classList.remove('pos-left', 'left');
          this.dom.btnBack.classList.add('pos-right', 'right');
          imgBack.src = 'images/icon-back2.png';
        } else {
          this.dom.btnBack.classList.remove('pos-right', 'right');
          this.dom.btnBack.classList.add('pos-left', 'left');
          imgBack.src = 'images/icon-back.png';
        }
      }
      this.dom.btnBack.setAttribute('aria-label', config.label);
      this.dom.btnBack.setAttribute('title', config.label);
    } else {
      if (this.dom.btnBack) {
        this.dom.btnBack.classList.remove('is-visible', 'pos-left', 'pos-right', 'left', 'right');
      }
    }

    this.updateHomeButtonVisibility();
  }

  updateNavigationDocks() {
    const currentScreen = this.state.currentScreen;
    // Side Navigation Docks chỉ hiển thị ở các trang chi tiết con (Level 2, Level 3) và khi video/demo mở
    // Không hiện button này ở Trang chủ (screen-main) và màn hình chờ (screen-idle)
    const shouldShow = (currentScreen !== 'screen-idle' && currentScreen !== 'screen-main') || Boolean(this.isDemoOpen);

    const docks = document.querySelectorAll('.nav-dock-side');
    docks.forEach(dock => {
      dock.classList.toggle('is-visible', Boolean(shouldShow));
    });
  }

  updateHomeButtonVisibility() {
    if (!this.dom.btnHome) return;
    const isLevel3 = typeof this.state.isLevel3Screen === 'function'
      ? this.state.isLevel3Screen(this.state.currentScreen)
      : (this.state.currentScreen && this.state.currentScreen.split('-').length >= 4);

    if (isLevel3 && !this.isDemoOpen) {
      this.dom.btnHome.classList.add('is-visible');
    } else {
      this.dom.btnHome.classList.remove('is-visible');
    }
  }

  handleHomeAction() {
    if (this.isAnimating) return;
    if (this.isDemoOpen) {
      this.closeDemo();
    }
    if (this.state.currentScreen === 'screen-main') {
      return;
    }
    this.navigateTo('screen-main');
    this.state.history = ['screen-idle'];
  }

  handleBackAction() {
    if (this.isDemoOpen) {
      this.closeDemo();
      return;
    }

    // Nếu đang ở Trang chủ mà bấm Back -> Quay về Màn hình chờ Kiosk
    if (this.state.currentScreen === 'screen-main') {
      this.forceNavigateToIdle();
      return;
    }

    this.goBack();
  }

  setupEventListeners() {
    // [DEBUG MODE] Tạm thời cho phép chuột phải và F12 Inspect theo yêu cầu (sẽ đóng lại sau)
    // window.addEventListener('contextmenu', (e) => {
    //   e.preventDefault();
    //   return false;
    // });

    // Kiosk Protection: Chặn kéo ảnh / phần tử mặc định của trình duyệt
    window.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // 0. Hệ thống Điều hướng kép 2 bên (Side Navigation Docks: Home & Back)
    document.querySelectorAll('.nav-btn[data-nav="home"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleHomeAction();
      });
    });

    document.querySelectorAll('.nav-btn[data-nav="back"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleBackAction();
      });
    });

    // Nút Back toàn cục cũ (nếu có trong DOM)
    if (this.dom.btnBack) {
      this.dom.btnBack.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleBackAction();
      });
    }

    // Nút Home toàn cục góc trên cũ (nếu có trong DOM)
    if (this.dom.btnHome) {
      this.dom.btnHome.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleHomeAction();
      });
    }

    // 1. Chạm bất kỳ điểm nào trên Trang Chờ (Idle Screen) -> Vào Trang Chính
    const idleScreen = this.dom.screens.get('screen-idle');
    if (idleScreen) {
      idleScreen.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateTo('screen-main');
      });
    }

    // 2. Lắng nghe click / touch trên toàn bộ container stage
    this.dom.stage.addEventListener('click', (e) => {
      // Nếu đang ở Trang Chờ mà click vào stage -> Chuyển sang Trang Chính
      if (this.state.currentScreen === 'screen-idle') {
        e.preventDefault();
        this.navigateTo('screen-main');
        return;
      }

      // Xử lý nút/vùng mở Demo Phone / Video
      const demoTrigger = e.target.closest('[data-demo="true"]');
      if (demoTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const videoSrc = demoTrigger.getAttribute('data-video') || demoTrigger.getAttribute('data-demo-video') || null;
        this.openDemo(videoSrc);
        return;
      }

      // Xử lý chuyển trang qua data-target
      const targetTrigger = e.target.closest('[data-target]');
      if (targetTrigger) {
        e.preventDefault();
        const targetScreenId = targetTrigger.getAttribute('data-target');
        if (targetScreenId) {
          this.navigateTo(targetScreenId);
        }
      }
    });

    // 3. Đóng Demo Phone khi chạm vào nền tối (Backdrop hoặc khoảng trống ngoài điện thoại)
    if (this.dom.demoBackdrop) {
      this.dom.demoBackdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDemo();
      });
    }

    if (this.dom.demoPhoneContainer) {
      this.dom.demoPhoneContainer.addEventListener('click', (e) => {
        if (!e.target.closest('.my-phone-gold')) {
          e.stopPropagation();
          this.closeDemo();
        }
      });
    }

    // 4. Bàn phím điều khiển (ESC để Back hoặc đóng Demo)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleBackAction();
      }
    });

    // Reset bộ đếm 5 phút tự động về trang chờ khi có bất kỳ thao tác chạm
    window.addEventListener('pointerdown', () => {
      if (this.state && typeof this.state.resetIdleTimer === 'function') {
        this.state.resetIdleTimer();
      }
    });

    // 5. Cử chỉ vuốt ngược trên màn hình cảm ứng & chuột (Touch / Drag Swipe Back)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleSwipeStart = (x, y) => {
      touchStartX = x;
      touchStartY = y;
      touchStartTime = Date.now();
    };

    const handleSwipeEnd = (x, y) => {
      const deltaX = x - touchStartX;
      const deltaY = y - touchStartY;
      const elapsedTime = Date.now() - touchStartTime;

      // Giới hạn thời gian cử chỉ vuốt hợp lệ (< 800ms)
      if (elapsedTime > 800) return;

      // Nếu đang mở Demo Phone: Vuốt xuống (deltaY > 60) hoặc vuốt sang phải (deltaX > 80) -> Đóng Demo
      if (this.isDemoOpen) {
        if (deltaY > 60 || deltaX > 80) {
          this.closeDemo();
        }
        return;
      }

      // Vuốt ngược từ trái sang phải (Swipe Right > 70px) -> Quay lại trang trước (Back)
      if (deltaX > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        this.goBack();
      }
    };

    // Touch events cho màn hình LED cảm ứng
    this.dom.stage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.dom.stage.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        handleSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: true });

    // Hỗ trợ chuột kéo lướt (Mouse Drag Swipe) để tiện kiểm thử trên máy tính
    let isMouseDown = false;
    this.dom.stage.addEventListener('mousedown', (e) => {
      // Chỉ nhận mousedown nếu không phải là click trực tiếp vào nút CTA hoặc demo
      if (e.target.closest('[data-demo="true"], [data-target]')) {
        return;
      }
      isMouseDown = true;
      handleSwipeStart(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
      if (isMouseDown) {
        isMouseDown = false;
        handleSwipeEnd(e.clientX, e.clientY);
      }
    });
  }

  /* ========================================================================
     ROUTING & NAVIGATION DISPATCHER (VỚI WATCHDOG & CLEANUP TOÀN CỤC)
     ======================================================================== */
  startAnimWatchdog(timeoutMs = 1500) {
    this.clearAnimWatchdog();
    this.animWatchdog = setTimeout(() => {
      console.warn('[AppMotionController] Animation watchdog timeout: giải phóng isAnimating');
      this.isAnimating = false;
    }, timeoutMs);
  }

  clearAnimWatchdog() {
    if (this.animWatchdog) {
      clearTimeout(this.animWatchdog);
      this.animWatchdog = null;
    }
  }

  getActiveScreenIdFromDOM() {
    for (const [id, el] of this.dom.screens.entries()) {
      if (id !== 'screen-idle' && (el.classList.contains('is-active') || el.classList.contains('active'))) {
        return id;
      }
    }
    return this.state.currentScreen;
  }

  cleanupScreens(activeId) {
    this.dom.screens.forEach((screenEl, screenId) => {
      if (screenId === activeId) {
        screenEl.classList.add('is-active');
        screenEl.classList.remove('active');
        gsap.set(screenEl, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      } else {
        screenEl.classList.remove('is-active', 'active');
        gsap.set(screenEl, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      }
    });
  }

  forceNavigateToIdle() {
    // 1. Đóng demo phone và video presentation nếu đang mở
    if (this.isDemoOpen) {
      this.closeDemo();
    }
    if (typeof this.closeVideoModal === 'function') {
      this.closeVideoModal();
    }

    // 2. Clear watchdog và dừng các animation dở dang
    this.clearAnimWatchdog();
    const screenEls = Array.from(this.dom.screens.values());
    gsap.killTweensOf(screenEls);
    gsap.killTweensOf([this.dom.bgMain, this.dom.bgDetail, this.dom.bgMarketplace, this.dom.bgIdle].filter(Boolean));

    const idleEl = this.dom.screens.get('screen-idle');
    if (!idleEl) return;

    // Nếu đã ở screen-idle thì dọn dẹp và reset ngay
    if (this.state.currentScreen === 'screen-idle') {
      this.cleanupScreens('screen-idle');
      this.state.resetToIdle();
      this.updateBackButtonVisibility();
      this.isAnimating = false;
      return;
    }

    this.isAnimating = true;
    this.startAnimWatchdog(1500);

    const activeDomId = this.getActiveScreenIdFromDOM();
    const currentScreenId = this.dom.screens.has(activeDomId) ? activeDomId : this.state.currentScreen;
    const currentScreenEl = this.dom.screens.get(currentScreenId);

    const tl = gsap.timeline({
      onComplete: () => {
        this.cleanupScreens('screen-idle');
        this.state.resetToIdle();
        this.updateBackButtonVisibility();
        this.clearAnimWatchdog();
        this.isAnimating = false;
      }
    });

    // Mờ dần màn hình hiện tại và các background phụ
    if (currentScreenEl && currentScreenEl !== idleEl) {
      tl.to(currentScreenEl, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0);
    }
    tl.to([this.dom.bgMain, this.dom.bgDetail, this.dom.bgMarketplace].filter(Boolean), {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, 0);

    // Kích hoạt screen-idle
    idleEl.classList.add('is-active');
    gsap.set(idleEl, { opacity: 0, visibility: 'visible', pointerEvents: 'auto' });
    tl.to(idleEl, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.2);
    if (this.dom.bgIdle) {
      tl.to(this.dom.bgIdle, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.2);
    }
  }

  navigateTo(targetId) {
    if (this.isAnimating) return;
    const currentId = this.state.currentScreen;
    if (currentId === targetId) return;

    if (!this.state.isValidScreen(targetId)) {
      console.warn(`Unknown screen target: ${targetId}`);
      return;
    }

    // Tự động kiểm tra phần tử DOM đang active thực tế nếu có lệch pha
    let fromId = currentId;
    const activeDomId = this.getActiveScreenIdFromDOM();
    if (activeDomId && activeDomId !== currentId && this.dom.screens.has(activeDomId)) {
      fromId = activeDomId;
    }

    const currentScreenEl = this.dom.screens.get(fromId) || this.dom.screens.get(currentId);
    const targetScreenEl = this.dom.screens.get(targetId);

    if (!targetScreenEl) return;

    // Ghi nhận vào state history
    this.state.navigateTo(targetId);
    this.updateBackButtonVisibility();

    // Quyết định loại hiệu ứng dựa trên cặp màn hình
    if (fromId === 'screen-idle' && targetId === 'screen-main') {
      this.animIdleToMain(currentScreenEl, targetScreenEl);
    } else if (fromId === 'screen-main' && targetId.startsWith('screen-1-')) {
      this.animMainToLevel1(currentScreenEl, targetScreenEl);
    } else if (targetId === 'screen-main' && fromId.startsWith('screen-1-')) {
      this.animLevel1ToMain(currentScreenEl, targetScreenEl);
    } else if (this.isLevel2Transition(fromId, targetId)) {
      this.animPanHorizontal(currentScreenEl, targetScreenEl, 'next');
    } else {
      this.animDefaultCrossfade(currentScreenEl, targetScreenEl);
    }
  }

  goBack() {
    if (this.isDemoOpen) {
      this.handleBackAction();
      return;
    }

    if (this.isAnimating) return;

    let currentId = this.state.currentScreen;
    const activeDomId = this.getActiveScreenIdFromDOM();
    // Tự động đồng bộ nếu DOM và State bị lệch pha
    if (activeDomId && activeDomId !== currentId && activeDomId !== 'screen-idle' && activeDomId !== 'screen-main') {
      console.warn(`[Router] Synchronizing state with active DOM: ${activeDomId}`);
      this.state.currentScreen = activeDomId;
      this.state.history = [];
      currentId = activeDomId;
    }

    const config = typeof this.state.getBackConfig === 'function'
      ? this.state.getBackConfig(currentId, false)
      : null;

    let prevId = config && config.targetScreen ? config.targetScreen : this.state.goBack();
    if (config && config.targetScreen) {
      this.state.currentScreen = prevId;
      if (prevId === 'screen-main') {
        this.state.history = ['screen-idle'];
      } else if (prevId === 'screen-1-3' || prevId === 'screen-1-4') {
        this.state.history = ['screen-idle', 'screen-main'];
      }
    }

    this.updateBackButtonVisibility();

    if (!prevId) {
      return;
    }

    const currentScreenEl = this.dom.screens.get(currentId);
    const prevScreenEl = this.dom.screens.get(prevId);

    if (!currentScreenEl || !prevScreenEl) return;

    // Chuyển động lùi tương ứng
    if (currentId.startsWith('screen-1-') && prevId === 'screen-main') {
      this.animLevel1ToMain(currentScreenEl, prevScreenEl);
    } else if (this.isLevel2Transition(prevId, currentId)) {
      this.animPanHorizontal(currentScreenEl, prevScreenEl, 'prev');
    } else {
      this.animDefaultCrossfade(currentScreenEl, prevScreenEl);
    }
  }

  isLevel2Transition(fromId, toId) {
    // 1.3 -> 1.3.1 / 1.3.2 hoặc 1.4 -> 1.4.1 / 1.4.2
    return (
      (fromId === 'screen-1-3' && (toId === 'screen-1-3-1' || toId === 'screen-1-3-2')) ||
      (fromId === 'screen-1-4' && (toId === 'screen-1-4-1' || toId === 'screen-1-4-2'))
    );
  }

  /* ========================================================================
     GSAP ANIMATION SEQUENCES (CHUYỂN CẢNH MƯỢT MÀ THEO MOTION BRIEF)
     ======================================================================== */

  /**
   * 1. Chuyển cảnh Trang Chờ -> Trang Chính
   * Crossfade nền + Pop-up 4 thẻ touchpoint
   */
  animIdleToMain(fromEl, toEl) {
    this.isAnimating = true;
    this.startAnimWatchdog(1500);
    const tl = gsap.timeline({
      onComplete: () => {
        this.cleanupScreens(toEl.id);
        this.clearAnimWatchdog();
        this.isAnimating = false;
      }
    });

    // 1. Fade out Trang Chờ
    tl.to(fromEl, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0);
    tl.to(this.dom.bgIdle, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0);

    // 2. Fade in Trang Chính & Nền Địa Cầu
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });
    tl.set(this.dom.bgMain, { x: '0%', scale: 1, transformOrigin: '62.7% 47%', filter: 'blur(0px)' }, 0);
    tl.to(this.dom.bgMain, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' }, 0.2);
    tl.to(toEl, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.25);

    // 3. Tiêu đề thương hiệu trượt nhẹ vào
    const brandHeading = toEl.querySelector('.brand-heading');
    if (brandHeading) {
      tl.fromTo(brandHeading,
        { opacity: 0, x: -35 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' },
        0.35
      );
    }

    // 4. Pop-up 4 thẻ touchpoints lần lượt theo brief
    const cards = toEl.querySelectorAll('.feature-card');
    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0, scale: 0.6, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: 'back.out(1.8)'
        },
        0.55
      );
    }
  }

  /**
   * 2. Chuyển cảnh Trang Chính -> Màn hình Cấp 1 (1.1, 1.2, 1.3, 1.4)
   * Theo brief & góp ý của User:
   * "Quả cầu zoom in về giữa màn hình, fade out hết text > Quả cầu nâu zoom out và mờ đi về vị trí như trang sau > Hiện title + textbox + Touchpoint"
   * Tinh chỉnh tốc độ chậm rãi, mượt mà và điện ảnh (~2.2s).
   */
  animMainToLevel1(fromEl, toEl) {
    this.isAnimating = true;
    this.startAnimWatchdog(2500);
    const tl = gsap.timeline({
      onComplete: () => {
        this.cleanupScreens(toEl.id);
        this.clearAnimWatchdog();
        this.isAnimating = false;
      }
    });

    // Giai đoạn 1: Mờ nội dung Trang Chính nhanh & Quả cầu xanh zoom in lướt tâm về chính giữa (từ 62.7% về 50%)
    tl.to(fromEl, { opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.out' }, 0);
    
    gsap.set(this.dom.bgMain, { transformOrigin: '62.7% 47%' });
    tl.to(this.dom.bgMain, {
      scale: 1.55,
      x: '-12.7%',
      opacity: 0,
      filter: 'blur(3px) brightness(1.2)',
      duration: 1.05,
      ease: 'power2.inOut'
    }, 0);

    // Giai đoạn 2: Nền chi tiết (bgDetail tại tâm giữa 50%) cross-fade gối đầu liền mạch, bắt nét êm ái với power3.out
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    gsap.set(this.dom.bgDetail, { transformOrigin: '50% 50%' });
    tl.set(this.dom.bgDetail, { scale: 1.18, opacity: 0, filter: 'blur(2px)' }, 0.3);
    tl.to(this.dom.bgDetail, {
      scale: 1.0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.85,
      ease: 'power3.out'
    }, 0.35);

    // Giai đoạn 3: "Mấy cái này tĩnh" - Tiêu đề, Card, Nút CTA trôi vào trễ nhịp nhàng ngay sau khi quả cầu định hình
    const heading = toEl.querySelector('.detail-heading');
    const cards = toEl.querySelectorAll('.detail-card, .rewards-card');
    const action = toEl.querySelector('.detail-action-container, .rewards-action-container, .feature-column .column-action');

    tl.to(toEl, { opacity: 1, duration: 0.35 }, 0.55);

    if (heading) {
      tl.fromTo(heading,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0.6
      );
    }

    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0, y: 25, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out'
        },
        0.7
      );
    }

    if (action) {
      tl.fromTo(action,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
        0.85
      );
    }
  }

  /**
   * 3. Chuyển cảnh ngược từ Màn hình Cấp 1 -> Trang Chính (Reverse Seamless Motion)
   */
  animLevel1ToMain(fromEl, toEl) {
    this.isAnimating = true;
    this.startAnimWatchdog(1500);
    const tl = gsap.timeline({
      onComplete: () => {
        this.cleanupScreens(toEl.id);
        this.clearAnimWatchdog();
        this.isAnimating = false;
      }
    });

    // 1. Thu nhỏ và mờ nhanh nội dung trang con
    tl.to(fromEl, { opacity: 0, y: 20, duration: 0.35, ease: 'power2.in' }, 0);

    // 2. Quả cầu đổi chiều: Nền chi tiết mờ đi tại giữa
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    gsap.set(this.dom.bgDetail, { transformOrigin: '50% 50%' });
    tl.to(this.dom.bgDetail, {
      opacity: 0,
      scale: 1.12,
      duration: 0.65,
      ease: 'power2.inOut'
    }, 0.05);

    if (this.dom.bgMarketplace) {
      tl.to(this.dom.bgMarketplace, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.05);
    }

    // Nền chính từ giữa thu nhỏ sắc nét và lướt về lại vị trí bên phải
    gsap.set(this.dom.bgMain, { transformOrigin: '62.7% 47%' });
    tl.set(this.dom.bgMain, { scale: 1.5, x: '-12.7%', opacity: 0 }, 0.05);
    tl.to(this.dom.bgMain, {
      scale: 1.0,
      x: '0%',
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      duration: 0.9,
      ease: 'power2.out'
    }, 0.15);

    tl.to(toEl, { opacity: 1, duration: 0.4 }, 0.35);

    const cards = toEl.querySelectorAll('.feature-card');
    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0.4, scale: 0.95 },
        { opacity: 1, scale: 1, stagger: 0.06, duration: 0.55, ease: 'power2.out' },
        0.4
      );
    }
  }

  /**
   * 4. Chuyển cảnh Pan ngang (Transition Pan text) giữa Cấp 1 và Cấp 2 (1.3 -> 1.3.1 / 1.3.2 hoặc 1.4 -> 1.4.1 / 1.4.2)
   */
  animPanHorizontal(fromEl, toEl, direction = 'next') {
    this.isAnimating = true;
    this.startAnimWatchdog(1500);
    const moveOutX = direction === 'next' ? -90 : 90;
    const moveInX = direction === 'next' ? 90 : -90;

    const tl = gsap.timeline({
      onComplete: () => {
        this.cleanupScreens(toEl.id);
        this.clearAnimWatchdog();
        this.isAnimating = false;
      }
    });

    // Trượt màn hình hiện tại ra
    tl.to(fromEl, {
      opacity: 0,
      x: moveOutX,
      duration: 0.5,
      ease: 'power2.in'
    }, 0);

    // Chuẩn bị màn hình mới
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, x: moveInX, visibility: 'visible' });

    // Chuyển background nếu vào hoặc ra khỏi Marketplace (1.4.2)
    if (this.dom.bgMarketplace) {
      if (toEl.id === 'screen-1-4-2') {
        tl.to(this.dom.bgMarketplace, { opacity: 1, duration: 0.65, ease: 'power2.out' }, 0.1);
        tl.to(this.dom.bgDetail, { opacity: 0, duration: 0.65, ease: 'power2.out' }, 0.1);
      } else if (fromEl.id === 'screen-1-4-2') {
        tl.to(this.dom.bgMarketplace, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0);
        tl.to(this.dom.bgDetail, { opacity: 1, duration: 0.65, ease: 'power2.out' }, 0.1);
      }
    }

    tl.to(toEl, {
      opacity: 1,
      x: 0,
      duration: 0.65,
      ease: 'power2.out'
    }, 0.2);

    // Stagger các thẻ số 1 2 3 (nếu là trang rewards 1.3.1, 1.3.2, 1.4.1)
    const rewardCards = toEl.querySelectorAll('.rewards-card');
    if (rewardCards.length > 0) {
      tl.fromTo(rewardCards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: 'back.out(1.2)' },
        0.35
      );
    }

    // Hiệu ứng Màn hình Marketplace (1.4.2): Heading bên trái & Banner đối tác
    const marketplaceHeading = toEl.querySelector('.marketplace-heading');
    const marketplaceInfo = toEl.querySelector('.marketplace-info');
    if (marketplaceHeading) {
      tl.fromTo(marketplaceHeading,
        { opacity: 0, x: -35 },
        { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out' },
        0.28
      );
    }
    if (marketplaceInfo) {
      tl.fromTo(marketplaceInfo,
        { opacity: 0, scale: 0.9, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.2)' },
        0.4
      );
    }

    // Hiệu ứng đầu điện thoại nhú lên từ đáy
    const phonePeek = toEl.querySelector('.phone-mockup-wrapper');
    if (phonePeek) {
      tl.fromTo(phonePeek,
        { y: 55, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.6)' },
        0.45
      );
    }
  }

  /**
   * 5. Crossfade mặc định cho các màn hình khác
   */
  animDefaultCrossfade(fromEl, toEl) {
    this.isAnimating = true;
    this.startAnimWatchdog(1500);
    const tl = gsap.timeline({
      onComplete: () => {
        this.cleanupScreens(toEl.id);
        this.clearAnimWatchdog();
        this.isAnimating = false;
      }
    });

    tl.to(fromEl, { opacity: 0, duration: 0.4 }, 0);
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    // Chuyển background nếu vào hoặc ra khỏi Marketplace (1.4.2)
    if (this.dom.bgMarketplace) {
      if (toEl.id === 'screen-1-4-2') {
        tl.to(this.dom.bgMarketplace, { opacity: 1, duration: 0.5 }, 0.1);
        tl.to(this.dom.bgDetail, { opacity: 0, duration: 0.5 }, 0.1);
      } else if (fromEl.id === 'screen-1-4-2') {
        tl.to(this.dom.bgMarketplace, { opacity: 0, duration: 0.5 }, 0);
        tl.to(this.dom.bgDetail, { opacity: 1, duration: 0.5 }, 0.1);
      }
    }

    tl.to(toEl, { opacity: 1, duration: 0.5 }, 0.2);
  }

  /**
   * Quản lý Hiển Thị Player Controls: Chạm hiện -> 5s tự động ẩn
   */
  showControlsWithTimer(durationMs = 5000) {
    if (!this.dom.videoControls) return;
    this.dom.videoControls.classList.add('is-visible');

    if (this.controlsTimer) {
      clearTimeout(this.controlsTimer);
      this.controlsTimer = null;
    }

    this.controlsTimer = setTimeout(() => {
      if (this.isDemoOpen && !this.isScrubbing) {
        this.dom.videoControls.classList.remove('is-visible');
      }
    }, durationMs);
  }

  hideControls() {
    if (!this.dom.videoControls) return;
    this.dom.videoControls.classList.remove('is-visible');
    if (this.controlsTimer) {
      clearTimeout(this.controlsTimer);
      this.controlsTimer = null;
    }
  }

  /**
   * BỘ ĐIỀU KHIỂN CHẠM DẠNG PHẲNG (FLAT TOUCH VIDEO CONTROLS)
   */
  setupVideoControls() {
    const {
      video,
      demoVideoModal,
      videoControls,
      btnPlayToggle,
      videoScrubBar,
      videoScrubProgress,
      videoScrubBuffer,
      videoScrubThumb,
      btnVideoBack
    } = this.dom;

    if (!video || !demoVideoModal) return;

    const togglePlay = () => {
      if (video.paused || video.ended) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    if (btnPlayToggle) {
      btnPlayToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
        this.showControlsWithTimer(5000);
      });
    }

    // Bấm vào video: Nếu controls đang ẩn -> hiện controls; nếu đang hiện -> toggle play/pause
    video.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = videoControls && videoControls.classList.contains('is-visible');
      if (!isVisible) {
        this.showControlsWithTimer(5000);
      } else {
        togglePlay();
        this.showControlsWithTimer(5000);
      }
    });

    video.addEventListener('play', () => this.updatePlayPauseUI(false));
    video.addEventListener('pause', () => this.updatePlayPauseUI(true));
    video.addEventListener('ended', () => {
      this.updatePlayPauseUI(true);
      this.showControlsWithTimer(8000);
    });

    video.addEventListener('timeupdate', () => {
      if (this.isScrubbing) return;
      const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      if (videoScrubProgress) videoScrubProgress.style.width = `${pct}%`;
      if (videoScrubThumb) videoScrubThumb.style.left = `${pct}%`;
      if (videoScrubBar) videoScrubBar.setAttribute('aria-valuenow', Math.round(pct));
    });

    video.addEventListener('progress', () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const pct = (bufferedEnd / video.duration) * 100;
        if (videoScrubBuffer) videoScrubBuffer.style.width = `${pct}%`;
      }
    });

    // Thanh tua tiến độ cảm ứng (Scrub Bar)
    if (videoScrubBar) {
      const updateScrub = (clientX) => {
        const rect = videoScrubBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (videoScrubProgress) videoScrubProgress.style.width = `${ratio * 100}%`;
        if (videoScrubThumb) videoScrubThumb.style.left = `${ratio * 100}%`;
        if (video.duration) {
          video.currentTime = ratio * video.duration;
        }
      };

      videoScrubBar.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.isScrubbing = true;
        videoScrubBar.setPointerCapture(e.pointerId);
        updateScrub(e.clientX);
        this.showControlsWithTimer(5000);
      });

      videoScrubBar.addEventListener('pointermove', (e) => {
        if (!this.isScrubbing) return;
        e.stopPropagation();
        updateScrub(e.clientX);
        this.showControlsWithTimer(5000);
      });

      const endScrub = (e) => {
        if (!this.isScrubbing) return;
        this.isScrubbing = false;
        try { videoScrubBar.releasePointerCapture(e.pointerId); } catch (_) {}
        this.showControlsWithTimer(5000);
      };

      videoScrubBar.addEventListener('pointerup', endScrub);
      videoScrubBar.addEventListener('pointercancel', endScrub);
    }

    // Nút Quay lại trong player
    if (btnVideoBack) {
      btnVideoBack.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDemo();
      });
    }

    // Nút Home trong player: Đóng video và quay về Trang chủ
    if (this.dom.btnVideoHome) {
      this.dom.btnVideoHome.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDemo();
        this.handleHomeAction();
      });
    }

    // Bất kỳ thao tác chạm/vuốt trên modal video -> hiện controls kèm timer 5s
    demoVideoModal.addEventListener('pointerdown', () => this.showControlsWithTimer(5000));
  }

  updatePlayPauseUI(isPaused) {
    if (this.dom.iconPlay && this.dom.iconPause) {
      this.dom.iconPlay.style.display = isPaused ? 'block' : 'none';
      this.dom.iconPause.style.display = isPaused ? 'none' : 'block';
    }
  }

  /**
   * 6. Mở màn hình Demo (Trình chiếu video full màn hình với hiệu ứng Cinematic Zoom & Focus)
   */
  openDemo(videoSrc = null) {
    if (this.isDemoOpen) return;
    this.isDemoOpen = true;

    // Xóa ngay trạng thái focus nếu có phần tử đang active
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    const targetVideo = videoSrc || this.screenVideoMap[this.state.currentScreen] || 'video/security.webm';

    if (this.dom.demoVideoModal && this.dom.video) {
      this.dom.demoVideoModal.classList.add('is-active');
      gsap.set(this.dom.demoVideoModal, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      this.updateBackButtonVisibility();

      // Mặc định không hiện player controls khi mở video
      this.hideControls();

      this.dom.video.src = targetVideo;
      this.dom.video.currentTime = 0;
      this.dom.video.play().catch(() => {});
      this.updatePlayPauseUI(false);

      // Hiệu ứng Mở Video Điện Ảnh (Cinematic Zoom & Focus Entrance Animation)
      if (this.dom.videoWrapper) {
        gsap.fromTo(this.dom.videoWrapper,
          { opacity: 0, scale: 0.88, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out', clearProps: 'filter' }
        );
      }
      return;
    }

    // Fallback modal cũ nếu có
    if (this.dom.demoModal) {
      this.dom.demoModal.classList.add('is-active');
      gsap.set(this.dom.demoModal, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      this.updateBackButtonVisibility();

      const tl = gsap.timeline();
      tl.fromTo(this.dom.demoBackdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' },
        0
      );
      tl.fromTo(this.dom.demoPhoneContainer,
        { y: '130%', scale: 0.88 },
        { y: '0%', scale: 1, duration: 0.8, ease: 'power3.out' },
        0.05
      );
    }
  }

  /**
   * 7. Đóng màn hình Demo
   */
  closeDemo() {
    if (!this.isDemoOpen) return;

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    this.hideControls();

    const finishClose = () => {
      if (this.dom.video) {
        this.dom.video.pause();
        this.dom.video.removeAttribute('src');
        this.dom.video.load();
      }

      if (this.dom.demoVideoModal) {
        this.dom.demoVideoModal.classList.remove('is-active');
        gsap.set(this.dom.demoVideoModal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      }

      if (this.dom.demoModal) {
        this.dom.demoModal.classList.remove('is-active');
        gsap.set(this.dom.demoModal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        if (this.dom.demoPhoneContainer) {
          gsap.set(this.dom.demoPhoneContainer, { y: '130%' });
        }
      }

      this.isDemoOpen = false;
      this.updateBackButtonVisibility();
    };

    if (this.dom.demoVideoModal && this.dom.demoVideoModal.classList.contains('is-active') && this.dom.videoWrapper) {
      gsap.to(this.dom.videoWrapper, {
        opacity: 0,
        scale: 0.92,
        filter: 'blur(6px)',
        duration: 0.35,
        ease: 'power2.in',
        onComplete: finishClose
      });
    } else {
      finishClose();
    }
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppMotionController();
  console.log('MSB Interactive LED SPA initialized successfully.');
});
