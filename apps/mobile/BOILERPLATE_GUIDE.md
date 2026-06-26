# Mobile Boilerplate Guide

Tài liệu này là bộ khung thực chiến để dev mới làm feature trên mobile app mà không phá vỡ cấu trúc hiện tại.

## Nguyên tắc kiến trúc

1. Route file trong src/app phải mỏng: chỉ điều hướng, không chứa business logic.
2. Feature module trong src/features/<domain> gồm screen + hook + types + validator/mapper.
3. Gọi API đặt trong services của từng feature, không gọi trực tiếp trong route.
4. Shared state tối thiểu đặt ở src/store; local state nên ở hook.
5. Mỗi feature mới phải có test cho service và hook.

## Cấu trúc mẫu

```txt
src/
  app/
    _layout.tsx
    index.tsx
    (templates)/
      feature-template.tsx
  features/
    template-feature/
      hooks/
        useTemplateFeature.ts
      mappers/
        template-feature.mapper.ts
      validators/
        template-feature.validator.ts
      services/
        template-feature.service.ts
      screens/
        TemplateFeatureScreen.tsx
      types/
        template.types.ts
      index.ts
  store/
    template-feature.store.ts
  __tests__/
    template-feature/
      template-feature.service.test.ts
      useTemplateFeature.test.tsx
```

## Cách tạo feature mới từ boilerplate

1. Tạo folder feature mới

- Copy src/features/template-feature thành src/features/<ten-feature>.
- Dùng kebab-case cho folder, PascalCase cho component.

2. Cập nhật data contract

- Chỉnh sửa file type để phù hợp contract backend.
- Nếu API có nested payload, thêm mapper để chuẩn hóa data.

3. Cập nhật validator

- Validator phải fail fast khi payload sai shape.
- Không để logic UI xử lý payload lỗi.

4. Cập nhật service

- Tạo file service trong services của feature.
- Luôn đọc base URL từ EXPO_PUBLIC_API_URL.
- Nhất quán kiểu lỗi (throw service error có thông điệp rõ ràng).

5. Cập nhật hook

- Hook quản lý loading, error, và transform state cho UI.
- Hook không import route-specific code.

6. Tạo screen UI

- Screen chỉ render UI + gọi hook/store facade.
- Nếu cần chia component nhỏ, đặt trong screens/components.

7. Tạo route

- Tạo route mới trong src/app/(group)/<feature>.tsx.
- Route chỉ import và render screen từ src/features.

8. Thêm test

- Service test: happy path + non-OK response.
- Hook test: success state + error state.

9. Chạy quality checks

```bash
pnpm -F mobile lint
pnpm -F mobile check-types
pnpm -F mobile test
```

## Anti-pattern cần tránh

- Gọi fetch/axios trực tiếp trong route file.
- Đặt business logic lớn trong component route.
- Để validator bỏ qua trường bắt buộc.
- Coupling chéo giữa 2 feature không qua abstraction rõ ràng.
- Mở PR mà không có test cho logic mới.

## Naming nhanh

- Folder/file: kebab-case
- React component/type/interface: PascalCase
- Function/hook/variable: camelCase

Xem thêm: apps/docs/NAMING_CONVENTIONS.md
