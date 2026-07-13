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
  drawDinosaurMark(ctx, size, cell);
}

function drawDinosaurMark(ctx, size, cell) {
  const logoBoxSize = Math.min(cell * 6.5, size * 0.17);
  const boxX = (size - logoBoxSize) / 2;
  const boxY = (size - logoBoxSize) / 2;

  ctx.fillStyle = WHITE;
  ctx.fillRect(boxX, boxY, logoBoxSize, logoBoxSize);

  const dinosaur = [
    "000011110",
    "000111101",
    "000111111",
    "000111000",
    "101111000",
    "111111000",
    "011110000",
    "001010000",
    "001001000",
  ];
  const pixel = logoBoxSize / 11;
  const startX = boxX + pixel;
  const startY = boxY + pixel;

  ctx.fillStyle = BLACK;
  dinosaur.forEach((row, rowIndex) => {
    [...row].forEach((value, columnIndex) => {
      if (value === "1") {
        ctx.fillRect(
          startX + columnIndex * pixel,
          startY + rowIndex * pixel,
          pixel,
          pixel,
        );
      }
    });
  });
}

function drawDataModules(ctx, qr, count, cell, offset) {
  ctx.fillStyle = QR_COLOR;

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col) || isFinderZone(row, col, count)) {
        continue;
      }

      const inset = cell * 0.025;
      drawRoundedRect(
        ctx,
        offset + col * cell + inset,
        offset + row * cell + inset,
        cell - inset * 2,
        cell - inset * 2,
        cell * 0.18,
      );
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
  drawRoundedRect(ctx, x, y, outer, outer, cell * 1.25);

  ctx.fillStyle = WHITE;
  drawRoundedRect(
    ctx,
    x + inset,
    y + inset,
    outer - inset * 2,
    outer - inset * 2,
    cell * 0.75,
  );

  ctx.fillStyle = BLACK;
  drawRoundedRect(
    ctx,
    x + centerInset,
    y + centerInset,
    outer - centerInset * 2,
    outer - centerInset * 2,
    cell * 0.45,
  );
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, safeRadius);
  ctx.fill();
}

function isFinderZone(row, col, count) {
  const inTop = row < 7;
  const inLeft = col < 7;
  const inRight = col >= count - 7;
  const inBottom = row >= count - 7;
  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
}
