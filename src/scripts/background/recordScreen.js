import {_____log} from "../log/log.mjs";
import {getLocal} from "../content/helpers/chrome/chromeLocalStorage.mjs";

export async function recordScreen(tab) {

  if (!await getLocal('app-active')) {
    chrome.tabs.sendMessage(tab.id, {text: 'dispatch_init_app'}, () => {
      console.log('bg: initializing app');
    });
    return;
  }

  chrome.desktopCapture.chooseDesktopMedia(
    [
      'tab',
      'screen',
      'window',
      'audio'
    ],
    tab,
    function (streamid, constraints) {
      let callback = o => { _____log('HERE boon boon') };
      let options  = {};
      let message  = {
        text:        'beginCapturing',
        streamid,
        constraints: {
          maxWidth:  2880,
          maxHeight: 1800
        }
      };
      chrome.tabs.sendMessage(tab.id, message, options, callback);
      return false;
    })
}