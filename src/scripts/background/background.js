import { recordScreen } from "./recordScreen";
import { dispatchContentGrabAction } from "./dispatchContentGrabAction.mjs";
import { _____log } from "../log/log.mjs";

const color = '#3aa757';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    checkCommandShortcuts();
  }
  console.clear();
  _____log('%ccolor', `color: ${color}`);
});

function contentScriptFunc(name) {
  console.log(`from bg: executing content script ${name}`);
}

chrome.action.onClicked.addListener((tab) => {
  console.log('here we are');
  chrome.action.setPopup({ popup: 'popup.html' });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: contentScriptFunc,
    args: ['action']
  });
});

function receiveLogChangeTab(url) {
  _____log('bg: change', url);
}

function receiveActiveTab(url) {
  _____log('bg: active', url);
}

chrome.commands.onCommand.addListener(async (command, tab) => {
  _____log('bg: execute command', { command });

  const dimensionMatch = /change_dimension_(\d)/.exec(command);
  const dimension = dimensionMatch ? dimensionMatch[1] : null;

  if (dimension) {
    _____log({ command });
    return dispatchContentGrabAction(tab, { text: command }, dimension);
  }

  switch (command) {
    case 'queue_yank_text':
      _____log('bg: yanking text');
      return dispatchContentGrabAction(tab, { text: 'dispatch_yank_text' });
    case 'record_screen':
      _____log('bg: recording screen');
      return recordScreen(tab);
    default:
      _____log('bg: unknown command');
  }
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  _____log(`bg: received external message from ${sender}`, { request });
  sendResponse({ received: true });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  _____log('bg: received message', { message });

  switch (message.text) {
    case 'queue_fill_log':
      _____log('bg: dispatching fill log');
      chrome.tabs.sendMessage(sender.tab.id, { text: 'dispatch_fill_log' }, () => {
        _____log('bg: queue ended');
      });
      break;
    case 'queue_yank_text':
      _____log('bg: dispatching yank text');
      dispatchContentGrabAction(sender.tab, { text: 'dispatch_yank_text' });
      break;
    case 'init_app':
      _____log('bg: dispatching init app', sender);
      chrome.tabs.sendMessage(sender.tab.id, { text: 'dispatch_init_app' }, () => {
        _____log('bg: init app dispatched');
      });
      break;
    case 'record_screen':
      _____log('bg: dispatching record screen');
      recordScreen(sender.tab);
      break;
    default:
      _____log('bg: unknown message');
  }
});

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  _____log('bg: tab updated', { tabId, tab });
  chrome.tabs.sendMessage(tabId, { text: 'log_change_tab' }, receiveActiveTab);
});

chrome.tabs.onActivated.addListener((tab) => {
  _____log('bg: tab activated', { tab });
  chrome.tabs.sendMessage(tab.tabId, { text: 'log_change_tab' }, receiveLogChangeTab);
});

function checkCommandShortcuts() {
  chrome.commands.getAll((commands) => {
    const missingShortcuts = commands.filter(({ shortcut }) => !shortcut).map(({ name }) => name);

    if (missingShortcuts.length > 0) {
      // Inform the user that one or more commands are currently unassigned
      _____log('bg: missing shortcuts', missingShortcuts);
    }
  });
}
