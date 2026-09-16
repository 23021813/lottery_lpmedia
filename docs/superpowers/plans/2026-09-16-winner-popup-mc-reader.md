# Kế Hoạch Triển Khai: Popup Vinh Danh Người Trúng Giải Cho MC (Final.html)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng Popup (Modal) vinh danh cực đại trên màn hình quay số `Final.html` hiển thị rõ nét thông tin người trúng thưởng cho MC đọc, tạm dừng luồng quay và tự động chuyển sang người tiếp theo khi bấm "TIẾP TỤC" hoặc "HOÀN TẤT" (hoặc phím Space/Enter).

**Architecture:** Sử dụng kiến trúc bất đồng bộ Promise-based interceptor (`await showWinnerAnnouncementModal(winner, isLast)`). Luồng quay tự động `spin16WinnersSequential` và quay lẻ `spinSingleCard` sẽ tạm dừng đợi người dùng tương tác. Tích hợp Global Keyboard Event Listener bắt phím Space và Enter.

**Tech Stack:** HTML5, CSS3 (Dark Luxury Gold, Backdrop blur, Flexbox/Grid), Vanilla JavaScript (ES6+ async/await, DOM API), Node.js Assertions Test Runner.

---

### Task 1: Tạo Bộ Kiểm Thử Độc Lập Cho Popup Vinh Danh (TDD Test Suite)

**Files:**
- Create: `scripts/test-winner-modal.mjs`

- [ ] **Step 1: Viết kịch bản test kiểm tra các yêu cầu của Popup Vinh Danh**

```javascript
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const finalHtmlPath = path.join(__dirname, '..', 'Final.html');

console.log("=== KIỂM THỬ TDD: POPUP VINH DANH NGƯỜI TRÚNG CHO MC ===");

const html = fs.readFileSync(finalHtmlPath, 'utf8');

// 1. Kiểm tra DOM elements của Modal
assert(html.includes('id="winnerAnnouncementModal"'), "Thiếu modal container #winnerAnnouncementModal");
assert(html.includes('id="winnerModalRank"'), "Thiếu thẻ hiển thị hạng giải #winnerModalRank");
assert(html.includes('id="winnerModalCode"'), "Thiếu thẻ hiển thị mã số trúng thưởng cực đại #winnerModalCode");
assert(html.includes('id="winnerModalName"'), "Thiếu thẻ hiển thị họ tên #winnerModalName");
assert(html.includes('id="winnerModalAgency"'), "Thiếu thẻ hiển thị đại lý #winnerModalAgency");
assert(html.includes('id="winnerModalSecure"'), "Thiếu thẻ hiển thị CCCD/SĐT bảo mật #winnerModalSecure");
assert(html.includes('id="winnerModalNextBtn"'), "Thiếu nút điều hướng #winnerModalNextBtn");

// 2. Kiểm tra CSS typography cỡ lớn cho MC
assert(html.includes('.winner-code-large'), "Thiếu class CSS .winner-code-large");
assert(html.includes('.winner-name-large'), "Thiếu class CSS .winner-name-large");

// 3. Kiểm tra hàm xử lý async Promise và phím tắt
assert(html.includes('showWinnerAnnouncementModal'), "Thiếu hàm showWinnerAnnouncementModal");
assert(html.includes('handleWinnerModalConfirm'), "Thiếu hàm handleWinnerModalConfirm");
assert(html.includes('TIẾP TỤC'), "Thiếu nhãn nút 'TIẾP TỤC'");
assert(html.includes('HOÀN TẤT'), "Thiếu nhãn nút 'HOÀN TẤT'");
assert(html.includes('Space') || html.includes('keydown'), "Thiếu logic bắt sự kiện phím Space/Enter");

console.log("✓ TẤT CẢ CÁC BÀI TEST POPUP VINH DANH ĐỀU PASS!");
```

- [ ] **Step 2: Chạy test để xác nhận trạng thái RED (thất bại)**

Run: `node scripts/test-winner-modal.mjs`
Expected: FAIL với AssertionError `Thiếu modal container #winnerAnnouncementModal`

- [ ] **Step 3: Commit file test ban đầu**

```powershell
git add scripts/test-winner-modal.mjs; git commit -m "test: add tdd test suite for winner announcement modal"
```

---

### Task 2: Triển Khai Giao Diện CSS & DOM Modal Vinh Danh Trong `Final.html`

**Files:**
- Modify: `Final.html:420-530` (Thêm CSS)
- Modify: `Final.html:570-600` (Thêm HTML markup)

- [ ] **Step 1: Viết CSS Dark Luxury và Typography cỡ lớn cho Popup Vinh Danh**

Thêm các lớp CSS:
- `.winner-announcement-backdrop`: Overlay full màn hình, `z-index: 2000`, nền `rgba(10, 7, 5, 0.9)`, `backdrop-filter: blur(14px)`.
- `.winner-announcement-box`: Tối đa 680px, bo góc 24px, viền kim loại vàng gold `border: 2.5px solid #ba7c38`, ánh sáng `box-shadow: 0 0 60px rgba(186, 124, 56, 0.45)`.
- `.winner-rank-large`: Font 22px, `font-weight: 800`, chữ hoa màu `#ba7c38`.
- `.winner-code-large`: Font 80px - 88px, `font-weight: 900`, màu `#ffdca3`, letter-spacing 3px.
- `.winner-name-large`: Font 44px - 48px, `font-weight: 900`, chữ in hoa màu `#ffffff`.
- `.winner-agency-large`: Font 26px, `font-weight: 700`, màu `#d4c5b2`.
- `.winner-secure-large`: Font 20px, màu `#ffdca3`, nền mờ bo góc `border: 1px solid rgba(186, 124, 56, 0.3)`.
- `.winner-btn-action`: Nút bấm lớn cao 56px, bo góc tròn, màu nền vàng gold `#ba7c38`, font 18px in hoa in đậm.

- [ ] **Step 2: Thêm cấu trúc HTML DOM của Modal Vinh Danh vào `Final.html`**

```html
<!-- MODAL VINH DANH NGƯỜI TRÚNG GIẢI CỰC ĐẠI CHO MC -->
<div class="winner-announcement-backdrop" id="winnerAnnouncementModal">
  <div class="winner-announcement-box">
    <div class="winner-congrats-tag">✨ CHÚC MỪNG NGƯỜI TRÚNG GIẢI ✨</div>
    <div class="winner-rank-large" id="winnerModalRank">GIẢI #01</div>
    <div class="winner-code-large" id="winnerModalCode">#0000</div>
    <div class="winner-name-large" id="winnerModalName">ĐANG TẢI...</div>
    <div class="winner-agency-large" id="winnerModalAgency">ĐẠI LÝ</div>
    <div class="winner-secure-large" id="winnerModalSecure">
      <span id="winnerModalCccd">CCCD: ****0000</span>
      <span style="opacity: 0.5;">•</span>
      <span id="winnerModalPhone">SĐT: 098***0000</span>
    </div>
    <div style="margin-top: 28px;">
      <button class="winner-btn-action" id="winnerModalNextBtn" onclick="handleWinnerModalConfirm()">
        TIẾP TỤC
      </button>
      <div class="winner-key-hint">Nhấn phím [Space] hoặc [Enter] để tiếp tục</div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Chạy lại test `test-winner-modal.mjs` để kiểm tra tiến độ**

Run: `node scripts/test-winner-modal.mjs`
Expected: Phần DOM và CSS pass, dừng lại ở phần hàm JS chưa triển khai.

- [ ] **Step 4: Commit thay đổi HTML & CSS**

```powershell
git add Final.html; git commit -m "feat(ui): add winner announcement modal dom and css in Final.html"
```

---

### Task 3: Triển Khai Logic Bất Đồng Bộ, Nút "TIẾP TỤC / HOÀN TẤT" Và Bắt Phím Bàn Phím

**Files:**
- Modify: `Final.html:730-1030`

- [ ] **Step 1: Viết các hàm JS điều khiển Modal (`showWinnerAnnouncementModal`, `handleWinnerModalConfirm`)**

```javascript
let winnerModalResolver = null;

function showWinnerAnnouncementModal(winner, isLastWinner) {
  return new Promise((resolve) => {
    winnerModalResolver = resolve;
    const modal = document.getElementById("winnerAnnouncementModal");
    const rankEl = document.getElementById("winnerModalRank");
    const codeEl = document.getElementById("winnerModalCode");
    const nameEl = document.getElementById("winnerModalName");
    const agencyEl = document.getElementById("winnerModalAgency");
    const cccdEl = document.getElementById("winnerModalCccd");
    const phoneEl = document.getElementById("winnerModalPhone");
    const nextBtn = document.getElementById("winnerModalNextBtn");

    const rankNum = (winner.rankIndex || (winner.cardIndex !== undefined ? winner.cardIndex + 1 : 1)).toString().padStart(2, "0");
    if (rankEl) rankEl.innerText = `GIẢI #${rankNum}`;
    if (codeEl) codeEl.innerText = `#${winner.id.toString().padStart(4, "0")}`;
    if (nameEl) nameEl.innerText = winner.name.toUpperCase();
    if (agencyEl) agencyEl.innerText = winner.agency || "";
    if (cccdEl) cccdEl.innerText = `CCCD: ****${(winner.nationalId || "").slice(-4)}`;
    if (phoneEl) phoneEl.innerText = `SĐT: ****${(winner.phone || "").slice(-4)}`;

    if (nextBtn) {
      if (isLastWinner) {
        nextBtn.innerText = "HOÀN TẤT";
        nextBtn.classList.add("btn-finish");
      } else {
        nextBtn.innerText = "TIẾP TỤC";
        nextBtn.classList.remove("btn-finish");
      }
    }

    if (modal) {
      modal.classList.add("show");
    }
  });
}

function handleWinnerModalConfirm() {
  const modal = document.getElementById("winnerAnnouncementModal");
  if (modal) {
    modal.classList.remove("show");
  }
  if (winnerModalResolver) {
    const resolve = winnerModalResolver;
    winnerModalResolver = null;
    resolve();
  }
}

// Bắt sự kiện phím Space / Enter khi modal hiển thị
window.addEventListener("keydown", (e) => {
  const modal = document.getElementById("winnerAnnouncementModal");
  if (modal && modal.classList.contains("show")) {
    if (e.code === "Space" || e.code === "Enter" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleWinnerModalConfirm();
    }
  }
});
```

- [ ] **Step 2: Tích hợp `await showWinnerAnnouncementModal` vào `spin16WinnersSequential` và `spinSingleCard`**

- Trong `spin16WinnersSequential`:
  ```javascript
  const isLast = (step === countToPick - 1) || (currentWinners.length === 16);
  await showWinnerAnnouncementModal(winnerRecord, isLast);
  if (!isLast) {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  ```
- Trong `spinSingleCard`:
  ```javascript
  const isLast = currentWinners.length === 16;
  await showWinnerAnnouncementModal(winnerRecord, isLast);
  ```

- [ ] **Step 3: Chạy test `test-winner-modal.mjs` để xác nhận trạng thái GREEN (tất cả pass)**

Run: `node scripts/test-winner-modal.mjs`
Expected: `✓ TẤT CẢ CÁC BÀI TEST POPUP VINH DANH ĐỀU PASS!`

- [ ] **Step 4: Commit thay đổi logic JS**

```powershell
git add Final.html; git commit -m "feat(logic): integrate async winner announcement modal with keyboard shortcuts in Final.html"
```

---

### Task 4: Cập Nhật Kịch Bản E2E & Đồng Bộ Sang Dist (Build & Verify)

**Files:**
- Modify: `scripts/e2e-test.mjs:320-355`
- Synchronize / Build: `dist/Final.html`

- [ ] **Step 1: Cập nhật kiểm tra trang quay số trong `scripts/e2e-test.mjs`**

Thêm các assertion kiểm tra `winnerAnnouncementModal`, `winnerModalNextBtn`, `TIẾP TỤC`, `HOÀN TẤT` vào Kịch bản 5 của `scripts/e2e-test.mjs`.

- [ ] **Step 2: Đồng bộ `Final.html` sang `dist/Final.html` hoặc chạy lệnh build**

Run: `npm run build`
Expected: File `Final.html` được copy sang `dist/Final.html` thành công theo cấu hình trong `vite.config.ts`.

- [ ] **Step 3: Commit cập nhật e2e và bản build**

```powershell
git add scripts/e2e-test.mjs dist/Final.html; git commit -m "test: update e2e script and sync dist/Final.html"
```
