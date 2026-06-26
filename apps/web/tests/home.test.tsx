import { render, screen } from "@testing-library/react";
import { beforeEach } from "vitest";
import Home from "../src/app/page";
import { useAuthStore } from "../src/stores/auth/store";

describe("Home page", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it("renders the getting started text", () => {
    render(<Home />);
    expect(screen.getAllByText(/AcademiShare/i)[0]).toBeInTheDocument();
  });

  it("links visitors to login and register pages", () => {
    render(<Home />);

    expect(
      screen.getAllByRole("link", { name: "Đăng nhập" })[0],
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getAllByRole("link", { name: "Bắt đầu miễn phí" })[0],
    ).toHaveAttribute("href", "/register");
  });
});
