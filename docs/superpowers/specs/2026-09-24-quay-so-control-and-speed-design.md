# Tài Liệu Thiết Kế: Điều Chỉnh Tốc Độ Quay Và Nút Điều Khiển Quay Số MSB

## 1. Tổng quan mục tiêu
Tối ưu hóa trải nghiệm quay số may mắn trên trang `quay-so/Final.html` của MSB:
1. Giảm tốc độ quay của các dải số (card) để người xem có thể nhìn thấy các con số nhảy chậm rãi, rõ ràng và hồi hộp hơn.
2. Thay thế cơ chế điều khiển phím/click lồng quay bằng 1 nút bấm điều khiển trực quan duy nhất đặt dưới khung số:
   - Trạng thái sẵn sàng: Hiển thị "QUAY SỐ" (hoặc "QUAY TIẾP").
   - Trạng thái đang quay: Chuyển thành nút "DỪNG LẠI".
   - Bấm nút "DỪNG LẠI": Dừng lồng quay tuần tự theo hiệu ứng cascade từ trái sang phải, sau đó hiển thị kết quả.
3. Loại bỏ hoàn toàn việc điều khiển bằng bàn phím (Space, Enter, V, Delete, ESC...) và loại bỏ các thanh/dòng chữ hướng dẫn phím tắt.
4. Bỏ cơ chế tự động dừng sau 5-7 giây: Lồng số sẽ quay liên tục cho tới khi người điều khiển bấm nút "DỪNG LẠI".
5. Xử lý nút "VẮNG MẶT": Khi người trúng giải vắng mặt, ghi nhận vào danh sách vắng mặt, đóng modal vinh danh nhưng **không tự động quay tiếp**. Nút quay sẽ ở trạng thái "QUAY TIẾP" để người điều khiển chủ động bấm.

---

## 2. Chi tiết kỹ thuật & Thay đổi

### 2.1. Điều chỉnh tốc độ quay (`quay-so/Final.html`)
- **Hiện tại**:
  - `baseSpeed = [78, 48, 86, 56]` px/frame (tương đương 3000 - 5000 px/s), cuộn quá nhanh gây mờ số.
- **Thay đổi**:
  - Giảm tốc độ cơ sở `baseSpeed` xuống khoảng `[24, 18, 26, 20]` px/frame kèm phương sai ngẫu nhiên nhỏ (`+ Math.random() * 2`).
  - Tốc độ này giúp các chữ số lướt qua mắt khán giả một cách mượt mà, dễ nhận biết và tạo không khí hồi hộp cho hội trường.

### 2.2. Nút điều khiển tương tác (Action Button)
- **Vị trí**:
  - Nằm ngay dưới khung 4 ô số `slotMachineContainer`, thay thế vị trí của `#spaceHintBar`.
- **Giao diện & Phong cách thiết kế**:
  - Thừa hưởng ngôn ngữ thiết kế **Liquid Glass 3D** và bảng màu chuẩn thương hiệu MSB:
    - Trạng thái `QUAY SỐ` / `QUAY TIẾP`: Nền gradient cam MSB (`#f37021` đến `#ef4123`), chữ trắng in hoa, bóng đổ đa tầng phát sáng cam rực rỡ, icon mũi tên quay tròn.
    - Trạng thái `DỪNG LẠI`: Nền gradient đỏ MSB (`#ed1c24` đến `#9e0b0f`), viền sáng bóng kính, hiệu ứng nhịp thở/pulse nhẹ để báo hiệu đang quay, icon hình khối vuông dừng.
- **Cơ chế hoạt động**:
  - Click nút khi chưa quay: Gọi `startSpin()`, cập nhật nút thành "DỪNG LẠI".
  - Click nút khi đang quay: Gọi `stopSpin()`, vô hiệu hóa nút tạm thời (disabled) trong quá trình các dải số đang hãm phanh (cascade 4 số).
  - Sau khi các số đã khóa và modal vinh danh xuất hiện / đóng: Nút trở về trạng thái "QUAY TIẾP".

### 2.3. Loại bỏ bộ đếm thời gian tự dừng (Infinite Spin Until Stopped)
- Trong hàm `startSpin()`:
  - Loại bỏ hoàn toàn khối `spinTimeoutId = setTimeout(() => { stopSpin(); }, randomDuration);`.
  - Lồng số sẽ quay liên tục cho đến khi người dùng click vào nút "DỪNG LẠI".

### 2.4. Loại bỏ phím tắt & Hướng dẫn phím
- Gỡ bỏ thẻ HTML `#spaceHintBar` ("SPACE BẤM ĐỂ QUAY / DỪNG").
- Gỡ bỏ dòng chữ gợi ý phím trong modal vinh danh: `.modal-keyboard-hints` ("[SPACE / ENTER]: Tiếp tục • [V / DELETE]: Vắng mặt • [ESC]: Đóng").
- Trong JavaScript:
  - Vô hiệu hóa hoặc gỡ bỏ `window.addEventListener("keydown", ...)`. Mọi tương tác chuyển sang click các nút trên giao diện.
  - Vô hiệu hóa click trực tiếp vào toàn bộ khung lồng quay `#slotMachineContainer` (`onclick="handleSlotClick()"`), tập trung điểm chạm vào nút điều khiển chuyên dụng để tránh bấm nhầm khi điều khiển trên sân khấu LED.

### 2.5. Xử lý sự kiện "VẮNG MẶT"
- Trong hàm `handleWinnerAbsent()`:
  - Bỏ đoạn code:
    ```javascript
    setTimeout(() => {
      startSpin();
    }, 400);
    ```
  - Thay vào đó: Chỉ lưu trạng thái `absentWinners`, đóng modal vinh danh, chuyển nút điều khiển chính về trạng thái "QUAY TIẾP" và mở sẵn sàng cho người điều khiển bấm.

---

## 3. Chiến lược kiểm thử & Xác minh
1. **Kiểm thử tự động**:
   - Chạy test hiện tại `node --test tests/quay-so-integration.test.mjs` đảm bảo không làm gãy các tiêu chuẩn về tệp tin và video.
   - Thêm test case kiểm tra:
     - Nút điều khiển "QUAY SỐ" / "DỪNG LẠI" tồn tại trong `Final.html`.
     - Không còn `#spaceHintBar` và `.modal-keyboard-hints`.
     - Hàm `handleWinnerAbsent` không còn tự động gọi `startSpin`.
     - Tốc độ `baseSpeed` đã được giảm.
2. **Kiểm thử giao diện & Trải nghiệm thực tế**:
   - Mở trang `quay-so/Final.html` trên trình duyệt bằng subagent browser.
   - Bấm nút "QUAY SỐ": Quan sát số quay chậm rãi, mượt mà. Nút đổi thành "DỪNG LẠI".
   - Chờ vài giây để đảm bảo số không tự dừng.
   - Bấm nút "DỪNG LẠI": Quan sát 4 số dừng tuần tự kịch tính, hiển thị modal trúng thưởng.
   - Bấm "VẮNG MẶT": Modal đóng lại, số KHÔNG tự động quay tiếp, nút hiển thị "QUAY TIẾP".
   - Bấm "QUAY TIẾP": Bắt đầu lượt quay mới trơn tru.
