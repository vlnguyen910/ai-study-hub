"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { Pagination } from "@/components/ui/Pagination";
import { Table, type TableRow } from "@/components/ui/Table";
import { userRouterConfig } from "@/routes/user/user.routes";

type DocumentRow = {
  title: string;
  category: string;
  size: string;
  date: string;
  status: "public" | "pending";
  icon: "picture_as_pdf" | "description" | "archive";
};

const DOCUMENTS: DocumentRow[] = [
  {
    title: "Giải tích 2 - Đề cương ôn tập kỳ 2023.2",
    category: "Toán học",
    size: "4.2 MB",
    date: "12/05/2024",
    status: "public",
    icon: "picture_as_pdf",
  },
  {
    title: "Tiểu luận Triết học Mác-Lênin",
    category: "Lý luận chính trị",
    size: "1.8 MB",
    date: "08/05/2024",
    status: "pending",
    icon: "description",
  },
  {
    title: "Source code đồ án Cơ sở dữ liệu",
    category: "CNTT",
    size: "15.6 MB",
    date: "01/05/2024",
    status: "public",
    icon: "archive",
  },
  {
    title: "Giáo trình Vật lý đại cương A1",
    category: "Vật lý",
    size: "22.4 MB",
    date: "25/04/2024",
    status: "public",
    icon: "picture_as_pdf",
  },
];

const sidebarItems = [
  userRouterConfig.PROFILE,
  userRouterConfig.SETTINGS,
  userRouterConfig.FAVORITES,
  userRouterConfig.MY_DOCUMENTS,
  userRouterConfig.MY_UPLOADS,
  userRouterConfig.CHANGE_PASSWORD,
] as const;

const documentColumns = [
  { key: "name", label: "Tên tài liệu" },
  { key: "date", label: "Ngày tải lên" },
  { key: "status", label: "Trạng thái" },
  { key: "actions", label: "Thao tác", align: "right" as const },
] as const;

function MyDocumentSidebar({ pathname }: { pathname: string }): ReactElement {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <Card className="sticky top-6 p-5 shadow-sm shadow-black/5">
        <div className="mb-6">
          <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
            Tài khoản
          </p>
          <h2 className="mt-1 font-headline-md text-headline-md font-bold text-primary">
            AI Study Hub
          </h2>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 font-label-md text-label-md transition-colors ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span>{item.title}</span>
                {isActive ? (
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-outline-variant pt-5">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl px-4 py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Về trang chủ
          </Link>
        </div>
      </Card>
    </aside>
  );
}

export default function MyDocumentPage(): ReactElement {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const stats = [
    { label: "Tổng tài liệu", value: "124", icon: "description" },
    { label: "Lượt xem", value: "2,850", icon: "visibility" },
    { label: "Lượt tải", value: "842", icon: "download" },
    { label: "Đóng góp", value: "Level 4", icon: "workspace_premium" },
  ] as const;

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return DOCUMENTS;
    }

    return DOCUMENTS.filter((document) =>
      [document.title, document.category, document.date, document.size]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [searchTerm]);

  const activePage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(filteredDocuments.length / 4)),
  );
  const visibleDocuments = filteredDocuments.slice(
    (activePage - 1) * 4,
    activePage * 4,
  );

  const documentRows: TableRow[] = visibleDocuments.map((document) => ({
    id: document.title,
    cells: [
      <div className="flex items-center gap-3" key="name">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-primary-container/10 text-primary">
          <span className="material-symbols-outlined">{document.icon}</span>
        </div>
        <div>
          <p className="font-label-md text-label-md font-semibold text-on-surface">
            {document.title}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {document.category} • {document.size}
          </p>
        </div>
      </div>,
      <span
        className="font-body-md text-body-md text-on-surface-variant"
        key="date"
      >
        {document.date}
      </span>,
      <Badge
        key="status"
        tone={document.status === "public" ? "success" : "warning"}
      >
        {document.status === "public" ? "Công khai" : "Đang chờ duyệt"}
      </Badge>,
      <div className="flex justify-end gap-2" key="actions">
        <Button type="button" variant="ghost" size="sm" className="px-3">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Sửa
          </span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-3 text-error hover:bg-error-container hover:text-error"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
            Xóa
          </span>
        </Button>
      </div>,
    ],
  }));

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <MyDocumentSidebar pathname={pathname} />

        <main className="flex-1 space-y-6 pb-10">
          <Card className="p-6 shadow-sm shadow-black/5 lg:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
                  Tài liệu của tôi
                </p>
                <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                  Dashboard tài liệu
                </h1>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                  Quản lý tài liệu, trạng thái và thao tác chỉnh sửa nhanh.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" type="button">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      filter_list
                    </span>
                    Bộ lọc
                  </span>
                </Button>
                <Button variant="outline" type="button">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      sort
                    </span>
                    Sắp xếp
                  </span>
                </Button>
              </div>
            </div>
          </Card>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="flex items-center gap-4 p-5 shadow-sm shadow-black/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/15 text-primary">
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {stat.label}
                  </p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface">
                    {stat.value}
                  </p>
                </div>
              </Card>
            ))}
          </section>

          <Card className="p-5 shadow-sm shadow-black/5 lg:p-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Danh sách tài liệu
                </h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {filteredDocuments.length} kết quả phù hợp với tìm kiếm hiện
                  tại.
                </p>
              </div>

              <div className="w-full lg:max-w-sm">
                <InputField
                  label="Tìm kiếm"
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={
                    <span className="material-symbols-outlined text-[18px]">
                      search
                    </span>
                  }
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
              <Table columns={documentColumns} rows={documentRows} />
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-outline-variant pt-5 md:flex-row md:items-center md:justify-between">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Hiển thị {visibleDocuments.length} / {filteredDocuments.length}{" "}
                tài liệu
              </p>

              <Pagination
                currentPage={activePage}
                totalPages={Math.max(
                  1,
                  Math.ceil(filteredDocuments.length / 4),
                )}
                onPageChange={setCurrentPage}
              />
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
