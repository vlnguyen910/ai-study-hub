import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminSystemSettingsPage from "../src/modules/admin/pages/AdminSystemSettingsPage";

describe("AdminSystemSettingsPage", () => {
  it("makes the settings backend deferral explicit instead of reporting a fake save", () => {
    render(<AdminSystemSettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(
      screen.getByText("Cấu hình hệ thống chưa có API lưu thay đổi."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Đã lưu thay đổi cài đặt."),
    ).not.toBeInTheDocument();
  });
});
