import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SoapNoteEditor from "./SoapNoteEditor";
import type { SaveResult, SoapDraft } from "@/lib/clinicalDrafts";

describe("SoapNoteEditor", () => {
  it("autosaves a draft as the provider types", async () => {
    const saveDraft = vi.fn(
      async (draft: SoapDraft): Promise<SaveResult> => ({
        location: "database",
        message: "SOAP draft saved to the chart.",
      }),
    );

    render(
      <SoapNoteEditor
        appointmentId="appt-1"
        saveDelayMs={20}
        saveDraft={saveDraft}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/What the patient reports/i), {
      target: { value: "Reports difficulty for six months." },
    });

    await waitFor(() => expect(saveDraft).toHaveBeenCalled());
    expect(saveDraft.mock.calls[0][0].subjective).toMatch(/six months/);
    expect(saveDraft.mock.calls[0][0].status).toBe("draft");
    expect(screen.getByTestId("soap-save-status")).toHaveTextContent(
      "SOAP draft saved to the chart.",
    );
  });
});
