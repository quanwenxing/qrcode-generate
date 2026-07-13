import qrcode from "qrcode-generator";

const QR_COLOR = "#050505";
const BLACK = "#050505";
const WHITE = "#ffffff";

export function renderZoomQr(canvas, payload, options = {}) {
  const size = options.size ?? 960;
  const qr = qrcode(0, "H");
  qr.addData(payload);
  qr.make();

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const count = qr.getModuleCount();
  const quietModules = 4;
  const cell = size / (count + quietModules * 2);
  const offset = quietModules * cell;

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, size, size);

  drawDataModules(ctx, qr, count, cell, offset);
  drawFinders(ctx, count, cell, offset);
}

function drawDataModules(ctx, qr, count, cell, offset) {
  ctx.fillStyle = QR_COLOR;

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col) || isFinderZone(row, col, count)) {
        continue;
      }

      ctx.fillRect(offset + col * cell, offset + row * cell, cell, cell);
    }
  }
}

function drawFinders(ctx, count, cell, offset) {
  const positions = [
    [0, 0],
    [count - 7, 0],
    [0, count - 7],
  ];

  for (const [col, row] of positions) {
    const x = offset + col * cell;
    const y = offset + row * cell;
    drawFinder(ctx, x, y, cell);
  }
}

function drawFinder(ctx, x, y, cell) {
  const outer = cell * 7;
  const inset = cell;
  const centerInset = cell * 2;

  ctx.fillStyle = BLACK;
  ctx.fillRect(x, y, outer, outer);

  ctx.fillStyle = WHITE;
  ctx.fillRect(x + inset, y + inset, outer - inset * 2, outer - inset * 2);

  ctx.fillStyle = BLACK;
  ctx.fillRect(
    x + centerInset,
    y + centerInset,
    outer - centerInset * 2,
    outer - centerInset * 2,
  );
}

function isFinderZone(row, col, count) {
  const inTop = row < 7;
  const inLeft = col < 7;
  const inRight = col >= count - 7;
  const inBottom = row >= count - 7;
  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
}
