import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ConsultationRoom from "./ConsultationRoom";
import type { SessionDurationLog } from "@/lib/clinicalDrafts";
import type { LiveJoinResult } from "@/lib/liveVideo";

const previewOnly = async (): Promise<LiveJoinResult> => ({
  fallbackReason: "Live video is not configured on the server.",
});

describe("ConsultationRoom", () => {
  it("starts the timer only after both parties join and logs duration on leave", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T12:00:00.000Z"));
    const onLogDuration = vi.fn(async (_entry: SessionDurationLog) => ({
      location: "database" as const,
      message: "Session duration saved to the visit record.",
    }));

    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ kind: "audio", enabled: true, stop: vi.fn() }, { kind: "video", enabled: true, stop: vi.fn() }],
        }),
      },
    });

    const view = render(
      <MemoryRouter>
        <ConsultationRoom
          appointmentId="appt-1"
          role="patient"
          displayName="Alex"
          remoteJoined={false}
          connectLive={previewOnly}
          onLogDuration={onLogDuration}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("session-timer")).toHaveTextContent("00:00");
    fireEvent.click(screen.getByTestId("join-visit"));
    fireEvent.click(screen.getByTestId("leave-visit"));
    expect(onLogDuration).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/both parties/i);

    view.unmount();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("logs the elapsed time when the other party is already present", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T12:00:00.000Z"));
    const logs: SessionDurationLog[] = [];

    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [],
        }),
      },
    });

    render(
      <MemoryRouter>
        <ConsultationRoom
          appointmentId="appt-2"
          role="provider"
          displayName="Dr. Lee"
          remoteJoined
          connectLive={previewOnly}
          onLogDuration={async (entry) => {
            logs.push(entry);
            return { location: "device", message: "Session duration saved on this device." };
          }}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("join-visit"));
    await vi.advanceTimersByTimeAsync(0);
    vi.setSystemTime(new Date("2026-09-21T12:00:05.000Z"));
    fireEvent.click(screen.getByTestId("mic-toggle"));
    expect(screen.getByTestId("mic-toggle")).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByTestId("camera-toggle"));
    expect(screen.getByTestId("camera-toggle")).toHaveAttribute("aria-pressed", "false");

    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "I can hear you." } });
    fireEvent.click(screen.getByTestId("chat-send"));
    expect(screen.getByTestId("chat-log")).toHaveTextContent("I can hear you.");

    fireEvent.click(screen.getByTestId("leave-visit"));
    await vi.waitFor(() => {
      expect(logs[0]?.durationSeconds).toBe(5);
      expect(screen.getByRole("status")).toHaveTextContent(/saved on this device/i);
    });

    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});
