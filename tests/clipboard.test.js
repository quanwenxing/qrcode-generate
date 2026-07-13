import { describe, expect, it, vi } from "vitest";
import { copyCanvasPng, copyText } from "../src/clipboard.js";

describe("copyCanvasPng", () => {
  it("writes the rendered QR as a PNG clipboard item", async () => {
    const image = { type: "image/png" };
    let finishRendering;
    const canvas = {
      toBlob: vi.fn((callback, type) => {
        expect(type).toBe("image/png");
        finishRendering = callback;
      }),
    };
    const clipboard = {
      write: vi.fn(async ([item]) => {
        expect(await item.items["image/png"]).toBe(image);
      }),
    };
    class FakeClipboardItem {
      constructor(items) {
        this.items = items;
      }
    }

    const copying = copyCanvasPng(canvas, {
      clipboard,
      ClipboardItemConstructor: FakeClipboardItem,
    });

    expect(clipboard.write).toHaveBeenCalledOnce();
    finishRendering(image);
    await copying;

    expect(clipboard.write).toHaveBeenCalledWith([
      expect.objectContaining({
        items: { "image/png": expect.any(Promise) },
      }),
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
