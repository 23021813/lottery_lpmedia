# Kế Hoạch Triển Khai: Tích Hợp Module Quay Số & Phát Hành Nhánh `quay-so` Lên GitHub Pages

> **Dành cho kỹ sư thực thi:** REQUIRED SUB-SKILL: Sử dụng `superpowers:executing-plans` hoặc `superpowers:subagent-driven-development` để thực hiện từng bước. Các bước sử dụng cú pháp checkbox (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Trích xuất mã nguồn Quay Số từ `origin/MSB`, tích hợp vào thư mục `quay-so/` trên nhánh `MSB-interactive`, nâng cấp Portal Hub `index.html` với thẻ liên kết Quay Số, tạo nhánh Git `quay-so` độc lập và xuất bản lên GitHub Pages.

**Kiến trúc:** Ứng dụng tĩnh (Static Web App) tối ưu cho GitHub Pages, trích xuất mã nguồn hoàn chỉnh từ `origin/MSB:Final.html` và dữ liệu `origin/MSB:data/data.csv`, kết nối qua Cổng Portal 3 phân hệ.

**Công nghệ:** HTML5, CSS3, Vanilla JS, Canvas API, Node.js Test Runner, Git, GitHub Actions.

---

### Task 1: Viết Bài Test Tự Động Kiểm Tra Tích Hợp (TDD RED)

**Tệp tin:**
- Tạo mới: `tests/quay-so-integration.test.mjs`

- [ ] **Bước 1: Viết test kiểm tra tệp tin, dữ liệu CSV và liên kết Portal**

```javascript
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Quay Số Integration Test Suite', async (t) => {
  await t.test('1. Thư mục quay-so phải tồn tại với đầy đủ tệp tin cốt lõi', () => {
    assert.strictEqual(fs.existsSync('quay-so'), true, 'Thư mục quay-so phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/index.html'), true, 'quay-so/index.html phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/msb-planet-arc-bg.jpg'), true, 'msb-planet-arc-bg.jpg phải tồn tại');
    assert.strictEqual(fs.existsSync('quay-so/data/data.csv'), true, 'quay-so/data/data.csv phải tồn tại');
  });

  await t.test('2. Tệp data/data.csv phải có dữ liệu hợp lệ', () => {
    const csvContent = fs.readFileSync('quay-so/data/data.csv', 'utf8');
    assert.ok(csvContent.length > 100, 'data.csv không được rỗng');
    assert.ok(csvContent.includes('\n'), 'data.csv phải có nhiều dòng');
  });

  await t.test('3. Tệp quay-so/index.html phải tham chiếu tài nguyên tương đối chính xác', () => {
    const html = fs.readFileSync('quay-so/index.html', 'utf8');
    assert.ok(html.includes('msb-planet-arc-bg.jpg'), 'Phải chứa hình nền msb-planet-arc-bg.jpg');
    assert.ok(html.includes('data/data.csv'), 'Phải fetch data/data.csv qua đường dẫn tương đối');
  });

  await t.test('4. Portal index.html phải chứa liên kết trỏ tới quay-so', () => {
    const portalHtml = fs.readFileSync('index.html', 'utf8');
    assert.ok(portalHtml.includes('quay-so/index.html') || portalHtml.includes('quay-so/'), 'Portal phải liên kết tới quay-so');
    assert.ok(portalHtml.includes('Quay Số') || portalHtml.includes('Lucky Draw'), 'Portal phải có tiêu đề Quay Số');
  });
});
```

- [ ] **Bước 2: Chạy test để xác nhận trạng thái RED (Thất bại do chưa có file)**
Chạy: `node --test tests/quay-so-integration.test.mjs`
Kỳ vọng: FAIL (do chưa có thư mục `quay-so`).

---

### Task 2: Trích Xuất & Tích Hợp Module `quay-so/` (TDD GREEN)

**Tệp tin:**
- Tạo mới: `quay-so/index.html` (sao chép từ `origin/MSB:Final.html`)
- Tạo mới: `quay-so/Final.html`
- Tạo mới: `quay-so/msb-planet-arc-bg.jpg` (từ `origin/MSB:msb-planet-arc-bg.jpg`)
- Tạo mới: `quay-so/QUAYSO.jpg` (từ `origin/MSB:QUAYSO.jpg`)
- Tạo mới: `quay-so/data/data.csv` (từ `origin/MSB:data/data.csv`)

- [ ] **Bước 1: Trích xuất các tệp tin từ nhánh `origin/MSB` vào thư mục `quay-so/`**
Sử dụng git show:
```powershell
New-Item -ItemType Directory -Force -Path "quay-so/data"
git show origin/MSB:Final.html > quay-so/index.html
git show origin/MSB:Final.html > quay-so/Final.html
git show origin/MSB:data/data.csv > quay-so/data/data.csv
```
Trích xuất ảnh nhị phân:
```javascript
const { execSync } = require('child_process');
const fs = require('fs');
fs.writeFileSync('quay-so/msb-planet-arc-bg.jpg', execSync('git show origin/MSB:msb-planet-arc-bg.jpg'));
fs.writeFileSync('quay-so/QUAYSO.jpg', execSync('git show origin/MSB:QUAYSO.jpg'));
```

- [ ] **Bước 2: Xác thực đường dẫn tài nguyên trong `quay-so/index.html`**
Đảm bảo các liên kết `msb-planet-arc-bg.jpg` và `data/data.csv` chạy chuẩn ở môi trường web.

---

### Task 3: Nâng Cấp Cổng Portal Hub (`index.html`)

**Tệp tin:**
- Sửa đổi: `index.html`

- [ ] **Bước 1: Cập nhật CSS grid cho 3 cột trên Portal**
Thêm class `.card-quay-so` với tông màu đỏ cam MSB (`#ef4123` / `#f37021`), gradient ánh kim.
- [ ] **Bước 2: Thêm thẻ điều hướng thứ 3: "Quay Số Trúng Thưởng (MSB Lucky Draw)"**
Liên kết trực tiếp tới `quay-so/index.html`.

---

### Task 4: Chạy Toàn Bộ Kiểm Thử Tự Động (TDD VERIFICATION)

- [ ] **Bước 1: Chạy test bài tích hợp `tests/quay-so-integration.test.mjs`**
Chạy: `node --test tests/quay-so-integration.test.mjs`
Kỳ vọng: 4/4 tests PASS.
- [ ] **Bước 2: Chạy toàn bộ test suite dự án**
Chạy: `node --test tests/*.test.mjs`
Kỳ vọng: 100% tests PASS (không có regression).

---

### Task 5: Tạo Nhánh Git `quay-so` & Cập Nhật GitHub Actions Workflow

**Tệp tin:**
- Sửa đổi: `.github/workflows/deploy.yml`

- [ ] **Bước 1: Tạo nhánh Git `quay-so` từ `origin/MSB` và push lên GitHub**
```powershell
git branch quay-so origin/MSB
git push origin quay-so
```
- [ ] **Bước 2: Cập nhật trigger trong `.github/workflows/deploy.yml`**
Bổ sung nhánh `quay-so` vào khối `on.push.branches`.

---

### Task 6: Commit, Merge và Triển Khai Lên GitHub Pages

- [ ] **Bước 1: Commit các thay đổi trên nhánh `MSB-interactive`**
```powershell
git add .
git commit -m "feat: integrate quay-so module and update portal hub with lucky draw"
git push origin MSB-interactive
```
- [ ] **Bước 2: Merge vào nhánh `gh-pages` và push lên GitHub**
```powershell
git checkout gh-pages
git merge MSB-interactive
git push origin gh-pages
git checkout MSB-interactive
```
- [ ] **Bước 3: Cập nhật tài liệu hỗ trợ (Artifacts: `implementation_plan.md`, `task.md`, `walkthrough.md`)**
