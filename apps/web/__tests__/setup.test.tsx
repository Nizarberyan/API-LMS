import { render, screen } from "@testing-library/react";

// Simple smoke test to verify Jest setup
describe("Jest Setup", () => {
  it("should run tests correctly", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have testing-library/jest-dom matchers", () => {
    const div = document.createElement("div");
    div.textContent = "Hello Test";
    document.body.appendChild(div);

    expect(screen.getByText("Hello Test")).toBeInTheDocument();
    document.body.removeChild(div);
  });
});
