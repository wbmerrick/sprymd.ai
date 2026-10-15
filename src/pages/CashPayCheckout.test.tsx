import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import CashPayCheckout from "./CashPayCheckout";
import { saveCheckoutSelection } from "@/lib/intakeFlow";

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/checkout" element={<CashPayCheckout />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => window.sessionStorage.clear());

describe("CashPayCheckout funnel handoff", () => {
  it("shows the plan chosen on the homepage and the $100 evaluation product", () => {
    renderAt("/checkout?plan=tada-daily&condition=ed&email=qa%40example.com");

    const plan = screen.getByTestId("selected-plan");
    expect(plan).toHaveTextContent("Tadalafil 5mg Daily");
    expect(plan).toHaveTextContent("$79/mo");
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("qa@example.com");
    expect(screen.queryByPlaceholderText(/1234 1234/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /physician glp-1 evaluation/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText(/\$100 physician evaluation/i).length).toBeGreaterThan(0);
  });

  it("falls back to the saved selection for primary care", () => {
    saveCheckoutSelection({
      conditionId: "pcp",
      treatmentId: "pcp-yearly",
      answers: {},
      email: "pcp@example.com",
    });
    renderAt("/checkout");

    expect(screen.getByTestId("selected-plan")).toHaveTextContent("Yearly Checkup");
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("pcp@example.com");
    expect(
      screen.getByRole("button", { name: /physician glp-1 evaluation/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("renders the evaluation picker when nothing was selected", () => {
    renderAt("/checkout?canceled=1");
    expect(screen.queryByTestId("selected-plan")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Nothing was charged/);
    expect(
      screen.getByRole("button", { name: /physician glp-1 evaluation/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
