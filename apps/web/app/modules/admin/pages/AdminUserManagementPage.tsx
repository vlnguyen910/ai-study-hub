"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, type TableRow } from "@/components/ui/Table";
import { useMemo, useState } from "react";
import { AdminShell } from "../components/AdminShell";
import {
  AdminCard,
  AdminIconAction,
  AdminSelect,
  MaterialIcon,
} from "../components/AdminPrimitives";
import { mockUsers } from "../mockData";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../types";

const userColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Tên", sortable: true },
  { key: "email", label: "Email" },
  { key: "role", label: "Vai trò" },
  { key: "status", label: "Trạng thái" },
  { key: "lastLogin", label: "Đăng nhập gần nhất" },
  { key: "actions", label: "Thao tác", align: "center" as const },
] as const;

const roleLabels: Record<AdminUserRole, string> = {
  admin: "Quản trị viên",
  moderator: "Kiểm duyệt viên",
  user: "Người dùng",
  guest: "Khách",
};

const statusLabels: Record<AdminUserStatus, string> = {
  active: "Đang hoạt động",
  inactive: "Không hoạt động",
  suspended: "Tạm khóa",
};

const statusTone: Record<
  AdminUserStatus,
  "success" | "warning" | "error" | "neutral"
> = {
  active: "success",
  inactive: "neutral",
  suspended: "error",
};

interface UserDraft {
  readonly name: string;
  readonly email: string;
  readonly role: AdminUserRole;
  readonly status: AdminUserStatus;
}

const emptyDraft: UserDraft = {
  name: "",
  email: "",
  role: "user",
  status: "active",
};

const pageSize = 6;

const roleOptions = [
  { label: "Tất cả vai trò", value: "all" },
  { label: "Quản trị viên", value: "admin" },
  { label: "Kiểm duyệt viên", value: "moderator" },
  { label: "Người dùng", value: "user" },
  { label: "Khách", value: "guest" },
] as const;

const editableRoleOptions: readonly {
  readonly label: string;
  readonly value: AdminUserRole;
}[] = [
  { label: "Quản trị viên", value: "admin" },
  { label: "Kiểm duyệt viên", value: "moderator" },
  { label: "Người dùng", value: "user" },
  { label: "Khách", value: "guest" },
];

const statusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Không hoạt động", value: "inactive" },
  { label: "Tạm khóa", value: "suspended" },
] as const;

const editableStatusOptions: readonly {
  readonly label: string;
  readonly value: AdminUserStatus;
}[] = [
  { label: "Đang hoạt động", value: "active" },
  { label: "Không hoạt động", value: "inactive" },
  { label: "Tạm khóa", value: "suspended" },
];

export default function AdminUserManagementPage(): React.JSX.Element {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        user.id.toLowerCase().includes(normalizedQuery) ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setDraft(emptyDraft);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setFormOpen(true);
  };

  const handleSaveUser = () => {
    if (!draft.name.trim() || !draft.email.trim()) {
      return;
    }

    if (editingUser) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: draft.name.trim(),
                email: draft.email.trim(),
                role: draft.role,
                status: draft.status,
              }
            : user,
        ),
      );
      setEditingUser(null);
      setFormOpen(false);
      return;
    }

    const nextNumber =
      Math.max(
        ...users.map((user) => Number(user.id.replace("USR-", ""))),
        1000,
      ) + 1;

    setUsers((current) => [
      {
        id: `USR-${nextNumber}`,
        name: draft.name.trim(),
        email: draft.email.trim(),
        role: draft.role,
        status: draft.status,
        createdAt: "26/05/2026",
        lastLogin: "Chưa đăng nhập",
      },
      ...current,
    ]);
    setDraft(emptyDraft);
    setFormOpen(false);
    setCurrentPage(1);
  };

  const handleDeactivateUser = (user: AdminUser) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: item.status === "inactive" ? "active" : "inactive",
            }
          : item,
      ),
    );
  };

  const rows: TableRow[] = visibleUsers.map((user) => ({
    id: user.id,
    cells: [
      <span
        className="font-label-sm text-label-sm text-on-surface-variant tracking-normal"
        key="id"
      >
        {user.id}
      </span>,
      <div className="min-w-40" key="name">
        <p className="font-label-md text-label-md text-on-surface tracking-normal">
          {user.name}
        </p>
        <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
          Tạo ngày {user.createdAt}
        </p>
      </div>,
      <span
        className="font-body-md text-sm text-on-surface-variant"
        key="email"
      >
        {user.email}
      </span>,
      <Badge key="role" tone={user.role === "admin" ? "warning" : "neutral"}>
        {roleLabels[user.role]}
      </Badge>,
      <Badge key="status" tone={statusTone[user.status]}>
        {statusLabels[user.status]}
      </Badge>,
      <span
        className="font-label-sm text-label-sm text-on-surface-variant tracking-normal"
        key="lastLogin"
      >
        {user.lastLogin}
      </span>,
      <div className="flex justify-center gap-1" key="actions">
        <AdminIconAction
          icon="visibility"
          label={`Xem ${user.name}`}
          onClick={() => setViewUser(user)}
        />
        <AdminIconAction
          icon="edit"
          label={`Sửa ${user.name}`}
          onClick={() => handleOpenEdit(user)}
          tone="primary"
        />
        <AdminIconAction
          icon={user.status === "inactive" ? "toggle_on" : "block"}
          label={
            user.status === "inactive"
              ? `Kích hoạt ${user.name}`
              : `Ngưng kích hoạt ${user.name}`
          }
          onClick={() => handleDeactivateUser(user)}
          tone="tertiary"
        />
        <AdminIconAction
          icon="delete"
          label={`Xóa ${user.name}`}
          onClick={() => setDeleteUser(user)}
          tone="error"
        />
      </div>,
    ],
  }));

  return (
    <AdminShell
      activeSection="users"
      searchPlaceholder="Tìm kiếm người dùng theo tên, email hoặc ID..."
    >
      <div className="relative">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-on-surface">
              Quản lý người dùng
            </h1>
            <p className="mt-2 max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Tìm kiếm, lọc trạng thái và thao tác nhanh với tài khoản hệ thống.
            </p>
          </div>
          <Button
            className="inline-flex items-center justify-center gap-2 self-start rounded"
            onClick={handleOpenAdd}
          >
            <MaterialIcon className="text-[18px]" name="person_add" />
            Thêm người dùng
          </Button>
        </div>

        <AdminCard className="mb-6 w-full max-w-[calc(100vw-32px)] p-4 lg:max-w-none">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_180px] lg:items-end">
            <SearchInput
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              onClear={() => {
                setQuery("");
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm người dùng..."
              value={query}
            />
            <AdminSelect
              label="Vai trò"
              onChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1);
              }}
              options={roleOptions}
              value={roleFilter}
            />
            <AdminSelect
              label="Trạng thái"
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={statusOptions}
              value={statusFilter}
            />
          </div>
        </AdminCard>

        <AdminCard className="w-full max-w-[calc(100vw-32px)] overflow-hidden lg:max-w-none">
          <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-label-md text-label-md text-on-surface tracking-normal">
                Danh sách người dùng
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
                {filteredUsers.length} kết quả · {users.length} tài khoản
              </p>
            </div>
            <Badge tone="neutral">
              Trang {currentPage}/{totalPages}
            </Badge>
          </div>
          <Table columns={userColumns} rows={rows} />
          <div className="flex flex-col gap-3 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              Hiển thị {visibleUsers.length} trên {filteredUsers.length} người
              dùng.
            </p>
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </AdminCard>

        {formOpen ? (
          <UserFormDialog
            draft={draft}
            editingUser={editingUser}
            onCancel={() => {
              setFormOpen(false);
              setEditingUser(null);
              setDraft(emptyDraft);
            }}
            onChange={setDraft}
            onSave={handleSaveUser}
          />
        ) : null}

        {viewUser ? (
          <UserDetailDialog onClose={() => setViewUser(null)} user={viewUser} />
        ) : null}

        <AdminConfirmDialog
          confirmLabel="Xóa"
          description={
            deleteUser
              ? `Tài khoản ${deleteUser.name} sẽ bị xóa khỏi danh sách.`
              : ""
          }
          onCancel={() => setDeleteUser(null)}
          onConfirm={() => {
            if (deleteUser) {
              setUsers((current) =>
                current.filter((user) => user.id !== deleteUser.id),
              );
              setDeleteUser(null);
            }
          }}
          open={deleteUser !== null}
          title="Xóa người dùng"
        />
      </div>
    </AdminShell>
  );
}

function UserFormDialog({
  draft,
  editingUser,
  onCancel,
  onChange,
  onSave,
}: {
  readonly draft: UserDraft;
  readonly editingUser: AdminUser | null;
  readonly onCancel: () => void;
  readonly onChange: (draft: UserDraft) => void;
  readonly onSave: () => void;
}): React.JSX.Element {
  const canSave = draft.name.trim().length > 0 && draft.email.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/35 px-4 py-8">
      <button
        aria-label="Đóng form người dùng"
        className="absolute inset-0"
        onClick={onCancel}
        type="button"
      />
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-on-surface">
              {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              {editingUser?.id ?? "Tài khoản mới"}
            </p>
          </div>
          <button
            aria-label="Đóng"
            className="rounded p-2 text-on-surface-variant hover:bg-surface-container-high"
            onClick={onCancel}
            type="button"
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Tên người dùng"
            onChange={(event) =>
              onChange({ ...draft, name: event.target.value })
            }
            placeholder="Nhập họ và tên"
            required
            value={draft.name}
          />
          <InputField
            label="Email đăng nhập"
            onChange={(event) =>
              onChange({ ...draft, email: event.target.value })
            }
            placeholder="Nhập địa chỉ email"
            required
            type="email"
            value={draft.email}
          />
          <AdminSelect
            label="Vai trò tài khoản"
            onChange={(value) => onChange({ ...draft, role: value })}
            options={editableRoleOptions}
            value={draft.role}
          />
          <AdminSelect
            label="Trạng thái tài khoản"
            onChange={(value) => onChange({ ...draft, status: value })}
            options={editableStatusOptions}
            value={draft.status}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-outline-variant pt-4">
          <Button onClick={onCancel} variant="ghost">
            Hủy
          </Button>
          <Button disabled={!canSave} onClick={onSave}>
            {editingUser ? "Lưu thay đổi" : "Tạo người dùng"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserDetailDialog({
  user,
  onClose,
}: {
  readonly user: AdminUser;
  readonly onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/35 px-4 py-8">
      <button
        aria-label="Đóng chi tiết người dùng"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-on-surface">
              {user.name}
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
              {user.id} · {user.email}
            </p>
          </div>
          <button
            aria-label="Đóng"
            className="rounded p-2 text-on-surface-variant hover:bg-surface-container-high"
            onClick={onClose}
            type="button"
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem label="Vai trò" value={roleLabels[user.role]} />
          <DetailItem label="Trạng thái" value={statusLabels[user.status]} />
          <DetailItem label="Ngày tạo" value={user.createdAt} />
          <DetailItem label="Đăng nhập gần nhất" value={user.lastLogin} />
        </div>
      </div>
    </div>
  );
}

function AdminConfirmDialog({
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  open,
  title,
}: {
  readonly confirmLabel: string;
  readonly description: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly open: boolean;
  readonly title: string;
}): React.JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-inverse-surface/35 px-4 py-8">
      <button
        aria-label="Đóng hộp thoại xác nhận"
        className="absolute inset-0"
        onClick={onCancel}
        type="button"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-6 flex items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded bg-error-container text-error">
            <MaterialIcon name="warning" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-on-surface">
              {title}
            </h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              {description}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
          <Button onClick={onCancel} variant="ghost">
            Hủy
          </Button>
          <button
            className="rounded bg-error px-6 py-2 font-label-md text-label-md text-on-error transition-opacity hover:opacity-90"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): React.JSX.Element {
  return (
    <div className="rounded border border-outline-variant bg-surface-container-low p-4">
      <p className="font-label-sm text-label-sm text-on-surface-variant tracking-normal">
        {label}
      </p>
      <p className="mt-1 font-label-md text-label-md text-on-surface tracking-normal">
        {value}
      </p>
    </div>
  );
}
