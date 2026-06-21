# AI Feature Prioritization Roadmap

## Overview

AI Study Hub có nhiều tính năng AI tiềm năng, tuy nhiên không nên triển khai đồng thời tất cả trong MVP.

Ưu tiên được xác định dựa trên:

- Giá trị mang lại cho người dùng
- Độ khó kỹ thuật
- Mức độ phụ thuộc hệ thống
- Chi phí AI
- Giá trị khi demo đồ án

---

# Priority 1 — AI Description Generation

## Goal

Hỗ trợ người dùng tạo mô tả tài liệu khi upload.

## User Flow

```text
Upload Document
    ↓
Generate Description with AI
    ↓
Review Description
    ↓
Submit Document
```

## Why First

- Dễ triển khai.
- Không cần RAG.
- Không cần Vector Search.
- Mang lại giá trị ngay lập tức.
- Giúp giảm tình trạng description trống hoặc chất lượng thấp.

## Technical Requirements

- Document text extraction.
- Gemini API.
- Description generation endpoint.

## MVP Scope

- User bấm "Generate Description".
- AI sinh mô tả 2–4 câu.
- User được chỉnh sửa trước khi lưu.

---

# Priority 2 — AI Summary (On-Demand)

## Goal

Giúp người dùng nhanh chóng hiểu nội dung tài liệu.

## User Flow

```text
Open Document
    ↓
Generate Summary
    ↓
View Summary
```

## Why Second

- Giá trị học tập cao.
- Tái sử dụng document text extraction.
- Không cần triển khai RAG hoàn chỉnh.

## Technical Requirements

- Extracted document text.
- Gemini API.

## MVP Scope

- Summary chỉ được tạo khi user yêu cầu.
- Summary được lưu để tái sử dụng.
- Không tự động tạo sau upload.

## Important Rule

```text
Summary là On-Demand Feature.
Không generate tự động sau upload.
```

---

# Priority 3 — AI Moderator Assistant

## Goal

Hỗ trợ moderator duyệt tài liệu nhanh hơn.

## User Flow

```text
Moderator Opens Document
    ↓
View AI Analysis
    ↓
Approve / Reject
```

## AI Responsibilities

- Generate summary.
- Suggest subject.
- Detect duplicates.
- Flag suspicious content.
- Suggest moderation decision.

## Important Rule

```text
AI chỉ hỗ trợ moderator.

AI không được:
- Approve document
- Reject document

Moderator luôn là người quyết định cuối cùng.
```

## Why Third

- Khác biệt với các project CRUD thông thường.
- Dùng lại kết quả từ Summary và Duplicate Detection.
- Có giá trị lớn khi bảo vệ đồ án.

---

# Priority 4 — AI Semantic Search

## Goal

Cho phép người dùng tìm tài liệu bằng mô tả tự nhiên.

## Example

Input:

```text
Tài liệu nói về deadlock trong hệ điều hành
```

Output:

```text
1. Operating System - Deadlock.pdf
2. OS Week 7 Slides.pdf
3. Process Synchronization Notes.pdf
```

## Why Fourth

- Giá trị cao.
- Trải nghiệm AI rõ ràng.
- Cần Embedding và Vector Search.

## Technical Requirements

- Chunking.
- Embedding generation.
- MongoDB Atlas Vector Search.

## MVP Scope

- User nhập mô tả tự nhiên.
- Trả về danh sách tài liệu liên quan.
- Hiển thị lý do khớp.

---

# Priority 5 — AI Chat With Document

## Goal

Cho phép hỏi đáp dựa trên nội dung của một tài liệu.

## User Flow

```text
Select Document
    ↓
Start Chat
    ↓
Ask Questions
    ↓
Receive Answers
```

## Why Fifth

- Đây là tính năng AI mạnh nhất.
- Độ khó cao.
- Phụ thuộc vào Vector Search và RAG.

## Technical Requirements

- Chunking.
- Embeddings.
- Retrieval.
- Gemini.
- Chat History.

## MVP Scope

- Chỉ chat với 1 tài liệu tại một thời điểm.
- Không chat toàn bộ thư viện.

## Important Rule

```text
Nếu tài liệu không chứa thông tin được hỏi,
AI phải trả lời rằng không tìm thấy thông tin trong tài liệu.
```

---

# Priority 6 — AI Quiz Generation

## Goal

Tạo câu hỏi ôn tập từ tài liệu.

## User Flow

```text
Open Document
    ↓
Generate Quiz
    ↓
Answer Questions
    ↓
Review Results
```

## Why Last

- Không phải core workflow.
- Tốn token.
- Cần UI bổ sung.

## Technical Requirements

- Extracted document text.
- Gemini API.

## MVP Scope

- User chọn số lượng câu hỏi.
- Generate quiz khi user yêu cầu.
- Hiển thị đáp án và giải thích.

## Important Rule

```text
Quiz là On-Demand Feature.

Không generate tự động sau upload.
```

---

# AI Processing Strategy

## Automatic Background Processing

Các tác vụ tự động sau upload:

```text
Extract Text
Chunking
Embedding Generation
Duplicate Detection (Public Documents)
AI Moderator Analysis
```

## User Triggered Processing

Các tác vụ chỉ chạy khi người dùng yêu cầu:

```text
Generate Description
Generate Summary
Generate Quiz
AI Semantic Search
AI Chat
```

---

# Recommended MVP AI Scope

## Must Have

```text
AI Description Generation
AI Summary
AI Moderator Assistant
```

## Should Have

```text
AI Semantic Search
AI Chat With Document
```

## Nice To Have

```text
AI Quiz Generation
```

---

# Final Implementation Order

```text
1. AI Description Generation
2. AI Summary
3. AI Moderator Assistant
4. AI Semantic Search
5. AI Chat With Document
6. AI Quiz Generation
```

This order provides the best balance between:

- Development complexity
- User value
- AI cost
- Demo impact
- MVP delivery speed
