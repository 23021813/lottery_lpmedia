# Tài Liệu Thiết Kế: Tích Hợp Module Quay Số & Phát Hành Nhánh `quay-so` Lên GitHub Pages

- **Ngày tạo:** 2026-09-24
- **Trạng thái:** Chờ phê duyệt (Pending Review)
- **Tác giả:** Antigravity AI & hiepvd2

---

## 1. Bối Cảnh & Mục Tiêu

### 1.1. Hiện trạng
- Mã nguồn chương trình Quay Số Trúng Thưởng (Lucky Draw) cho sự kiện MSB đang nằm trên nhánh Git `MSB` (`origin/MSB`), bao gồm tệp giao diện chính `Final.html`, hình nền thương hiệu `msb-planet-arc-bg.jpg`, hình ảnh `QUAYSO.jpg` và tệp cơ sở dữ liệu danh sách `data/data.csv`.
- Nhánh làm việc chính hiện tại là `MSB-interactive` đang quản lý Cổng Portal (`index.html`), phân hệ Cá nhân (`ca-nhan/`), phân hệ Doanh nghiệp (`doanh-nghiep/`) và bộ công cụ chẩn đoán LED (`debug.html`).
- Dự án được tự động triển khai lên GitHub Pages tại địa chỉ: `https://23021813.github.io/lottery_lpmedia/`.

### 1.2. Mục tiêu
1. **Trích xuất và tích hợp module Quay Số:** Sao chép mã nguồn Quay Số từ `origin/MSB` vào thư mục `quay-so/` trên nhánh `MSB-interactive`.
2. **Chuẩn hóa đường dẫn tương đối (Relative Paths):**
   - Đặt `Final.html` thành `quay-so/index.html` để có thể truy cập trực tiếp qua đường dẫn thân thiện `.../lottery_lpmedia/quay-so/`.
   - Đảm bảo đường dẫn `msb-planet-arc-bg.jpg` và `data/data.csv` hoạt động chính xác khi chạy ở cấp thư mục con trên GitHub Pages.
3. **Mở rộng Cổng Portal Hub (`index.html`):**
   - Bổ sung thẻ điều hướng thứ 3: "Quay Số Trúng Thưởng (MSB Lucky Draw)" với sắc đỏ - cam MSB rực rỡ, kèm danh sách tính năng và nút truy cập trực tiếp.
4. **Tạo nhánh Git độc lập `quay-so`:**
   - Tạo nhánh mới `quay-so` từ `origin/MSB` và đẩy lên GitHub (`origin/quay-so`).
5. **Cấu hình và Triển khai GitHub Pages:**
   - Cập nhật workflow GitHub Actions `.github/workflows/deploy.yml` bổ sung nhánh `quay-so` vào danh sách kích hoạt triển khai.
   - Đồng bộ sang nhánh `gh-pages` để toàn bộ module `quay-so/` khả dụng ngay lập tức trên môi trường online.
6. **Kiểm thử tự động (TDD / Regression Tests):**
   - Viết bài test tự động kiểm tra sự tồn tại của các tệp tin trong `quay-so/`, tính toàn vẹn của tệp `data/data.csv`, cú pháp HTML/JS và liên kết chuyển hướng từ Portal.

---

## 2. Kiến Trúc Thư Mục & Luồng Dữ Liệu

### 2.1. Cấu trúc thư mục dự kiến
```text
MSB_INTERACTIVE/
├── .github/workflows/
│   └── deploy.yml               <-- Thêm nhánh 'quay-so' vào trigger
├── index.html                   <-- Cổng Portal 3 phân hệ (Cá nhân, Doanh nghiệp, Quay số)
├── debug.html                   <-- Bộ chẩn đoán LED Kiosk
├── ca-nhan/                     <-- Phân hệ Cá nhân
├── doanh-nghiep/                <-- Phân hệ Doanh nghiệp
├── quay-so/                     <-- MODULE QUAY SỐ MỚI
│   ├── index.html               <-- Giao diện Quay Số (từ Final.html)
│   ├── Final.html               <-- Bản alias dự phòng
│   ├── msb-planet-arc-bg.jpg    <-- Ảnh nền vũ trụ MSB
│   ├── QUAYSO.jpg               <-- Ảnh nhận diện quay số
│   └── data/
│       └── data.csv             <-- Danh sách dữ liệu người tham gia
└── tests/
    └── quay-so-integration.test.mjs <-- Bài test tự động kiểm tra tích hợp
```

### 2.2. Luồng truy cập của người dùng
1. **Truy cập trang chủ:** `https://23021813.github.io/lottery_lpmedia/`
   - Hiển thị 3 thẻ:
     1. Hành Tinh Số Cá Nhân (`/ca-nhan/`)
     2. Hành Tinh Số Doanh Nghiệp (`/doanh-nghiep/`)
     3. Quay Số Trúng Thưởng (`/quay-so/`)
2. **Truy cập trực tiếp module Quay Số:** `https://23021813.github.io/lottery_lpmedia/quay-so/`
   - Tự động tải `quay-so/index.html`.
   - Script tự động đọc `data/data.csv` bằng đường dẫn tương đối và hiển thị giao diện sân khấu quay số trực tiếp với slot machine, hiệu ứng hạt, quản lý người vắng mặt và bảng vinh danh.

---

## 3. Kế Hoạch Triển Khai Chi Tiết

### Bước 1: Trích xuất file từ `origin/MSB`
- Trích xuất các tệp tin từ tree của `origin/MSB`:
  - `Final.html`
  - `msb-planet-arc-bg.jpg`
  - `QUAYSO.jpg`
  - `data/data.csv`
- Tạo thư mục `quay-so/` và lưu trữ các tệp trên:
  - Sao chép `Final.html` thành `quay-so/index.html` và `quay-so/Final.html`.
  - Đảm bảo trong `quay-so/index.html`: `fetch("data/data.csv")` và `url("msb-planet-arc-bg.jpg")` hoạt động trơn tru.

### Bước 2: Nâng cấp Portal Hub (`index.html`)
- Chuyển `portal-grid` từ 2 cột sang 3 cột (hoặc bố cục lưới responsive 3 thẻ) hài hòa:
  - Thẻ 1: Phân hệ Cá Nhân (Cam MSB)
  - Thẻ 2: Phân hệ Doanh Nghiệp (Xanh Navy MSB)
  - Thẻ 3: Quay Số Trúng Thưởng (Đỏ Cam Lucky Draw) với mô tả tính năng quay số sân khấu, vinh danh người trúng giải.

### Bước 3: Kiểm thử tự động (Test-Driven Development)
- Tạo bài test `tests/quay-so-integration.test.mjs` kiểm tra:
  - Tồn tại thư mục `quay-so/` cùng các file thiết yếu (`index.html`, `data/data.csv`, `msb-planet-arc-bg.jpg`).
  - File `data/data.csv` có dữ liệu hợp lệ (không rỗng, chứa các trường thông tin thí sinh).
  - File `quay-so/index.html` có cú pháp script hợp lệ và liên kết asset tương đối chính xác.
  - File `index.html` có liên kết trỏ tới `quay-so/index.html`.

### Bước 4: Tạo nhánh Git `quay-so` và Cấu hình Workflow
- Tạo nhánh local `quay-so` từ `origin/MSB`.
- Push nhánh `quay-so` lên GitHub remote (`git push origin quay-so`).
- Cập nhật `.github/workflows/deploy.yml` để kích hoạt khi có push vào `quay-so`.

### Bước 5: Đồng bộ `gh-pages` và Nghiệm Thu Trực Tuyến
- Commit các thay đổi trên `MSB-interactive`.
- Merge vào `gh-pages` và push lên GitHub.
- Kiểm tra tính sẵn sàng trên đường link trực tuyến:
  - `https://23021813.github.io/lottery_lpmedia/`
  - `https://23021813.github.io/lottery_lpmedia/quay-so/`

---

## 4. Rủi Ro & Biện Pháp Kiểm Soát
1. **Lỗi tải dữ liệu CSV qua `fetch`:** Khi chạy bằng giao thức `file://` cục bộ, trình duyệt chặn `fetch` do chính sách CORS. Khi chạy qua máy chủ (HTTP Server cổng 8000 hoặc GitHub Pages), `fetch("data/data.csv")` hoạt động hoàn toàn bình thường.
2. **Kích thước ảnh nền lớn:** Ảnh nền `msb-planet-arc-bg.jpg` (~709 KB) là ảnh tĩnh tối ưu cho màn hình sự kiện độ nét cao, tải nhanh chóng qua CDN của GitHub Pages.
