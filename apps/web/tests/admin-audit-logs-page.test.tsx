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
    action: "BAN_USER",
    targetId: "user-to-ban-123",
    ipAddress: "127.0.0.1",
    metadata: { reason: "Spamming" },
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
    action: "APPROVE_DOCUMENT",
    targetId: "doc-123",
    ipAddress: "192.168.1.1",
    metadata: { docTitle: "Introduction to AI" },
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
    expect(screen.getByText("127.0.0.1")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
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
    expect(screen.getByText(/Spamming/)).toBeInTheDocument();
    expect(screen.getByText(/actor-1/)).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: "Đóng" });
    fireEvent.click(closeButtons[0]);

    expect(
      screen.queryByText("Chi tiết nhật ký hoạt động"),
    ).not.toBeInTheDocument();
  });

  it("filters audit logs by actor ID", async () => {
    render(<AdminAuditLogsPage />);

    await screen.findByText("Admin User");

    const actorInput = screen.getByLabelText("ID người thực hiện (Actor ID)");
    fireEvent.change(actorInput, { target: { value: "actor-1" } });

    await waitFor(() => {
      expect(adminApiMock.fetchAuditLogs).toHaveBeenLastCalledWith(
        expect.objectContaining({
          actorId: "actor-1",
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
          startDate: "2026-06-01",
          endDate: "2026-06-30",
        }),
      );
    });

    const resetButton = screen.getByRole("button", { name: "Xóa bộ lọc" });
    fireEvent.click(resetButton);

    expect(fromDateInput).toHaveValue("");
    expect(toDateInput).toHaveValue("");
  });
});
