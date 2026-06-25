import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminAuditLogsPage from "../src/modules/admin/pages/AdminAuditLogsPage";
import { type AuditLog } from "../src/modules/admin/api";

const adminApiMock = vi.hoisted(() => ({
  fetchAuditLogs: vi.fn(),
}));

vi.mock("../src/modules/admin/api", () => ({
  fetchAuditLogs: adminApiMock.fetchAuditLogs,
}));

const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    actorId: "actor-1",
    actor: {
      id: "actor-1",
      name: "Admin User",
      email: "admin@example.com",
    },
    actorRole: "ADMIN",
    action: "BAN_USER",
    targetType: "USER",
    targetId: "user-to-ban-123",
    createdAt: "2026-06-25T12:00:00.000Z",
  },
  {
    id: "log-2",
    actorId: "actor-2",
    actor: {
      id: "actor-2",
      name: "Mod User",
      email: "mod@example.com",
    },
    actorRole: "MODERATOR",
    action: "APPROVE_DOCUMENT",
    targetType: "DOCUMENT",
    targetId: "doc-123",
    createdAt: "2026-06-25T13:00:00.000Z",
  },
];

describe("AdminAuditLogsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApiMock.fetchAuditLogs.mockResolvedValue({
      logs: mockAuditLogs,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
  });

  it("loads and renders fetched logs", async () => {
    render(<AdminAuditLogsPage />);

    expect(
      screen.getByText("Đang tải nhật ký hoạt động..."),
    ).toBeInTheDocument();

    expect(await screen.findByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("Mod User")).toBeInTheDocument();
    expect(screen.getByText("mod@example.com")).toBeInTheDocument();
  });

  it("shows error message if API fails", async () => {
    adminApiMock.fetchAuditLogs.mockRejectedValue(
      new Error("Failed to fetch logs"),
    );
    render(<AdminAuditLogsPage />);

    expect(await screen.findByText("Failed to fetch logs")).toBeInTheDocument();
  });

  it("opens detail dialog when clicking details button", async () => {
    render(<AdminAuditLogsPage />);

    await screen.findByText("Admin User");

    const viewButtons = screen.getAllByRole("button", { name: "Xem chi tiết" });
    fireEvent.click(viewButtons[0]);

    expect(
      await screen.findByText("Chi tiết nhật ký hoạt động"),
    ).toBeInTheDocument();
    expect(screen.getByText(/actor-1/)).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: "Đóng" });
    fireEvent.click(closeButtons[0]);

    expect(
      screen.queryByText("Chi tiết nhật ký hoạt động"),
    ).not.toBeInTheDocument();
  });

  it("filters audit logs by actor name", async () => {
    render(<AdminAuditLogsPage />);

    await screen.findByText("Admin User");

    const actorInput = screen.getByLabelText("Người thực hiện");
    fireEvent.change(actorInput, { target: { value: "Admin" } });

    await waitFor(() => {
      expect(adminApiMock.fetchAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          actorName: "Admin",
        }),
      );
    });
  });

  it("filters audit logs by action select", async () => {
    render(<AdminAuditLogsPage />);

    await screen.findByText("Admin User");

    const trigger = screen.getByRole("button", { name: "Hành động" });
    fireEvent.click(trigger);

    const option = screen.getByRole("option", { name: "Ban người dùng" });
    fireEvent.click(option);

    await waitFor(() => {
      expect(adminApiMock.fetchAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          action: "BAN_USER",
        }),
      );
    });
  });

  it("filters audit logs by target type select", async () => {
    render(<AdminAuditLogsPage />);

    await screen.findByText("Admin User");

    const trigger = screen.getByRole("button", { name: "Loại đối tượng" });
    fireEvent.click(trigger);

    const option = screen.getByRole("option", { name: "Tài liệu" });
    fireEvent.click(option);

    await waitFor(() => {
      expect(adminApiMock.fetchAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          targetType: "DOCUMENT",
        }),
      );
    });
  });

  it("filters audit logs by dates and resets them", async () => {
    render(<AdminAuditLogsPage />);

    await screen.findByText("Admin User");

    const fromDateInput = screen.getByLabelText("Từ ngày");
    const toDateInput = screen.getByLabelText("Đến ngày");

    fireEvent.change(fromDateInput, { target: { value: "2026-06-01" } });
    fireEvent.change(toDateInput, { target: { value: "2026-06-30" } });

    await waitFor(() => {
      expect(adminApiMock.fetchAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: "2026-06-01",
          to: "2026-06-30",
        }),
      );
    });

    const resetButton = screen.getByRole("button", { name: "Xóa bộ lọc" });
    fireEvent.click(resetButton);

    expect(fromDateInput).toHaveValue("");
    expect(toDateInput).toHaveValue("");
  });
});
