import dayjs from 'dayjs';
import joinUrl from 'url-join';

export function getExplorerUrl({ explorer, value, type = 'address' }) {
  const url = explorer && value && joinUrl(explorer, type, value);
  return url;
}

export function formatTime(timeText) {
  return dayjs(timeText).format('YYYY-MM-DD HH:mm');
}

export function isIframeWrapper() {
  return (
    (window.self.frameElement && window.self.frameElement.tagName === 'IFRAME') ||
    window.frames.length !== window.parent.frames.length ||
    window.self !== window.top ||
    window?.parent !== window
  );
}
