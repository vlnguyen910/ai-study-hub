"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Pagination } from "@/components/ui/Pagination";
import { Table, type TableRow } from "@/components/ui/Table";
import { useMemo, useState, type ComponentProps } from "react";
import { postModerationItems } from "../mockData";
import type { PostModerationItem, PostModerationStatus } from "../types";
import { ModeratorFilterToolbar } from "../components/ModeratorFilterToolbar";
import { ModeratorShell } from "../components/ModeratorShell";
import { EmptyState, MaterialIcon } from "../components/ModeratorPrimitives";

type ModerationTab = "pending" | "reported" | "history";

const pageSize = 4;

const moderationOptions: readonly string[] = [
  "Chờ duyệt",
  "Đã báo cáo",
  "Lịch sử",
] as const;

const tabLabelMap: Record<ModerationTab, string> = {
  pending: "Chờ duyệt",
  reported: "Đã báo cáo",
  history: "Lịch sử",
};

const tabValueMap: Record<string, ModerationTab> = {
  "Chờ duyệt": "pending",
  "Đã báo cáo": "reported",
  "Lịch sử": "history",
};

const postColumns = [
  { key: "post", label: "BÀI VIẾT" },
  { key: "author", label: "TÁC GIẢ" },
  { key: "reason", label: "LÝ DO" },
  { key: "time", label: "THỜI GIAN" },
  { key: "status", label: "TRẠNG THÁI" },
  { key: "actions", label: "THAO TÁC", align: "right" as const },
] as const;

const statusMeta: Record<
  PostModerationStatus,
  {
    label: string;
    tone: NonNullable<ComponentProps<typeof Badge>["tone"]>;
  }
> = {
  pending: { label: "Chờ phê duyệt", tone: "warning" },
  reported: { label: "Đã báo cáo", tone: "error" },
  approved: { label: "Đã duyệt", tone: "success" },
  hidden: { label: "Đã ẩn", tone: "error" },
  restored: { label: "Đã khôi phục", tone: "success" },
  flagged: { label: "Đã gắn cờ", tone: "error" },
};

function updatePostStatus(
  items: PostModerationItem[],
  id: string,
  status: PostModerationStatus,
) {
  return items.map((item) => (item.id === id ? { ...item, status } : item));
}

export default function ModeratorPostsPage(): React.JSX.Element {
  const [posts, setPosts] = useState(postModerationItems);
  const [activeTab, setActiveTab] = useState<ModerationTab>("pending");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const scopedPosts =
      activeTab === "history"
        ? posts.filter((post) =>
            ["approved", "hidden", "restored", "flagged"].includes(post.status),
          )
        : posts.filter((post) => post.status === activeTab);

    if (!normalizedQuery) {
      return scopedPosts;
    }

    return scopedPosts.filter((post) =>
      [
        post.id,
        post.title,
        post.author,
        post.reason,
        post.community,
        post.excerpt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [activeTab, posts, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const visiblePosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const unresolvedCount = posts.filter((post) =>
    ["pending", "reported", "flagged"].includes(post.status),
  ).length;
  const reportedCount = posts.filter(
    (post) => post.status === "reported",
  ).length;

  const handleStatusChange = (
    id: string,
    status: PostModerationStatus,
    message: string,
  ) => {
    setPosts((current) => updatePostStatus(current, id, status));
    setToastMessage(message);
  };

  const handleResetFilters = () => {
    setActiveTab("pending");
    setCurrentPage(1);
    setQuery("");
  };

  const postRows: TableRow[] = visiblePosts.map((post) => {
    const status = statusMeta[post.status];

    return {
      id: post.id,
      cells: [
        <div className="flex min-w-[280px] items-center gap-3" key="post">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant bg-secondary-container/20 text-secondary">
            <MaterialIcon name="article" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-label-md text-label-md text-on-surface">
              {post.title}
            </p>
            <p className="truncate font-label-sm text-label-sm text-on-surface-variant">
              {post.id} • {post.community}
            </p>
          </div>
        </div>,
        <div className="flex items-center gap-2" key="author">
          <img
            alt={`Ảnh đại diện của ${post.author}`}
            className="h-6 w-6 rounded-full border border-outline-variant object-cover"
            height={24}
            src={post.avatarUrl}
            width={24}
          />
          <span className="font-body-md text-body-md text-on-surface">
            {post.author}
          </span>
        </div>,
        <span
          className="block max-w-[220px] truncate font-label-sm text-label-sm text-on-surface-variant"
          key="reason"
        >
          {post.reason} • {post.reports} báo cáo
        </span>,
        <span
          className="whitespace-nowrap font-body-md text-body-md text-on-surface-variant"
          key="time"
        >
          {post.reportedAt}
        </span>,
        <Badge key="status" tone={status.tone}>
          {status.label}
        </Badge>,
        <div className="flex justify-end gap-2" key="actions">
          <IconButton
            ariaLabel={`Duyệt ${post.title}`}
            className="text-primary hover:text-primary"
            icon={<MaterialIcon name="check_circle" />}
            onClick={() =>
              handleStatusChange(post.id, "approved", `Đã duyệt ${post.id}`)
            }
          />
          <IconButton
            ariaLabel={`Ẩn ${post.title}`}
            className="text-error hover:text-error"
            icon={<MaterialIcon name="visibility_off" />}
            onClick={() =>
              handleStatusChange(post.id, "hidden", `Đã ẩn ${post.id}`)
            }
          />
          <IconButton
            ariaLabel={`Khôi phục ${post.title}`}
            icon={<MaterialIcon name="restore" />}
            onClick={() =>
              handleStatusChange(post.id, "restored", `Đã khôi phục ${post.id}`)
            }
          />
          <IconButton
            ariaLabel={`Gắn cờ ${post.title}`}
            className="text-tertiary hover:text-tertiary"
            icon={<MaterialIcon name="flag" />}
            onClick={() =>
              handleStatusChange(post.id, "flagged", `Đã gắn cờ ${post.id}`)
            }
          />
        </div>,
      ],
    };
  });

  return (
    <ModeratorShell
      activeSection="posts"
      searchPlaceholder="Tìm kiếm bài viết hoặc tác giả..."
    >
      <div className="space-y-gutter">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Kiểm duyệt bài viết
            </h1>
            <p className="mt-2 max-w-3xl whitespace-normal break-words font-body-md text-body-md text-on-surface-variant">
              Theo dõi bài chờ duyệt, báo cáo vi phạm và lịch sử xử lý.
            </p>
          </div>
          <Card className="grid w-full max-w-sm grid-cols-2 gap-0 overflow-hidden rounded-lg p-0 lg:w-auto">
            <div className="border-r border-outline-variant px-5 py-3 text-center">
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Chưa xử lý
              </p>
              <p className="font-headline-md text-headline-md text-primary">
                {unresolvedCount}
              </p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Báo cáo
              </p>
              <p className="font-headline-md text-headline-md text-error">
                {reportedCount}
              </p>
            </div>
          </Card>
        </div>

        {toastMessage ? (
          <div
            className="flex items-center justify-between border border-primary bg-primary-fixed px-4 py-3 text-on-primary-fixed"
            role="status"
          >
            <span className="font-label-md text-label-md">{toastMessage}</span>
            <button
              className="rounded p-1 text-on-primary-fixed-variant hover:bg-surface"
              onClick={() => setToastMessage(null)}
              type="button"
            >
              <span className="sr-only">Đóng thông báo</span>
              <MaterialIcon name="close" />
            </button>
          </div>
        ) : null}

        <ModeratorFilterToolbar
          filterLabel="Nhóm xử lý"
          filterOptions={moderationOptions}
          filterValue={tabLabelMap[activeTab]}
          onFilterChange={(value) => {
            setActiveTab(tabValueMap[value] ?? "pending");
            setCurrentPage(1);
          }}
          onQueryChange={(value) => {
            setQuery(value);
            setCurrentPage(1);
          }}
          onQueryClear={() => {
            setQuery("");
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
          query={query}
          searchPlaceholder="Tiêu đề, tác giả, cộng đồng, mã bài viết..."
        />

        <Card className="overflow-hidden rounded-lg p-0">
          <Table columns={postColumns} rows={postRows} />
          {filteredPosts.length === 0 ? (
            <EmptyState
              description="Thử đổi nhóm xử lý hoặc xóa nội dung tìm kiếm để xem lại danh sách."
              title="Không có bài viết phù hợp"
            />
          ) : null}
          <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Hiển thị {visiblePosts.length} của {filteredPosts.length} bài viết
            </p>
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </Card>
      </div>
    </ModeratorShell>
  );
}
