import type {
  DocumentReviewItem,
  ModeratorActivity,
  ModeratorStat,
  PostModerationItem,
} from "./types";

export const moderatorProfile = {
  name: "Nguyen Minh Quan",
  role: "Senior Moderator",
  email: "moderator@academishare.vn",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA4ehXB6Loahm2Xvv7hh5rSmuu4x1nYDFZ0OVy7Cu1W-W16R8bwM1vzm_bG4Ak7x2yP64Fup1aVUhUypWXNO-F8OMy0-VjDYNUVe1O8ZjI84xkYhxeCiYrPl66Jz4qOUD8RrSzZvX8rXh2Md_hlrDa2eWWieGYB0GEIFJXPTnn6PKtMEZfBj_-SpP2SZb2-8p2r2-vAioh9uBTbajE-kehXsaylS8xPnYlnybQvfES2mEzCVwz4Q2e_NFXmjv_XKT7MLneDX58uU97f",
} as const;

export const dashboardStats: ModeratorStat[] = [
  {
    label: "Tài liệu chờ duyệt",
    value: "1,428",
    caption: "124 mục mới trong hôm nay",
    icon: "pending_actions",
    tone: "primary",
    trend: "+12%",
  },
  {
    label: "Báo cáo bài viết",
    value: "56",
    caption: "18 báo cáo mức ưu tiên cao",
    icon: "report",
    tone: "tertiary",
    trend: "Hôm nay",
  },
  {
    label: "Người kiểm duyệt",
    value: "12",
    caption: "8 moderator đang trực tuyến",
    icon: "group",
    tone: "secondary",
    trend: "Trực tuyến",
  },
];

export const recentActivities: ModeratorActivity[] = [
  {
    id: "act-1",
    title: "Nguyen Van A đã duyệt tài liệu",
    description: "Giai tich 1 - Bai tap cuoi ky",
    time: "10 phút trước",
    tone: "primary",
  },
  {
    id: "act-2",
    title: "Tran Thi B đã ẩn bài viết",
    description: "Vi phạm tiêu chuẩn cộng đồng",
    time: "25 phút trước",
    tone: "error",
  },
  {
    id: "act-3",
    title: "Le Van C đã phản hồi báo cáo",
    description: "Ticket #8842 - Đã giải quyết",
    time: "42 phút trước",
    tone: "secondary",
  },
  {
    id: "act-4",
    title: "Hệ thống tự động quét",
    description: "Phát hiện 3 tài liệu trùng lặp",
    time: "1 giờ trước",
    tone: "tertiary",
  },
];

export const weeklyDocumentFlow = [
  { label: "T2", uploaded: 68, approved: 54 },
  { label: "T3", uploaded: 82, approved: 72 },
  { label: "T4", uploaded: 56, approved: 42 },
  { label: "T5", uploaded: 96, approved: 88 },
  { label: "T6", uploaded: 74, approved: 61 },
  { label: "T7", uploaded: 44, approved: 31 },
  { label: "CN", uploaded: 32, approved: 21 },
] as const;

export const documentReviewItems: DocumentReviewItem[] = [
  {
    id: "DOC-2023-08-442",
    title: "Giáo trình kiến trúc máy tính nâng cao 2023",
    description:
      "Tài liệu tóm tắt các nguyên lý thiết kế bộ vi xử lý hiện đại, bao gồm kỹ thuật pipelining và cache mapping.",
    author: "Nguyen Van A",
    authorEmail: "nva.student@hcmut.edu.vn",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_798UeMa0LxINQUyz2PkHQj_z--KyNKudVd9tiJw59PylKsZtHHGPO1ng7bK1eOcjuBI6vyMOW4ld4VtM1pUJ9aFL9qbxkhcP5qSSDfE6uNkez_XGgQrEAaP9r0_KuaHHMnRJ7tKVyHz79OeptmcekAgDWTXHkCZnYmiTWggLSj_yDsIFHTPUuZ1mp6Cc1r3igK7kRg2zOymYLnU57ZRNQWsXK2qjcoeBYDDxDt_l9mYowWNVAF7PuqHWP8Wl4XgtObOHEGgKpOZq",
    category: "Khoa học Máy tính",
    subject: "Computer Architecture",
    university: "ĐH Bách Khoa",
    uploadDate: "12/08/2023",
    fileType: "PDF",
    fileSize: "4.2 MB",
    pages: 128,
    status: "priority",
    riskScore: 18,
    priority: "urgent",
    previewUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcuJcp-Hzz9nuL0QP1ID_7wVjrI3DKEMVYB9QXzPj3QQovrSaii0TVSMlWkGxcgZjt8fLD2I7GjYbbEzpVDJ-L2G89vmds4u5WgMiaeTDwalxzswi7JljzJJXIh0fAmytjpSHw-EgRWinDLJKLqf6fFFBj4g73sTS0qg-uTyhZICRUqiAVSmQ0MRZirXC3R0DneR-e3Sb_lNeV67sM_PjjV30rUT3jOUEbHHVFcgbKXke7XusSgwfrG4BZmacGoAQsJTpWGI0zVDla",
    tags: ["#ComputerScience", "#Architecture", "#University"],
    checks: [
      { label: "Virus scan", value: "Đã quét bởi ClamAV", tone: "success" },
      { label: "Trùng lặp", value: "3% tương đồng", tone: "success" },
      { label: "Bản quyền", value: "Cần xác minh nguồn", tone: "warning" },
    ],
    versions: [
      {
        version: "2.0",
        uploadedBy: "nva_student",
        uploadedAt: "12/08/2023 14:30",
        note: "Bản hiện tại, bổ sung chương cache mapping.",
      },
      {
        version: "1.0",
        uploadedBy: "nva_student",
        uploadedAt: "10/08/2023 09:15",
        note: "Bản tải lên đầu tiên.",
      },
    ],
  },
  {
    id: "DOC-2023-08-381",
    title: "Nghiên cứu về AI trong Giáo dục",
    description:
      "Bài khảo sát ứng dụng mô hình ngôn ngữ lớn trong lớp học kết hợp.",
    author: "Tran Thi B",
    authorEmail: "ttb@uit.edu.vn",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZVlgsFX5e5ANYmmHF4S4-AofpxYLA47e55SPCnbs3scSq_qkvz_fV1RyD74V3m7FdR8ewIzFubsSLM4nomf7sRTYi1wdpXvWqbRHzTO7O19aLsK8mfZEn8yXBCalTjkOcdCqClYbI7QkSbxJ-B8F6g4f09A7aHFPnumxXDRAxWLN9DvsEjd83DSqJuFg6DFSRztOAV49wAc_915G8s8lsh0hMMC4wuBNVXtbM0uNPX-m_nsRWTTjYIW9PSuhr0rtWh_s7eQi3V8f7",
    category: "Khoa học Máy tính",
    subject: "AI Education",
    university: "ĐH Công Nghệ Thông Tin",
    uploadDate: "12/10/2023",
    fileType: "PDF",
    fileSize: "4.2 MB",
    pages: 42,
    status: "pending",
    riskScore: 9,
    priority: "high",
    previewUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80",
    tags: ["#AI", "#Education", "#Research"],
    checks: [
      { label: "Virus scan", value: "Sạch", tone: "success" },
      { label: "Trùng lặp", value: "8% tương đồng", tone: "success" },
      { label: "Metadata", value: "Đầy đủ", tone: "success" },
    ],
    versions: [
      {
        version: "1.0",
        uploadedBy: "ttb_research",
        uploadedAt: "12/10/2023 08:20",
        note: "Bản đầu tiên.",
      },
    ],
  },
  {
    id: "DOC-2023-08-295",
    title: "Lý thuyết Kinh tế Vĩ mô Hiện đại",
    description:
      "Tổng hợp bài giảng kinh tế vĩ mô với ví dụ chính sách tiền tệ Việt Nam.",
    author: "Le Van C",
    authorEmail: "lvc@neu.edu.vn",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5jBWCj_h1ZPe64Rm6c5iQTsCRCzsyONLi05sElbwwxQXehkgR9ozxcX_Zoo7T_mD175GsTnc0_deA535CSSSFyACF2p11Jz7_dW_dK5qu9pQhbnpj3RMtNnaS9ZGejvxdr6oTLDCPafrFSpf92TKa_lvoo2vjkrzXTlZVBSczTbLm0G_S2Z1MlcsBF_rxBfwogE_wZQUf9NqdMs26BDN-udcSUzS_U-_yRgGDLNv_mLwINBmwIwtoA5x6pnrbmAAD9o_IYa4Lz_B8",
    category: "Kinh tế học",
    subject: "Macroeconomics",
    university: "ĐH Kinh tế Quốc dân",
    uploadDate: "11/10/2023",
    fileType: "DOCX",
    fileSize: "1.8 MB",
    pages: 76,
    status: "pending",
    riskScore: 12,
    priority: "normal",
    previewUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
    tags: ["#Economics", "#Macro", "#Lecture"],
    checks: [
      { label: "Virus scan", value: "Sạch", tone: "success" },
      { label: "Trích dẫn", value: "Thiếu 2 nguồn", tone: "warning" },
      { label: "Metadata", value: "Đầy đủ", tone: "success" },
    ],
    versions: [
      {
        version: "1.0",
        uploadedBy: "lvc_econ",
        uploadedAt: "11/10/2023 17:15",
        note: "Bản đầu tiên.",
      },
    ],
  },
  {
    id: "DOC-2023-08-219",
    title: "Phân tích Tâm lý học Hành vi",
    description:
      "Tài liệu seminar về các mô hình hành vi trong môi trường học tập.",
    author: "Pham Thu D",
    authorEmail: "ptd@ussh.edu.vn",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFUf9JVxb1u9QhztJfjqZZ0mO24tmPBP3fHYKq75rArakTQHl_jBBnRNjl0hJWaknur226EM4HeP6nRs5LRU-Nv0QxI_TdmsW5QrMFTgJMRCIHsR358FpVL_IHO03-0mgHYiTAfHi3ralyPYFqEytrw8ycYYi1AegnTfYsUC5YKRtIZH-gPkFMx7vo6l5uNVbY3qZwyXSXMvtL4iflAplkPMsVlIfQhvB7cGmXNuhw-m5REG19DqdibX0cjcBHn9jYeyCxl12vWUVj",
    category: "Tâm lý học",
    subject: "Behavioral Psychology",
    university: "ĐH Khoa học Xã hội",
    uploadDate: "10/10/2023",
    fileType: "PDF",
    fileSize: "5.5 MB",
    pages: 94,
    status: "changes_requested",
    riskScore: 28,
    priority: "normal",
    previewUrl:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=900&q=80",
    tags: ["#Psychology", "#Behavior", "#Seminar"],
    checks: [
      { label: "Virus scan", value: "Sạch", tone: "success" },
      {
        label: "Bản quyền",
        value: "Ảnh minh họa chưa rõ nguồn",
        tone: "warning",
      },
      { label: "Metadata", value: "Thiếu mô tả chi tiết", tone: "warning" },
    ],
    versions: [
      {
        version: "1.1",
        uploadedBy: "ptd_psy",
        uploadedAt: "10/10/2023 12:40",
        note: "Đã bổ sung slide phụ lục.",
      },
      {
        version: "1.0",
        uploadedBy: "ptd_psy",
        uploadedAt: "09/10/2023 11:30",
        note: "Bản đầu tiên.",
      },
    ],
  },
];

export const postModerationItems: PostModerationItem[] = [
  {
    id: "POST-9021",
    title: "Nghiên cứu về AI trong Giáo dục",
    excerpt:
      "Mình tổng hợp một số tài liệu về AI trong giáo dục, mọi người góp ý thêm...",
    author: "Le Minh Tam",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFUf9JVxb1u9QhztJfjqZZ0mO24tmPBP3fHYKq75rArakTQHl_jBBnRNjl0hJWaknur226EM4HeP6nRs5LRU-Nv0QxI_TdmsW5QrMFTgJMRCIHsR358FpVL_IHO03-0mgHYiTAfHi3ralyPYFqEytrw8ycYYi1AegnTfYsUC5YKRtIZH-gPkFMx7vo6l5uNVbY3qZwyXSXMvtL4iflAplkPMsVlIfQhvB7cGmXNuhw-m5REG19DqdibX0cjcBHn9jYeyCxl12vWUVj",
    reason: "Nội dung nhạy cảm",
    status: "reported",
    reportedAt: "10:45, 24/05",
    reports: 6,
    community: "AI Study Group",
  },
  {
    id: "POST-8842",
    title: "Giáo trình Toán cao cấp A1",
    excerpt:
      "Bài viết chia sẻ giáo trình và lời giải bài tập theo từng chương cho sinh viên năm nhất.",
    author: "Tran Hoang Nam",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBt_NECNAFxYI2pa0UXHfhadAGf3P5sSaywZPrcpK2bIOc6v1kmyN_tlWYCiDd3dGg53WRAXHnHNxv2G5xseX_VV8I56URVXAx6iEUc9tMn3CgMXYADbAWYsQUduQTvUETiJ7KZer7ZiY5utMPSU_fTs-HHn76lDWUhkYeQQ05vbEmDNcKbsa-_ZI1qoN45osNALY0IhRr0e3UbR5tG_j5Ma1U747LALImsLy0CrwVhy8ynx5she69jYGcDAYwDVJY_O-BIxOT_91Au",
    reason: "Chờ phê duyệt",
    status: "pending",
    reportedAt: "09:12, 24/05",
    reports: 1,
    community: "Calculus Hub",
  },
  {
    id: "POST-7719",
    title: "Spam: Mua bán tài liệu lậu",
    excerpt:
      "Tài khoản đăng link bán tài liệu không rõ nguồn và yêu cầu chuyển khoản ngoài nền tảng.",
    author: "Nguoi dung an danh",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDe2I1AZVupugwI2f54Sw9uOi56wnQkZumkepFvyRqW08Fkv0utBQ4MufPS8K7Ea3efehMDc5PA7V_23sQp6wxdWPg_9UKUzYs4xFyK9NhIG8Qx7U1pKN1QxYHPT-M05tVs5qUoz5903uaBQb4Jfps_0X3sRBtA66s5m16h-498eADL64LSlIH9qSPoV17Y2LKqrxiGS1OEJF97uicqoQcuiQWDoP-evg2PWYdt_uAYPd544j6AbItX3KCOrmTFSHs7YiVKMICi2tN7",
    reason: "Bị báo cáo spam",
    status: "reported",
    reportedAt: "Hôm qua, 23:55",
    reports: 14,
    community: "Document Market",
  },
  {
    id: "POST-7702",
    title: "Tổng hợp đề thi cuối kỳ Cấu trúc dữ liệu",
    excerpt:
      "Danh sách đề thi được phân nhóm theo năm học, có ghi chú mức độ khó từng đề.",
    author: "Hoang Minh",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
    reason: "Chờ phê duyệt",
    status: "pending",
    reportedAt: "Hôm qua, 21:10",
    reports: 0,
    community: "CS Review",
  },
];
