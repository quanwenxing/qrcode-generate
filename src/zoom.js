const ZOOM_HOST = "https://zoom.us";

export function normalizeMeetingId(value) {
  return value.replace(/[^\d]/g, "");
}

export function buildZoomJoinUrl({ joinUrl, meetingId, passcode }) {
  const trimmedJoinUrl = joinUrl.trim();
  if (trimmedJoinUrl) {
    return normalizeJoinUrl(trimmedJoinUrl);
  }

  const normalizedMeetingId = normalizeMeetingId(meetingId);
  if (!normalizedMeetingId) {
    throw new Error("Zoom URL またはミーティング ID を入力してください。");
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
