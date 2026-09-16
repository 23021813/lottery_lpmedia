# Thiết Kế Chi Tiết: Tái Cấu Trúc & Nâng Cấp Giao Diện Quản Trị (Admin Dashboard)

- **Ngày tạo:** 2026-09-16
- **Mục tiêu:** Khắc phục toàn bộ các hạn chế của giao diện Admin hiện tại, chuyển sang bố cục Phân Tab (Tabbed Modern Dashboard), nâng cấp bộ lọc tìm kiếm dữ liệu người tham gia, hiển thị cột CCCD, phân trang và bảo vệ các thao tác nguy hiểm.

---

## 1. Vấn đề của giao diện hiện tại
1. **Thiếu tính năng tìm kiếm:** Không thể tra cứu người tham gia theo Tên, Số điện thoại, CCCD hoặc Mã số dự thưởng (`#0001`).
2. **Thiếu cột thông tin CCCD:** Bảng danh sách không hiển thị số CCCD, trong khi kịch bản quay số và trao giải sự kiện bắt buộc đối soát 4 số cuối CCCD.
3. **Cuộn bảng chật hẹp & thiếu phân trang:** Toàn bộ 487 dòng bị ép vào một khung cuộn cố định (`max-h-80`), không có phân trang (25 / 50 / 100 dòng).
4. **Nút thao tác mờ nhạt và kém an toàn:** Nút xuất danh sách quay số bị chìm màu; nút "Reset CSV" là thao tác xóa sạch cơ sở dữ liệu lại nằm ngay cạnh các nút tải file dễ gây bấm nhầm.
5. **Thiếu bộ lọc Đại lý:** Không thể lọc riêng danh sách theo từng sàn / đại lý phân phối.
6. **Bố cục dồn cục:** Toàn bộ các module (QR Code, Thời gian, Danh sách, Đại lý, Logo, Background) xếp chồng thẳng hàng một cột gây dài trang và khó theo dõi.

---

## 2. Kiến trúc giải pháp (Architecture & Layout)

### 2.1. Bố cục 3 Tab chuyên biệt (`App.tsx`)
Chia toàn bộ giao diện quản trị Admin thành 3 Tab độc lập:
1. **Tab 1: 📋 Quản Lý Dữ Liệu & Quay Thưởng (`SubmissionList.tsx`)**
   - 4 Thẻ KPI thống kê số liệu tổng quan.
   - Thanh công cụ Tìm kiếm tức thì & Bộ lọc đa chiều.
   - Nút hành động nổi bật: Xuất DS Quay Số (Đáp án C), Tải toàn bộ CSV, Mở Final.html.
   - Bảng dữ liệu có cột CCCD, chế độ xem an toàn / đầy đủ, và phân trang.
   - Vùng cảnh báo nguy hiểm (Danger Zone) cho thao tác Reset CSV.
2. **Tab 2: ⏱️ Thời Gian & QR Check-in (`TimeSettings.tsx` & `QRCodeManager.tsx`)**
   - Hiển thị QR Code Standee độ nét cao, nút tải file in 1000x1000 px, sao chép link check-in.
   - Quản lý mốc thời gian bắt đầu và kết thúc đăng ký, trạng thái form Đang mở / Đã đóng.
3. **Tab 3: 🏢 Đại Lý & Thương Hiệu (`AgencyManager.tsx`, `LogoManager.tsx`, `BackgroundManager.tsx`)**
   - Quản lý danh sách 19 đại lý phân phối (Thêm / Sửa / Xóa đại lý).
   - Tùy chỉnh Logo sự kiện và Ảnh nền background.

---

## 3. Chi tiết Nâng Cấp Bảng Dữ Liệu (`SubmissionList.tsx`)

### 3.1. 4 Thẻ KPI Cards
- **Tổng Đăng Ký:** Số lượng toàn bộ lượt check-in (`submissions.length`).
- **Đủ Điều Kiện (Đáp án C):** Số lượng người chọn đáp án đúng C + Tỷ lệ % trên tổng số.
- **Không Đạt (A, B, D / Khác):** Số lượng người chọn sai đáp án hoặc dữ liệu cũ chưa có đáp án.
- **Đã Trúng Giải:** Số lượng người đã được trao giải thưởng từ file CSV.

### 3.2. Thanh tìm kiếm & Bộ lọc (Search & Filters Toolbar)
- **Ô tìm kiếm tức thì (Instant Search):**
  - Tìm kiếm không phân biệt chữ hoa/thường theo: Họ tên, Số điện thoại, Số CCCD, Mã số định danh (`#0001` hoặc `1`).
- **Lọc theo Đại lý:** Dropdown chọn `Tất cả đại lý` hoặc 1 trong 19 đại lý.
- **Lọc theo Đáp án:** `Tất cả`, `Chỉ đáp án C (Đạt chuẩn quay số)`, `Đáp án khác (A, B, D, trống)`.
- **Lọc theo Giải thưởng:** `Tất cả`, `Đã trúng giải`, `Chưa trúng giải`.

### 3.3. Cấu trúc Bảng dữ liệu (Data Table)
Các cột hiển thị:
1. **MÃ:** Định dạng `#0001`, in đậm màu xanh dương.
2. **HỌ VÀ TÊN:** Tên người tham gia.
3. **CCCD:** Hiển thị dạng `********1234` kèm nút con mắt 👁️ xem đầy đủ khi cần đối soát giải thưởng.
4. **SĐT:** Hiển thị dạng `0974377***` kèm nút xem đầy đủ.
5. **ĐẠI LÝ:** Tên đại lý trực thuộc.
6. **ĐÁP ÁN:**
   - Nếu `C`: Badge xanh lá nổi bật `✓ C`.
   - Nếu `A, B, D`: Badge màu xám hiển thị rõ chữ cái.
   - Nếu trống: Hiển thị `-`.
7. **GIẢI THƯỞNG:** Hiển thị huy hiệu giải nếu có (hoặc `Chưa trúng`).

### 3.4. Phân trang (Pagination)
- Chọn số lượng bản ghi hiển thị: `25 dòng / trang` (mặc định), `50 dòng`, `100 dòng`, hoặc `Tất cả`.
- Thanh chuyển trang: Nút `Trước`, số trang `1, 2, 3...`, nút `Sau`.

### 3.5. Khu vực Nguy hiểm (Danger Zone)
- Nút "Reset CSV" được chuyển xuống cuối bảng trong một khung viền đỏ riêng biệt.
- Yêu cầu xác nhận 2 lớp để đảm bảo không bị bấm nhầm khi đang diễn ra sự kiện.

---

## 4. Kế hoạch Kiểm thử (Verification & Testing)
1. **Kiểm thử logic lọc & tìm kiếm:**
   - Tìm kiếm theo Tên tiếng Việt có dấu và không dấu.
   - Tìm kiếm theo 4 số cuối SĐT, CCCD và mã số.
   - Lọc kết hợp (vừa lọc Đại lý, vừa lọc Đáp án C).
2. **Kiểm thử phân trang:**
   - Kiểm tra tính toán số trang chính xác cho 487 dòng.
   - Kiểm tra chuyển trang, thay đổi kích thước trang (25 -> 50).
3. **Kiểm thử xuất CSV:**
   - Xuất file CSV danh sách đáp án C có đầy đủ các cột và hỗ trợ tiếng Việt (BOM UTF-8).
   - Xuất toàn bộ CSV đầy đủ thông tin.
4. **Kiểm thử E2E không đầu (Headless E2E Test):**
   - Mở rộng script `scripts/e2e-test.mjs` để xác minh các chức năng mới.
