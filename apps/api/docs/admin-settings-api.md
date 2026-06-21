# AI Study Hub Admin Settings API

## Kiến trúc và response contract

Luồng xử lý là `Controller -> SettingsService -> SettingsRepository -> Prisma/MongoDB`.
Toàn bộ cấu hình nằm trong một document `system_settings` có unique key `GLOBAL`; repository dùng `upsert` nên database mới tự nhận default mà không tạo bản ghi trùng.

Mọi response có đúng dạng:

```json
{
  "success": true,
  "message": "System settings fetched successfully",
  "data": {},
  "errors": null
}
```

`400` dùng cho payload sai kiểu/format hoặc rỗng; `401` cho thiếu/sai JWT; `403` cho tài khoản không phải `ADMIN`; `422` cho dữ liệu đúng kiểu nhưng vi phạm nghiệp vụ; `500` cho lỗi ngoài dự kiến.

MongoDB không dùng Prisma migration files. Schema nằm tại `prisma/schema.prisma`; áp dụng bằng `pnpm --filter api db:sync`. Seed singleton bằng `pnpm --filter api db:seed`.

Hai endpoint đọc dùng chung cho cả bảy khối:

| Method | URL                      | Mô tả                                    | Quyền  |
| ------ | ------------------------ | ---------------------------------------- | ------ |
| GET    | `/api/v1/settings`       | Đọc runtime config để Web/Mobile áp dụng | Public |
| GET    | `/api/v1/admin/settings` | Đọc toàn bộ config trong trang Admin     | ADMIN  |

## 1. General System Config

### [1] Database schema

| Field               | Prisma/Mongo type | Default                    |
| ------------------- | ----------------- | -------------------------- |
| `systemName`        | `String`          | `AI Study Hub`             |
| `maintenanceMode`   | `Boolean`         | `false`                    |
| `defaultSchoolCode` | `String`          | `FPTU`                     |
| `supportEmail`      | `String`          | `support@aistudyhub.local` |

### [2] API endpoint

| Method | URL                              | Mô tả                                    | Quyền |
| ------ | -------------------------------- | ---------------------------------------- | ----- |
| PATCH  | `/api/v1/admin/settings/general` | Cập nhật một hoặc nhiều general settings | ADMIN |

### [3] Validation

`systemName`: chuỗi 2-100 ký tự; `maintenanceMode`: boolean; `defaultSchoolCode`: 2-20 ký tự `[A-Z0-9_-]`, được uppercase và phải tồn tại trong `schools`; `supportEmail`: email hợp lệ, tối đa 254 ký tự. Body phải có ít nhất một field.

### [4] Backend implementation

Route/controller: `src/modules/settings/settings.controller.ts`; DTO: `dto/update-general-settings.dto.ts`; kiểm tra school và business logic: `settings.service.ts`; singleton upsert: `settings.repository.ts`.

### [5] OpenAPI

Path `PATCH /admin/settings/general`, schema `UpdateGeneralSettingsRequest` trong `openapi/admin-settings.openapi.yaml`.

## 2. Upload Config

### [1] Database schema

| Field               | Prisma/Mongo type | Default           |
| ------------------- | ----------------- | ----------------- |
| `maxFileSizeMb`     | `Int`             | `100`             |
| `allowedFileTypes`  | `String[]`        | `PDF, DOCX, PPTX` |
| `allowMobileUpload` | `Boolean`         | `true`            |

### [2] API endpoint

| Method | URL                             | Mô tả                    | Quyền |
| ------ | ------------------------------- | ------------------------ | ----- |
| PATCH  | `/api/v1/admin/settings/upload` | Cập nhật upload settings | ADMIN |

### [3] Validation

`maxFileSizeMb`: số nguyên 1-1024; `allowedFileTypes`: mảng 1-3 phần tử duy nhất, được uppercase, chỉ nhận `PDF`, `DOCX`, `PPTX`; `allowMobileUpload`: boolean. Body không được rỗng.

### [4] Backend implementation

DTO `dto/update-upload-settings.dto.ts`; route, service và repository dùng chung của SettingsModule.

### [5] OpenAPI

Path `PATCH /admin/settings/upload`, schema `UpdateUploadSettingsRequest`.

## 3. Document Visibility & Review Config

### [1] Database schema

| Field                                 | Type      | Default |
| ------------------------------------- | --------- | ------- |
| `requireModerationForPublicDocuments` | `Boolean` | `true`  |
| `allowPrivateDocuments`               | `Boolean` | `true`  |
| `allowSharedLink`                     | `Boolean` | `true`  |
| `privateToPublicRequiresReview`       | `Boolean` | `true`  |
| `replaceFileRequiresReview`           | `Boolean` | `true`  |

### [2] API endpoint

| Method | URL                                          | Mô tả                               | Quyền |
| ------ | -------------------------------------------- | ----------------------------------- | ----- |
| PATCH  | `/api/v1/admin/settings/document-visibility` | Cập nhật visibility/review workflow | ADMIN |

### [3] Validation

Mọi field chỉ nhận boolean; body phải chứa ít nhất một field được hỗ trợ. Unknown field bị từ chối với `400`.

### [4] Backend implementation

DTO `dto/update-document-visibility-settings.dto.ts`; `SettingsService.updateDocumentVisibility`; `SettingsRepository.update` tăng `version` nguyên tử.

### [5] OpenAPI

Path `PATCH /admin/settings/document-visibility`, schema `UpdateDocumentVisibilitySettingsRequest`.

## 4. AI Config

### [1] Database schema

| Field                        | Type      | Default |
| ---------------------------- | --------- | ------- |
| `enableAiFeatures`           | `Boolean` | `true`  |
| `enableAiSummary`            | `Boolean` | `true`  |
| `enableAiQuiz`               | `Boolean` | `true`  |
| `enableAiSearch`             | `Boolean` | `true`  |
| `enableAiChat`               | `Boolean` | `true`  |
| `enableAiModeratorAssistant` | `Boolean` | `true`  |
| `maxAiRequestsPerUserPerDay` | `Int`     | `20`    |
| `maxQuizQuestions`           | `Int`     | `20`    |
| `defaultQuizQuestions`       | `Int`     | `10`    |

### [2] API endpoint

| Method | URL                         | Mô tả                              | Quyền |
| ------ | --------------------------- | ---------------------------------- | ----- |
| PATCH  | `/api/v1/admin/settings/ai` | Cập nhật feature flags và quota AI | ADMIN |

### [3] Validation

Feature flags là boolean; daily requests là số nguyên 1-10000; các giới hạn quiz là số nguyên 1-100; giá trị default sau cập nhật phải nhỏ hơn hoặc bằng max, nếu không trả `422`.

### [4] Backend implementation

DTO `dto/update-ai-settings.dto.ts`; `SettingsService.updateAi` tính giá trị hiệu lực từ payload và bản ghi hiện tại trước khi ghi.

### [5] OpenAPI

Path `PATCH /admin/settings/ai`, schema `UpdateAiSettingsRequest`.

## 5. Moderation Config

### [1] Database schema

| Field                                      | Type      | Default |
| ------------------------------------------ | --------- | ------- |
| `autoFlagDuplicateDocuments`               | `Boolean` | `true`  |
| `duplicateSimilarityThreshold`             | `Int`     | `85`    |
| `requireRejectionReason`                   | `Boolean` | `true`  |
| `allowModeratorToApproveAiFlaggedDocument` | `Boolean` | `true`  |

### [2] API endpoint

| Method | URL                                 | Mô tả                               | Quyền |
| ------ | ----------------------------------- | ----------------------------------- | ----- |
| PATCH  | `/api/v1/admin/settings/moderation` | Cập nhật duplicate/rejection policy | ADMIN |

### [3] Validation

Threshold là phần trăm nguyên từ 0 đến 100; các field còn lại là boolean; body không được rỗng.

### [4] Backend implementation

DTO `dto/update-moderation-settings.dto.ts`; `SettingsService.updateModeration`; persistence qua singleton repository.

### [5] OpenAPI

Path `PATCH /admin/settings/moderation`, schema `UpdateModerationSettingsRequest`.

## 6. Account Config

### [1] Database schema

| Field                                   | Type       | Default |
| --------------------------------------- | ---------- | ------- |
| `allowGmailRegistration`                | `Boolean`  | `true`  |
| `requireEmailVerification`              | `Boolean`  | `true`  |
| `allowUnverifiedLoginWithLimitedAccess` | `Boolean`  | `true`  |
| `defaultRoleAfterSignup`                | `UserRole` | `USER`  |

### [2] API endpoint

| Method | URL                              | Mô tả                               | Quyền |
| ------ | -------------------------------- | ----------------------------------- | ----- |
| PATCH  | `/api/v1/admin/settings/account` | Cập nhật signup/verification policy | ADMIN |

### [3] Validation

Ba policy field là boolean. Trong MVP, `defaultRoleAfterSignup` chỉ nhận `USER`; API cố ý không cho cấu hình signup tự cấp `ADMIN`/`MODERATOR`.

### [4] Backend implementation

DTO `dto/update-account-settings.dto.ts`; `SettingsService.updateAccount`; Prisma enum `UserRole` ngăn dữ liệu role tự do.

### [5] OpenAPI

Path `PATCH /admin/settings/account`, schema `UpdateAccountSettingsRequest`.

## 7. Mobile Config

### [1] Database schema

| Field                    | Type      | Default |
| ------------------------ | --------- | ------- |
| `enableMobileAppAccess`  | `Boolean` | `true`  |
| `enableMobileUpload`     | `Boolean` | `true`  |
| `enableMobileAiFeatures` | `Boolean` | `true`  |

### [2] API endpoint

| Method | URL                             | Mô tả                         | Quyền |
| ------ | ------------------------------- | ----------------------------- | ----- |
| PATCH  | `/api/v1/admin/settings/mobile` | Cập nhật mobile feature flags | ADMIN |

### [3] Validation

Mọi field chỉ nhận boolean; body phải có ít nhất một field hợp lệ.

### [4] Backend implementation

DTO `dto/update-mobile-settings.dto.ts`; `SettingsService.updateMobile`; public GET cho mobile tải runtime config.

### [5] OpenAPI

Path `PATCH /admin/settings/mobile`, schema `UpdateMobileSettingsRequest`.

## Tích hợp trang Admin Config

Trang `/admin/config` đã gọi `GET /api/v1/admin/settings` khi mount, bind từng section vào bảy object trong `data`, và gọi PATCH tương ứng khi lưu từng section. UI dùng trực tiếp field `maxFileSizeMb`; danh sách file type được gửi dưới dạng array thay vì chuỗi phân cách dấu phẩy.
