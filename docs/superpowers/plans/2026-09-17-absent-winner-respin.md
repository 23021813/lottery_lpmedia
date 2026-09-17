# Kế Hoạch Triển Khai: Tính Năng Check Có Mặt & Nút Vắng Mặt Quay Lại Ô Tương Ứng

> **Dành cho kỹ sư/agent thực thi:** BẮT BUỘC áp dụng quy trình TDD (RED-GREEN-REFACTOR) và tuân thủ các bước dưới đây.

**Mục tiêu:** Bổ sung nút "VẮNG MẶT" trên popup vinh danh trúng giải để MC kiểm tra sự hiện diện của khách tại sự kiện. Nếu khách vắng mặt, hủy kết quả của người này (không bốc lại nữa) và tự động kích hoạt quay lại ngay ô tương ứng trên danh sách 16 ô cho đến khi có đủ 16 người thực tế có mặt.

**Kiến trúc giải pháp:**
1. Thêm mảng `absentWinners` quản lý các ID thí sinh bị hủy giải do vắng mặt, đồng bộ với `sessionStorage`.
2. Bổ sung nút `VẮNG MẶT` và phím tắt `[V] / [Delete]` song song cùng nút `TIẾP TỤC` trên `#winnerAnnouncementModal`.
3. Khi MC bấm "VẮNG MẶT":
   - Đóng popup.
   - Thêm ID vào `absentWinners`, loại khỏi `currentWinners` và `usedNumbers`.
   - Giữ nguyên chỉ số ô hiện tại và tự động kích hoạt quay lại ngay ô đó (cả ở chế độ quay tự động 16 ô lẫn chế độ bấm quay từng ô).
   - Tiếp tục quy trình cho đến khi người trúng có mặt xác nhận "TIẾP TỤC".
4. Tối ưu giao diện cho màn chiếu 1152x576 (2 nút ngang hàng vừa vặn, không vỡ layout).

**Công nghệ:** HTML5, CSS3, JavaScript (ES6+), Vitest/Node Assert TDD.

---

### Task 1: Viết Test TDD Xác Thực Cơ Chế Nút Vắng Mặt & Tự Động Quay Lại Ô

**Files:**
- Create: `scripts/test-absent-winner.mjs`

- [ ] **Bước 1: Viết bài test TDD**
  - Kiểm tra `#winnerModalAbsentBtn` tồn tại trong HTML.
  - Kiểm tra style `.winner-btn-absent` và `.winner-actions-group`.
  - Kiểm tra biến/mảng `absentWinners` và cập nhật sessionStorage.
  - Kiểm tra logic `handleWinnerAbsent`.
  - Kiểm tra bộ lọc `participants` loại trừ `absentWinners`.
  - Kiểm tra phím tắt `KeyV` hoặc `Delete` trên window `keydown`.
  - Kiểm tra vòng lặp quay lại ô hiện tại khi kết quả là vắng mặt.

- [ ] **Bước 2: Chạy test xác nhận trạng thái RED**
  - Chạy: `node scripts/test-absent-winner.mjs`
  - Kết quả mong đợi: FAIL (do chưa triển khai nút và hàm xử lý).

---

### Task 2: Cập Nhật Giao Diện Modal Vinh Danh (HTML & CSS)

**Files:**
- Modify: `Final.html:940-965` (CSS media query màn chiếu)
- Modify: `Final.html:560-610` (CSS chính của modal)
- Modify: `Final.html:1050-1070` (HTML cấu trúc nút modal)

- [ ] **Bước 1: Thêm CSS cho nhóm nút và nút VẮNG MẶT**
  - Tạo `.winner-actions-group` dạng flex container, gap 16px, căn giữa.
  - Tạo `.winner-btn-absent`: Nền tối trong suốt viền đỏ/cam mờ `rgba(235, 87, 87, 0.7)`, chữ `#ffb8b8`, hover phát sáng đỏ nhẹ sang trọng.
  - Cập nhật media query `@media screen and (max-height: 650px)` để 2 nút hiển thị vừa vặn trong màn chiếu 1152x576.

- [ ] **Bước 2: Cập nhật HTML cấu trúc nút của `#winnerAnnouncementModal`**
  - Đặt cả 2 nút vào `.winner-actions-group`:
    - Nút 1: `VẮNG MẶT` (`#winnerModalAbsentBtn`, onclick: `handleWinnerAbsent()`).
    - Nút 2: `TIẾP TỤC` / `HOÀN TẤT` (`#winnerModalNextBtn`, onclick: `handleWinnerModalConfirm()`).
  - Cập nhật dòng chữ hướng dẫn phím tắt: `[Space / Enter]: Có mặt • [V / Delete]: Vắng mặt`.

---

### Task 3: Cập Nhật Logic JavaScript Xử Lý Khách Vắng Mặt & Tự Động Quay Lại Ô

**Files:**
- Modify: `Final.html:1070-1650`

- [ ] **Bước 1: Quản lý danh sách `absentWinners`**
  - Khai báo `let absentWinners = [];`
  - Cập nhật trong `clearSessionData()` để reset cả `absentWinners`.
  - Cập nhật bộ lọc `available` ở cả `spinSingleCard` và `spin16WinnersSequential` để loại trừ `absentWinners`.

- [ ] **Bước 2: Cập nhật `showWinnerAnnouncementModal` trả về hành động**
  - Promise resolve với object `{ action: 'confirm' }` hoặc `{ action: 'absent' }`.
  - Tạo hàm `handleWinnerAbsent()`:
    - Đóng modal.
    - Gọi `winnerModalResolver({ action: 'absent' })`.
  - Thêm bắt sự kiện bàn phím:
    - Phím `KeyV`, `Keyv`, `Delete`, `Backspace` -> kích hoạt `handleWinnerAbsent()`.

- [ ] **Bước 3: Xử lý quay lại ô tương ứng khi khách vắng mặt**
  - **Trong `spinSingleCard(idx)`:**
    - Nếu action là `absent`:
      - Thêm ID vào `absentWinners`.
      - Xóa người này khỏi `usedNumbers` và `currentWinners`.
      - Lưu sessionStorage.
      - Tự động gọi lại `spinSingleCard(idx)` để bốc người mới thế chỗ ngay lập tức!
  - **Trong `spin16WinnersSequential()`:**
    - Vòng lặp quay từng ô: Sau khi quay xong 1 ô và chờ modal:
      - Nếu action là `absent`:
        - Thêm ID vào `absentWinners`.
        - Xóa khỏi `usedNumbers` và `currentWinners`.
        - Lưu sessionStorage.
        - Lặp lại chính ô `step` (không tăng bước sang ô tiếp theo) cho đến khi người đó xác nhận có mặt!
      - Nếu action là `confirm`:
        - Tiếp tục bước sang ô kế tiếp.

---

### Task 4: Kiểm Thử Toàn Diện & Đồng Bộ Production Build

**Files:**
- Test: `scripts/test-absent-winner.mjs`
- Test: `scripts/e2e-test.mjs`
- Test: `scripts/test-card-stabilization.mjs`
- Test: `scripts/test-projector-1152x576.mjs`
- Dist: `dist/Final.html`

- [ ] **Bước 1: Chạy test TDD `node scripts/test-absent-winner.mjs`**
  - Kỳ vọng: Toàn bộ tiêu chí đạt GREEN 100%.

- [ ] **Bước 2: Chạy bộ test hồi quy E2E**
  - Chạy `node scripts/e2e-test.mjs`, `node scripts/test-projector-1152x576.mjs`, `node scripts/test-card-stabilization.mjs`.

- [ ] **Bước 3: Chạy `npm run build`**
  - Biên dịch và đồng bộ mã nguồn sang `dist/Final.html`.

- [ ] **Bước 4: Kiểm tra trực quan trên trình duyệt (Browser Subagent / Manual)**
  - Xác nhận luồng: Bấm quay -> Modal hiện -> Bấm "VẮNG MẶT" -> Ô đó tự động quay lại bốc người mới -> Bấm "TIẾP TỤC" -> Hoàn tất.
