# Thiết Kế Kỹ Thuật: Hàng Đợi Xử Lý Đăng Ký Bất Đồng Bộ Trên Server (Server-Side Async Queue & Atomic Append)

## 1. Mục tiêu
Giải quyết triệt để rủi ro xung đột ghi đè (Race Condition) và mất dữ liệu khi nhiều người dùng quét mã QR và bấm nút "Xác nhận Đăng ký" tại cùng một thời điểm trong sự kiện.

## 2. Kiến trúc & Thiết kế Chi tiết

### 2.1. Server-Side Async Queue (Hàng đợi Tuần tự)
- Server duy trì một hàng đợi xử lý bất đồng bộ (`Promise queue / Mutex`) cho các thao tác ghi dữ liệu vào file `data.csv`.
- Dù có N request gửi đến cùng lúc (concurrent requests), các tác vụ ghi file sẽ được xếp hàng và xử lý lần lượt (FIFO):
  ```javascript
  let writeQueue = Promise.resolve();
  function enqueueWrite(task) {
    const result = writeQueue.then(task);
    writeQueue = result.catch(() => {});
    return result;
  }
  ```

### 2.2. Endpoint mới: `POST /api/submit-registration`
- **Request Body**:
  ```json
  {
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "nationalId": "001234567890",
    "agency": "RED LAND",
    "answer": "C"
  }
  ```
- **Xử lý bên trong hàng đợi**:
  1. Đọc nội dung hiện tại của `data/data.csv`.
  2. Parse danh sách người đã đăng ký.
  3. Kiểm tra trùng SĐT (`phone`) hoặc CCCD (`nationalId`). Nếu đã tồn tại, trả về HTTP 400 `{ success: false, error: "Số điện thoại hoặc CCCD này đã được đăng ký." }`.
  4. Tính toán ID mới: `newId = (max(id) || 0) + 1`.
  5. Tạo dòng CSV mới: `${newId},"${name}","${phone}","${nationalId}","${agency}","${answer}",""`.
  6. Ghi nối tiếp (hoặc ghi file cập nhật an toàn) vào cả `data/data.csv` và `dist/data/data.csv`.
  7. Trả về HTTP 200 `{ success: true, id: newId }`.

### 2.3. Cập nhật Client-Side (`services/csvService.ts`)
- Thay đổi hàm `addSubmission`:
  - Thay vì tự đọc toàn bộ CSV về máy -> cộng ID -> gửi đè cả file qua `/api/write-csv`, hàm `addSubmission` sẽ gọi trực tiếp `POST /api/submit-registration`.
  - Giữ nguyên fallback hoặc hỗ trợ nếu server trả về lỗi.

### 2.4. Môi trường hỗ trợ
- Cập nhật cả `server.js` (cho production/Docker) và `vite.config.ts` (cho môi trường dev server hiện tại).

## 3. Kế hoạch TDD & Self-Test
1. Viết kịch bản kiểm thử tải đồng thời (`scripts/test-concurrency.mjs`):
   - Bắn đồng thời 20 - 30 request đăng ký vào API `/api/submit-registration` trong cùng 1 mili-giây (`Promise.all`).
   - Kiểm tra:
     - 100% request thành công (không có request nào bị lỗi 500).
     - Tất cả các ID được cấp phát liên tục từ `startId + 1` đến `startId + N`, không có 2 request nào trùng ID.
     - File `data/data.csv` có đủ N dòng mới, không bị mất bất kỳ dòng nào.
     - Thử gửi tiếp một request trùng SĐT -> Đảm bảo bị từ chối chính xác.
   - Phục hồi lại dữ liệu ban đầu sau khi test xong.
