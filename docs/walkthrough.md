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

### 7. Admin Pages UX Improvements
- **Pinned table action column**: Removed the forced `min-width: 1141px` and `overflow: hidden` on `.table-2 table` in [style.css](public/admin/assets/css/style.css), moved outer frame styling to `.table-2`, and pinned `th:last-child:not([colspan]), td:last-child:not([colspan])` (`Hành động`) to the right edge (`position: sticky; right: 0;`) so edit/delete/undo buttons remain visible without horizontal scrolling.
- **Redesigned filter bar & clarified defaults**: Updated `.section-4` in [style.css](public/admin/assets/css/style.css) and admin list views (`tour-list`, `category-list`, `user-list`, `order-list`, `contact-list`, `setting-account-admin-list`) with explicit field labels, `-- Tất cả ... --` default `<option>` text, `Từ` / `Đến` sub-labels around `136px` date inputs, and a separated `Xóa bộ lọc` button. Wired status and date-range filtering into [order.controller.js](controllers/admin/order.controller.js), [contact.controller.js](controllers/admin/contact.controller.js), and [setting.controller.js](controllers/admin/setting.controller.js) using [filter.helper.js](helpers/filter.helper.js).
- **Improved table spacing & readability**: Increased `.table-2` cell padding (`14px 16px`), set `vertical-align: middle`, added vertical rhythm between stacked lines, `gap: 10px` on order `.inner-list` items, and `white-space: nowrap` on badges and numeric/date lines.
- **Natural table pagination**: Created [pagination.helper.js](helpers/pagination.helper.js) and [pagination.pug](views/admin/mixins/pagination.pug) (`Trước`, numeric page-jump input `/ totalPages`, `Sau`), updated [script.js](public/admin/assets/js/script.js) to handle prev/next/page-input navigation and reset `page` on filter/search changes, and replaced static `.section-7` pagination across all 8 paginated admin table views.

### 8. Admin Page Navigation Performance Fixes
- **Eliminated sequential N+1 database queries**:
  - [tour.controller.js](controllers/admin/tour.controller.js): Parallelized `Tour.find`, `AccountAdmin.find`, and `Category.find` via `Promise.all` and mapped `createdBy`/`updatedBy` names in memory (dropping warm `tour.list` controller time from `2,321 ms` to `270 ms`); batched `deletedBy` lookups via `$in` in `trash` (`408 ms` $\rightarrow$ `307 ms`).
  - [category.controller.js](controllers/admin/category.controller.js): Parallelized `Category.find` and `AccountAdmin.find` via `Promise.all` with in-memory `Map` lookup (`838 ms` $\rightarrow$ `204 ms`).
  - [order.controller.js](controllers/admin/order.controller.js): Batched item `Tour` lookups using `$in` and `.lean()`, and moved order-level formatting outside the inner item loop (`1,416 ms` $\rightarrow$ `308 ms`).
  - [setting.controller.js](controllers/admin/setting.controller.js): Batched `Role` lookups in `accountAdminList` using `$in` and `.lean()` (`903 ms` $\rightarrow$ `322 ms`).
  - [auth.middleware.js](middlewares/admin/auth.middleware.js): Added `.select(...).lean()` and null-safe `roleDetail` handling in `verifyToken`.
- **Removed render-blocking scripts**: Added `defer` to TinyMCE and vendor CDN scripts in [layout-default.pug](views/admin/layouts/layout-default.pug), and guarded `initTinyMce()` in [tinymce-config.js](public/admin/assets/js/tinymce-config.js) so TinyMCE only initializes on pages containing `[textarea-mce]`.

### 9. Admin Bulk-Action Toolbar & Checkbox Cleanup
- **Dedicated bulk-action bar**: Created [bulk-action.pug](views/admin/mixins/bulk-action.pug) and styled `.section-bulk-action` in [style.css](public/admin/assets/css/style.css) right above the table with a `Thao tác hàng loạt:` label, live selection counter (`Đã chọn N mục`), `-- Chọn hành động --` default option, and a primary `Áp dụng` button that highlights in `--color-blue-wash` when rows are checked.
- **Live state & validation**: Updated `[change-multi]` in [script.js](public/admin/assets/js/script.js) to disable `Áp dụng` when zero items are checked, update `[bulk-selected-count]` live on checkbox changes, and prompt when clicked without selecting an action.
- **Removed `check-all` & dead placeholders**: Removed `check-all` checkboxes across `tour-list`, `tour-trash`, `category-list`, `user-list`, and `user-trash`, and removed unwired static `.inner-change-status` bars and non-functional checkboxes from `contact-list`, `setting-account-admin-list`, and `setting-role-list`.

### 10. Admin Table Column Spacing & Alignment
- **User & Admin Account tables ([user-list.pug](views/admin/pages/user-list.pug), [user-trash.pug](views/admin/pages/user-trash.pug), [setting-account-admin-list.pug](views/admin/pages/setting-account-admin-list.pug))**: Added `.inner-col-name` (`min-width: 160px; font-weight: 600;`), `.inner-col-email` (`min-width: 190px; word-break: break-word;`), `.inner-col-address` (`min-width: 180px; max-width: 280px;`), `.inner-nowrap` on phone/role/position cells, and centered `Ảnh đại diện` headers and avatars in [style.css](public/admin/assets/css/style.css).
- **Tour, Category, Order, Contact & Role tables**: Set `.inner-col-title` (`min-width: 220px; max-width: 320px; font-weight: 600;`) on `tour-list`, `tour-trash`, `category-list`, and `setting-role-list`; capped `.inner-info`, widened `.inner-list` (`min-width: 260px`), added `flex-shrink: 0` on `.inner-item .inner-image`, and centered `Trạng thái` on `order-list`; applied `.inner-col-email` and `.inner-nowrap` on `contact-list`.

### 11. Admin Filter Bar Multi-Row Layout & Clean Default Labels
- **Intentional filter wrapping**: Updated `.section-4 .inner-wrap` in [style.css](public/admin/assets/css/style.css) so `.inner-label` spans the top as a full-width header with a bottom divider and select filter items flex evenly (`flex: 1 1 175px; min-width: 155px; max-width: 260px;`) across wrapped rows.
- **Clean default option labels**: Removed `--` markers from default `<option>` labels in [bulk-action.pug](views/admin/mixins/bulk-action.pug) (`Chọn hành động`) and across admin filter views (`Tất cả trạng thái`, `Tất cả người tạo`, `Tất cả danh mục`, `Tất cả mức giá`, `Tất cả nhóm quyền`, `Tất cả PTTT`, `Tất cả thanh toán`).

### 12. User View Navbar Category Tour Seeding
- **Populated empty & sparse navbar categories in MongoDB**: Seeded 15 active tours with schedules, pricing, stock, locations, and Cloudinary images so every active navbar link on the client site has tours:
  - **Tour xuyên Việt** (`/category/tour-xuyen-viet`): `0` $\rightarrow$ **4 active tours**
  - **Tour Châu Mỹ** (`/category/tour-chau-my`): `0` $\rightarrow$ **4 active tours**
  - **Châu Phi** (`/category/chau-phi`): `0` $\rightarrow$ **4 active tours**
  - **Tour Châu Âu** (`/category/tour-chau-au`): `1` $\rightarrow$ **4 active tours**
- **Verified**: Confirmed `controllers/client/category.controller.js` (`list`) returns `4` tours in `tourListSection9` for each of those slugs, bringing active tour totals to **52** under `Tour trong nước` and **18** under `Tour nước ngoài`.

### 13. Client Category Filter & Dynamic Pagination
- **Polished filter sidebar & default labels**: Updated `.box-filter` in [style.css](public/assets/css/style.css) with clean `#E2E8F0` border, `14px` radius, soft elevation, bottom header divider, `40px` `#F8FAFC` inputs with focus rings, and removed `--` markers from default options in [tour-list.pug](views/client/pages/tour-list.pug) (`Tất cả điểm đi`, `Tất cả điểm đến`, `Tất cả khoảng giá`).
- **Dynamic pagination & Prev/Next labels**: Wired `PaginationHelper.buildPagination` (9 tours/page) into [category.controller.js](controllers/client/category.controller.js), replaced hardcoded `1 2 3 4` buttons in [tour-list.pug](views/client/pages/tour-list.pug) with dynamic `1..totalPages` rendering, added `Trang trước` / `Trang sau` text with greyed-out `:disabled` styling in [style.css](public/assets/css/style.css), and wired `[client-pagination]` URL navigation in [script.js](public/assets/js/script.js).

### 14. Landing Page Hero & AI Search UX
- **Elevated hero & AI prompt composer**: Added a light gradient scrim over `.section-1` in [style.css](public/assets/css/style.css), added a top hero badge (`Trợ lý tìm kiếm tour thông minh`) and fixed `AI-Assisted` title casing in [home.pug](views/client/pages/home.pug), redesigned `.ai-search-box` as an elevated frosted card (`20px` radius, focus-within glow, `#F8FAFC` prompt input, gradient `Tìm tour ngay` button), and added quick clickable prompt chips (`[ai-quick-prompt]`).
- **Enter-to-submit keyboard UX**: Added a `keydown` handler on `#ai-tour-request` in [script.js](public/assets/js/script.js) so pressing `Enter` (without `Shift` or active IME composition) submits the AI search form, while `Shift+Enter` inserts a newline.

### 15. AI Search Results Page Redesign
- **Original prompt continuity**: Updated [ai-search.controller.js](controllers/client/ai-search.controller.js) to pass the trimmed user `prompt` in `searchUrl`, and updated [search.controller.js](controllers/client/search.controller.js) (`list`) to expose `isAiSearch`, `aiPrompt`, and `pageTitle: 'Gợi ý tour từ AI'`.
- **Per-tour AI relevance badges**: Added `scoreAndRankTours` and `resolveAiMatchMeta` in [search.controller.js](controllers/client/search.controller.js) to label each AI-ranked tour (`Phù hợp nhất`, `Khớp thời lượng`, `Khớp ngân sách`, `Đúng điểm đến`, `Gợi ý gần nhất`) and conditionally render `.inner-ai-badge` in [product-item.pug](views/client/mixins/product-item.pug) without altering standard category/homepage cards.
- **AI spotlight hero, inline refine & rich empty state**: Redesigned [search.pug](views/client/pages/search.pug) and [style.css](public/assets/css/style.css) with `.ai-results-hero` (eyebrow badge, result count card `.ai-results-count-card`, echoed prompt + extracted criteria chips in `.ai-understanding-card`, and inline `#ai-search-form` refine composer with `Enter`-to-submit and quick-retry chips), `.ai-results-grid` card elevation, and `.search-empty-card` with quick AI retry buttons (wired via `document.querySelectorAll("[ai-quick-prompt]")` in [script.js](public/assets/js/script.js)).

### 16. AI Status Indicator, 12s Timeout & Error Message Parity
- **Prominent status banner & spinner**: Wrapped `[ai-tour-message]` inside `.ai-tour-status` with an animated `.ai-tour-spinner` (`@keyframes ai-spin`) in [home.pug](views/client/pages/home.pug) and [search.pug](views/client/pages/search.pug), and added `setAiStatus(state, message)` in [script.js](public/assets/js/script.js) to apply colored state styling in [style.css](public/assets/css/style.css) (`.is-loading` violet, `.is-success` emerald, `.is-warning` amber, `.is-error` crimson) with a `4px` left accent border.
- **12s Gemini timeout & backend error parity**: Increased `requestConfig.timeout` from `8000` to `12000` in [gemini.helper.js](helpers/gemini.helper.js), covered `ERR_CANCELED` in [ai-search.controller.js](controllers/client/ai-search.controller.js), and updated `fetch("/search/ai")` error handling in [script.js](public/assets/js/script.js) with a `15000`ms `AbortController` safeguard and direct JSON error parsing so backend timeout (`504`) and rate-limit (`429`/`503`) messages surface accurately in the UI.

### 17. Client Cart & Checkout Page Redesign
- **Cart header, empty state & item cards**: Updated `.section-11` in [cart.pug](views/client/pages/cart.pug), [script.js](public/assets/js/script.js), and [style.css](public/assets/css/style.css) with a shopping-bag icon badge, live `[cart-count-label]` tour counter pill, working `Tiếp tục xem tour` link (`/category/tour-trong-nuoc`), `.cart-empty-state` when empty, bordered `.inner-tour-item` cards with `.is-checked` highlighting, rounded `.inner-delete` buttons, `#F8FAFC` passenger quantity panels, and a grouped `.cart-summary-card` containing `#coupon-form` and itemized totals.
- **Checkout form & payment cards**: Upgraded `.section-12` in [cart.pug](views/client/pages/cart.pug) and [style.css](public/assets/css/style.css) with section headers/subtitles, `#F8FAFC` inputs with focus rings, 2-column selectable payment method cards (`:has(input:checked)`), indigo-tinted `.inner-info-bank` details, and a gradient `Đặt Tour Ngay` submit button.

### 18. User Navigation Bar & Compact Top Contact Bar
- **Slimmer top address/contact bar**: Reduced `.top-header` height (`padding: 5px 0`), font size (`12px`), icon size (`12px`), and item gap (`24px`) with a subtle gradient background in [style.css](public/assets/css/style.css).
- **Sticky, polished navigation bar**: Updated `.header` in [style.css](public/assets/css/style.css) with sticky positioning, translucent backdrop blur, crisp bottom border/shadow, pill-styled nav links (`#F5F3FF` hover/active highlight), rotating caret icons, floating rounded dropdown menus (`14px` radius, `box-shadow`, `::before` hover bridge), and clean mobile drawer resets.
- **Dynamic active nav state**: Added URL path matching in [script.js](public/assets/js/script.js) so `.header .inner-menu a.active` reflects the active route rather than keeping `"Trang chủ"` permanently highlighted.

### 19. Client Page Navigation Performance Fixes
- **Parallel & cached client middlewares**: Added 30-second `.lean()` in-memory caches to [setting.middleware.js](middlewares/client/setting.middleware.js) and [category.middleware.js](middlewares/client/category.middleware.js) (also exposing `res.locals.categoryList`), added `.lean()` to [auth.middleware.js](middlewares/client/auth.middleware.js) (`optionalCustomer`), and parallelized all three middlewares via `Promise.all` in [routes/client/index.route.js](routes/client/index.route.js) (`421 ms` $\rightarrow$ **`0 ms`** warm).
- **Eliminated sequential controller queries**: Updated [home.controller.js](controllers/client/home.controller.js) to reuse `res.locals.websiteInfo`/`res.locals.categoryList` and parallelize all 3 `Tour.find(...).lean()` queries (`671 ms` $\rightarrow$ **`173 ms`**). Updated [category.controller.js](controllers/client/category.controller.js) to resolve category/parent/descendants in memory (`collectDescendantIds`) and parallelize `Tour.countDocuments`, `Tour.find(...).lean()`, and `City.find({}).lean()` (`765 ms` $\rightarrow$ **`157 ms`**).
- **Non-blocking scripts**: Added `defer` to all 5 `<script>` tags in [default.pug](views/client/layouts/default.pug).
