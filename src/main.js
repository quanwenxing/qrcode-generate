import "./styles.css";
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
      <a class="brand" href="./" aria-label="Zoom Linker のホーム">Zoom Linker</a>
      <span class="status-dot" title="ローカルで動作中" aria-label="ローカルで動作中"></span>
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
      </form>

      <section class="preview" aria-label="Generated QR code">
        <div class="qr-stage">
          <canvas id="qr-canvas" width="960" height="960" aria-label="Zoom meeting QR code"></canvas>
        </div>
        <div class="output-bottom">
          <div class="output-actions">
            <button class="copy-button" type="button" id="copy-button" title="参加URLをコピー" aria-label="参加URLをコピー"><span aria-hidden="true">⧉</span></button>
            <button class="download-button" type="button" id="download-button" title="PNGを保存" aria-label="PNGを保存"><span aria-hidden="true">↓</span></button>
          </div>
        </div>
        <p class="join-url" id="join-url"></p>
      </section>
    </section>
    <footer class="bottom-actions">
      <button class="reset-button" type="button" id="reset-button" title="すべての入力をリセット">Clear All <span aria-hidden="true">↗</span></button>
    </footer>
  </main>
`;

const form = document.querySelector("#qr-form");
const canvas = document.querySelector("#qr-canvas");
const status = document.querySelector("#status");
const joinUrlText = document.querySelector("#join-url");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const resetButton = document.querySelector("#reset-button");

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
    const values = Object.fromEntries(new FormData(form).entries());
    const joinUrl = buildZoomJoinUrl(values);
    if (!navigator.clipboard?.writeText) {
      throw new Error("このブラウザではクリップボードにコピーできません。");
    }
    await navigator.clipboard.writeText(joinUrl);
    status.textContent = "参加URLをコピーしました。";
    status.dataset.state = "ok";
  } catch (error) {
    status.textContent = error.message || "参加URLをコピーできませんでした。";
    status.dataset.state = "error";
  }
});

resetButton.addEventListener("click", () => {
  form.elements.topic.value = DEFAULTS.topic;
  form.elements.meetingId.value = DEFAULTS.meetingId;
  form.elements.passcode.value = DEFAULTS.passcode;
  updateQr();
});

updateQr();

function updateQr() {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  try {
    const joinUrl = buildZoomJoinUrl(values);
    renderZoomQr(canvas, joinUrl);
    joinUrlText.textContent = joinUrl;
    status.textContent = "QR を生成しました。";
    status.dataset.state = "ok";
  } catch (error) {
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
