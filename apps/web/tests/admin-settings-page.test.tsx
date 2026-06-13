import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminSystemSettingsPage from "../src/modules/admin/pages/AdminSystemSettingsPage";

describe("AdminSystemSettingsPage", () => {
  it("renders the settings page without throwing", () => {
    render(<AdminSystemSettingsPage />);

    expect(screen.getByText("Cài đặt hệ thống")).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: "Lưu thay đổi" });
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);
  });
});
