# Kế Hoạch Triển Khai: Tối Ưu Màn Hình Quay Số Cho Màn Chiếu 3m x 1,5m (1152 x 576 px)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu hóa toàn bộ giao diện màn hình quay thưởng `Final.html` hiển thị vừa khít 100% không cuộn trang (Zero Scroll) trên màn chiếu sân khấu tỷ lệ 2:1 (1152x576 px), chuyển đổi lưới 16 ô sang bố cục 8 cột x 2 hàng, gộp Topbar tinh gọn và thu gọn Modal vinh danh vừa vặn trong 576px chiều cao.

**Architecture:** Sử dụng CSS Grid `repeat(8, 1fr)` kết hợp Flexbox và CSS Media Query định vị khung nhìn thấp (`max-height: 650px`). Tái cấu trúc Header và Action buttons thành Top Stage Bar nằm ngang. Khóa cứng `height: 100vh; overflow: hidden;` để loại bỏ hoàn toàn thanh cuộn chuột trên sân khấu.

**Tech Stack:** HTML5, CSS3 (CSS Grid, Media Queries, Viewport Units `vh/vw`), Vanilla JavaScript, Node.js Assertions Test Runner.

---

### Task 1: Tạo Bộ Kiểm Thử TDD Cho Màn Chiếu 1152x576

**Files:**
- Create: `scripts/test-projector-1152x576.mjs`

- [ ] **Step 1: Viết file test kiểm tra các ràng buộc CSS & DOM cho màn chiếu 1152x576**

```javascript
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const finalHtmlPath = path.join(__dirname, '..', 'Final.html');

console.log("=== KIỂM THỬ TDD: TỐI ƯU MÀN CHIẾU 1152x576 (FINAL.HTML) ===");

const html = fs.readFileSync(finalHtmlPath, 'utf8');

// 1. Kiểm tra Media Query cho màn chiếu sân khấu
assert(html.includes('@media') && (html.includes('max-height: 650px') || html.includes('max-height: 600px') || html.includes('1152px')), "Thiếu CSS Media Query tối ưu cho màn chiếu thấp 1152x576");

// 2. Kiểm tra quy tắc 8 cột x 2 hàng
assert(html.includes('repeat(8, 1fr)'), "Thiếu cấu hình CSS Grid 8 cột 'repeat(8, 1fr)' cho màn chiếu 2:1");

// 3. Kiểm tra khóa cứng không cuộn trang (Zero-scroll)
assert(html.includes('overflow: hidden') && html.includes('height: 100vh'), "Thiếu quy tắc khóa chiều cao và ẩn cuộn trang (overflow: hidden)");

// 4. Kiểm tra cấu trúc Top Stage Bar tinh gọn (gộp Header và Nút điều khiển ngang)
assert(html.includes('stage-top-bar') || html.includes('header-stage'), "Thiếu cấu trúc thanh Topbar tinh gọn cho màn chiếu");

// 5. Kiểm tra CSS tối ưu Modal cho màn chiếu
assert(html.includes('winner-announcement-box') && html.includes('max-height: 5'), "Thiếu giới hạn max-height an toàn cho Winner Modal trên màn chiếu");

console.log("✓ TẤT CẢ CÁC BÀI TEST TỐI ƯU MÀN CHIẾU 1152x576 ĐỀU PASS!");
```

- [ ] **Step 2: Chạy test xác nhận trạng thái RED (thất bại)**

Run: `node scripts/test-projector-1152x576.mjs`
Expected: FAIL với AssertionError `Thiếu CSS Media Query tối ưu cho màn chiếu thấp 1152x576`

- [ ] **Step 3: Commit file test vào git**

```powershell
git add scripts/test-projector-1152x576.mjs; git commit -m "test: add tdd test suite for 1152x576 projector optimization"
```

---

### Task 2: Tái Cấu Trúc Top Stage Bar & Hệ Thống Grid 8x2 Trong `Final.html`

**Files:**
- Modify: `Final.html:680-740` (Tái cấu trúc Header & Buttons)

- [ ] **Step 1: Tổ chức lại Header và Nút điều khiển thành thanh ngang `stage-top-bar`**

Tái cấu trúc phần Header và Action buttons thành:
```html
<div class="stage-top-bar" id="stageTopBar">
  <div class="stage-brand-group">
    <h1>LUCKY DRAW</h1>
    <span class="event-subtitle">16 GIẢI THƯỞNG MAY MẮN</span>
  </div>
  <div class="action-btn-group">
    <button class="button" id="spinButton" onclick="spin16WinnersSequential()">QUAY SỐ</button>
    <button class="button button-secondary" id="resetBtn" onclick="clearSessionData()">LÀM MỚI</button>
  </div>
</div>
```

- [ ] **Step 2: Commit cấu trúc DOM mới**

```powershell
git add Final.html; git commit -m "refactor(dom): restructure header and controls into horizontal stage-top-bar"
```

---

### Task 3: Triển Khai CSS Media Query Chuyên Sâu Cho Màn Chiếu 1152x576

**Files:**
- Modify: `Final.html:150-500` (Thêm CSS Media Query)

- [ ] **Step 1: Viết CSS cho màn chiếu 1152x576 và màn hình có chiều cao thấp**

```css
/* ===== TỐI ƯU MÀN CHIẾU SÂN KHẤU 3m x 1,5m (1152 x 576 px, TỶ LỆ 2:1) ===== */
@media screen and (max-height: 650px), screen and (max-width: 1200px) and (max-height: 700px) {
  html, body {
    height: 100vh;
    max-height: 576px;
    overflow: hidden !important;
    margin: 0;
    padding: 0;
  }

  .game-root {
    height: 100vh;
    max-height: 576px;
    min-height: 0;
    padding: 6px 14px 8px 14px;
    overflow: hidden;
    justify-content: flex-start;
  }

  /* 1. Top Bar tinh gọn ngang */
  .stage-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1360px;
    margin-bottom: 6px;
    padding: 0 4px;
  }

  .stage-brand-group {
    display: flex;
    align-items: baseline;
    gap: 14px;
  }

  .stage-brand-group h1 {
    font-size: 26px;
    margin-bottom: 0;
    letter-spacing: 2px;
  }

  .stage-brand-group .event-subtitle {
    font-size: 13px;
    margin-bottom: 0;
    letter-spacing: 1px;
    opacity: 0.9;
  }

  .action-btn-group {
    margin: 0;
    gap: 10px;
  }

  .button {
    height: 38px;
    min-width: 130px;
    font-size: 14px;
    padding: 0 20px;
    border-radius: 20px;
    letter-spacing: 1px;
  }

  /* 2. Progress Bar siêu mỏng */
  .prize-progress-container {
    width: 100%;
    max-width: 1360px;
    margin: 0 auto 6px auto;
    padding: 3px 10px;
    border-radius: 8px;
  }

  .progress-bar-bg {
    height: 6px;
  }

  /* 3. Lưới 16 thẻ: 8 CỘT x 2 HÀNG */
  .lottery-grid-container {
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 10px 12px;
    border-radius: 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .slot-grid-16 {
    grid-template-columns: repeat(8, 1fr) !important;
    gap: 8px !important;
  }

  /* 4. Thẻ giải thưởng compact */
  .slot-card-16 {
    padding: 10px 8px;
    border-radius: 10px;
  }

  .card-rank {
    font-size: 10px;
    margin-bottom: 2px;
  }

  .card-badge {
    font-size: 8px;
    padding: 1px 4px;
  }

  .card-code {
    font-size: 24px;
    letter-spacing: 1.5px;
    margin-bottom: 4px;
  }

  .card-name {
    font-size: 12px;
    margin-bottom: 2px;
  }

  .card-agency {
    font-size: 10px;
    margin-bottom: 6px;
  }

  .card-secure {
    font-size: 9px;
    padding: 3px 6px;
  }

  /* 5. Modal vinh danh vừa khít 576px */
  .winner-announcement-box {
    max-height: 520px !important;
    max-width: 640px !important;
    padding: 20px 24px !important;
  }

  .winner-congrats-tag {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .winner-rank-large {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .winner-code-large {
    font-size: 68px;
    margin: 4px 0 10px 0;
  }

  .winner-name-large {
    font-size: 34px;
    margin-bottom: 8px;
  }

  .winner-agency-large {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .winner-secure-large {
    font-size: 16px;
    padding: 6px 18px;
  }

  .winner-btn-action {
    height: 48px;
    font-size: 18px;
    min-width: 200px;
  }
}
```

- [ ] **Step 2: Chạy lại bài test `test-projector-1152x576.mjs`**

Run: `node scripts/test-projector-1152x576.mjs`
Expected: PASS toàn bộ!

- [ ] **Step 3: Commit CSS mới vào git**

```powershell
git add Final.html; git commit -m "feat(responsive): add 8x2 grid and zero-scroll styles for 1152x576 projector"
```

---

### Task 4: Kiểm Thử Toàn Diện & Đồng Bộ Sang Thư Mục Phân Phối (Dist)

**Files:**
- Modify / Build: `dist/Final.html`
- Test: `scripts/e2e-test.mjs`, `scripts/test-winner-modal.mjs`, `scripts/test-projector-1152x576.mjs`

- [ ] **Step 1: Chạy toàn bộ các bài test độc lập**

Run:
1. `node scripts/test-winner-modal.mjs`
2. `node scripts/test-projector-1152x576.mjs`
Expected: Cả 2 bộ test đều PASS 100%.

- [ ] **Step 2: Đồng bộ bản build sang `dist/Final.html`**

Run: `npm run build`
Expected: Vite build thành công và copy `Final.html` sang `dist/Final.html`.

- [ ] **Step 3: Khởi động máy chủ và kiểm thử E2E**

Run:
1. Chạy server: `$env:PORT="3333"; node server.js`
2. Chạy E2E: `node scripts/e2e-test.mjs`
Expected: 49/49 kịch bản PASS (100%).

- [ ] **Step 4: Commit hoàn tất tính năng**

```powershell
git add dist/Final.html; git commit -m "chore(dist): sync updated Final.html for 1152x576 projector"
```
