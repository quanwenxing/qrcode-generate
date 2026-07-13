const ZOOM_HOST = "https://zoom.us";

export function normalizeMeetingId(value) {
  return value.replace(/[^\d]/g, "");
}

export function formatMeetingId(value) {
  const digits = normalizeMeetingId(value).slice(0, 11);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

export function buildZoomJoinUrl({ joinUrl = "", meetingId, passcode }) {
  const trimmedJoinUrl = joinUrl.trim();
  if (trimmedJoinUrl) {
    return normalizeJoinUrl(trimmedJoinUrl);
  }

  const rawMeetingId = meetingId.trim();
  if (!rawMeetingId) {
    throw new Error("ミーティング ID を入力してください。");
  }

  if (/[^\d\s-]/.test(rawMeetingId)) {
    throw new Error("ミーティング ID は数字で入力してください。");
  }

  const normalizedMeetingId = normalizeMeetingId(rawMeetingId);
  if (normalizedMeetingId.length < 9 || normalizedMeetingId.length > 11) {
    throw new Error("ミーティング ID は9〜11桁で入力してください。");
  }

  const url = new URL(`/j/${normalizedMeetingId}`, ZOOM_HOST);
  const trimmedPasscode = passcode.trim();
  if (trimmedPasscode) {
    url.searchParams.set("pwd", trimmedPasscode);
  }
  return url.toString();
}

function normalizeJoinUrl(value) {
  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(value);
  const url = new URL(hasProtocol ? value : `https://${value}`);

  if (!/zoom\.(us|com\.cn)$/i.test(url.hostname) && !url.hostname.endsWith(".zoom.us")) {
    throw new Error("Zoom の参加 URL を入力してください。");
  }

  return url.toString();
}
