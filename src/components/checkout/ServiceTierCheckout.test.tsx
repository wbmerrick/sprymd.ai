import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ServiceTierCheckout from "./ServiceTierCheckout";

function renderCheckout() {
  return render(
    <MemoryRouter>
      <ServiceTierCheckout />
    </MemoryRouter>,
  );
}

describe("ServiceTierCheckout consent gate", () => {
  it("keeps payment disabled until terms, limitations, and a licensed state are set", () => {
    renderCheckout();
    const pay = screen.getByTestId("pay-button");
    expect(pay).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/cash-pay/i));
    fireEvent.click(screen.getByLabelText(/clinical limitations/i));
    fireEvent.change(screen.getByLabelText(/physically located/i), {
      target: { value: "CA" },
    });

    expect(pay).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(/not licensed in California/i);

    fireEvent.change(screen.getByLabelText(/physically located/i), {
      target: { value: "TN" },
    });
    expect(pay).toBeEnabled();
    expect(screen.getByText(/Licensed state confirmed/i)).toBeInTheDocument();
  });

  it("does not call checkout when consent is incomplete", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    renderCheckout();
    fireEvent.click(screen.getByTestId("pay-button"));
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });
});
