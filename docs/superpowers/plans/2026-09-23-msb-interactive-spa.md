# Triển Khai SPA Tương Tác LED - Hành Tinh Số Cá Nhân (MSB)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi bộ mã nguồn HTML raw trong thư mục `ca-nhan/` thành một ứng dụng Single Page Application (SPA) hoàn chỉnh, tương thích chuẩn tỷ lệ màn hình LED 1535x576, tích hợp hiệu ứng chuyển động GSAP chân thực theo đúng sơ đồ luồng `RB - Cá nhân.jpg`.

**Architecture:** Single DOM In-Memory State Machine. Toàn bộ các màn hình được tổ chức dưới dạng các `<section class="screen-view">` độc lập lồng trong sân khấu chuẩn `#screenStage`. Điều hướng màn hình thông qua module điều khiển `AppRouter` / `MotionController` với GSAP Timelines chuyên biệt cho từng loại transition.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5 Semantic, Modern CSS Tokens/Glassmorphism, GSAP 3.x (GreenSock Animation Platform).

---

### Task 1: Chuẩn bị Thư viện GSAP Offline & Tài nguyên Trang Chờ Nháp

**Files:**
- Create: `ca-nhan/js/gsap.min.js`
- Create: `ca-nhan/images/bg_idle_draft.jpg`

- [ ] **Step 1: Tải hoặc tích hợp GSAP 3.x vào thư mục local `ca-nhan/js/`**
- [ ] **Step 2: Tạo ảnh nền nháp cho Trang Chờ (`bg_idle_draft.jpg`) trích xuất từ graphic chuẩn "THE NEXT MOVE"**
- [ ] **Step 3: Commit các tài nguyên ban đầu vào git**

---

### Task 2: Tái cấu trúc `ca-nhan/index.html` thành Cấu trúc SPA Đa Lớp

**Files:**
- Modify: `ca-nhan/index.html`

- [ ] **Step 1: Tích hợp cấu trúc các Screen View trong `#screenStage`:**
  - `#screen-idle`: Màn hình chờ nháp (Logo MSB, Tiêu đề The Next Move, chỉ dẫn chạm để bắt đầu).
  - `#screen-main`: Trang chính hiện tại (Heading + 4 Touchpoint Cards trên nền quả địa cầu).
  - `#screen-1-1`: Hiệu năng mạnh mẽ & An toàn bảo mật.
  - `#screen-1-2`: Cá nhân hóa dịch vụ.
  - `#screen-1-3`: Tối ưu tài chính (Hub 2 cột).
  - `#screen-1-3-1`: M-Sinh lời (3 thẻ + đầu điện thoại nhú lên).
  - `#screen-1-3-2`: M-Triple (3 thẻ + đầu điện thoại nhú lên).
  - `#screen-1-4`: Hệ sinh thái tiện ích All In One (Hub 2 cột).
  - `#screen-1-4-1`: MSB Rewards (3 thẻ + đầu điện thoại nhú lên).
  - `#screen-1-4-2`: Marketplace (Khối TBU).
  - `#screen-demo`: Khung Demo điện thoại trượt lên chiếm trọn trung tâm.
- [ ] **Step 2: Bổ sung các nút Back chuẩn (`.btn-back-stage`) cho các màn hình cấp con**
- [ ] **Step 3: Kiểm tra cấu trúc DOM qua trình duyệt**
- [ ] **Step 4: Commit**

---

### Task 3: Bổ sung CSS Animation & Layer Management vào `ca-nhan/css/style.css`

**Files:**
- Modify: `ca-nhan/css/style.css`

- [ ] **Step 1: Khai báo các lớp trạng thái màn hình (`.screen-view`, `.screen-view.is-active`, `.screen-view.is-exiting`)**
- [ ] **Step 2: Viết CSS keyframes cho hiệu ứng mũi tên nhấp nháy (`@keyframes ctaBlink`), nút CTA phập phồng (`@keyframes pulseGlow`), và chevron indicator**
- [ ] **Step 3: Định vị và tạo hiệu ứng nhú lên của đầu điện thoại (`.phone-mockup-wrapper`) ở chân các trang chi tiết**
- [ ] **Step 4: Định vị modal/layer điện thoại toàn màn hình (`#screen-demo`) với backdrop làm mờ sang trọng**
- [ ] **Step 5: Commit**

---

### Task 4: Lập trình Bộ điều khiển Router & State Machine (`ca-nhan/js/app.js`)

**Files:**
- Create: `ca-nhan/js/app.js`

- [ ] **Step 1: Xây dựng State Manager lưu trữ `currentScreen` và `historyStack`**
- [ ] **Step 2: Lập trình hàm `navigateTo(targetScreenId, transitionType)`**
- [ ] **Step 3: Lập trình hàm `goBack()` tự động lấy màn hình trước từ stack**
- [ ] **Step 4: Lập trình Kiosk Idle Timer (mặc định 60 giây không tương tác tự động quay về `#screen-idle`)**
- [ ] **Step 5: Gắn bộ lắng nghe sự kiện click/touch cho toàn bộ touchpoint, button CTA và nút Back**
- [ ] **Step 6: Commit**

---

### Task 5: Lập trình Hệ thống Hiệu ứng Chuyển động GSAP Timeline

**Files:**
- Modify: `ca-nhan/js/app.js`

- [ ] **Step 1: Hiệu ứng 1 - Chuyển cảnh Trang Chờ ➔ Trang Chính:**
  - Fade out Trang Chờ
  - Fade in Trang Chính
  - Quả địa cầu xoay/scale nhẹ vào vị trí
  - Stagger pop-up 4 thẻ touchpoint xuất hiện lần lượt
- [ ] **Step 2: Hiệu ứng 2 - Trang Chính ➔ Màn hình Cấp 1 (1.1, 1.2, 1.3, 1.4):**
  - Quả cầu zoom in phóng đại về giữa màn hình, text trang chính fade out
  - Quả cầu zoom out mờ dần và dịch về góc nền tương ứng của trang con
  - Title và các cards của trang cấp 1 trượt nhẹ vào vị trí
  - Kích hoạt pulse cho nút CTA và nhấp nháy cho mũi tên
- [ ] **Step 3: Hiệu ứng 3 - Màn hình Cấp 1 ➔ Màn hình Cấp 2 (1.3 sang 1.3.1/1.3.2, 1.4 sang 1.4.1):**
  - Hiệu ứng Pan trượt ngang (Slide out nhóm thẻ cũ sang trái, Slide in nhóm thẻ mới từ phải)
  - Đầu điện thoại nhú lên từ đáy màn hình kèm nhãn "TRẢI NGHIỆM NGAY"
- [ ] **Step 4: Hiệu ứng 4 - Mở Màn hình Demo (Mô hình Điện thoại):**
  - Chạm vào đầu điện thoại / nút CTA
  - Điện thoại trượt từ dưới lên giữa màn hình với gia tốc `power3.out`
  - Nền mờ tối nhẹ tập trung vào nội dung demo
  - Nhấn Back / Chạm bên ngoài để thu điện thoại xuống
- [ ] **Step 5: Commit**

---

### Task 6: Kiểm thử Tự động & Xác thực Tương tác Trực quan

- [ ] **Step 1: Kiểm thử toàn bộ các nhánh rẽ điều hướng (Trang Chờ -> Trang Chính -> 1.1 -> Demo -> Back -> 1.3 -> 1.3.1 -> Demo -> Back)**
- [ ] **Step 2: Kiểm thử tính năng Kiosk Timer tự động trở về Trang Chờ**
- [ ] **Step 3: Chụp ảnh màn hình / quay video xác nhận hiển thị trên tỷ lệ 1535x576**
- [ ] **Step 4: Hoàn thành Walkthrough và báo cáo**
