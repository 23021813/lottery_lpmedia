# 🎯 Lucky Draw Registration App

> Ứng dụng đăng ký quay số trúng thưởng chuyên nghiệp cho các sự kiện bất động sản với bảo mật Cloudflare Turnstile

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6+-purple.svg)](https://vitejs.dev/)
[![Turnstile](https://img.shields.io/badge/Cloudflare-Turnstile-orange.svg)](https://developers.cloudflare.com/turnstile/)

## 📋 Mục Lục

- [✨ Tính Năng Chính](#-tính-năng-chính)
- [🚀 Cài Đặt Nhanh](#-cài-đặt-nhanh)
- [⚙️ Cấu Hình](#️-cấu-hình)
- [🛡️ Bảo Mật Turnstile](#️-bảo-mật-turnstile)
- [📁 Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [🔌 API Endpoints](#-api-endpoints)
- [👨‍💼 Admin Panel](#-admin-panel)
- [🎨 Tùy Chỉnh Giao Diện](#-tùy-chỉnh-giao-diện)
- [📊 Quản Lý Dữ Liệu](#-quản-lý-dữ-liệu)
- [🔧 Development](#-development)
- [🚢 Production](#-production)
- [📚 Tài Liệu](#-tài-liệu)

## ✨ Tính Năng Chính

### 🔐 Bảo Mật & Validation
- ✅ **Cloudflare Turnstile**: Bảo vệ chống bot và spam
- ✅ **Server-side Validation**: Xác thực kép client + server
- ✅ **Real-time Validation**: Kiểm tra trùng lặp SĐT/CCCD
- ✅ **IP Tracking**: Theo dõi và chống abuse

### 📝 Quản Lý Đăng Ký
- ✅ **Form Đăng Ký**: Thu thập thông tin với validation chi tiết
- ✅ **Quản Lý Thời Gian**: Cài đặt thời gian mở/đóng đăng ký
- ✅ **Danh Sách Đăng Ký**: Xem và quản lý tất cả submission
- ✅ **Export Data**: Xuất CSV và JSON config

### 🏢 Quản Lý Đại Lý
- ✅ **CRUD Operations**: Thêm/sửa/xóa đại lý bất động sản
- ✅ **Dynamic Loading**: Load danh sách từ config file
- ✅ **Validation**: Kiểm tra tính hợp lệ của đại lý

### 🎲 Hệ Thống Quay Số
- ✅ **Wheel Animation**: Hiệu ứng quay số đẹp mắt
- ✅ **Fair Random**: Thuật toán random công bằng
- ✅ **Prize Management**: Quản lý giải thưởng

### 🎨 Tùy Chỉnh Giao Diện
- ✅ **Background Upload**: Upload ảnh background tùy chỉnh
- ✅ **Responsive Design**: Tối ưu cho mobile và desktop
- ✅ **Modern UI**: Giao diện hiện đại với Tailwind CSS

## 🚀 Cài Đặt Nhanh

### Yêu Cầu Hệ Thống
- **Node.js**: 18.0.0 hoặc cao hơn
- **npm**: 8.0.0 hoặc cao hơn
- **Cloudflare Account**: Để sử dụng Turnstile

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd lucky-draw-registration-app
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Cấu Hình Environment
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
# Cloudflare Turnstile Keys
VITE_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# Admin Configuration
ADMIN_PASSWORD=admin123

# Optional: Gemini AI (for advanced features)
GEMINI_API_KEY=your_gemini_key_here
```

### Bước 4: Chạy Development Server
```bash
npm run dev
```

Truy cập: http://localhost:5173

### Bước 5: Build Production
```bash
npm run build
npm start
```

## ⚙️ Cấu Hình

### Environment Variables

| Variable | Mô Tả | Bắt Buộc | Mặc Định |
|----------|-------|----------|----------|
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Site Key | ✅ | `1x00000000000000000000AA` (test) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Secret Key | ✅ | `1x0000000000000000000000000000000AA` (test) |
| `ADMIN_PASSWORD` | Mật khẩu admin panel | ✅ | `admin123` |
| `GEMINI_API_KEY` | Google Gemini API Key | ❌ | - |

### Test Keys (Development)
Để test trong môi trường development:
```env
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

## 🛡️ Bảo Mật Turnstile

### Tại Sao Sử Dụng Turnstile?
- **Privacy-First**: Không thu thập dữ liệu cá nhân
- **Better UX**: Ít invasive hơn reCAPTCHA
- **High Performance**: Tốc độ xử lý nhanh
- **Free Tier**: Miễn phí cho hầu hết use cases

### Cách Hoạt Động
1. **Client-Side**: Widget Turnstile hiển thị trong form
2. **Token Generation**: User verify → nhận token
3. **Server Validation**: Token được verify với Cloudflare API
4. **Double Security**: Validation cả client và server

### Cấu Hình Turnstile

#### Bước 1: Tạo Turnstile Site
1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vào **Turnstile** → **Add Site**
3. Điền thông tin:
   - **Site name**: Tên dự án
   - **Domain**: Domain website của bạn
   - **Widget Mode**: Managed (khuyến nghị)

#### Bước 2: Lấy Keys
- **Site Key**: Dùng cho client-side (bắt đầu bằng `0x...`)
- **Secret Key**: Dùng cho server-side (bắt đầu bằng `0x...`)

#### Bước 3: Cấu Hình Domain
- Thêm domain production vào **Domains** list
- Cho development: có thể dùng `localhost`

### Security Features
- ✅ **Bot Protection**: Chặn automated requests
- ✅ **Rate Limiting**: Giới hạn số lần submit
- ✅ **IP Tracking**: Theo dõi suspicious activities
- ✅ **Token Expiry**: Token có thời hạn sử dụng

## 📁 Cấu Trúc Dự Án

```
lucky-draw-registration-app/
├── 📁 components/              # React Components
│   ├── 📄 RegistrationForm.tsx    # Form đăng ký chính
│   ├── 📄 SubmissionList.tsx      # Danh sách đăng ký
│   ├── 📄 AgencyManager.tsx       # Quản lý đại lý
│   ├── 📄 BackgroundManager.tsx   # Quản lý background
│   ├── 📄 WheelComponent.tsx      # Wheel quay số
│   └── 📁 ui/                     # UI Components
│       ├── 📄 Button.tsx
│       ├── 📄 Input.tsx
│       ├── 📄 Select.tsx
│       ├── 📄 Card.tsx
│       └── 📄 Turnstile.tsx       # Turnstile wrapper
├── 📁 services/               # Services & APIs
│   ├── 📄 mockApi.ts             # Main API service
│   ├── 📄 csvService.ts          # CSV operations
│   ├── 📄 fileService.ts         # File operations
│   ├── 📄 captchaService.ts      # Captcha verification
│   └── 📄 turnstileService.js    # Server-side Turnstile
├── 📁 data/                   # Data Storage
│   ├── 📄 config.json            # App configuration
│   └── 📄 data.csv               # Submissions data
├── 📁 public/                 # Static Assets
│   ├── 📄 bg.jpeg                # Background image
│   └── 📄 favicon.ico
├── 📄 server.js               # Express Production Server
├── 📄 vite.config.ts          # Vite Configuration
├── 📄 constants.ts            # App Constants
├── 📄 types.ts                # TypeScript Types
└── 📄 App.tsx                 # Main App Component
```

## 🔌 API Endpoints

### Development (Vite Dev Server)
Base URL: `http://localhost:5173`

### Production (Express Server)
Base URL: `http://localhost:3000`

### Endpoints

| Method | Endpoint | Mô Tả | Body |
|--------|----------|-------|------|
| `POST` | `/api/write-config` | Lưu cấu hình app | `{config: object}` |
| `POST` | `/api/write-csv` | Lưu dữ liệu CSV | `{content: string}` |
| `POST` | `/api/verify-submission` | Verify Turnstile token | `{captchaToken: string, formData: object}` |
| `POST` | `/api/upload-background` | Upload background image | `FormData` |

### Response Format
```json
{
  "success": true|false,
  "message": "Success message",
  "error": "Error message (if failed)",
  "data": {} // Additional data
}
```

## 👨‍💼 Admin Panel

### Truy Cập Admin
1. Click **"Bản quyền"** ở footer
2. Nhập mật khẩu: `admin123`
3. Truy cập các chức năng admin

### Chức Năng Admin

#### ⏰ Quản Lý Thời Gian
- Cài đặt thời gian mở đăng ký
- Cài đặt thời gian đóng đăng ký
- Hiển thị countdown timer

#### 📋 Quản Lý Đăng Ký
- Xem danh sách tất cả đăng ký
- Tìm kiếm theo tên, SĐT, CCCD
- Export dữ liệu CSV
- Xóa đăng ký (nếu cần)

#### 🏢 Quản Lý Đại Lý
- Thêm đại lý mới
- Sửa tên đại lý
- Xóa đại lý
- Sắp xếp danh sách

#### 🎲 Quay Số Trúng Thưởng
- Wheel animation với hiệu ứng
- Random selection công bằng
- Lưu kết quả trúng thưởng
- Export danh sách trúng thưởng

#### 🎨 Quản Lý Background
- Upload ảnh background mới
- Preview trước khi apply
- Hỗ trợ JPG, PNG, WEBP
- Tối đa 5MB

## 🎨 Tùy Chỉnh Giao Diện

### Background Customization
1. **Truy cập Admin Panel**
2. **Vào "Quản Lý Background"**
3. **Chọn file ảnh** (JPG/PNG/WEBP, max 5MB)
4. **Upload** → Background áp dụng ngay

### Supported Formats
- **JPEG/JPG**: Tối ưu cho photos
- **PNG**: Hỗ trợ transparency
- **WEBP**: Kích thước nhỏ, chất lượng cao

### Technical Details
- **Storage**: `public/bg.jpeg`
- **Auto-resize**: Tự động scale theo viewport
- **Fallback**: Default gradient nếu không có ảnh

## 📊 Quản Lý Dữ Liệu

### Data Storage
- **Config**: `data/config.json`
- **Submissions**: `data/data.csv`
- **Background**: `public/bg.jpeg`

### Data Format

#### Config.json
```json
{
  "timeSettings": {
    "regStart": "2024-01-01T00:00:00.000Z",
    "regEnd": "2024-12-31T23:59:59.000Z"
  },
  "agencies": [
    "Đại lý A",
    "Đại lý B"
  ]
}
```

#### Data.csv
```csv
id,name,phone,nationalId,agency,prizeWon
1,Nguyễn Văn A,0987654321,001234567890,Đại lý A,
2,Trần Thị B,0123456789,098765432100,Đại lý B,Giải nhất
```

### Export Features
- **CSV Export**: Tất cả submissions
- **Config Export**: App configuration
- **Filtered Export**: Theo criteria cụ thể

## 🔧 Development

### Development Server
```bash
npm run dev
```
- **URL**: http://localhost:5173
- **Hot Reload**: Enabled
- **API Proxy**: Vite middleware

### Build Process
```bash
npm run build
```
- **Output**: `dist/` folder
- **Optimization**: Minification, tree-shaking
- **Assets**: Optimized images, fonts

### Code Structure
- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first CSS

### Development Tools
- **Vite**: Fast build tool
- **React DevTools**: Component debugging
- **Network Tab**: API monitoring

## 🚢 Production

### Production Build
```bash
npm run build
npm start
```

### Production Server
- **Express.js**: Production server
- **Port**: 3000 (configurable)
- **Static Serving**: Optimized assets
- **API Routes**: Full functionality

### Environment Setup
```env
NODE_ENV=production
PORT=3000
REACT_APP_TURNSTILE_SITE_KEY=your_production_site_key
TURNSTILE_SECRET_KEY=your_production_secret_key
```

### Deployment Checklist
- [ ] Set production Turnstile keys
- [ ] Configure domain in Cloudflare
- [ ] Set strong admin password
- [ ] Test all functionality
- [ ] Monitor error logs
- [ ] Setup backup strategy

### Hosting Options
- **VPS/Dedicated**: Full control
- **Vercel**: Easy deployment
- **Netlify**: Static + serverless
- **Railway**: Container deployment

## 📚 Tài Liệu

### Guides
- [TURNSTILE_SETUP_GUIDE.md](TURNSTILE_SETUP_GUIDE.md) - Chi tiết setup Turnstile
- [BACKGROUND_UPLOAD_GUIDE.md](BACKGROUND_UPLOAD_GUIDE.md) - Hướng dẫn upload background

### API Documentation
- Xem phần [API Endpoints](#-api-endpoints)
- Response format chuẩn JSON
- Error handling đầy đủ

### Troubleshooting

#### Common Issues

**1. Turnstile không hiển thị**
```bash
# Kiểm tra Site Key
echo $REACT_APP_TURNSTILE_SITE_KEY

# Kiểm tra network
curl -I https://challenges.cloudflare.com
```

**2. API calls fail**
```bash
# Kiểm tra server
curl http://localhost:5173/api/verify-submission

# Kiểm tra logs
npm run dev # Xem console logs
```

**3. Build errors**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Support
- **Issues**: GitHub Issues
- **Documentation**: README files
- **Community**: Discussions tab

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ for Real Estate Events**
