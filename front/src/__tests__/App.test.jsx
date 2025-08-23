import { render, screen } from "@testing-library/react";
import App from "../App";
import { describe, it, expect } from "vitest";

describe("App component", () => {
  it("renders Hello from the server", () => {
    render(<App />);
    expect(screen.getByText(/Hello/i)).toBeDefined();
  });
});
