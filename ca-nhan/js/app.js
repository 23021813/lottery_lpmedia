/**
 * MSB Digital Universe - Interactive LED Single Page Application
 * Motion Engine powered by GSAP 3.x & AppStateManager
 * Resolution: 1535 x 576 px
 */

import { AppStateManager } from './state-manager.js';

class AppMotionController {
  constructor() {
    this.state = new AppStateManager({
      initialScreen: 'screen-idle'
    });

    this.isAnimating = false;
    this.isDemoOpen = false;

    // DOM Elements Cache
    this.dom = {
      stage: document.getElementById('screenStage'),
      bgMain: document.getElementById('bgLayerMain'),
      bgDetail: document.getElementById('bgLayerDetail'),
      bgIdle: document.getElementById('bgLayerIdle'),
      demoModal: document.getElementById('screen-demo'),
      demoBackdrop: document.getElementById('demoBackdrop'),
      demoPhoneContainer: document.getElementById('demoPhoneContainer'),
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
    this.applyInitialState();
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
    gsap.set(this.dom.bgMain, { opacity: 0, scale: 1 });
    gsap.set(this.dom.bgDetail, { opacity: 0, scale: 1 });

    // Demo phone modal initial state (Hoàn toàn ẩn và không cản trở tương tác)
    gsap.set(this.dom.demoModal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
    gsap.set(this.dom.demoBackdrop, { opacity: 0 });
    gsap.set(this.dom.demoPhoneContainer, { y: '100%' });
  }

  setupEventListeners() {
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

      // Xử lý nút/vùng mở Demo Phone (1.1, 1.2, 1.3.1, 1.3.2, 1.4.1)
      const demoTrigger = e.target.closest('[data-demo="true"]');
      if (demoTrigger) {
        e.preventDefault();
        e.stopPropagation();
        this.openDemo();
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
        if (this.isDemoOpen) {
          this.closeDemo();
        } else {
          this.goBack();
        }
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
     ROUTING & NAVIGATION DISPATCHER
     ======================================================================== */
  navigateTo(targetId) {
    if (this.isAnimating) return;
    const currentId = this.state.currentScreen;
    if (currentId === targetId) return;

    if (!this.state.isValidScreen(targetId)) {
      console.warn(`Unknown screen target: ${targetId}`);
      return;
    }

    const currentScreenEl = this.dom.screens.get(currentId);
    const targetScreenEl = this.dom.screens.get(targetId);

    if (!targetScreenEl) return;

    // Ghi nhận vào state history
    this.state.navigateTo(targetId);

    // Quyết định loại hiệu ứng dựa trên cặp màn hình
    if (currentId === 'screen-idle' && targetId === 'screen-main') {
      this.animIdleToMain(currentScreenEl, targetScreenEl);
    } else if (currentId === 'screen-main' && targetId.startsWith('screen-1-')) {
      this.animMainToLevel1(currentScreenEl, targetScreenEl);
    } else if (this.isLevel2Transition(currentId, targetId)) {
      this.animPanHorizontal(currentScreenEl, targetScreenEl, 'next');
    } else {
      this.animDefaultCrossfade(currentScreenEl, targetScreenEl);
    }
  }

  goBack() {
    // Nếu đang mở Demo phone thì ưu tiên đóng demo trước
    if (this.isDemoOpen) {
      this.closeDemo();
      return;
    }

    if (this.isAnimating) return;

    const currentId = this.state.currentScreen;
    const prevId = this.state.goBack();

    if (!prevId) {
      // Đã ở trang gốc
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
    const tl = gsap.timeline({
      onComplete: () => {
        fromEl.classList.remove('is-active');
        gsap.set(fromEl, { pointerEvents: 'none' });
        toEl.classList.add('is-active');
        gsap.set(toEl, { pointerEvents: 'auto' });
        this.isAnimating = false;
      }
    });

    // 1. Fade out Trang Chờ
    tl.to(fromEl, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0);
    tl.to(this.dom.bgIdle, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0);

    // 2. Fade in Trang Chính & Nền Địa Cầu
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });
    tl.to(this.dom.bgMain, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.2);
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
    const tl = gsap.timeline({
      onComplete: () => {
        fromEl.classList.remove('is-active');
        gsap.set(fromEl, { pointerEvents: 'none' });
        toEl.classList.add('is-active');
        gsap.set(toEl, { pointerEvents: 'auto' });
        this.isAnimating = false;
      }
    });

    // Giai đoạn 1: Fade out toàn bộ text Trang Chính & Quả cầu xanh zoom in về giữa màn hình
    tl.to(fromEl, { opacity: 0, scale: 0.94, duration: 0.65, ease: 'power2.in' }, 0);
    tl.to(this.dom.bgMain, {
      scale: 1.48,
      filter: 'brightness(1.28)',
      duration: 1.15,
      ease: 'power1.inOut'
    }, 0);

    // Giai đoạn 2: Quả cầu nâu zoom out từ 1.35 về 1.0 và mờ dần vào vị trí trang sau
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    tl.set(this.dom.bgDetail, { scale: 1.35, opacity: 0 }, 0.6);
    tl.to(this.dom.bgDetail, {
      scale: 1.0,
      opacity: 1,
      duration: 1.15,
      ease: 'power2.out'
    }, 0.7);

    tl.to(this.dom.bgMain, { opacity: 0, duration: 0.65 }, 0.75);

    // Giai đoạn 3: Hiện title + textbox + Touchpoint của trang cấp 1
    const heading = toEl.querySelector('.detail-heading');
    const cards = toEl.querySelectorAll('.detail-card, .rewards-card');
    const action = toEl.querySelector('.detail-action-container, .rewards-action-container');

    tl.to(toEl, { opacity: 1, duration: 0.5 }, 1.1);

    if (heading) {
      tl.fromTo(heading,
        { opacity: 0, y: -25 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        1.15
      );
    }

    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.12,
          duration: 0.75,
          ease: 'back.out(1.3)'
        },
        1.25
      );
    }

    if (action) {
      tl.fromTo(action,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
        1.45
      );
    }
  }

  /**
   * 3. Chuyển cảnh ngược từ Màn hình Cấp 1 -> Trang Chính (Slower & Majestic)
   */
  animLevel1ToMain(fromEl, toEl) {
    this.isAnimating = true;
    const tl = gsap.timeline({
      onComplete: () => {
        fromEl.classList.remove('is-active');
        gsap.set(fromEl, { pointerEvents: 'none' });
        toEl.classList.add('is-active');
        gsap.set(toEl, { pointerEvents: 'auto' });
        this.isAnimating = false;
      }
    });

    // 1. Thu nhỏ và mờ nội dung trang con
    tl.to(fromEl, { opacity: 0, y: 25, duration: 0.55, ease: 'power2.in' }, 0);

    // 2. Quả cầu đổi chiều: Nền chi tiết mờ đi, Nền chính zoom từ 1.4 về 1.0
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });

    tl.to(this.dom.bgDetail, { opacity: 0, scale: 1.2, duration: 0.85, ease: 'power2.inOut' }, 0.1);
    tl.set(this.dom.bgMain, { scale: 1.38, opacity: 0 }, 0.1);
    tl.to(this.dom.bgMain, {
      scale: 1.0,
      opacity: 1,
      filter: 'brightness(1)',
      duration: 1.05,
      ease: 'power2.out'
    }, 0.25);

    tl.to(toEl, { opacity: 1, duration: 0.6 }, 0.4);

    const cards = toEl.querySelectorAll('.feature-card');
    if (cards.length > 0) {
      tl.fromTo(cards,
        { opacity: 0.4, scale: 0.92 },
        { opacity: 1, scale: 1, stagger: 0.09, duration: 0.6, ease: 'power2.out' },
        0.5
      );
    }
  }

  /**
   * 4. Chuyển cảnh Pan ngang (Transition Pan text) giữa Cấp 1 và Cấp 2 (1.3 -> 1.3.1 / 1.3.2 hoặc 1.4 -> 1.4.1 / 1.4.2)
   */
  animPanHorizontal(fromEl, toEl, direction = 'next') {
    this.isAnimating = true;
    const moveOutX = direction === 'next' ? -90 : 90;
    const moveInX = direction === 'next' ? 90 : -90;

    const tl = gsap.timeline({
      onComplete: () => {
        fromEl.classList.remove('is-active');
        gsap.set(fromEl, { x: 0, pointerEvents: 'none' });
        toEl.classList.add('is-active');
        gsap.set(toEl, { pointerEvents: 'auto' });
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

    // Hiệu ứng container TBU (nếu là màn hình 1.4.2)
    const tbuBox = toEl.querySelector('.tbu-container');
    if (tbuBox) {
      tl.fromTo(tbuBox,
        { opacity: 0, scale: 0.9, y: 25 },
        { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'back.out(1.4)' },
        0.35
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
    const tl = gsap.timeline({
      onComplete: () => {
        fromEl.classList.remove('is-active');
        gsap.set(fromEl, { pointerEvents: 'none' });
        toEl.classList.add('is-active');
        gsap.set(toEl, { pointerEvents: 'auto' });
        this.isAnimating = false;
      }
    });

    tl.to(fromEl, { opacity: 0, duration: 0.4 }, 0);
    toEl.classList.add('is-active');
    gsap.set(toEl, { opacity: 0, visibility: 'visible' });
    tl.to(toEl, { opacity: 1, duration: 0.5 }, 0.2);
  }

  /**
   * 6. Mở màn hình Demo (Mô hình Điện thoại trượt từ dưới lên vào vị trí giữa màn hình)
   * Kích hoạt từ 1.1 CTA, 1.2 CTA, 1.3.1 (card 1-2-3 & cta), 1.3.2 (card 1-2-3 & cta), 1.4.1 (card 1-2-3 & cta)
   */
  openDemo() {
    if (this.isDemoOpen) return;
    this.isDemoOpen = true;

    // Kích hoạt layer modal: Hiển thị rõ ràng (opacity: 1), nhận pointer-events
    this.dom.demoModal.classList.add('is-active');
    gsap.set(this.dom.demoModal, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });

    const tl = gsap.timeline();

    // 1. Làm mờ nền backdrop phía sau
    tl.fromTo(this.dom.demoBackdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
      0
    );

    // 2. Điện thoại trượt từ dưới đáy lên chiếm trọn trung tâm màn hình
    tl.fromTo(this.dom.demoPhoneContainer,
      { y: '100%', scale: 0.88 },
      { y: '0%', scale: 1, duration: 0.8, ease: 'power3.out' },
      0.05
    );
  }

  /**
   * 7. Đóng màn hình Demo (Điện thoại trượt xuống lại đáy)
   */
  closeDemo() {
    if (!this.isDemoOpen) return;

    const tl = gsap.timeline({
      onComplete: () => {
        this.dom.demoModal.classList.remove('is-active');
        gsap.set(this.dom.demoModal, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        this.isDemoOpen = false;
      }
    });

    // 1. Điện thoại trượt xuống đáy
    tl.to(this.dom.demoPhoneContainer, {
      y: '100%',
      scale: 0.9,
      duration: 0.5,
      ease: 'power2.in'
    }, 0);

    // 2. Backdrop mờ dần
    tl.to(this.dom.demoBackdrop, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.15);
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppMotionController();
  console.log('MSB Interactive LED SPA initialized successfully.');
});
