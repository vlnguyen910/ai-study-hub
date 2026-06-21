# AcademiShare/AI Study Hub — Fix chữ label/placeholder bị mờ khi bật Dark Mode

> Đưa file này cho AI coding agent (Claude Code, Codex, Cursor...) đọc trực
> tiếp trên repo và áp dụng thay đổi. Agent cần tự đọc code thực tế trong
> repo trước khi sửa — không giả định cấu trúc file cụ thể.

## Bối cảnh & triệu chứng

Trang đăng ký/đăng nhập dùng shadcn/ui + Tailwind CSS. Khi bật Dark Mode
toggle trong app:

- Phần nền card chứa form (vùng chứa các input "Họ tên/Username", "Email",
  "Password"...) **vẫn hiển thị nền trắng/sáng**, không đổi sang nền tối như
  mong đợi.
- Trong khi đó, chữ label (vd. "Họ tên/Username", "Email", "Password") và
  placeholder text trong các ô input **lại đổi sang tông màu sáng/nhạt**
  (màu dành cho hiển thị trên nền tối).
- Kết quả: chữ sáng nằm trên nền sáng → gần như không đọc được, "mờ đi".
- Checkbox "Tôi đồng ý với Điều khoản sử dụng" cũng bị ảnh hưởng tương tự —
  text cạnh checkbox mờ đi.

**Đây không phải lỗi thiếu CSS biến dark mode nói chung** — vì phần text
ĐÃ đổi đúng theo dark mode. Vấn đề là **phần nền (background) của card/form
không đổi theo cùng cơ chế đó**, gây lệch pha giữa 2 lớp.

## Yêu cầu xử lý

### Bước 1 — Xác định nguyên nhân thật trong code (bắt buộc làm trước khi sửa)

Đọc các file sau trong repo để xác định chính xác:

1. File khai báo theme tokens — thường là `src/index.css`, `src/app/globals.css`,
   hoặc `src/styles/globals.css` — tìm khối `:root { --background: ...; }`
   và `.dark { --background: ...; }` (hoặc cú pháp tương đương theo phiên
   bản shadcn đang dùng — bản mới dùng `@theme` trực tiếp trong CSS thay vì
   tailwind.config). Xác nhận:
   - `--background`/`--card` có được khai báo riêng cho `.dark` không, và
     giá trị đó có thực sự là màu tối hay vẫn đang là màu sáng/để trống
     (kế thừa nhầm từ `:root`)?

2. File component chứa card/form đăng ký, đăng nhập (tìm bằng
   `grep -rl "Tạo tài khoản mới\|Chào mừng trở lại" src/`). Kiểm tra xem
   phần tử bọc ngoài form (card/div chính) đang dùng class nào cho nền:
   - Nếu dùng `bg-white`, `bg-gray-50`, hoặc bất kỳ class Tailwind màu
     **cố định** (không phải token shadcn như `bg-card`/`bg-background`) —
     đây chính là nguyên nhân. Class màu cố định không tự đổi theo `.dark`.
   - Nếu đang dùng inline style hoặc class tự định nghĩa ngoài hệ thống
     shadcn (vd. CSS module riêng, styled-component có giá trị hex cứng) —
     cùng vấn đề.

3. Kiểm tra cách dark mode được toggle trong app (tìm
   `grep -rl "useTheme\|next-themes\|ThemeProvider\|classList.add(.dark.)" src/`):
   - Xác nhận class `dark` có thực sự được thêm vào đúng phần tử gốc
     (`<html>` hoặc `<body>`) khi toggle, hay chỉ thêm vào 1 phần tử con cụ
     thể nào đó (nếu chỉ thêm vào 1 vùng nhỏ, các CSS variable kế thừa theo
     cascade có thể không áp dụng đúng cho phần tử card nằm ngoài vùng đó).

### Bước 2 — Sửa đúng theo nguyên nhân tìm được

**Trường hợp A (khả năng cao nhất): card đang dùng màu nền cố định thay vì
token shadcn**

Thay mọi class nền cố định (`bg-white`, `bg-gray-50`, `bg-slate-50`...) trên
card/container bọc form bằng đúng token shadcn tương ứng:

```tsx
// SAI — không tự đổi theo dark mode
<div className="bg-white rounded-2xl shadow-xl ...">

// ĐÚNG — tự đổi theo dark mode vì bg-card map tới CSS variable --card
<div className="bg-card rounded-2xl shadow-xl ...">
```

Áp dụng tương tự cho mọi màu khác đang bị hardcode trong cùng component
(border, text màu phụ...):

- `border-gray-200` → `border-border`
- `text-gray-500`/`text-gray-400` (cho phần mô tả phụ, không phải label
  chính) → `text-muted-foreground`
- `text-gray-900`/`text-black` (cho text chính) → `text-foreground`

**Trường hợp B: `--background`/`--card` trong `.dark` bị khai báo sai giá
trị (vô tình trùng với giá trị light mode, hoặc bị bỏ trống)**

Mở file theme CSS, kiểm tra khối `.dark { ... }` có đầy đủ override cho
toàn bộ token liên quan không (tối thiểu phải có, giá trị ví dụ — điều
chỉnh theo bảng màu thật của project, không copy nguyên giá trị mẫu nếu
project đã có giá trị khác):

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(1 0 0 / 10%);
  /* ... các token còn lại giữ nguyên theo bản gốc project đã có */
}
```

Nếu `--card` đang thiếu hẳn trong khối `.dark` (chỉ khai báo `--background`)
— đây là nguyên nhân trực tiếp, vì component card thường dùng riêng
`bg-card` (khác `bg-background`) để tạo độ tương phản nhẹ giữa nền trang và
nền card. Bổ sung `--card` vào `.dark` nếu thiếu.

**Trường hợp C: class `dark` không được set đúng phần tử gốc**

Nếu phát hiện class `dark` chỉ được toggle trên 1 wrapper div cụ thể thay vì
`<html>`/`<body>`, và card/form nằm ngoài wrapper đó (vd. do Portal, Modal,
hoặc layout split-screen render ở slot khác) — cần đảm bảo `ThemeProvider`
(hoặc cơ chế tương đương) bọc ở cấp cao nhất của ứng dụng (`layout.tsx`,
`App.tsx`, hoặc `main.tsx`), không bọc cục bộ trong từng route.

### Bước 3 — KHÔNG làm theo hướng sau (đã cân nhắc và loại bỏ)

Không sửa bằng cách set màu chữ thủ công riêng cho từng input/label/title
(vd. thêm `dark:text-white` thủ công cho từng phần tử). Đây là cách vá
triệu chứng, không vá nguyên nhân — sẽ phải lặp lại sửa cho mọi input/page
mới sau này. Mục tiêu là sửa đúng 1 lần ở tầng token màu (CSS variable) +
đảm bảo mọi container dùng đúng token, để toàn bộ component tự đồng bộ theo
dark mode mà không cần can thiệp thủ công ở từng nơi.

## Xác minh sau khi sửa

```bash
npm run build
npx eslint <đường dẫn file đã sửa>
```

Mở app, bật dark mode toggle, kiểm tra cả 2 trang Đăng ký và Đăng nhập:

- Nền card chuyển sang màu tối đúng theo theme.
- Label ("Họ tên/Username", "Email", "Password", "Confirm Password") đọc rõ,
  tương phản tốt với nền.
- Placeholder text trong input đọc được (mờ nhẹ hơn label theo đúng thiết kế
  `muted-foreground`, nhưng không đến mức biến mất).
- Checkbox "Tôi đồng ý với Điều khoản sử dụng" và link "Điều khoản sử dụng"
  đọc rõ.
- Nút "Đăng ký với Google" / "Đăng nhập với Google" vẫn giữ nền trắng đúng
  theo brand Google (không bị đổi theo dark mode — đây là hành vi đúng,
  không phải lỗi, không cần sửa).
- Tắt dark mode, xác nhận light mode vẫn hiển thị đúng như cũ, không bị ảnh
  hưởng bởi thay đổi.

## Output mong muốn

1. Liệt kê chính xác nguyên nhân tìm được (Trường hợp A/B/C ở trên, hoặc tổ
   hợp nhiều trường hợp) sau khi đọc code thật.
2. Code đã sửa, áp dụng trực tiếp.
3. Tóm tắt ngắn gọn các file đã thay đổi.
