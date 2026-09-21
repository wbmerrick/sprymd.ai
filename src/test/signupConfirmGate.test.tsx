import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EMAIL_CONFIRM_NOTICE, resolveSignupNavigation } from "../lib/signupConfirmGate";

vi.mock("../lib/customerAccounts", () => ({
  signUpCustomer: vi.fn(),
  signInCustomer: vi.fn(),
  signOutCustomer: vi.fn(),
  restoreCustomerSession: vi.fn(),
  updateCustomerProfile: vi.fn(),
  addCustomerOrder: vi.fn(),
  addCustomerProtocol: vi.fn(),
}));

import { signUpCustomer } from "../lib/customerAccounts";
import { SignIn } from "../SpryApp.jsx";

const signUp = vi.mocked(signUpCustomer);

function fillSignup() {
  fireEvent.click(screen.getByRole("button", { name: /create an account/i }));
  fireEvent.change(screen.getByPlaceholderText("William B Merrick"), { target: { value: "Ada Lovelace" } });
  const dob = document.querySelector('input[type="date"]');
  if (!dob) throw new Error("date of birth field missing");
  fireEvent.change(dob, { target: { value: "1990-01-01" } });
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "ada@example.com" } });
  fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: "password1" } });
  fireEvent.click(screen.getByRole("button", { name: /create account & continue/i }));
}

describe("resolveSignupNavigation", () => {
  it("stays on sign-in when email confirmation is required", () => {
    expect(resolveSignupNavigation({ needsEmailConfirm: true, returnTo: "refills" })).toEqual({
      leaveSignIn: false,
      notice: EMAIL_CONFIRM_NOTICE,
      continueTo: "refills",
    });
  });

  it("leaves sign-in immediately when the account is already confirmed", () => {
    expect(resolveSignupNavigation({ needsEmailConfirm: false })).toEqual({
      leaveSignIn: true,
      notice: "",
      continueTo: "account",
    });
  });
});

describe("SignIn email confirmation", () => {
  beforeEach(() => {
    signUp.mockReset();
  });

  it("shows the check-email notice and does not navigate until the customer continues", async () => {
    signUp.mockResolvedValue({
      profile: { email: "ada@example.com", name: "Ada Lovelace", dob: "1990-01-01" },
      needsEmailConfirm: true,
    });
    const go = vi.fn();
    render(<SignIn go={go} returnTo="account" onAuthSuccess={vi.fn()} />);
    fillSignup();

    expect(await screen.findByText(EMAIL_CONFIRM_NOTICE)).toBeInTheDocument();
    expect(go).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /continue to my account/i }));
    expect(go).toHaveBeenCalledTimes(1);
    expect(go).toHaveBeenCalledWith("account", { justLoggedIn: true });
  });

  it("still navigates immediately when confirmation is not required", async () => {
    signUp.mockResolvedValue({
      profile: { email: "ada@example.com", name: "Ada Lovelace", dob: "1990-01-01" },
      needsEmailConfirm: false,
    });
    const go = vi.fn();
    render(<SignIn go={go} returnTo="dashboard" onAuthSuccess={vi.fn()} />);
    fillSignup();
    await waitFor(() => expect(go).toHaveBeenCalledWith("dashboard", { justLoggedIn: true }));
    expect(screen.queryByText(EMAIL_CONFIRM_NOTICE)).not.toBeInTheDocument();
  });
});
