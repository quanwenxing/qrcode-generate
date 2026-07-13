import { rename } from "node:fs/promises";

const outputDirectory = new URL("../offline/", import.meta.url);

await rename(
  new URL("index.html", outputDirectory),
  new URL("Zoom-QR-Generator.html", outputDirectory),
);
