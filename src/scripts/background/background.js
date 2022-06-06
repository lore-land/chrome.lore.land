import {recordScreen}              from "./recordScreen";
import {dispatchContentGrabAction} from "./dispatchContentGrabAction.mjs";
import {_____log}                  from "../log/log.mjs";

let color = '#3aa757';

chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    checkCommandShortcuts();
  }
  console.clear();
  _____log('%ccolor', `color: ${color}`);
});

function contentScriptFunc(name) {
  console.log('from bg: executing content script ' + name)
}

chrome.action.onClicked.addListener((tab) => {
  console.log('here we are');
  chrome.action.setPopup('popup.html');
  chrome.scripting.executeScript({
                                   target: {tabId: tab.id},
                                   func:   contentScriptFunc,
                                   args:   ['action'],
                                   files:  ['popup.html']
                                 });
});

function receiveLogChangeTab(url) {
  _____log('bg: change', url)
}

function receiveActiveTab(url) {
  _____log('bg: active', url)
}

chrome.commands.onCommand.addListener(async function (command, tab, sender) {
  _____log(`bg: execute command `, {arguments});

  let ex        = /change_dimension_(\d)/.exec(command);
  let dimension = (ex || [])[1];
  if (dimension) {
    _____log({arguments});
    return dispatchContentGrabAction(tab, {text: command}, dimension);
    return;
  }
  switch (command) {
    case 'queue_yank_text' : {
      _____log('bg: yanking');
      return dispatchContentGrabAction(tab, {text: 'dispatch_yank_text'}, false);
    }
    case 'record_screen' :
      _____log('bg: recording screen')
      return recordScreen(tab);
  }
});
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  _____log(`bg: received message from ${sender}: `, {arguments});
  sendResponse({received: true});
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  _____log('bg: listening to message', {arguments});
  switch (message.text) {
    case 'queue_fill_log': {
      _____log('bg: dispatching fill log', {arguments});
      chrome.tabs.sendMessage(
        sender.tab.id,
        {text: 'dispatch_fill_log'},
        () => {
          _____log('bg: queue ended')
        }
      );
    }
      break;
    case 'queue_yank_text' : {
      _____log('bg: dispatching yank text');
      dispatchContentGrabAction(sender.tab, {text: 'dispatch_yank_text'}, false);
    }
      break;
    case 'init_app' : {
      _____log('bg: dispatching init app', sender);
      chrome.tabs.sendMessage(message.tab.id, {text: 'dispatch_init_app'}, () => {
        _____log('bg: dispatched init app')
      })
    }
      break;
    case 'record_screen' :
      _____log('bg: dispatching record screen');
      recordScreen(sender.tab);
      break;
  }

});
chrome.tabs.onUpdated.addListener(async function (tabId, tab) {
  _____log('bg: tab change', {arguments});
  chrome.tabs.sendMessage(tabId, {text: 'log_change_tab'}, receiveActiveTab);
});
chrome.tabs.onActivated.addListener(async function (tab) {
  _____log('bg: tab activation', {arguments});
  chrome.tabs.sendMessage(tab.tabId, {text: 'log_change_tab'}, receiveLogChangeTab);
});

// Only use this function during the initial install phase. After
// installation the user may have intentionally unassigned commands.
function checkCommandShortcuts() {
  chrome.commands.getAll((commands) => {
    let missingShortcuts = [];

    for (let {name, shortcut} of commands) {
      if (shortcut === '') {
        missingShortcuts.push(name);
      }
    }

    if (missingShortcuts.length > 0) {
      // Update the extension UI to inform the user that one or more
      // commands are currently unassigned.
    }
  });
}