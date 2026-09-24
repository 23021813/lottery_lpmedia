# Cập Nhật Video WebM Alpha & Thiết Lập Nền Trình Chiếu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giải nén 13 video WebM có kênh Alpha trong suốt, ghi đè vào thư mục video của Cá nhân và Doanh nghiệp, đồng thời cập nhật phông nền trình chiếu video (`.video-presentation-wrapper`) sang hình ảnh nhận diện thương hiệu chuẩn (`bg_canhanhoa.jpg` cho Cá nhân, `bg_toiuu.jpg` cho Doanh nghiệp) với nền video trong suốt.

**Architecture:** 
1. Giải nén và đổi tên chính xác 13 video WebM từ `WEBM-20260924T010151Z-1-001.zip` tương ứng vào `ca-nhan/video/` (6 tệp) và `doanh-nghiep/video/` (7 tệp).
2. Cập nhật CSS cho modal trình chiếu video ở cả hai dự án: đặt `.video-presentation-wrapper` hiển thị đúng background image đặc trưng, đặt `.presentation-video` có `background: transparent`.
3. TDD: Viết test mở rộng trong `tests/video-presentation.test.mjs` kiểm tra kênh `alpha_mode: 1` và thuộc tính CSS nền, đảm bảo 100% test pass.

**Tech Stack:** WebM (VP9 + Alpha channel), HTML5 `<video>`, CSS3 (Background cover, Flexbox), Node.js test runner (`node --test`), Git.

---

### Task 1: Cập Nhật Bộ Test TDD Kiểm Tra Kênh Alpha và Phông Nền CSS

**Files:**
- Modify: `tests/video-presentation.test.mjs:130-153`

- [ ] **Step 1: Viết test mở rộng kiểm tra kênh Alpha và CSS background**

Thêm các test cases vào `tests/video-presentation.test.mjs`:
- Kiểm tra các video trong `ca-nhan/video/` và `doanh-nghiep/video/` được kiểm tra thông qua ffprobe hoặc container inspection có `alpha_mode: 1`.
- Kiểm tra `ca-nhan/css/style.css` chứa `background-image: url('../images/bg_canhanhoa.jpg')` trong `.video-presentation-wrapper` và `.presentation-video` có `background: transparent`.
- Kiểm tra `doanh-nghiep/css/style.css` chứa `background-image: url('../images/bg_toiuu.jpg')` trong `.video-presentation-wrapper` và `.presentation-video` có `background: transparent`.

- [ ] **Step 2: Chạy test để xác nhận RED (thất bại vì chưa cập nhật video và CSS)**

Chạy: `node --test tests/video-presentation.test.mjs`
Kỳ vọng: FAIL ở các bài test mới.

---

### Task 2: Giải Nén và Thay Thế 13 Video WebM Alpha Vào Đúng Thư Mục

**Files:**
- Extract from: `WEBM-20260924T010151Z-1-001.zip`
- Destination (Cá nhân):
  - `ca-nhan/video/marketplace.webm`
  - `ca-nhan/video/security.webm`
  - `ca-nhan/video/thay-doi-giao-dien.webm`
  - `ca-nhan/video/m-sinh-loi.webm`
  - `ca-nhan/video/m-triple.webm`
  - `ca-nhan/video/m-rewards.webm`
- Destination (Doanh nghiệp):
  - `doanh-nghiep/video/quan-tri-dich-vu.webm`
  - `doanh-nghiep/video/ket-noi-doi-tac.webm`
  - `doanh-nghiep/video/tin-dung-linh-hoat.webm`
  - `doanh-nghiep/video/tai-cap-han-muc.webm`
  - `doanh-nghiep/video/the-tin-dung.webm`
  - `doanh-nghiep/video/chung-chi-tien-gui.webm`
  - `doanh-nghiep/video/msb-rewards.webm`

- [ ] **Step 1: Viết script copy chính xác 13 video từ thư mục giải nén vào vị trí đích**
- [ ] **Step 2: Thực thi script copy và kiểm tra file size từng video**
- [ ] **Step 3: Chạy test xác nhận video test case passes**

---

### Task 3: Cập Nhật CSS Phông Nền Cho Cá Nhân & Doanh Nghiệp

**Files:**
- Modify: `ca-nhan/css/style.css:1140-1160`
- Modify: `doanh-nghiep/css/style.css:990-1010`

- [ ] **Step 1: Cập nhật CSS cho Cá nhân (`ca-nhan/css/style.css`)**
  - Đặt `.video-presentation-wrapper`:
    ```css
    background-color: #0c0402;
    background-image: url('../images/bg_canhanhoa.jpg');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    ```
  - Đặt `.presentation-video`:
    ```css
    background: transparent;
    ```
  - Đặt `.demo-modal-overlay.demo-video-modal`:
    ```css
    background: transparent;
    ```

- [ ] **Step 2: Cập nhật CSS cho Doanh nghiệp (`doanh-nghiep/css/style.css`)**
  - Đặt `.video-presentation-wrapper`:
    ```css
    background-color: #02071a;
    background-image: url('../images/bg_toiuu.jpg');
    background-repeat: no-repeat;
    background-position: center 42%;
    background-size: cover;
    ```
  - Đặt `.presentation-video`:
    ```css
    background: transparent;
    ```
  - Đặt `.demo-modal-overlay.demo-video-modal`:
    ```css
    background: transparent;
    ```

- [ ] **Step 3: Chạy test suite `node --test` để đảm bảo GREEN (tất cả bài test đều đỗ)**

---

### Task 4: Kiểm Thử Giao Diện Thực Tế Trên Trình Duyệt & Đồng Bộ GitHub

**Files:**
- Verify: `http://localhost:8000/ca-nhan/`
- Verify: `http://localhost:8000/doanh-nghiep/`

- [ ] **Step 1: Dùng trình duyệt kiểm tra modal video trên Cá nhân và Doanh nghiệp**
- [ ] **Step 2: Đảm bảo điện thoại nổi trong suốt trên nền ảnh nhận diện**
- [ ] **Step 3: Commit code và cập nhật git**
