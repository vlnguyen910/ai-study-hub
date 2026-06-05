import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home page", () => {
  it("renders the getting started text", () => {
    render(<Home />);
    expect(screen.getByText(/AcademiShare/i)).toBeInTheDocument();
  });
});
