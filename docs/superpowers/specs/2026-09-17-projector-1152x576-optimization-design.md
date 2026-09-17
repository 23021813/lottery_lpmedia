# Thiết Kế Kỹ Thuật: Tối Ưu Màn Hình Quay Số Cho Màn Chiếu Sân Khấu 3m x 1,5m (1152 x 576 px)

## 1. Mục Tiêu & Bối Cảnh
- **Màn chiếu sự kiện**: Kích thước vật lý 3m x 1,5m, tỷ lệ 2:1, độ phân giải LED/máy chiếu **1152 x 576 px**.
- **Vấn đề cần giải quyết**:
  - Giao diện `Final.html` hiện tại có tổng chiều cao ~1165px, gấp đôi chiều cao màn chiếu (576px), gây tràn viền và phát sinh thanh cuộn dọc (scroll bar).
  - Bố cục dọc truyền thống (Header phía trên, các nút bấm ở giữa, rồi đến lưới 4x4 bên dưới) không tận dụng được chiều rộng 1152px và làm chật chội chiều cao 576px.
  - Popup vinh danh cho MC hiện tại cao ~580px, có nguy cơ tràn đỉnh/đáy màn chiếu.
- **Yêu cầu cốt lõi**:
  - **Zero-Scroll (Không cuộn trang)**: 100% nội dung và 16 ô thẻ giải thưởng phải hiển thị trọn vẹn trong khung nhìn 576px chiều cao.
  - **Bố cục 8 cột x 2 hàng (8x2 Grid)**: Trải rộng 16 giải theo chiều ngang để tận dụng chiều rộng 1152px.
  - **Top Bar tinh gọn**: Gộp Header và 2 nút điều khiển (QUAY SỐ, LÀM MỚI) thành 1 thanh ngang duy nhất trên đỉnh.
  - **Popup vinh danh MC compact**: Tối ưu chiều cao của modal vinh danh để lọt trọn trong 576px mà chữ mã số và họ tên vẫn cực to.

---

## 2. Thiết Kế Bố Cục Giao Diện (Layout Specifications)

### 2.1. Phân Bổ Chiều Cao Viewport (Tổng: 576px)
- **Top Bar (Header + Action Controls)**: Chiều cao tối đa **~60px - 65px**.
  - Bên trái: Tiêu đề `LUCKY DRAW` (font 26px - 28px) và phụ đề `16 GIẢI THƯỞNG MAY MẮN` (font 12px).
  - Bên phải: Nút `QUAY SỐ` và `LÀM MỚI` (chiều cao 40px - 42px, padding 0 24px, font 14px - 15px).
- **Progress Bar Mỏng**: Chiều cao **~12px - 15px** (thanh fill cao 6px, padding và margin tối giản).
- **Hệ Lưới 16 Ô Giải (8x2 Grid)**: Chiều cao **~420px - 440px**.
  - `grid-template-columns: repeat(8, 1fr)`
  - `gap: 8px - 10px`
  - 2 hàng thẻ, mỗi hàng cao ~190px - 200px.
  - Mỗi thẻ giải thưởng (`slot-card-16`):
    - Kích thước ~130px rộng x ~195px cao.
    - `card-rank`: 10px - 11px.
    - `card-code`: 26px - 28px in đậm 900, màu vàng `#ffdca3`.
    - `card-name`: 12px - 13px in đậm, in hoa, cắt ngắn nếu dài (`text-overflow: ellipsis`).
    - `card-agency`: 11px.
    - `card-secure`: 10px ở chân thẻ.
- **Đệm an toàn (Padding toàn trang)**: `padding: 8px 16px` để tránh sát mép màn chiếu LED.

---

## 3. Tối Ưu Popup Vinh Danh Cho MC (Modal)
- Khung Modal `#winnerAnnouncementModal`:
  - `max-height: 510px; max-width: 660px; padding: 20px 24px;`
  - `margin: auto;` căn giữa tuyệt đối trong màn hình 576px.
- Các kích thước chữ trên modal:
  - `winner-congrats-tag`: font 13px, margin-bottom 4px.
  - `winner-rank-large`: font 18px, margin-bottom 6px.
  - `winner-code-large`: font **68px - 72px**, line-height 1.05, margin 4px 0 10px 0.
  - `winner-name-large`: font **34px - 38px**, margin-bottom 8px.
  - `winner-agency-large`: font 20px - 22px, margin-bottom 14px.
  - `winner-secure-large`: font 16px - 18px, padding 6px 18px.
  - Nút `winner-btn-action`: cao 48px, font 18px, min-width 200px.
  - `winner-key-hint`: font 12px, margin-top 6px.

---

## 4. Kỹ Thuật CSS Media Query & Khóa Khung Hình
Sử dụng CSS Media Query chuyên biệt nhắm vào màn chiếu hoặc các màn hình có chiều cao thấp:
```css
@media screen and (max-height: 650px), screen and (max-width: 1200px) and (max-height: 700px) {
  html, body {
    height: 100vh;
    overflow: hidden !important;
  }
  .game-root {
    min-height: 100vh;
    height: 100vh;
    max-height: 576px;
    padding: 8px 16px !important;
    overflow: hidden;
    justify-content: space-between;
  }
  /* Topbar gộp chung ngang */
  .top-stage-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 6px;
  }
  /* Grid 8 cột x 2 hàng */
  .slot-grid-16 {
    grid-template-columns: repeat(8, 1fr) !important;
    gap: 8px !important;
    height: calc(100vh - 120px);
    max-height: 440px;
  }
}
```

---

## 5. Kế Hoạch Xác Minh & Kiểm Thử
1. **Kiểm thử tự động (TDD)**:
   - Viết test kiểm tra các quy tắc CSS cho layout 8x2, `@media screen and (max-height: 650px)`, và `overflow: hidden`.
2. **Kiểm thử E2E [scripts/e2e-test.mjs](file:///c:/Users/hiepvd2/Desktop/lottery_lpmedia/scripts/e2e-test.mjs)**:
   - Xác minh toàn bộ 49 kịch bản E2E vẫn duy trì tỷ lệ đạt 100%.
3. **Kiểm thử thực tế trên kích thước Viewport 1152 x 576**:
   - Kiểm tra `document.documentElement.scrollHeight <= 576` (không cuộn trang).
   - Kiểm tra 16 thẻ chia đúng 8 cột và 2 hàng.
