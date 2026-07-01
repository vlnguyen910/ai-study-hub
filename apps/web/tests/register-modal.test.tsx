import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterModal from "../src/components/auth/RegisterModal";
import { apiClient } from "../src/lib/axios";
import { navigationMocks } from "./setup";

const apiClientMock = vi.mocked(apiClient);

vi.mock("../src/lib/axios", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe("RegisterModal", () => {
  const onClose = vi.fn();
  const onOpenLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    navigationMocks.router.replace.mockClear();
    apiClientMock.post.mockResolvedValue({ data: null });
  });

  it("registers without sending deviceId and redirects to login", async () => {
    render(
      <RegisterModal isOpen onClose={onClose} onOpenLogin={onOpenLogin} />,
    );

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Nguyen Student" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }));

    await waitFor(() => {
      expect(apiClientMock.post).toHaveBeenCalledWith(
        "/api/v1/auth/signup",
        expect.objectContaining({
          name: "Nguyen Student",
          email: "student@example.com",
          password: "Password123!",
        }),
      );
      expect(apiClientMock.post.mock.calls[0][1]).not.toHaveProperty(
        "deviceId",
      );
      expect(navigationMocks.router.replace).toHaveBeenCalledWith("/login");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
