# TODO — Refactor Landing Page & Auth Flow (AI Study Hub)

> Tài liệu này tổng hợp feedback của khách và mô tả chi tiết các tính năng cần build/sửa.
> Mỗi mục đều có checklist `- [ ]` để theo dõi tiến độ khi làm cùng GitHub Copilot.

---

## Bối cảnh

Khách hàng (guest) phản hồi 3 việc cần làm:

1. Sửa trang landing page.
2. Sửa UI trang login/register — trang register có nút "quay lại" không hoạt động.
3. Sửa trang quên mật khẩu.

Thiết kế tham khảo cho login/register là layout dạng **split-screen 2 cột** (form bên trái, banner thương hiệu + illustration bên phải) — đây chỉ là tham khảo về **bố cục và cảm giác chuyên nghiệp**, không cần giữ đúng màu sắc/brand trong ảnh. Cần áp theme màu của AI Study Hub (xanh dương `#2563EB` hoặc tương đương đang dùng ở trang quên mật khẩu hiện tại).

Trang quên mật khẩu hiện tại (light theme, card đơn giản, có nút "Quay lại", tiêu đề "Forgot password", input email, nút "Send reset link", link "Sign in") sẽ dùng làm baseline để nâng cấp.

---

## 1. Landing Page — Refactor

### Hiện trạng

Chưa có ý tưởng chi tiết, cần đề xuất cấu trúc mới.

### Đề xuất cấu trúc (ý tưởng cho Copilot tham khảo, có thể điều chỉnh)

1. **Header/Nav** — Logo, menu (Features, Pricing, Blog), nút "Đăng nhập" + CTA nổi bật "Bắt đầu miễn phí".
2. **Hero section** — Tagline ngắn nêu giá trị cốt lõi (VD: học tập hiệu quả hơn với AI), 1 câu mô tả, 2 CTA (Primary: Get Started, Secondary: Watch demo), hình minh họa/screenshot sản phẩm bên cạnh hoặc phía dưới.
3. **Social proof** — Logo trường/tổ chức đối tác, hoặc số liệu (VD: "10,000+ sinh viên đang sử dụng").
4. **Features section** — 3–4 khối tính năng chính (flashcard AI, tạo quiz tự động, tóm tắt tài liệu, lộ trình học cá nhân hoá...), mỗi khối có icon + tiêu đề + mô tả ngắn.
5. **How it works** — 3 bước đơn giản (Upload tài liệu → AI phân tích → Nhận bộ câu hỏi/flashcard).
6. **Testimonials** — Vài đánh giá từ người dùng (carousel hoặc grid).
7. **Pricing teaser** — So sánh Free vs Pro, nút "Xem chi tiết bảng giá".
8. **FAQ** — Accordion 4–6 câu hỏi thường gặp.
9. **Final CTA banner** — Kêu gọi đăng ký, nổi bật, full-width.
10. **Footer** — Link sản phẩm, công ty, liên hệ, social, legal.

### Checklist

- [ ] Thiết kế lại wireframe landing page theo cấu trúc trên (hoặc cấu trúc được duyệt)
- [ ] Đảm bảo responsive (mobile-first)
- [ ] Tối ưu tốc độ tải (lazy-load ảnh, nén asset)
- [ ] Đồng bộ theme màu/font với toàn site (đặc biệt là trang login/register/forgot password sau khi refactor)
- [ ] Thêm CTA rõ ràng, nhất quán dẫn về `/register`
- [ ] SEO cơ bản: title, meta description, heading hierarchy đúng chuẩn

---

## 2. Trang Login & Register (Full Page — KHÔNG dùng modal/pop-up)

### Yêu cầu chung

- Build thành **route/page riêng biệt**: `/login` và `/register`, không phải modal hay overlay popup.
- Layout tham khảo theo ảnh đính kèm: **2 cột**
  - Cột trái: form (logo app, tiêu đề "Sign Up"/"Sign In", các input field, nút submit, link chuyển qua trang còn lại)
  - Cột phải: panel thương hiệu — tiêu đề chào mừng, mô tả ngắn, illustration, nút CTA phụ (VD ở trang Register, cột phải có nút "Sign In" để chuyển sang trang login và ngược lại)
- Form Register cần các field tối thiểu: Họ tên/Username, Email, Password (+ confirm nếu cần), checkbox đồng ý điều khoản.
- Form Login cần: Email, Password, checkbox "Remember me", link "Quên mật khẩu?".
- Có thể giữ captcha "Click to verify" như ảnh tham khảo nếu hệ thống đang có/yêu cầu chống spam.

### Bug cần fix (ưu tiên cao)

- [ ] **Trang Register: nút "Quay lại" (back) không hoạt động** — kiểm tra lại event handler / router navigation, đảm bảo bấm vào quay lại đúng trang trước đó (landing hoặc login) mà không bị lỗi JS hoặc href sai.

### Checklist

- [ x] Tạo page `/login` theo layout 2 cột, full page
- [ x] Tạo page `/register` theo layout 2 cột, full page
- [ x] Fix nút "Quay lại" ở trang Register
- [ x] Thêm validate form (email hợp lệ, password tối thiểu ký tự, confirm password khớp...)
- [ x] Hiển thị lỗi rõ ràng dưới từng field khi validate fail
- [ x] Responsive cho mobile (ở mobile có thể ẩn cột phải minh hoạ hoặc thu nhỏ thành banner trên cùng)
- [ x] Link qua lại giữa Login ↔ Register hoạt động đúng (không reload toàn trang nếu dùng SPA router)
- [ x] Đồng bộ theme màu với landing page mới
- [ x] Thêm trạng thái loading khi submit + thông báo thành công/thất bại

---

## 3. Trang Quên Mật Khẩu (Forgot Password)

### Hiện trạng

Trang hiện tại: card đơn giản giữa màn hình, light theme, có nút "Quay lại", tiêu đề "Forgot password", mô tả ngắn, 1 input Email, nút "Send reset link", link "Remembered your password? Sign in". Layout còn khá rời rạc, chưa đồng bộ với hướng thiết kế mới của login/register.

### Đề xuất cải tiến

1. Đồng bộ layout với trang Login/Register — dùng cùng khung 2 cột (form trái + illustration/brand phải) để trải nghiệm liền mạch khi người dùng chuyển qua các trang auth.
2. Thêm **trạng thái sau khi gửi thành công**: ẩn form, hiện thông báo "Đã gửi link đặt lại mật khẩu tới email của bạn, vui lòng kiểm tra hộp thư" + icon check, kèm nút "Gửi lại" với cơ chế cooldown (VD 60 giây) để tránh spam.
3. Thêm xử lý lỗi rõ ràng: email không tồn tại / email không hợp lệ / lỗi server.
4. Trang đặt lại mật khẩu mới (sau khi click link trong email) nên cùng style: nhập password mới + confirm, validate độ mạnh password.
5. Giữ nút "Quay lại" nhưng đảm bảo nó dẫn đúng về trang Login (không lỗi như bug ở Register).

### Checklist

- [ ] Refactor layout trang Forgot Password đồng bộ với Login/Register
- [ ] Thêm trạng thái "đã gửi email thành công" với cooldown resend
- [ ] Thêm xử lý & hiển thị lỗi (email không tồn tại, lỗi mạng...)
- [ ] Build/refactor trang "Reset Password" (nhập mật khẩu mới) đồng bộ style
- [ ] Đảm bảo nút "Quay lại" hoạt động đúng, không bug như trang Register
- [ ] Responsive mobile

---

## Ghi chú kỹ thuật chung (áp dụng cho cả 3 phần trên)

- Tái sử dụng component dùng chung (Button, Input, AuthLayout 2 cột...) để tránh lặp code giữa Login/Register/Forgot Password.
- Thống nhất design tokens: màu chính, font, spacing, border-radius giữa landing page và auth pages.
- Đảm bảo accessibility: label cho input, contrast màu đủ chuẩn, focus state rõ ràng, hỗ trợ điều hướng bằng bàn phím.
- Viết test cơ bản (unit/E2E) cho luồng: đăng ký, đăng nhập, quên mật khẩu, đặc biệt test lại nút back ở Register để tránh regression.
