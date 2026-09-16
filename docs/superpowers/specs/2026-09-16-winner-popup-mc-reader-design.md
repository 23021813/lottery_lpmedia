# Thiết Kế Kỹ Thuật: Popup Vinh Danh Người Trúng Giải Cho MC

## 1. Mục tiêu & Bối cảnh
- **Vấn đề**: Hiện tại trên màn hình quay thưởng [Final.html](file:///c:/Users/hiepvd2/Desktop/lottery_lpmedia/Final.html), khi quay thưởng, các thẻ kết quả nằm trên hệ lưới 16 ô (4x4) có kích thước tương đối nhỏ. Khi trình chiếu lên màn hình lớn hoặc máy chiếu trên sân khấu, MC rất khó quan sát để đọc to thông tin người trúng giải.
- **Giải pháp**: 
  - Mỗi khi một ô quay xong và chốt được người trúng giải, hệ thống lập tức hiển thị một Popup (Modal) vinh danh cực đại phủ trên màn hình với cỡ chữ lớn.
  - Vòng lặp quay tuần tự sẽ tạm dừng và chờ MC/kỹ thuật bấm nút **TIẾP TỤC** (hoặc phím tắt Space/Enter) để đóng popup và tự động quay người tiếp theo.
  - Đối với người trúng thưởng cuối cùng trong lượt quay, nút hiển thị sẽ tự động chuyển thành **HOÀN TẤT** và kích hoạt hiệu ứng pháo hoa chúc mừng.

---

## 2. Thiết Kế Giao Diện (UI/UX)
- **Tông màu & Phong cách**: Dark Luxury phù hợp nhận diện Vinh Heritage:
  - Nền mờ sang trọng: `background: rgba(14, 10, 7, 0.88); backdrop-filter: blur(14px);`
  - Hộp nội dung nổi bật: bo góc `24px`, viền kim loại vàng gold phát sáng `border: 2.5px solid #ba7c38; box-shadow: 0 0 60px rgba(186, 124, 56, 0.4);`
- **Các thành phần hiển thị**:
  1. **Hạng giải**: `GIẢI #01` - Font 24px, màu vàng đồng `#ba7c38`, chữ hoa, in đậm.
  2. **MÃ SỐ DỰ THƯỞNG**: Font **84px**, in đậm `900`, chữ vàng ánh kim rực rỡ `#ffdca3`, viền nổi bật.
  3. **HỌ VÀ TÊN**: Font **48px**, in hoa sắc nét `#ffffff`, font `Be Vietnam Pro`.
  4. **TÊN ĐẠI LÝ**: Font **26px**, màu đồng sang trọng `#d4c5b2`.
  5. **THÔNG TIN BẢO MẬT (CCCD & SĐT)**: Font **20px**, nền bo góc tối giản, hiển thị dạng che: `CCCD: ****5678  •  SĐT: 098***1234`.
  6. **NÚT HÀNH ĐỘNG ĐIỀU HƯỚNG**:
     - Khi chưa phải giải cuối: Nút vàng gold kích thước lớn có chữ **`TIẾP TỤC`** (id: `winnerModalNextBtn`).
     - Khi là giải cuối cùng (người thứ 16 hoặc hết danh sách quay): Nút chuyển nhãn thành **`HOÀN TẤT`**.
     - Phía dưới nút hiển thị gợi ý nhỏ: *Bấm phím [Space] hoặc [Enter] để tiếp tục*.

---

## 3. Kiến Trúc & Luồng Xử Lý Kỹ Thuật (Architecture & Flow)

### 3.1. Cơ chế Chặn Bất Đồng Bộ (`waitForUserAction`)
Xây dựng hàm:
```javascript
let winnerModalResolver = null;

function showWinnerAnnouncementModal(winner, isLastWinner) {
  return new Promise((resolve) => {
    winnerModalResolver = resolve;
    // Điền dữ liệu vào các thẻ ID trên Modal:
    // - Hạng giải: winner.rankIndex
    // - Mã số: #0000
    // - Tên: winner.name
    // - Đại lý: winner.agency
    // - CCCD & SĐT: dạng che 4 số cuối
    // - Cập nhật nút bấm: "HOÀN TẤT" nếu isLastWinner, ngược lại là "TIẾP TỤC"
    // Hiển thị modal (thêm class .show)
  });
}

function handleWinnerModalConfirm() {
  // Đóng modal (xóa class .show)
  if (winnerModalResolver) {
    const resolve = winnerModalResolver;
    winnerModalResolver = null;
    resolve();
  }
}
```

### 3.2. Lắng nghe phím tắt bàn phím (Keyboard Listener)
- Lắng nghe sự kiện `keydown` trên toàn trang (`window.addEventListener('keydown', ...)`):
- Khi Modal đang mở (`winnerAnnouncementModal.classList.contains('show')`):
  - Nếu người dùng bấm phím `Space` (Phím cách) hoặc `Enter`:
    - Chặn hành vi mặc định `e.preventDefault()`.
    - Gọi hàm `handleWinnerModalConfirm()`.

### 3.3. Tích hợp vào vòng lặp quay tự động (`spin16WinnersSequential`)
- Vòng lặp `for (let step = 0; step < countToPick; step++)`:
  1. Chạy hiệu ứng quay số ngẫu nhiên 3–5 giây trên thẻ ô tương ứng.
  2. Cập nhật thẻ ô đó sang trạng thái `is-completed` và lưu kết quả vào `currentWinners` và `sessionStorage`.
  3. Xác định xem đây có phải là người cuối cùng trong đợt quay hay không:
     `const isLast = (step === countToPick - 1) || (currentWinners.length === 16);`
  4. Gọi `await showWinnerAnnouncementModal(winner, isLast);` -> Tạm dừng luồng quay, hiển thị popup cho MC đọc.
  5. Khi MC/người điều khiển bấm nút **TIẾP TỤC** (hoặc gõ phím Space/Enter):
     - Modal đóng lại.
     - Promise resolve.
     - Nếu chưa phải người cuối cùng: chờ 300ms rồi tiếp tục vòng lặp quay người kế tiếp.
     - Nếu là người cuối cùng: kích hoạt pháo hoa chúc mừng toàn màn hình (`startConfetti()`).

### 3.4. Tích hợp vào quay riêng lẻ từng thẻ (`spinSingleCard`)
- Khi người dùng click quay 1 thẻ ô lẻ:
  - Quay xong chốt số -> gọi `await showWinnerAnnouncementModal(randWinner, currentWinners.length === 16)`.
  - Hiển thị nút **HOÀN TẤT** (hoặc **TIẾP TỤC** nếu còn ô chưa quay).
  - Bấm đóng modal để trở về màn hình chính.

---

## 4. Kế Hoạch Kiểm Thử & Xác Minh (Testing)
1. **Kiểm tra cú pháp & tính toàn vẹn HTML/JS**:
   - Chạy lệnh build hoặc kiểm tra cấu trúc DOM trong [Final.html](file:///c:/Users/hiepvd2/Desktop/lottery_lpmedia/Final.html).
2. **Cập nhật & Chạy kịch bản E2E [scripts/e2e-test.mjs](file:///c:/Users/hiepvd2/Desktop/lottery_lpmedia/scripts/e2e-test.mjs)**:
   - Kiểm tra xem [Final.html](file:///c:/Users/hiepvd2/Desktop/lottery_lpmedia/Final.html) có chứa modal vinh danh `#winnerAnnouncementModal`.
   - Kiểm tra sự tồn tại của nút bấm `#winnerModalNextBtn` với logic "TIẾP TỤC" và "HOÀN TẤT".
   - Kiểm tra logic bắt phím Space/Enter.
