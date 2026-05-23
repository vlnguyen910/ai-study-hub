# Template Feature Module

Bộ mẫu này minh họa cấu trúc để tạo feature mới trong mobile app.

## Mục tiêu

- Route trong src/app chỉ render screen.
- Logic nằm trong hooks.
- Gọi API nằm trong services.
- Shared state nhỏ nằm trong store.

## Các file cần có

- types.ts: Định nghĩa data contract.
- hooks/use<Feature>.ts: Xử lý state, loading, error.
- screens/<Feature>Screen.tsx: UI component cho route.
- mappers/\*.ts: Chuẩn hóa dữ liệu trả về từ API.
- validators/\*.ts: Validate payload de fail fast.
- index.ts: Export cho feature.

## Cách tạo feature mới

1. Copy thư mục template-feature thành tên feature mới theo kebab-case.
2. Đổi tên các symbol TemplateFeature thành tên feature mới.
3. Tạo service trong thư mục services của feature.
4. Tạo route ở src/app và import screen từ feature.
5. Thêm test cho service và hook.
