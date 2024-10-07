import { _____log } from "../log/log.mjs";

export function dispatchContentGrabAction(tab, message, yankType) {
  const tabId = tab.id;
  const updatedMessage = { ...message, yankType }; // Merge message and yankType
  _____log(updatedMessage);

  const callback = (responseMessage) => {
    const lastError = chrome.runtime.lastError;
    if (lastError) {
      _____log('Error:', lastError);
    }
    _____log('bg: dispatching fill log:', { tabId }, responseMessage);
  };

  chrome.tabs.sendMessage(
    tabId,
    updatedMessage,
    () => {
      chrome.tabs.sendMessage(
        tabId,
        { text: 'dispatch_fill_log', yankType },
        callback
      );
    }
  );
}
