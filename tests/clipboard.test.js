import { describe, expect, it, vi } from "vitest";
import { copyCanvasPng } from "../src/clipboard.js";

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
