import { describe, expect, it, vi } from "vitest";
import { copyCanvasPng, copyText } from "../src/clipboard.js";

describe("copyCanvasPng", () => {
  it("writes the rendered QR as a PNG clipboard item", async () => {
    const image = { type: "image/png" };
    const canvas = {
      toBlob: vi.fn((callback, type) => {
        expect(type).toBe("image/png");
        callback(image);
      }),
    };
    const clipboard = { write: vi.fn() };
    class FakeClipboardItem {
      constructor(items) {
        this.items = items;
      }
    }

    await copyCanvasPng(canvas, {
      clipboard,
      ClipboardItemConstructor: FakeClipboardItem,
    });

    expect(clipboard.write).toHaveBeenCalledWith([
      expect.objectContaining({ items: { "image/png": image } }),
    ]);
  });
});

describe("copyText", () => {
  it("writes the join URL to the clipboard", async () => {
    const clipboard = { writeText: vi.fn() };
    const joinUrl = "https://zoom.us/j/1234567890?pwd=example";

    await copyText(joinUrl, { clipboard });

    expect(clipboard.writeText).toHaveBeenCalledWith(joinUrl);
  });
});
