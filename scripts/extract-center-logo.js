import { createReadStream, createWriteStream } from "node:fs";
import { PNG } from "pngjs";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/extract-center-logo.js <input> <output>");
}

const crop = {
  x: 94,
  y: 113,
  width: 96,
  height: 54,
};

createReadStream(inputPath)
  .pipe(new PNG())
  .on("parsed", function parsed() {
    const out = new PNG({ width: crop.width, height: crop.height });

    for (let y = 0; y < crop.height; y += 1) {
      for (let x = 0; x < crop.width; x += 1) {
        const srcIdx = ((crop.y + y) * this.width + crop.x + x) << 2;
        const destIdx = (y * crop.width + x) << 2;
        const r = this.data[srcIdx];
        const g = this.data[srcIdx + 1];
        const b = this.data[srcIdx + 2];
        const a = this.data[srcIdx + 3];

        if (y < 10 || isQrBlue(r, g, b) || isEdgeQrBlue(x, y, r, g, b)) {
          out.data[destIdx] = 255;
          out.data[destIdx + 1] = 255;
          out.data[destIdx + 2] = 255;
          out.data[destIdx + 3] = 0;
          continue;
        }

        if (isWhiteBackground(r, g, b)) {
          out.data[destIdx] = 255;
          out.data[destIdx + 1] = 255;
          out.data[destIdx + 2] = 255;
          out.data[destIdx + 3] = 0;
          continue;
        }

        out.data[destIdx] = r;
        out.data[destIdx + 1] = g;
        out.data[destIdx + 2] = b;
        out.data[destIdx + 3] = a;
      }
    }

    out.pack().pipe(createWriteStream(outputPath));
  });

function isQrBlue(r, g, b) {
  return r < 70 && g > 80 && g < 160 && b > 210;
}

function isEdgeQrBlue(x, y, r, g, b) {
  const nearEdge = y < 9 || y > crop.height - 8 || x < 4 || x > crop.width - 5;
  return nearEdge && r < 190 && g < 220 && b > 160;
}

function isWhiteBackground(r, g, b) {
  return r > 248 && g > 248 && b > 248;
}
