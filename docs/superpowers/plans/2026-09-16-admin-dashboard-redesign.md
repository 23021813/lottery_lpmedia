# Kế Hoạch Triển Khai: Tái Cấu Trúc Giao Diện Quản Trị (Admin Dashboard)

> **Dành cho Agentic Workers:** Sử dụng superpowers:subagent-driven-development hoặc executing-plans để triển khai theo từng task. Các bước sử dụng cú pháp checkbox (`- [ ]`).

**Mục tiêu:** Nâng cấp toàn diện giao diện quản trị Admin thành hệ thống 3 Tab chuyên nghiệp, bổ sung 4 KPI Cards, thanh tìm kiếm tức thì, bộ lọc đa chiều (Đại lý, Đáp án, Giải), bổ sung cột CCCD với chế độ ẩn/hiện, phân trang 25/50/100 và đưa nút Reset CSV vào Danger Zone an toàn.

**Kiến trúc:** 
- `App.tsx`: Quản lý trạng thái chuyển Tab (Tabs: `submissions` | `timing-qr` | `agencies-brand`).
- `components/SubmissionList.tsx`: Tách biệt logic lọc/tìm kiếm, phân trang và render bảng quản trị tương phản cao.
- `scripts/e2e-test.mjs`: Bộ kiểm thử tự động xác minh logic tìm kiếm, phân trang, lọc và xuất dữ liệu.

**Công nghệ:** React 19, TypeScript, Tailwind CSS, Node.js Test CLI.

---

### Task 1: Mở rộng kiểm thử tự động (E2E Test) cho Logic Quản Trị
**Files:**
- Test: `scripts/e2e-test.mjs`

- [ ] **Bước 1: Viết test cho logic tìm kiếm & phân loại dữ liệu Admin**
  - Kiểm tra tìm kiếm theo Tên, SĐT, CCCD, Mã số.
  - Kiểm tra lọc theo Đại lý (19 đại lý), Đáp án (C vs Khác), Trạng thái trúng giải.
  - Kiểm tra phân trang (Pagination math: totalPages, slice range).
- [ ] **Bước 2: Chạy kiểm thử để xác nhận**
  - Run: `node scripts/e2e-test.mjs`

---

### Task 2: Nâng cấp Bảng Quản trị Dữ Liệu `components/SubmissionList.tsx`
**Files:**
- Modify: `components/SubmissionList.tsx`

- [ ] **Bước 1: Bổ sung State tìm kiếm, lọc đa chiều, phân trang và toggle hiển thị CCCD/SĐT**
  - State: `searchTerm`, `selectedAgency`, `filterAnswer`, `filterPrize`, `currentPage`, `rowsPerPage`, `revealedIds`.
- [ ] **Bước 2: Triển khai 4 KPI Cards thống kê trực quan**
  - Tổng đăng ký, Đủ điều kiện (C) + %, Không đạt + %, Đã trúng giải.
- [ ] **Bước 3: Triển khai Toolbar Tìm kiếm & Bộ lọc**
  - Input tìm kiếm tức thì.
  - Dropdown chọn Đại lý (lấy danh sách duy nhất từ dữ liệu hoặc 19 đại lý).
  - Dropdown lọc Đáp án và Lọc Giải thưởng.
  - Dropdown chọn số dòng/trang (25, 50, 100, Tất cả).
- [ ] **Bước 4: Bổ sung Cột CCCD & Hoàn thiện Bảng dữ liệu**
  - Cột CCCD: hiển thị `********XXXX` kèm icon 👁️ toggle xem toàn bộ.
  - Cột SĐT: hiển thị `0974377***` kèm icon 👁️ toggle.
  - Badge Đáp án nổi bật: `✓ C` màu xanh lục, các đáp án khác màu xám.
- [ ] **Bước 5: Thêm Thanh điều hướng Phân trang (Pagination Bar)**
  - Hiển thị dòng "Hiển thị X - Y trên tổng số Z bản ghi".
  - Nút Trước, 1, 2, 3..., Sau.
- [ ] **Bước 6: Tối ưu nút Xuất CSV và Đưa Reset CSV vào Danger Zone**
  - Nút Xuất DS Quay Số (Đáp Án C): màu xanh ngọc đậm, tương phản cao, hiển thị số lượng.
  - Khung Danger Zone viền đỏ ở đáy bảng cho thao tác Reset CSV.

---

### Task 3: Cấu trúc 3 Tab tại `App.tsx`
**Files:**
- Modify: `App.tsx`

- [ ] **Bước 1: Bổ sung State `activeAdminTab`**
  - `'submissions' | 'timing-qr' | 'agencies-brand'`
- [ ] **Bước 2: Thiết kế Thanh Tab Navigation hiện đại**
  - 3 nút Tab có icon, badge số lượng, hiệu ứng active rõ nét.
- [ ] **Bước 3: Bố cục nội dung từng Tab**
  - Tab 1: `SubmissionList` + nút tắt mở `Final.html`.
  - Tab 2: Lưới 2 cột cho `QRCodeManager` (bên trái) và `TimeSettings` (bên phải).
  - Tab 3: `AgencyManager` và khối cấu hình thương hiệu (`LogoManager`, `BackgroundManager`).

---

### Task 4: Kiểm thử, Build Production & Xác minh Trực quan
**Files:**
- Test: `scripts/e2e-test.mjs`
- Build: `npm run build`

- [ ] **Bước 1: Chạy toàn bộ bộ test `npm run test:e2e`**
- [ ] **Bước 2: Chạy `npm run build` để đảm bảo TypeScript và Vite build thành công**
- [ ] **Bước 3: Xác minh trên giao diện thực tế và cập nhật walkthrough.md**
