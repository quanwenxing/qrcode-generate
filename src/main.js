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
    <section class="workspace" aria-label="Zoom QR generator">
      <form class="panel controls" id="qr-form">
        <div class="brand-row">
          <div>
            <p class="eyebrow">Zoom QR</p>
            <h1>接続用 QR コード生成</h1>
          </div>
          <button class="icon-button" type="button" id="reset-button" title="入力をリセット" aria-label="入力をリセット">
            <span aria-hidden="true">↺</span>
          </button>
        </div>

        <label>
          <span>会議名</span>
          <input name="topic" autocomplete="off" value="${DEFAULTS.topic}" />
        </label>

        <label>
          <span>Zoom 参加 URL</span>
          <textarea name="joinUrl" rows="3" placeholder="https://zoom.us/j/..."></textarea>
        </label>

        <div class="field-grid">
          <label>
            <span>ミーティング ID</span>
            <input name="meetingId" inputmode="numeric" value="${DEFAULTS.meetingId}" />
          </label>
          <label>
            <span>パスコード</span>
            <input name="passcode" autocomplete="off" value="${DEFAULTS.passcode}" />
          </label>
        </div>

        <div class="actions">
          <button class="primary" type="submit">QR を更新</button>
          <button class="secondary" type="button" id="download-button">PNG 保存</button>
        </div>

        <p class="status" id="status" role="status"></p>
      </form>

      <section class="panel preview" aria-label="Generated QR code">
        <div class="preview-head">
          <div>
            <p class="eyebrow">Preview</p>
            <h2 id="preview-title">${DEFAULTS.topic}</h2>
          </div>
          <span class="badge">High ECC</span>
        </div>
        <canvas id="qr-canvas" width="960" height="960" aria-label="Zoom meeting QR code"></canvas>
        <p class="join-url" id="join-url"></p>
      </section>
    </section>
  </main>
`;

const form = document.querySelector("#qr-form");
const canvas = document.querySelector("#qr-canvas");
const status = document.querySelector("#status");
const joinUrlText = document.querySelector("#join-url");
const previewTitle = document.querySelector("#preview-title");
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

resetButton.addEventListener("click", () => {
  form.elements.topic.value = DEFAULTS.topic;
  form.elements.meetingId.value = DEFAULTS.meetingId;
  form.elements.passcode.value = DEFAULTS.passcode;
  form.elements.joinUrl.value = DEFAULTS.joinUrl;
  updateQr();
});

updateQr();

function updateQr() {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  const topic = values.topic.trim() || "Zoom Meeting";

  try {
    const joinUrl = buildZoomJoinUrl(values);
    renderZoomQr(canvas, joinUrl);
    previewTitle.textContent = topic;
    joinUrlText.textContent = joinUrl;
    status.textContent = "QR を生成しました。";
    status.dataset.state = "ok";
  } catch (error) {
    previewTitle.textContent = topic;
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
