export async function copyCanvasPng(canvas, options = {}) {
  const clipboard = options.clipboard ?? navigator.clipboard;
  const ClipboardItemConstructor =
    options.ClipboardItemConstructor ??
    (typeof ClipboardItem === "undefined" ? undefined : ClipboardItem);

  if (!clipboard?.write || !ClipboardItemConstructor) {
    throw new Error("このブラウザではQR画像をコピーできません。");
  }

  const image = await canvasToPng(canvas);
  await clipboard.write([
    new ClipboardItemConstructor({ "image/png": image }),
  ]);
}

export async function copyText(text, options = {}) {
  const clipboard = options.clipboard ?? navigator.clipboard;

  if (!clipboard?.writeText) {
    throw new Error("このブラウザではURLをコピーできません。");
  }

  await clipboard.writeText(text);
}

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("QR画像を作成できませんでした。"));
    }, "image/png");
  });
}
