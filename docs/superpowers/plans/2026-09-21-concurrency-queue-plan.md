# Server-Side Async Queue & Concurrency Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triệt tiêu rủi ro xung đột ghi đè (race condition) và mất dữ liệu khi nhiều người bấm đăng ký cùng lúc bằng Async Queue trên Server và Atomic Append vào `data.csv`.

**Architecture:** Sử dụng cơ chế Promise-chain Queue (FIFO Mutex) trên Node.js server (`server.js` và `vite.config.ts`). Cung cấp endpoint `POST /api/submit-registration`. Trình duyệt gửi thông tin đăng ký, server đưa vào hàng đợi, kiểm tra trùng lặp và ghi nối tiếp vào `data.csv`.

**Tech Stack:** Node.js, Express, Vite middlewares, TypeScript, React.

---

### Task 1: Viết test kiểm thử đồng thời (TDD - Red)
**Files:**
- Create: `scripts/test-concurrency.mjs`

- [ ] **Step 1: Viết test script gửi đồng thời 30 request**
  Viết script `scripts/test-concurrency.mjs` gửi đồng thời 30 request đăng ký qua `Promise.all` tới `http://localhost:3000/api/submit-registration`.
- [ ] **Step 2: Chạy test và xác nhận FAIL (do endpoint chưa có hoặc chưa xử lý queue)**
  Chạy: `node scripts/test-concurrency.mjs`
  Kỳ vọng: Test báo lỗi (HTTP 404 hoặc connection failure do endpoint chưa tồn tại).

---

### Task 2: Xây dựng Async Queue & Endpoint `/api/submit-registration` trên Server (TDD - Green)
**Files:**
- Modify: `vite.config.ts`
- Modify: `server.js`

- [ ] **Step 1: Cài đặt Promise-chain Queue trong `vite.config.ts`**
  Thêm queue xử lý tuần tự và handler cho `POST /api/submit-registration`:
  - Parse body: `{ name, phone, nationalId, agency, answer }`
  - Đọc `data/data.csv`
  - Kiểm tra duplicate SĐT / CCCD
  - Tự sinh `newId = maxId + 1`
  - Thêm dòng mới vào `data/data.csv` và `dist/data/data.csv`
  - Trả về `{ success: true, id: newId }`
- [ ] **Step 2: Cài đặt logic tương tự trong `server.js` cho Production**
  Đồng bộ endpoint `/api/submit-registration` vào `server.js`.
- [ ] **Step 3: Chạy test `scripts/test-concurrency.mjs` để xác nhận PASS**
  Chạy: `node scripts/test-concurrency.mjs`
  Kỳ vọng: PASS 100%, 30 request thành công, ID tăng dần liên tục, kiểm tra trùng lặp bị chặn.

---

### Task 3: Cập nhật Client gọi API mới (`services/csvService.ts`)
**Files:**
- Modify: `services/csvService.ts`

- [ ] **Step 1: Cập nhật hàm `addSubmission` trong `services/csvService.ts`**
  Gửi trực tiếp `POST /api/submit-registration` với payload `{ name, phone, nationalId, agency, answer }`.
  Nếu thành công, trả về `newId`. Nếu server báo trùng hoặc lỗi, reject với thông báo từ server.
- [ ] **Step 2: Kiểm tra tương thích với `RegistrationForm.tsx`**

---

### Task 4: Chạy toàn diện bộ kiểm thử & Build Production
**Files:**
- Run: `node scripts/test-concurrency.mjs`
- Run: `node scripts/e2e-test.mjs`
- Run: `npm run build`

- [ ] **Step 1: Chạy test concurrency**
- [ ] **Step 2: Chạy test E2E**
- [ ] **Step 3: Build production**
