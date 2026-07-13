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
  drawEarthMark(ctx, size, cell);
}

function drawEarthMark(ctx, size, cell) {
  const logoBoxSize = Math.min(cell * 6.5, size * 0.17);
  const boxX = (size - logoBoxSize) / 2;
  const boxY = (size - logoBoxSize) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const globeRadius = logoBoxSize * 0.39;

  ctx.fillStyle = WHITE;
  ctx.fillRect(boxX, boxY, logoBoxSize, logoBoxSize);

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "#2478f3";
  ctx.fillRect(
    centerX - globeRadius,
    centerY - globeRadius,
    globeRadius * 2,
    globeRadius * 2,
  );

  ctx.fillStyle = "#47c96f";
  drawContinent(ctx, centerX, centerY, globeRadius);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = Math.max(1, globeRadius * 0.07);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, globeRadius * 0.46, globeRadius, 0, 0, Math.PI * 2);
  ctx.moveTo(centerX - globeRadius, centerY);
  ctx.lineTo(centerX + globeRadius, centerY);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = "#145fc8";
  ctx.lineWidth = Math.max(1, globeRadius * 0.08);
  ctx.beginPath();
  ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawContinent(ctx, centerX, centerY, radius) {
  ctx.beginPath();
  ctx.moveTo(centerX - radius * 0.78, centerY - radius * 0.5);
  ctx.lineTo(centerX - radius * 0.35, centerY - radius * 0.76);
  ctx.lineTo(centerX - radius * 0.02, centerY - radius * 0.54);
  ctx.lineTo(centerX - radius * 0.18, centerY - radius * 0.22);
  ctx.lineTo(centerX - radius * 0.48, centerY - radius * 0.08);
  ctx.lineTo(centerX - radius * 0.62, centerY + radius * 0.28);
  ctx.lineTo(centerX - radius * 0.9, centerY + radius * 0.08);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX + radius * 0.16, centerY - radius * 0.42);
  ctx.lineTo(centerX + radius * 0.62, centerY - radius * 0.34);
  ctx.lineTo(centerX + radius * 0.82, centerY - radius * 0.04);
  ctx.lineTo(centerX + radius * 0.44, centerY + radius * 0.08);
  ctx.lineTo(centerX + radius * 0.34, centerY + radius * 0.62);
  ctx.lineTo(centerX + radius * 0.02, centerY + radius * 0.38);
  ctx.lineTo(centerX - radius * 0.04, centerY + radius * 0.02);
  ctx.closePath();
  ctx.fill();
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
