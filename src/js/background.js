// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lore.land extension installed.');
});

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { command });
    }
  });
});
