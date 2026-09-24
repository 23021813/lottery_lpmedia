# Kế Hoạch Triển Khai: Tốc Độ Quay Và Nút Điều Khiển Quay Số MSB

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Điều chỉnh tốc độ quay các số trong `quay-so/Final.html` chậm lại, thay thế phím Space bằng 1 nút bấm trực quan chuyển trạng thái (QUAY SỐ / DỪNG LẠI / QUAY TIẾP), bỏ cơ chế tự động dừng và không tự động quay khi bấm VẮNG MẶT.

**Architecture:** Giữ nguyên kiến trúc client-side tĩnh thuần túy (Vanilla HTML/CSS/JS) của trang sự kiện MSB Liquid Glass. Thêm component nút điều khiển Liquid Glass động `#lotteryControlBtn`, loại bỏ các đoạn lắng nghe phím tắt và timer tự động dừng, tái cấu trúc hàm luồng quay và xử lý vắng mặt.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3 Liquid Glass 3D, Node.js Test Runner (`node:test`, `node:assert`).

---

### Task 1: Viết test kiểm thử tự động (TDD RED)

**Files:**
- Create: `tests/quay-so-controls.test.mjs`

- [ ] **Step 1: Viết bài test mới kiểm tra các yêu cầu điều khiển và tốc độ**

Tạo tệp `tests/quay-so-controls.test.mjs` kiểm tra các tiêu chí:
1. `quay-so/Final.html` có nút điều khiển `#lotteryControlBtn`.
2. Không còn thẻ `#spaceHintBar` và `.modal-keyboard-hints`.
3. Tốc độ `baseSpeed` được hạ xuống `<= 30` px/frame.
4. Không có `spinTimeoutId = setTimeout` tự động dừng trong `startSpin`.
5. Không có `setTimeout` gọi `startSpin` trong `handleWinnerAbsent`.
6. Không có `window.addEventListener("keydown"`.
7. Thẻ `#slotMachineContainer` không còn gán `onclick="handleSlotClick()"`.

- [ ] **Step 2: Chạy test để xác nhận test đang FAIL (RED)**

Run: `node --test tests/quay-so-controls.test.mjs`
Expected: FAIL với các lỗi do chưa sửa `Final.html`.

- [ ] **Step 3: Commit tệp test**

Run:
```bash
git add tests/quay-so-controls.test.mjs
git commit -m "test: add automated test suite for quay-so controls and speed"
```

---

### Task 2: Chỉnh sửa Final.html đáp ứng toàn bộ yêu cầu (TDD GREEN)

**Files:**
- Modify: `quay-so/Final.html`

- [ ] **Step 1: Cập nhật CSS cho nút bấm điều khiển `#lotteryControlBtn`**
Thêm style Liquid Glass 3D MSB cho nút:
- Nền gradient Cam MSB (`#f37021` - `#ef4123`), viền phản quang trắng, hiệu ứng bóng đổ nước nổi khối 3D.
- Trạng thái `is-spinning` (DỪNG LẠI): Đổi sang màu đỏ MSB (`#ed1c24` - `#9e0b0f`), hiệu ứng pulse nhẹ.
- Trạng thái `disabled`: Độ mờ 0.5, pointer-events none khi đang hãm phanh cascade.

- [ ] **Step 2: Cập nhật HTML**
- Xóa bỏ `#spaceHintBar`.
- Đặt nút `<button id="lotteryControlBtn" class="lottery-control-btn" onclick="handleLotteryControlClick()">QUAY SỐ</button>` ngay dưới `#slotMachineContainer`.
- Xóa bỏ `onclick="handleSlotClick()"` ở `#slotMachineContainer`.
- Xóa bỏ `.modal-keyboard-hints` trong `#winnerModalOverlay`.

- [ ] **Step 3: Cập nhật JavaScript**
- Giảm `baseSpeed = [24, 18, 26, 20]`.
- Bỏ bộ đếm thời gian tự dừng trong `startSpin()`.
- Thêm hàm `handleLotteryControlClick()` điều phối click quay / dừng và cập nhật giao diện nút.
- Trong `stopSpin()`: Chuyển nút sang trạng thái đang dừng (disabled tạm thời).
- Trong `onAllDigitsLocked()`: Kích hoạt hiển thị modal trúng thưởng, chuẩn bị nút về trạng thái "QUAY TIẾP".
- Trong `handleWinnerConfirm()`: Sau khi xác nhận, nút hiển thị "QUAY TIẾP".
- Trong `handleWinnerAbsent()`: Ghi nhận vắng mặt, đóng modal, KHÔNG gọi `startSpin()`, cập nhật nút hiển thị "QUAY TIẾP" và kích hoạt lại nút.
- Bỏ hoàn toàn khối `window.addEventListener("keydown", ...)`.

- [ ] **Step 4: Chạy test xác nhận mọi bài test đều PASS (GREEN)**

Run:
```bash
node --test tests/quay-so-controls.test.mjs
node --test tests/quay-so-integration.test.mjs
```
Expected: Cả 2 bộ test đều PASS 100%.

- [ ] **Step 5: Commit thay đổi**

Run:
```bash
git add quay-so/Final.html
git commit -m "feat: update quay-so speed, interactive control button and absent handler"
```

---

### Task 3: Xác minh tương tác trực quan và trải nghiệm (Verification)

**Files:**
- Test: `quay-so/Final.html`
- Artifact: `walkthrough.md`

- [ ] **Step 1: Khởi động server nội bộ và mở trình duyệt kiểm tra**
- Khởi chạy static server (ví dụ `python -m http.server 8080` hoặc node server).
- Dùng browser subagent truy cập `http://localhost:8080/quay-so/Final.html`.
- Kiểm tra trực quan:
  1. Nút "QUAY SỐ" hiển thị sang trọng, nổi bật.
  2. Bấm nút: Số quay mượt mà, chuyển động chậm vừa mắt, nút đổi thành "DỪNG LẠI".
  3. Để quay 10 giây: Xác nhận số không tự động dừng.
  4. Bấm "DỪNG LẠI": Số hãm phanh mượt mà, khóa chính tâm, hiện modal trúng thưởng.
  5. Bấm "VẮNG MẶT": Modal đóng lại, số KHÔNG tự động quay, nút đổi thành "QUAY TIẾP".
  6. Bấm "QUAY TIẾP": Bắt đầu lượt quay mới thành công.
- Chụp ảnh màn hình minh chứng.

- [ ] **Step 2: Viết walkthrough.md tổng kết kết quả**
- Ghi nhận chi tiết kết quả thực hiện, đính kèm hình ảnh và thông số kỹ thuật.
