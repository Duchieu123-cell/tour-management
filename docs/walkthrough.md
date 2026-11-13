# Project Review & Demo Polish Walkthrough

## Summary of Changes

All five areas identified from the Team Lead's feedback and our codebase/database audit have been implemented and verified on the `review` branch:

---

### 1. Admin User Management (`/admin/user/*`)
- **Integrated Full User CRUD, Trash & Sorting**:
  - Updated [user.controller.js](file:///Users/qcl/personal/projects/tour-management/controllers/admin/user.controller.js), [user.route.js](file:///Users/qcl/personal/projects/tour-management/routes/admin/user.route.js), and [user.validate.js](file:///Users/qcl/personal/projects/tour-management/validates/admin/user.validate.js) with filtering (status, date range), keyword search (name, email, phone), sortable columns (`createdAt` and `deletedAt`), modal-based Create/Edit with avatar upload, quick status toggle, bulk actions, soft-delete trash, restore, and permanent delete.
  - Added [user-list.pug](file:///Users/qcl/personal/projects/tour-management/views/admin/pages/user-list.pug), [user-trash.pug](file:///Users/qcl/personal/projects/tour-management/views/admin/pages/user-trash.pug), [user-modals.pug](file:///Users/qcl/personal/projects/tour-management/views/admin/partials/user-modals.pug), [user.js](file:///Users/qcl/personal/projects/tour-management/public/admin/assets/js/user.js), and modal/sort styles in [style.css](file:///Users/qcl/personal/projects/tour-management/public/admin/assets/css/style.css).
- **Fixed Permanent Delete & RBAC**:
  - Registered both `PATCH` and `DELETE` on `/admin/user/destroy/:id` in [user.route.js](file:///Users/qcl/personal/projects/tour-management/routes/admin/user.route.js#L36-L37) so `script.js`'s `[button-delete]` handler works seamlessly in `/admin/user/trash`.
  - Added `user-view`, `user-create`, `user-edit`, `user-delete`, and `user-trash` permissions in [permission.js](file:///Users/qcl/personal/projects/tour-management/config/permission.js#L42-L60) and assigned them to the `"Quản trị viên"` role.

---

### 2. Admin Tour Management & Client Tour Cards
- **Merged & Polished `/admin/tour/list` and `/admin/tour/trash`**:
  - Applied category subtree filtering (`filter-category`), effective adult price range filtering (`filter-price`), filter reset (`filter-reset`), table header fix (`Tên danh mục` $\rightarrow$ `Tên tour`), and RBAC checks in [tour.controller.js](file:///Users/qcl/personal/projects/tour-management/controllers/admin/tour.controller.js), [tour-list.pug](file:///Users/qcl/personal/projects/tour-management/views/admin/pages/tour-list.pug), and [script.js](file:///Users/qcl/personal/projects/tour-management/public/admin/assets/js/script.js).
  - Increased `/admin/tour/list` page size from `3` to `10` items per page.
  - Fixed `/admin/tour/trash` ([tour-trash.pug](file:///Users/qcl/personal/projects/tour-management/views/admin/pages/tour-trash.pug)) by replacing the hardcoded `"Hiển thị 1 - 9 của 78"` pagination with dynamic pagination, wiring the keyword search input, and adding a *"Quay lại danh sách"* button.
  - Fixed null-safety on city lookup and the `/order/list` redirect typo in [order.controller.js](file:///Users/qcl/personal/projects/tour-management/controllers/admin/order.controller.js#L98-L111).
- **Fixed Client Tour Card Discount Badge**:
  - Updated [product-item.pug](file:///Users/qcl/personal/projects/tour-management/views/client/mixins/product-item.pug) to compute the discount percentage fallback directly in the mixin and only render `.inner-discount` when `computedDiscount > 0`, eliminating the broken `Giảm -%` badge across the homepage ("Tour trong nước" & "Tour nước ngoài") and category pages.

---

### 3. AI Tour Search Speed Optimization (`/search/ai`)
- Updated [gemini.helper.js](file:///Users/qcl/personal/projects/tour-management/helpers/gemini.helper.js):
  - **Deterministic Fast-Path Vietnamese Parser (`< 5ms`)**: Extracts destination, duration (`N ngày M đêm` / `NNMĐ`), and budget ranges (`X - Y triệu`, `dưới X triệu`, `trên X triệu`, `khoảng X triệu`) locally for unambiguous single-sentence Vietnamese tour queries without waiting on network I/O.
  - **In-Memory LRU Cache (`< 1ms`)**: Caches up to 200 normalized queries for 30 minutes.
  - **Low-Latency Gemini Fallback**: Uses a persistent `https.Agent({ keepAlive: true })`, `thinkingConfig: { thinkingBudget: 0 }` (with automatic fallback), and `maxOutputTokens: 150` for complex queries.

---

### 4. Client Top Header Redesign
- Updated [header.pug](file:///Users/qcl/personal/projects/tour-management/views/client/partials/header.pug), [style.css](file:///Users/qcl/personal/projects/tour-management/public/assets/css/style.css#L192-L406), and [script.js](file:///Users/qcl/personal/projects/tour-management/public/assets/js/script.js#L29-L49):
  - Grouped the Cart button (`.inner-cart`) and User Account (`.header-account`) inside a single right-aligned `.header-actions` container so they no longer float apart in `justify-content: space-between`.
  - Styled `.header-cart-btn` as a matching pill button with icon, label, and counter badge.
  - Replaced the bulky inline logout button inside the user pill with an interactive `.header-account-dropdown` menu containing **Hồ sơ cá nhân** (`/account/profile`), **Đơn đặt tour của tôi** (`/account/orders`), and **Đăng xuất** (`POST /account/logout`).
  - Replaced the two `Lorem ipsum` placeholder descriptions in [home.pug](file:///Users/qcl/personal/projects/tour-management/views/client/pages/home.pug) with natural Vietnamese copy.

---

### 5. Database Cleanup & Demo Data Seeding
- Created and executed [seed-demo-polish.js](file:///Users/qcl/personal/projects/tour-management/scripts/seed-demo-polish.js):
  - Removed all **44 dummy `"Tour mẫu XX"`** records and the test category `'Mới'`.
  - Re-categorized domestic Vietnamese tours that were previously misassigned to *Tour Châu Á*, and seeded **8 authentic international tours** (*Thái Lan*, *Singapore - Malaysia*, *Hàn Quốc*, *Nhật Bản*, *Bali*, *Đài Loan*, *Châu Âu*, *Châu Úc*) so the homepage **"Tour nước ngoài"** section displays genuine international tours.
  - Normalized all tour prices to clean 100,000 VND increments, rotated 18 high-resolution travel photos across tours, set upcoming `departureDate`s, and fixed all `createdBy`/`updatedBy` admin references so `/admin/tour/list` has zero blank creator names.
  - Updated `SettingWebsiteInfo` to `SmartTour` with an active future Flash Sale countdown (`2026-12-31T23:59`).
  - Polished customer profiles (replacing `user1`..`user4`, `testuser`, `djdskjdkjskd` with realistic Vietnamese names, phones, and addresses) and seeded October/November 2026 comparison data so every stat card and chart on `/admin/dashboard` displays live metrics and percentage comparisons.

---

## Verification Results

| Check | Result | Details |
| :--- | :--- | :--- |
| **AI Search Latency** | **Passed** | `"Tôi muốn tour du lịch đi Nha Trang, 3 ngày 2 đêm, giá 5 - 10 triệu."` $\rightarrow$ **3.95ms**<br>`"Tìm tour Đà Lạt 2 ngày 1 đêm, giá dưới 5 triệu."` $\rightarrow$ **4.15ms**<br>`"Đi Phú Quốc 4N3Đ khoảng 8 triệu"` $\rightarrow$ **0.97ms** |
| **Admin Tour List & Trash** | **Passed** | `tourController.list` (10 items/page, 56 active tours, 0 `"Tour mẫu"`, all creator names populated) and `tourController.trash` (2 trash tours, dynamic pagination) rendered cleanly. |
| **Admin User List & Trash** | **Passed** | `userController.list` (9 active customers with full Vietnamese profiles) and `userController.trash` (3 soft-deleted customers) rendered cleanly with modals and sorting. |
| **Client Homepage & Header** | **Passed** | `home.pug` rendered cleanly (`32,415` bytes), zero `Giảm -%` badges, domestic vs. international sections accurately separated, `.header-actions` and `.header-account-dropdown` verified. |
| **Admin Dashboard** | **Passed** | All 4 stat cards (`Doanh thu`, `Đơn đặt`, `Chưa thanh toán`, `Khách hàng mới`) and cumulative revenue chart populated with Oct vs. Nov 2026 comparison metrics. |

---

## Additional Fixes

### 6. Client Tour Detail Page (`/tour/detail/:slug`)
- **Fixed blank space in "Thông tin tour" block**: In [style.css](public/assets/css/style.css) `.box-tour-info .inner-content` used a fixed `height: 500px`, leaving blank space for short content until "Xem tất cả" was clicked. It now uses `max-height: 500px`, so short content fits its natural height.
- **Smart collapse in [script.js](public/assets/js/script.js)**: the block is only collapsed when content exceeds 500px. Otherwise a `no-collapse` class is applied and the "Xem tất cả" button is hidden. The check re-runs on window `load` and as images finish loading.
- **Reordered blocks in [tour-detail.pug](views/client/pages/tour-detail.pug)**: "Thông tin tour" now sits below the timeline (`box-tour-schedule`) block.
