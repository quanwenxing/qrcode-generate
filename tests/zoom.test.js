import { describe, expect, it } from "vitest";
import { buildZoomJoinUrl, normalizeMeetingId } from "../src/zoom.js";

describe("normalizeMeetingId", () => {
  it("keeps only digits", () => {
    expect(normalizeMeetingId("123 456-7890")).toBe("1234567890");
  });
});

describe("buildZoomJoinUrl", () => {
  it("uses a pasted Zoom join URL first", () => {
    expect(
      buildZoomJoinUrl({
        joinUrl: "zoom.us/j/1234567890?pwd=abc",
        meetingId: "",
        passcode: "",
      }),
    ).toBe("https://zoom.us/j/1234567890?pwd=abc");
  });

  it("builds a URL from meeting ID and passcode", () => {
    expect(
      buildZoomJoinUrl({
        joinUrl: "",
        meetingId: "123 456 7890",
        passcode: "secret",
      }),
    ).toBe("https://zoom.us/j/1234567890?pwd=secret");
  });

  it("does not require a join URL", () => {
    expect(
      buildZoomJoinUrl({
        meetingId: "123 456 7890",
        passcode: "",
      }),
    ).toBe("https://zoom.us/j/1234567890");
  });

  it("rejects an invalid meeting ID length", () => {
    expect(() =>
      buildZoomJoinUrl({
        meetingId: "12345678",
        passcode: "",
      }),
    ).toThrow("9〜11桁");
  });

  it("rejects non-numeric meeting ID characters", () => {
    expect(() =>
      buildZoomJoinUrl({
        meetingId: "123 ABC 7890",
        passcode: "",
      }),
    ).toThrow("数字");
  });

  it("rejects non-Zoom URLs", () => {
    expect(() =>
      buildZoomJoinUrl({
        joinUrl: "https://example.com/j/123",
        meetingId: "",
        passcode: "",
      }),
    ).toThrow("Zoom");
  });
});
