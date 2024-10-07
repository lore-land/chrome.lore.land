import { _____log } from "../log/log.mjs";
import { getLocal } from "../content/helpers/chrome/chromeLocalStorage.mjs";

export async function recordScreen(tab) {
  // Check if the app is active using local storage
  const isActive = await getLocal('app-active');

  if (!isActive) {
    chrome.tabs.sendMessage(tab.id, { text: 'dispatch_init_app' }, () => {
      console.log('bg: initializing app');
    });
    return;
  }

  // Use desktopCapture API to choose the media for capturing
  chrome.desktopCapture.chooseDesktopMedia(
    ['tab', 'screen', 'window', 'audio'],
    tab,
    (streamid, constraints) => {
      const message = {
        text: 'beginCapturing',
        streamid,
        constraints: {
          maxWidth: 2880,
          maxHeight: 1800
        }
      };

      const options = {};
      const callback = () => {
        _____log('HERE boon boon');
      };

      chrome.tabs.sendMessage(tab.id, message, options, callback);
      return false;
    }
  );
}
