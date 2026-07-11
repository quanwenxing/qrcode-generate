import "./styles.css";
import { copyCanvasPng } from "./clipboard.js";
import { renderZoomQr } from "./qr-renderer.js";
import { buildZoomJoinUrl } from "./zoom.js";

const DEFAULTS = {
  topic: "定例ミーティング",
  meetingId: "123 456 7890",
  passcode: "",
  joinUrl: "",
};

document.querySelector("#app").innerHTML = `
  <main class="shell">
    <header class="app-header">
      <a class="brand" href="./" aria-label="Zoom qrcode-genarete のホーム">Zoom qrcode-genarete</a>
    </header>

    <section class="workspace" aria-label="Zoom QR generator">
      <form class="controls" id="qr-form">
        <input name="topic" type="hidden" value="${DEFAULTS.topic}" />

        <label class="field-card field-id">
          <span class="field-label">Meeting ID</span>
          <input name="meetingId" inputmode="numeric" value="${DEFAULTS.meetingId}" />
        </label>

        <label class="field-card field-passcode">
          <span class="field-label">Passcode</span>
          <input name="passcode" autocomplete="off" value="${DEFAULTS.passcode}" />
        </label>

        <p class="status" id="status" role="status"></p>
        <div class="bottom-actions">
          <button class="reset-button" type="button" id="reset-button" title="すべての入力をクリア">Clear All</button>
        </div>
      </form>

      <section class="preview" aria-label="Generated QR code">
        <div class="qr-stage">
          <canvas id="qr-canvas" width="960" height="960" aria-label="Zoom meeting QR code"></canvas>
        </div>
        <div class="output-bottom">
          <div class="output-actions">
            <button class="copy-button" type="button" id="copy-button" title="QR画像をコピー"><span class="button-icon" aria-hidden="true">⧉</span><span>QRをコピー</span></button>
            <button class="download-button" type="button" id="download-button" title="PNGを保存"><span class="button-icon" aria-hidden="true">↓</span><span>PNG保存</span></button>
          </div>
        </div>
        <p class="join-url" id="join-url"></p>
      </section>
    </section>
  </main>
`;

const form = document.querySelector("#qr-form");
const canvas = document.querySelector("#qr-canvas");
const status = document.querySelector("#status");
const joinUrlText = document.querySelector("#join-url");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const resetButton = document.querySelector("#reset-button");
let hasGeneratedQr = false;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateQr();
});

form.addEventListener("input", () => {
  updateQr();
});

document.addEventListener("center-logo-ready", () => {
  updateQr();
});

downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = makeFileName(form.elements.topic.value);
  link.href = canvas.toDataURL("image/png");
  link.click();
});

copyButton.addEventListener("click", async () => {
  try {
    if (!hasGeneratedQr) {
      throw new Error("先にミーティング ID を入力してください。");
    }

    await copyCanvasPng(canvas);
    status.textContent = "QR画像をコピーしました。";
    status.dataset.state = "ok";
  } catch (error) {
    status.textContent = error.message || "QR画像をコピーできませんでした。";
    status.dataset.state = "error";
  }
});

resetButton.addEventListener("click", () => {
  form.elements.topic.value = "";
  form.elements.meetingId.value = "";
  form.elements.passcode.value = "";
  updateQr();
});

updateQr();

function updateQr() {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  try {
    const joinUrl = buildZoomJoinUrl(values);
    renderZoomQr(canvas, joinUrl);
    hasGeneratedQr = true;
    joinUrlText.textContent = joinUrl;
    status.textContent = "QR を生成しました。";
    status.dataset.state = "ok";
  } catch (error) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    hasGeneratedQr = false;
    joinUrlText.textContent = "";
    status.textContent = error.message;
    status.dataset.state = "error";
  }
}

function makeFileName(topic) {
  const base = (topic.trim() || "zoom-meeting")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "zoom-meeting"}-qr.png`;
}
