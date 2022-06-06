import {_____log} from "../log/log.mjs";

export function dispatchContentGrabAction(tab, message, yankType) {
  const tabId = tab.id;
  Object.assign(message, {yankType});
  _____log(message);
  const callback = () => {
    _____log('bg: dispatching fill log: ', {tabId});
    chrome.tabs.sendMessage(tabId,
                            {
                              text: 'dispatch_fill_log',
                              yankType
                            },
                            (message) => {
                              _____log(chrome.runtime.lastError, message);
                            })
  }
  return chrome.tabs.sendMessage(tabId, message, callback);
}