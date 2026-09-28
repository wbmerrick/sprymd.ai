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
  it("shows the plan chosen on the homepage, preselects the protocol visit, and prefills email", () => {
    renderAt("/checkout?plan=tada-daily&condition=ed&email=qa%40example.com");

    const plan = screen.getByTestId("selected-plan");
    expect(plan).toHaveTextContent("Tadalafil 5mg Daily");
    expect(plan).toHaveTextContent("$79/mo");
    expect(plan).toHaveTextContent(/one-time clinician visit fee/i);
    expect(plan).toHaveTextContent(/do not charge medication automatically/i);
    expect(plan).toHaveTextContent(/Tennessee-licensed clinician approves/i);
    expect(screen.getByRole("link", { name: /back to your options/i })).toHaveAttribute("href", "/?view=plan&condition=ed");

    expect(screen.getByRole("button", { name: /protocol start visit/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /clinician visit/i })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("qa@example.com");
    expect(screen.queryByPlaceholderText(/1234 1234/)).not.toBeInTheDocument();
  });

  it("falls back to the saved selection and uses the basic visit for primary care", () => {
    saveCheckoutSelection({ conditionId: "pcp", treatmentId: "pcp-yearly", answers: {}, email: "pcp@example.com" });
    renderAt("/checkout");

    expect(screen.getByTestId("selected-plan")).toHaveTextContent("Yearly Checkup");
    expect(screen.getByRole("button", { name: /^clinician visit/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByPlaceholderText("you@example.com")).toHaveValue("pcp@example.com");
  });

  it("renders the plain visit picker when nothing was selected", () => {
    renderAt("/checkout?canceled=1");
    expect(screen.queryByTestId("selected-plan")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Nothing was charged/);
    expect(screen.getByRole("button", { name: /^clinician visit/i })).toHaveAttribute("aria-pressed", "true");
  });
});
