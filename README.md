# Lucky Draw Registration App

Ứng dụng đăng ký quay số trúng thưởng cho các sự kiện bất động sản.

## Tính Năng Chính

- ✅ **Form đăng ký**: Thu thập thông tin khách hàng với validation
- ✅ **Quản lý đại lý**: Thêm/sửa/xóa danh sách đại lý bất động sản  
- ✅ **Cài đặt thời gian**: Quản lý thời gian mở/đóng đăng ký
- ✅ **Danh sách đăng ký**: Xem và quản lý tất cả đăng ký
- ✅ **Wheel quay số**: Quay số trúng thưởng với hiệu ứng đẹp mắt
- ✅ **Upload Background**: **[MỚI]** Upload ảnh background tùy chỉnh
- ✅ **Xuất dữ liệu**: Export config và CSV data
- ✅ **Responsive**: Tối ưu cho mobile và desktop

## Chạy Ứng Dụng

**Yêu cầu:** Node.js

1. Cài đặt dependencies:
   ```bash
   npm install
   ```

2. Chạy development:
   ```bash
   npm run dev
   ```

3. Build production:
   ```bash
   npm run build
   npm start
   ```

## Tính Năng Upload Background [MỚI]

Admin có thể upload ảnh background tùy chỉnh:

1. **Truy cập admin**: Nhấp "Bản quyền" → nhập mật khẩu `admin123`
2. **Upload ảnh**: Vào phần "Quản Lý Background" → chọn file ảnh
3. **Áp dụng**: Background sẽ được áp dụng ngay cho toàn bộ app

**Hỗ trợ:**
- Định dạng: JPG, PNG, WEBP  
- Kích thước tối đa: 5MB
- Lưu tại: `public/bg.jpeg`

Chi tiết xem [BACKGROUND_UPLOAD_GUIDE.md](BACKGROUND_UPLOAD_GUIDE.md)

## Cấu Trúc Dự Án

```
├── components/           # React components
│   ├── AgencyManager.tsx       # Quản lý đại lý
│   ├── BackgroundManager.tsx   # [MỚI] Quản lý background  
│   ├── RegistrationForm.tsx    # Form đăng ký
│   ├── SubmissionList.tsx      # Danh sách đăng ký
│   └── ui/                     # UI components
├── services/            # API services
├── data/                # JSON config & CSV data
├── public/              # Static assets (including bg.jpeg)
└── server.js            # Express server với upload API
```

## API Endpoints

- `POST /api/write-config` - Lưu cấu hình
- `POST /api/write-csv` - Lưu dữ liệu CSV  
- `POST /api/upload-background` - **[MỚI]** Upload background

## Admin Panel

**Mật khẩu admin:** `admin123`

**Chức năng:**
- Cài đặt thời gian đăng ký
- Quản lý danh sách đăng ký  
- Quản lý đại lý bất động sản
- **Upload background tùy chỉnh**
- Quay số trúng thưởng
- Export dữ liệu
