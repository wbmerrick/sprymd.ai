import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IntakeQuestionnaire from "./IntakeQuestionnaire";
import type { IntakeDraft, SaveResult } from "@/lib/clinicalDrafts";

describe("IntakeQuestionnaire", () => {
  it("shows the ED follow-up only after that complaint is selected and autosaves", async () => {
    const saveDraft = vi.fn(
      async (_draft: IntakeDraft): Promise<SaveResult> => ({
        location: "database",
        message: "Draft saved to the chart.",
      }),
    );

    render(<IntakeQuestionnaire saveDelayMs={20} saveDraft={saveDraft} />);

    expect(screen.queryByText(/nitrates/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Erectile dysfunction" }));

    expect(await screen.findByText(/nitrates/i)).toBeInTheDocument();

    await waitFor(() => expect(saveDraft).toHaveBeenCalled());
    expect(screen.getByTestId("intake-save-status")).toHaveTextContent(
      "Draft saved to the chart.",
    );
  });
});
