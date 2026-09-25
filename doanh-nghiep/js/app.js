/**
 * MSB Digital Universe - Interactive LED Single Page Application (Doanh Nghiệp)
 * Motion Engine powered by GSAP 3.x & DoanhNghiepStateManager
 * LED Kiosk Resolution: 1535 x 576 px
 */

import { DoanhNghiepStateManager } from './state-manager.js';

class DoanhNghiepMotionController {
  constructor() {
    // Khởi tạo state manager với idle timeout 5 phút (300.000 ms)
    this.state = new DoanhNghiepStateManager({
      initialScreen: 'screen-idle',
      idleTimeoutMs: 300000,
      onTimeout: () => {
        this.forceNavigateToIdle();
      }
    });

    this.isAnimating = false;
    this.animWatchdog = null;
    this.isDemoOpen = false;
    this.activeDemoModal = null;
    this.isScrubbing = false;
    this.isAdjustingVolume = false;
    this.controlsDimTimer = null;
    this.lastVolume = 1;

    // Mapping video chuẩn theo từng màn hình (Hosted trên GitHub Releases CDN)
    this.screenVideoMap = {
      'screen-1-1': 'https://github.com/23021813/lottery_lpmedia/releases/download/media-doanh-nghiep/quan-tri-dich-vu.webm',
      'screen-1-2': 'https://github.com/23021813/lottery_lpmedia/releases/download/media-doanh-nghiep/ket-noi-doi-tac.webm',
      'screen-1-3-1': 'https://github.com/23021813/lottery_lpmedia/releases/download/media-doanh-nghiep/tin-dung-linh-hoat.webm',
      'screen-1-3-2': 'https://github.com/23021813/lottery_lpmedia/releases/download/media-doanh-nghiep/tai-cap-han-muc.webm',
      'screen-1-3-3': 'https://github.com/23021813/lottery_lpmedia/releases/download/media-doanh-nghiep/the-tin-dung.webm',
      'screen-1-3-4': 'https://github.com/23021813/lottery_lpmedia/releases/download/media-doanh-nghiep/chung-chi-tien-gui.webm',
      'screen-1-3-5': 'https://github.com/23021813/lottery_lpmedia/releases/download/media-doanh-nghiep/msb-rewards.webm'
    };

    // Cache các phần tử DOM chính
    this.dom = {
      stage: document.getElementById('screenStage'),
      bgMain: document.getElementById('bgLayerMain'),
      bgDetail: document.getElementById('bgLayerDetail'),
      bgDetail2: document.getElementById('bgLayerDetail2'),
      btnBack: document.getElementById('btnGlobalBack'),
      btnHome: document.getElementById('btnGlobalHome'),
      modalDesktop: document.getElementById('screen-demo-desktop'),
      modalPhone: document.getElementById('screen-demo-phone'),
      modalDesktopTitle: document.getElementById('demoDesktopTitle'),
      modalPhoneTitle: document.getElementById('demoPhoneTitle'),
      btnDemoDesktopClose: document.getElementById('btnDemoDesktopClose'),
      btnDemoPhoneClose: document.getElementById('btnDemoPhoneClose'),
      // Video Presentation Player & Flat Touch Controls
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

    // Thu thập tất cả 10 screen views
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
    // Thiết lập hiển thị ban đầu: chỉ có screen-idle active
    this.dom.screens.forEach((el, id) => {
      if (id === 'screen-idle') {
        el.classList.add('active');
        gsap.set(el, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      } else {
        el.classList.remove('active');
        gsap.set(el, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      }
    });

    // Các layer nền
    gsap.set(this.dom.bgMain, {
      opacity: 1,
      scale: 1,
      x: '0%',
      transformOrigin: '62.7% center',
      filter: 'blur(0px)'
    });
    gsap.set(this.dom.bgDetail, {
      opacity: 0,
      scale: 1,
      transformOrigin: '50% 50%',
      filter: 'blur(0px)'
    });
    gsap.set(this.dom.bgDetail2, {
      opacity: 0,
      scale: 1,
      filter: 'blur(0px)'
    });

    // Các modal demo
    if (this.dom.modalDesktop) {
      this.dom.modalDesktop.classList.remove('active');
      gsap.set(this.dom.modalDesktop, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
    }
    if (this.dom.modalPhone) {
      this.dom.modalPhone.classList.remove('active');
      gsap.set(this.dom.modalPhone, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
    }

    // Nút Back
    this.updateBackButtonVisibility();
  }

  updateBackButtonVisibility() {
    this.updateNavigationDocks();

    if (!this.dom.btnBack) return;
    const config = typeof this.state.getBackConfig === 'function'
      ? this.state.getBackConfig(this.state.currentScreen, this.isDemoOpen)
      : null;

    if (config) {
      this.dom.btnBack.classList.add('is-visible');
      const imgBack = this.dom.btnBack.querySelector('.img-back') || this.dom.btnBack.querySelector('img');
      if (config.position === 'left') {
        this.dom.btnBack.classList.remove('pos-right', 'right');
        this.dom.btnBack.classList.add('pos-left', 'left');
        if (imgBack && !imgBack.src.endsWith('icon-back2.png')) {
          imgBack.src = 'images/icon-back2.png';
        }
      } else {
        this.dom.btnBack.classList.remove('pos-left', 'left');
        this.dom.btnBack.classList.add('pos-right', 'right');
        if (imgBack && !imgBack.src.endsWith('icon-back.png')) {
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
    // Kiosk Protection: Chặn chuột phải (contextmenu), vẫn cho phép inspect qua F12 / DevTools
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('dragstart', (e) => e.preventDefault());

    // 0. Hệ thống Điều hướng kép 2 bên (Side Navigation Docks: Home & Back)
    document.querySelectorAll('.nav-btn[data-nav="home"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.blur();
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        this.handleHomeAction();
      });
    });

    document.querySelectorAll('.nav-btn[data-nav="back"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.blur();
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        this.handleBackAction();
      });
    });

    // Nút quay lại toàn cục cũ (nếu có trong DOM)
    if (this.dom.btnBack) {
      this.dom.btnBack.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleBackAction();
      });
    }

    // Nút Home góc trên toàn cục cũ (nếu có trong DOM)
    if (this.dom.btnHome) {
      this.dom.btnHome.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleHomeAction();
      });
    }

    // Chạm vào trang chờ -> Chuyển sang trang chính
    const idleScreen = this.dom.screens.get('screen-idle');
    if (idleScreen) {
      idleScreen.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateTo('screen-main');
      });
    }

    // Lắng nghe click / touch trên stage
    this.dom.stage.addEventListener('click', (e) => {
      // Nếu đang ở trang chờ mà chạm bất kỳ đâu -> vào trang chính
      if (this.state.currentScreen === 'screen-idle') {
        e.preventDefault();
        this.navigateTo('screen-main');
        return;
      }

      // Xử lý nút kích hoạt Demo modal (Trải nghiệm ngay)
      const demoTrigger = e.target.closest('[data-demo-target], [data-demo-video]');
      if (demoTrigger) {
        e.preventDefault();
        e.stopPropagation();
        const demoType = demoTrigger.getAttribute('data-demo-target') || 'desktop';
        const demoTitle = demoTrigger.getAttribute('data-demo-title') || 'Trải nghiệm dịch vụ';
        const demoVideo = demoTrigger.getAttribute('data-demo-video') || null;
        this.openDemo(demoType, demoTitle, demoVideo);
        return;
      }

      // Xử lý nút điều hướng (data-screen)
      const screenTrigger = e.target.closest('[data-screen]');
      if (screenTrigger) {
        e.preventDefault();
        const targetScreen = screenTrigger.getAttribute('data-screen');
        if (targetScreen) {
          this.navigateTo(targetScreen);
        }
      }
    });

    // Nút đóng demo
    if (this.dom.btnDemoDesktopClose) {
      this.dom.btnDemoDesktopClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDemo();
      });
    }
    if (this.dom.btnDemoPhoneClose) {
      this.dom.btnDemoPhoneClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDemo();
      });
    }

    // Đóng demo khi click vào vùng tối mờ bên ngoài
    if (this.dom.modalDesktop) {
      this.dom.modalDesktop.addEventListener('click', (e) => {
        if (!e.target.closest('.demo-modal-container')) {
          this.closeDemo();
        }
      });
    }
    if (this.dom.modalPhone) {
      this.dom.modalPhone.addEventListener('click', (e) => {
        if (!e.target.closest('.demo-modal-container')) {
          this.closeDemo();
        }
      });
    }

    // Phím Escape để quay lại
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

    // Cử chỉ vuốt cảm ứng (Swipe Back)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const onSwipeStart = (x, y) => {
      touchStartX = x;
      touchStartY = y;
      touchStartTime = Date.now();
    };

    const onSwipeEnd = (x, y) => {
      const deltaX = x - touchStartX;
      const deltaY = y - touchStartY;
      const elapsed = Date.now() - touchStartTime;

      if (elapsed > 700) return;

      // Đang mở demo modal: vuốt xuống hoặc vuốt phải -> đóng demo
      if (this.isDemoOpen) {
        if (deltaY > 60 || deltaX > 80) {
          this.closeDemo();
        }
        return;
      }

      // Đang ở màn hình con: vuốt từ trái sang phải (> 70px) -> Back
      if (deltaX > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        this.goBack();
      }
    };

    this.dom.stage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.dom.stage.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        onSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: true });

    // Hỗ trợ chuột kéo swipe khi test trên Desktop
    let isMouseDown = false;
    this.dom.stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('[data-screen], [data-demo-target], button, a')) return;
      isMouseDown = true;
      onSwipeStart(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
      if (isMouseDown) {
        isMouseDown = false;
        onSwipeEnd(e.clientX, e.clientY);
      }
    });
  }

  /* ========================================================================
     ROUTING & ANIMATION DISPATCHER (VỚI WATCHDOG & CLEANUP TOÀN CỤC)
     ======================================================================== */
  startAnimWatchdog(timeoutMs = 1500) {
    this.clearAnimWatchdog();
    this.animWatchdog = setTimeout(() => {
      console.warn('[DoanhNghiepMotionController] Animation watchdog timeout: giải phóng isAnimating');
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
      if (id !== 'screen-idle' && (el.classList.contains('active') || el.classList.contains('is-active'))) {
        return id;
      }
    }
    return this.state.currentScreen;
  }

  cleanupScreens(activeId) {
    this.dom.screens.forEach((screenEl, screenId) => {
      if (screenId === activeId) {
        screenEl.classList.add('active');
        screenEl.classList.remove('is-active');
        gsap.set(screenEl, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      } else {
        screenEl.classList.remove('active', 'is-active');
        gsap.set(screenEl, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      }
    });
  }

  forceNavigateToIdle() {
    // 1. Đóng toàn bộ modal demo / video nếu đang mở
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
    gsap.killTweensOf([this.dom.bgMain, this.dom.bgDetail, this.dom.bgDetail2].filter(Boolean));

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
    tl.to([this.dom.bgDetail, this.dom.bgDetail2].filter(Boolean), {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, 0);

    // Kích hoạt screen-idle
    idleEl.classList.add('active');
    gsap.set(idleEl, { opacity: 0, visibility: 'visible', pointerEvents: 'auto' });
    tl.to(idleEl, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.2);
  }

  navigateTo(targetId) {
    if (this.isAnimating) return;
    const currentId = this.state.currentScreen;
    if (currentId === targetId) return;

    if (!this.state.isValidScreen(targetId)) {
      console.warn(`[Router] Invalid screen target: ${targetId}`);
      return;
    }

    // Tự động kiểm tra phần tử DOM đang active thực tế nếu có lệch pha
    let fromId = currentId;
    const activeDomId = this.getActiveScreenIdFromDOM();
    if (activeDomId && activeDomId !== currentId && this.dom.screens.has(activeDomId)) {
      fromId = activeDomId;
    }

    const currentEl = this.dom.screens.get(fromId) || this.dom.screens.get(currentId);
    const targetEl = this.dom.screens.get(targetId);

    if (!targetEl) return;

    this.state.navigateTo(targetId);
    this.updateBackButtonVisibility();

    // Chọn hiệu ứng chuyển cảnh phù hợp
    if (fromId === 'screen-idle' && targetId === 'screen-main') {
      this.animIdleToMain(currentEl, targetEl);
    } else if (fromId === 'screen-main' && targetId.startsWith('screen-1-')) {
      this.animMainToLevel1(currentEl, targetEl);
    } else if (targetId === 'screen-main' && fromId.startsWith('screen-1-')) {
      this.animLevel1ToMain(currentEl, targetEl);
    } else if (this.isLevel2Transition(fromId, targetId)) {
      this.animPanHorizontal(currentEl, targetEl, 'next');
    } else {
      this.animDefaultCrossfade(currentEl, targetEl);
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
      } else if (prevId === 'screen-1-3') {
        this.state.history = ['screen-idle', 'screen-main'];
      }
    }

    this.updateBackButtonVisibility();

    if (!prevId) return;

    const currentEl = this.dom.screens.get(currentId);
    const prevEl = this.dom.screens.get(prevId);

    if (!currentEl || !prevEl) return;

    if (currentId.startsWith('screen-1-') && !currentId.startsWith('screen-1-3-') && prevId === 'screen-main') {
      this.animLevel1ToMain(currentEl, prevEl);
    } else if (currentId === 'screen-1-3' && prevId === 'screen-main') {
      this.animLevel1ToMain(currentEl, prevEl);
    } else if (currentId.startsWith('screen-1-3-') && prevId === 'screen-1-3') {
      this.animPanHorizontal(currentEl, prevEl, 'prev');
    } else {
      this.animDefaultCrossfade(currentEl, prevEl);
    }
  }

  isLevel2Transition(fromId, toId) {
    return fromId === 'screen-1-3' && toId.startsWith('screen-1-3-');
  }

  /* ========================================================================
     GSAP TIMELINES
     ======================================================================== */

  /**
   * 1. animIdleToMain
   * Note specs: "Từ trang chờ sang trang chính hiện nền và tiêu đề trước, 3 textbox pop-up sau"
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

    // Mờ dần trang chờ
    tl.to(fromEl, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0);

    // Kích hoạt trang chính
    toEl.classList.add('active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    // Nền hiện rõ và tiêu đề thương hiệu trượt nhẹ vào trước
    tl.set(this.dom.bgMain, { x: '0%', scale: 1, transformOrigin: '62.7% center', filter: 'blur(0px)' }, 0);
    tl.to(this.dom.bgMain, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.1);
    tl.to(toEl, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.15);

    const brandHeading = toEl.querySelector('.brand-heading');
    if (brandHeading) {
      tl.fromTo(brandHeading,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out' },
        0.2
      );
    }

    // 3 textbox (feature cards) pop-up sau nhịp nhàng
    const cards = toEl.querySelectorAll('.feature-card');
    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0, scale: 0.6, y: 35 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.14,
          duration: 0.65,
          ease: 'back.out(1.8)'
        },
        0.45
      );
    }
  }

  /**
   * 2. animMainToLevel1
   * Note specs: "Quả địa cầu zoom về chính giữa màn hình rồi khi zoom out là vào đúng vị trí của trang sau"
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

    // Mờ nhanh nội dung trang chính
    tl.to(fromEl, { opacity: 0, scale: 0.96, duration: 0.35, ease: 'power2.out' }, 0);

    // Quả cầu từ vị trí 62.7% zoom in và lướt tâm về chính giữa 50%
    gsap.set(this.dom.bgMain, { transformOrigin: '62.7% center' });
    tl.to(this.dom.bgMain, {
      scale: 1.55,
      x: '-12.7%',
      opacity: 0,
      filter: 'blur(3px) brightness(1.15)',
      duration: 1.0,
      ease: 'power2.inOut'
    }, 0);

    // Nền chi tiết (bgDetail ở giữa 50%) cross-fade gối đầu và bắt nét
    toEl.classList.add('active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    gsap.set(this.dom.bgDetail, { transformOrigin: '50% 50%' });
    tl.set(this.dom.bgDetail, { scale: 1.18, opacity: 0, filter: 'blur(2px)' }, 0.28);
    tl.to(this.dom.bgDetail, {
      scale: 1.0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.85,
      ease: 'power3.out'
    }, 0.35);

    // Tiêu đề, thẻ và nút CTA trôi vào êm ái
    const heading = toEl.querySelector('.detail-heading');
    const cards = toEl.querySelectorAll('.toiuu-card');
    const action = toEl.querySelector('.rewards-action-container');

    tl.to(toEl, { opacity: 1, duration: 0.35 }, 0.5);

    if (heading) {
      tl.fromTo(heading,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0.55
      );
    }

    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0, y: 24, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'transform'
        },
        0.65
      );
    }

    if (action) {
      tl.fromTo(action,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
        0.8
      );
    }
  }

  /**
   * 3. animLevel1ToMain
   * Reverse Zoom mượt mà về lại Trang Chính
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

    // Mờ nội dung trang con
    tl.to(fromEl, { opacity: 0, y: 18, duration: 0.35, ease: 'power2.in' }, 0);

    toEl.classList.add('active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    // Nền chi tiết mờ đi
    gsap.set(this.dom.bgDetail, { transformOrigin: '50% 50%' });
    tl.to(this.dom.bgDetail, {
      opacity: 0,
      scale: 1.12,
      duration: 0.65,
      ease: 'power2.inOut'
    }, 0.05);

    // Nền chính từ giữa thu nhỏ sắc nét và lướt về lại vị trí bên phải
    gsap.set(this.dom.bgMain, { transformOrigin: '62.7% center' });
    tl.set(this.dom.bgMain, { scale: 1.5, x: '-12.7%', opacity: 0 }, 0.05);
    tl.to(this.dom.bgMain, {
      scale: 1.0,
      x: '0%',
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      duration: 0.85,
      ease: 'power2.out'
    }, 0.15);

    tl.to(toEl, { opacity: 1, duration: 0.4 }, 0.35);

    const cards = toEl.querySelectorAll('.feature-card');
    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0.4, scale: 0.95 },
        { opacity: 1, scale: 1, stagger: 0.06, duration: 0.5, ease: 'power2.out' },
        0.4
      );
    }
  }

  /**
   * 4. animPanHorizontal
   * Note specs: "Pan text ngang" giữa 1.3 và 1.3.x
   */
  animPanHorizontal(fromEl, toEl, direction = 'next') {
    this.isAnimating = true;
    this.startAnimWatchdog(1500);
    const moveOutX = direction === 'next' ? -80 : 80;
    const moveInX = direction === 'next' ? 80 : -80;

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
      duration: 0.45,
      ease: 'power2.in'
    }, 0);

    // Trượt màn hình mới vào
    toEl.classList.add('active');
    gsap.set(toEl, { opacity: 0, x: moveInX, visibility: 'visible' });

    tl.to(toEl, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, 0.15);

    // Stagger các thẻ
    const cards = toEl.querySelectorAll('.toiuu-card');
    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.55,
          ease: 'back.out(1.2)',
          clearProps: 'transform'
        },
        0.3
      );
    }

    const action = toEl.querySelector('.rewards-action-container');
    if (action) {
      tl.fromTo(action,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0.45
      );
    }
  }

  /**
   * 5. animDefaultCrossfade
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

    tl.to(fromEl, { opacity: 0, duration: 0.35 }, 0);
    toEl.classList.add('active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });
    tl.to(toEl, { opacity: 1, duration: 0.45 }, 0.15);
  }

  /**
   * 6. openDemo(demoType, title, videoSrc)
   * Trình chiếu video full màn hình với hiệu ứng Cinematic Zoom & Focus
   */
  openDemo(demoType = 'desktop', title = 'Trải nghiệm dịch vụ', videoSrc = null) {
    if (this.isDemoOpen) return;
    this.isDemoOpen = true;

    // Tìm video tương ứng
    const targetVideo = videoSrc || this.screenVideoMap[this.state.currentScreen] || null;

    if (this.dom.demoVideoModal && this.dom.video && targetVideo) {
      this.activeDemoModal = this.dom.demoVideoModal;
      this.dom.demoVideoModal.classList.add('active');
      gsap.set(this.dom.demoVideoModal, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
      this.updateBackButtonVisibility();

      // Mặc định không hiện player controls khi mở video
      this.hideControls();

      this.dom.video.onerror = () => {
        const currentSrc = this.dom.video.src || '';
        if (currentSrc.includes('github.com')) {
          const fileName = currentSrc.split('/').pop();
          console.warn(`[VideoFallback] Fallback sang video local: video/${fileName}`);
          this.dom.video.onerror = null;
          this.dom.video.src = `video/${fileName}`;
          this.dom.video.play().catch(() => {});
        }
      };

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
    const modal = demoType === 'phone' ? this.dom.modalPhone : this.dom.modalDesktop;
    const titleEl = demoType === 'phone' ? this.dom.modalPhoneTitle : this.dom.modalDesktopTitle;

    if (!modal) return;
    this.activeDemoModal = modal;

    if (titleEl && title) {
      titleEl.textContent = title;
    }

    modal.classList.add('active');
    gsap.set(modal, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
    this.updateBackButtonVisibility();

    const container = modal.querySelector('.demo-modal-container');
    if (container) {
      gsap.fromTo(container,
        { opacity: 0, scale: 0.94, y: 35 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }

  /**
   * 7. closeDemo()
   */
  closeDemo() {
    if (!this.isDemoOpen) return;

    if (this.dom.demoVideoModal) {
      this.dom.demoVideoModal.style.pointerEvents = 'none';
    }

    this.hideControls();

    const finishClose = () => {
      if (this.dom.video) {
        this.dom.video.pause();
        this.dom.video.removeAttribute('src');
        this.dom.video.load();
      }

      const modal = this.activeDemoModal || this.dom.demoVideoModal;
      if (modal) {
        modal.classList.remove('active');
        gsap.set(modal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
      }

      this.isDemoOpen = false;
      this.activeDemoModal = null;
      this.updateBackButtonVisibility();
    };

    if (this.activeDemoModal === this.dom.demoVideoModal && this.dom.videoWrapper) {
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

  /**
   * 8. Quản lý Hiển Thị Player Controls: Chạm hiện -> 5s tự động ẩn
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
   * 9. setupVideoControls()
   * Thiết lập tương tác cho bộ điều khiển video dạng phẳng (Flat Touch Controls)
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
    let controlsWereVisibleOnPointerDown = false;
    demoVideoModal.addEventListener('pointerdown', () => {
      controlsWereVisibleOnPointerDown = this.dom.videoControls && this.dom.videoControls.classList.contains('is-visible');
      this.showControlsWithTimer(5000);
    });

    if (video) {
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        this.updatePlayPauseUI(true);
      });
    }

    window.addEventListener('pointerup', () => {
      if (this.isScrubbing) this.isScrubbing = false;
    });
  }

  updatePlayPauseUI(isPaused) {
    if (this.dom.iconPlay && this.dom.iconPause) {
      this.dom.iconPlay.style.display = isPaused ? 'block' : 'none';
      this.dom.iconPause.style.display = isPaused ? 'none' : 'block';
    }
  }

  resetControlsAutoDim() {
    if (this.controlsDimTimer) {
      clearTimeout(this.controlsDimTimer);
      this.controlsDimTimer = null;
    }
    if (this.dom.videoControls) {
      this.dom.videoControls.classList.remove('is-dimmed');
    }
    if (this.dom.video && !this.dom.video.paused && !this.dom.video.ended) {
      this.controlsDimTimer = setTimeout(() => {
        if (this.dom.video && !this.dom.video.paused && this.dom.videoControls && !this.isScrubbing && !this.isAdjustingVolume) {
          this.dom.videoControls.classList.add('is-dimmed');
        }
      }, 4000);
    }
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.appController = new DoanhNghiepMotionController();
  console.log('MSB Doanh Nghiệp Interactive LED SPA initialized.');
});
