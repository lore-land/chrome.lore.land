chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');
});

// Listener for when user interacts with boon.land
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "collectOrb") {
    // Get the current orbs from storage, update them, and store them back
    chrome.storage.local.get(['collectedOrbs'], (result) => {
      const orbs = result.collectedOrbs || [];
      orbs.push(message.orb);  // Add the new orb
      chrome.storage.local.set({ collectedOrbs: orbs }, () => {
        console.log("Orb collected and saved:", message.orb);
        sendResponse({ status: "Orb collected!" });
      });
    });
    return true;  // Keeps the message channel open for async response
  } else if (message.command === "getOrbs") {
    // Retrieve the orbs from storage
    chrome.storage.local.get(['collectedOrbs'], (result) => {
      sendResponse({ orbs: result.collectedOrbs || [] });
    });
    return true;  // Keeps the message channel open for async response
  } else if (message.command === "clearOrbs") {
    // Clear the orbs in storage
    chrome.storage.local.set({ collectedOrbs: [] }, () => {
      console.log("Orbs cleared!");
      sendResponse({ status: "Orbs cleared!" });
    });
    return true;  // Keeps the message channel open for async response
  }
});
