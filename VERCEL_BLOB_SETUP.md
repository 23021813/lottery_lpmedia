# Hướng dẫn Setup Vercel Blob

## Vấn đề
Vercel Functions có file system read-only, không thể ghi file vào thư mục local. Lỗi `EROFS (read-only file system)` xảy ra khi cố gắng ghi file `data.csv` và `config.json`.

## Giải pháp
Sử dụng **Vercel Blob** để lưu trữ files thay vì ghi vào local file system.

## Cài đặt

### 1. Cài đặt Vercel Blob SDK
```bash
npm install @vercel/blob
```

### 2. Tạo Vercel Blob Store
1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Vào **Storage** tab
3. Tạo **Blob Store** mới
4. Copy **BLOB_READ_WRITE_TOKEN**

### 3. Cấu hình Environment Variables
Thêm vào Vercel project settings:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```

### 4. Cấu hình Local Development
Tạo file `.env.local`:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```

## Cách hoạt động

### API Endpoints mới:
- `POST /api/write-config` - Lưu config vào Vercel Blob
- `POST /api/write-csv` - Lưu CSV data vào Vercel Blob  
- `GET /api/read-config` - Đọc config từ Vercel Blob
- `GET /api/read-csv` - Đọc CSV data từ Vercel Blob
- `GET /api/list-files` - Liệt kê tất cả files trong Blob

### Files được lưu:
- `config.json` - Cấu hình ứng dụng
- `data.csv` - Dữ liệu đăng ký

### Development Requirements:
- Vercel Blob là bắt buộc cho cả development và production
- Cần set BLOB_READ_WRITE_TOKEN trong .env.local cho development

## Ưu điểm
✅ **Giải quyết EROFS error** trên Vercel  
✅ **Persistent storage** - data không bị mất khi redeploy  
✅ **Global CDN** - truy cập nhanh từ mọi nơi  
✅ **Automatic scaling** - không cần quản lý infrastructure  
✅ **Fallback support** - hoạt động cả local và production  

## Cách sử dụng

### Frontend JavaScript:
```javascript
// Lưu config
const saveConfig = async (config) => {
  const response = await fetch('/api/write-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return response.json();
};

// Đọc config
const loadConfig = async () => {
  const response = await fetch('/api/read-config');
  const result = await response.json();
  return result.data;
};

// Lưu CSV
const saveCsv = async (csvContent) => {
  const response = await fetch('/api/write-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: csvContent })
  });
  return response.json();
};

// Đọc CSV
const loadCsv = async () => {
  const response = await fetch('/api/read-csv');
  const result = await response.json();
  return result.data;
};
```

## Khởi tạo Data
1. Deploy code với Vercel Blob
2. Hệ thống sẽ tự động tạo files với default values khi cần
3. Admin có thể cấu hình agencies và time settings qua giao diện

## Troubleshooting

### Lỗi "BLOB_READ_WRITE_TOKEN not found"
- Kiểm tra environment variable đã được set chưa
- Đảm bảo token có quyền read/write

### Lỗi "Failed to save to Vercel Blob"
- Kiểm tra network connection
- Verify token còn valid không
- Check Vercel Blob store status

### Development không hoạt động
- Tạo file `.env.local` với BLOB_READ_WRITE_TOKEN
- Vercel Blob là bắt buộc, không có fallback