import "./styles.css";
import { copyCanvasPng, copyText } from "./clipboard.js";
import { renderZoomQr } from "./qr-renderer.js";
import {
  buildZoomJoinUrl,
  formatMeetingId,
  normalizeMeetingId,
} from "./zoom.js";

const DEFAULTS = {
  meetingId: "",
  passcode: "",
};
const UPDATE_DELAY = 200;
const EMAIL_COPY_SIZE = 360;

document.querySelector("#app").innerHTML = `
  <main class="shell">
    <header class="app-header">
      <a class="brand" href="./" aria-label="Zoom QR Code Generator のホーム">Zoom QR Code Generator</a>
    </header>

    <section class="workspace" aria-label="Zoom QR generator">
      <form class="controls" id="qr-form" novalidate>
        <label class="field-card field-id">
          <span class="field-label">ミーティングID</span>
          <input name="meetingId" inputmode="numeric" autocomplete="off" maxlength="15" placeholder="123 456 7890" aria-describedby="meeting-id-error" />
          <span class="field-error" id="meeting-id-error" aria-live="polite"></span>
        </label>

        <label class="field-card field-passcode">
          <span class="field-label">パスコード <small>任意</small></span>
          <span class="passcode-input">
            <input name="passcode" type="password" autocomplete="off" maxlength="64" placeholder="パスコードを入力" />
            <button class="visibility-button" type="button" id="visibility-button" aria-label="パスコードを表示">表示</button>
          </span>
          <span class="field-helper" aria-hidden="true">&nbsp;</span>
        </label>

        <div class="bottom-actions">
          <button class="reset-button" type="button" id="reset-button"><span class="reset-icon" aria-hidden="true">↺</span><span>クリア</span></button>
        </div>
      </form>

      <section class="preview" id="preview" data-empty="true" aria-label="生成されたQRコード">
        <p class="status" id="status" role="status" aria-live="polite"></p>
        <div class="preview-empty" aria-hidden="true">ミーティングIDを入力</div>
        <div class="qr-stage">
          <canvas id="qr-canvas" width="960" height="960" aria-label="Zoom会議のQRコード"></canvas>
        </div>
        <div class="output-bottom">
          <div class="output-actions">
            <button class="copy-button" type="button" id="copy-button" disabled><span class="button-icon" aria-hidden="true">⧉</span><span>QRをコピー</span></button>
            <button class="download-button" type="button" id="download-button" disabled><span class="button-icon" aria-hidden="true">↓</span><span>PNG保存</span></button>
            <button class="copy-url-button" type="button" id="copy-url-button" disabled><span class="button-icon" aria-hidden="true">⧉</span><span>URLをコピー</span></button>
          </div>
        </div>
      </section>
    </section>
  </main>
`;

const form = document.querySelector("#qr-form");
const canvas = document.querySelector("#qr-canvas");
const status = document.querySelector("#status");
const copyUrlButton = document.querySelector("#copy-url-button");
const meetingIdError = document.querySelector("#meeting-id-error");
const preview = document.querySelector("#preview");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const resetButton = document.querySelector("#reset-button");
const visibilityButton = document.querySelector("#visibility-button");
let hasGeneratedQr = false;
let currentJoinUrl = "";
let hasInteracted = false;
let updateTimer;
let statusTimer;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(updateTimer);
  hasInteracted = true;
  updateQr();
});

form.addEventListener("input", (event) => {
  if (
    event.target === form.elements.meetingId &&
    !/[^\d\s-]/.test(event.target.value)
  ) {
    event.target.value = formatMeetingId(event.target.value);
  }

  hasInteracted = true;
  clearStatus();
  clearTimeout(updateTimer);
  updateTimer = setTimeout(updateQr, UPDATE_DELAY);
});

downloadButton.addEventListener("click", () => {
  if (!hasGeneratedQr) {
    return;
  }

  const link = document.createElement("a");
  link.download = makeFileName(form.elements.meetingId.value);
  link.href = canvas.toDataURL("image/png");
  link.click();
  showStatus("PNGを保存しました。", "ok");
});

copyButton.addEventListener("click", async () => {
  try {
    if (!hasGeneratedQr) {
      throw new Error("先にミーティング ID を入力してください。");
    }

    const emailCanvas = document.createElement("canvas");
    renderZoomQr(emailCanvas, currentJoinUrl, { size: EMAIL_COPY_SIZE });
    await copyCanvasPng(emailCanvas);
    showStatus("QR画像をコピーしました。", "ok");
  } catch (error) {
    showStatus(error.message || "QR画像をコピーできませんでした。", "error");
  }
});

copyUrlButton.addEventListener("click", async () => {
  try {
    if (!currentJoinUrl) {
      throw new Error("先にミーティング ID を入力してください。");
    }

    await copyText(currentJoinUrl);
    showStatus("接続URLをコピーしました。", "ok");
  } catch (error) {
    showStatus(error.message || "接続URLをコピーできませんでした。", "error");
  }
});

resetButton.addEventListener("click", () => {
  clearTimeout(updateTimer);
  form.reset();
  form.elements.passcode.type = "password";
  visibilityButton.textContent = "表示";
  visibilityButton.setAttribute("aria-label", "パスコードを表示");
  hasInteracted = false;
  clearStatus();
  updateQr();
});

visibilityButton.addEventListener("click", () => {
  const isHidden = form.elements.passcode.type === "password";
  form.elements.passcode.type = isHidden ? "text" : "password";
  visibilityButton.textContent = isHidden ? "隠す" : "表示";
  visibilityButton.setAttribute(
    "aria-label",
    isHidden ? "パスコードを隠す" : "パスコードを表示",
  );
});

updateQr();

function updateQr() {
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  try {
    const joinUrl = buildZoomJoinUrl(values);
    renderZoomQr(canvas, joinUrl);
    hasGeneratedQr = true;
    preview.dataset.empty = "false";
    meetingIdError.textContent = "";
    copyButton.disabled = false;
    downloadButton.disabled = false;
    copyUrlButton.disabled = false;
    currentJoinUrl = joinUrl;
  } catch (error) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    hasGeneratedQr = false;
    preview.dataset.empty = "true";
    meetingIdError.textContent = hasInteracted ? error.message : "";
    copyButton.disabled = true;
    downloadButton.disabled = true;
    copyUrlButton.disabled = true;
    currentJoinUrl = "";
  }
}

function showStatus(message, state) {
  clearTimeout(statusTimer);
  status.textContent = message;
  status.dataset.state = state;
  statusTimer = setTimeout(clearStatus, 3000);
}

function clearStatus() {
  clearTimeout(statusTimer);
  status.textContent = "";
  delete status.dataset.state;
}

function makeFileName(meetingId) {
  const id = normalizeMeetingId(meetingId);
  return `zoom-${id || "meeting"}-qr.png`;
}
