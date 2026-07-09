import qrcode from "qrcode-generator";
import centerLogoUrl from "../assets/nplus-logo.png";

const QR_COLOR = "#2378ff";
const BLACK = "#050505";
const WHITE = "#ffffff";

const centerLogo = new Image();
centerLogo.src = centerLogoUrl;
centerLogo.addEventListener("load", () => {
  document.dispatchEvent(new CustomEvent("center-logo-ready"));
});

export function renderZoomQr(canvas, payload, options = {}) {
  const size = options.size ?? 960;
  const qr = qrcode(0, "H");
  qr.addData(payload);
  qr.make();

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const count = qr.getModuleCount();
  const quietModules = 2;
  const cell = size / (count + quietModules * 2);
  const offset = quietModules * cell;

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, size, size);

  drawDataModules(ctx, qr, count, cell, offset);
  drawFinders(ctx, count, cell, offset);
  drawCenterMark(ctx, size);
}

function drawDataModules(ctx, qr, count, cell, offset) {
  ctx.fillStyle = QR_COLOR;
  const pad = cell * 0.03;
  const radius = cell * 0.26;

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col) || isFinderZone(row, col, count)) {
        continue;
      }

      const x = offset + col * cell + pad;
      const y = offset + row * cell + pad;
      roundedRect(ctx, x, y, cell - pad * 2, cell - pad * 2, radius);
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
  const inset = cell * 1.2;
  const centerInset = cell * 2.35;

  ctx.fillStyle = BLACK;
  roundedRect(ctx, x, y, outer, outer, cell * 1.85);

  ctx.fillStyle = WHITE;
  roundedRect(ctx, x + inset, y + inset, outer - inset * 2, outer - inset * 2, cell * 1.1);

  ctx.fillStyle = BLACK;
  roundedRect(
    ctx,
    x + centerInset,
    y + centerInset,
    outer - centerInset * 2,
    outer - centerInset * 2,
    cell * 0.72,
  );
}

function drawCenterMark(ctx, size) {
  if (!centerLogo.complete || centerLogo.naturalWidth === 0) {
    return;
  }

  const cx = size / 2;
  const cy = size / 2;
  const clearWidth = size * 0.27;
  const clearHeight = size * 0.14;
  const clearGradient = ctx.createLinearGradient(
    cx - clearWidth / 2,
    cy,
    cx + clearWidth / 2,
    cy,
  );
  clearGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  clearGradient.addColorStop(0.25, "rgba(255, 255, 255, 0.94)");
  clearGradient.addColorStop(0.76, "rgba(255, 255, 255, 0.92)");
  clearGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = clearGradient;
  ctx.beginPath();
  ctx.ellipse(cx, cy, clearWidth / 2, clearHeight / 2, -0.12, 0, Math.PI * 2);
  ctx.fill();

  const width = size * 0.29;
  const height = width * (centerLogo.naturalHeight / centerLogo.naturalWidth);
  ctx.drawImage(centerLogo, (size - width) / 2, (size - height) / 2, width, height);
}

function isFinderZone(row, col, count) {
  const inTop = row < 9;
  const inLeft = col < 9;
  const inRight = col >= count - 8;
  const inBottom = row >= count - 8;
  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
  ctx.fill();
}
