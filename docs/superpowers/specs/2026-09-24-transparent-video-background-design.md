# Thiết Kế Kỹ Thuật: Cập Nhật Video WebM Alpha & Áp Dụng Nền Cho Màn Hình Trình Chiếu

## 1. Mục Tiêu
- Thay thế toàn bộ 13 video demo hiện tại bằng 13 video WebM mới đã được render chuẩn kênh Alpha trong suốt (`vp9`, `alpha_mode: 1`).
- Thay đổi phông nền của màn hình trình chiếu video (`.video-presentation-wrapper`):
  - **Cá nhân:** Sử dụng phông nền vũ trụ cam ấm `bg_canhanhoa.jpg` (theo mẫu `msb-html/ca-nhan/my-phone.html`).
  - **Doanh nghiệp:** Sử dụng phông nền xanh navy công nghệ `bg_toiuu.jpg` (chuẩn giao diện Doanh nghiệp).
- Giữ nguyên toàn bộ cơ chế điều khiển cảm ứng phẳng: Play/Pause, Seekbar đổi màu (cam cho Cá nhân, xanh cho Doanh nghiệp), nút Back và tự ẩn sau 5 giây.

---

## 2. Danh Sách Mapping 13 Video Alpha Mới
Toàn bộ video được giải nén từ tệp `WEBM-20260924T010151Z-1-001.zip`:

### 2.1. Cá Nhân (`ca-nhan/video/`) - 6 Video
1. `Marketplace_1.webm` -> `ca-nhan/video/marketplace.webm`
2. `Sercurity_1.webm` -> `ca-nhan/video/security.webm`
3. `Thay đổi giao diện_1.webm` -> `ca-nhan/video/thay-doi-giao-dien.webm`
4. `M-Sinh Loi_1.webm` -> `ca-nhan/video/m-sinh-loi.webm`
5. `M triple_2.webm` -> `ca-nhan/video/m-triple.webm`
6. `M- reward_1.webm` -> `ca-nhan/video/m-rewards.webm`

### 2.2. Doanh Nghiệp (`doanh-nghiep/video/`) - 7 Video
1. `QUẢN TRỊ DỊCH VỤ TRỰC TUYẾN_1.webm` -> `doanh-nghiep/video/quan-tri-dich-vu.webm`
2. `KẾT NỐI MỌI ĐỐI TÁC TRÊN MỘT NỀN TẢNG_1.webm` -> `doanh-nghiep/video/ket-noi-doi-tac.webm`
3. `TÍN DỤNG LINH HOẠT - COMBO 5 TRONG 1_1.webm` -> `doanh-nghiep/video/tin-dung-linh-hoat.webm`
4. `TÁI CẤP HẠN MỨC - PRE-APPROVED OFFER_1.webm` -> `doanh-nghiep/video/tai-cap-han-muc.webm`
5. `THẺ TÍN DỤNG DOANH NGHIỆP - MỞ THẺ MỘT CHẠM_1.webm` -> `doanh-nghiep/video/the-tin-dung.webm`
6. `CHỨNG CHỈ TIÈN GỬI_1.webm` -> `doanh-nghiep/video/chung-chi-tien-gui.webm`
7. `MSB REWARDS DN_1.webm` -> `doanh-nghiep/video/msb-rewards.webm`

---

## 3. Cập Nhật Phong Cách Giao Diện (CSS)

### 3.1. Cá Nhân (`ca-nhan/css/style.css`)
- `.demo-modal-overlay.demo-video-modal`: `background: transparent;`
- `.video-presentation-wrapper`:
  - `background-color: #0c0402;`
  - `background-image: url('../images/bg_canhanhoa.jpg');`
  - `background-repeat: no-repeat;`
  - `background-position: center center;`
  - `background-size: cover;`
- `.presentation-video`:
  - `background: transparent;` (không còn nền `#000000`, điện thoại hiển thị lơ lửng trên nền vũ trụ).

### 3.2. Doanh Nghiệp (`doanh-nghiep/css/style.css`)
- `.demo-modal-overlay.demo-video-modal`: `background: transparent;`
- `.video-presentation-wrapper`:
  - `background-color: #02071a;`
  - `background-image: url('../images/bg_toiuu.jpg');`
  - `background-repeat: no-repeat;`
  - `background-position: center 42%;`
  - `background-size: cover;`
- `.presentation-video`:
  - `background: transparent;`

---

## 4. Kế Hoạch Kiểm Thử & Xác Minh (TDD)
- Cập nhật bộ test `tests/video-presentation.test.mjs` để kiểm tra:
  - Tất cả 13 video đều tồn tại, có dung lượng hợp lệ (> 100KB), và có kênh `alpha_mode: 1`.
  - CSS của cả 2 ứng dụng sử dụng đúng hình nền tương ứng (`bg_canhanhoa.jpg` cho cá nhân, `bg_toiuu.jpg` cho doanh nghiệp) thay vì nền đen `#000000`.
  - `.presentation-video` có `background: transparent`.
- Kiểm tra hiển thị thực tế trên trình duyệt bằng headless/browser subagent hoặc curl test server.
