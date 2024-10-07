// popup.js

document.getElementById('start-recording').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: 'start_recording' });
});

document.getElementById('yank-text').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { command: 'yank_chapter' });
    }
  });
});

document.getElementById('clear-log').addEventListener('click', () => {
  chrome.storage.local.remove('interactionLogs', () => {
    updateLog();
  });
});

document.getElementById('submit-thought').addEventListener('click', () => {
  const thought = prompt('Enter your thought:');
  if (thought) {
    chrome.storage.local.get('thoughts', (data) => {
      const thoughts = data.thoughts || [];
      thoughts.push({ thought, timestamp: new Date().toISOString() });
      chrome.storage.local.set({ thoughts });
    });
  }
});

function updateLog() {
  chrome.storage.local.get('interactionLogs', (data) => {
    const logs = data.interactionLogs || [];
    const logContainer = document.getElementById('log-container');
    logContainer.innerHTML = '';
    logs.forEach((log) => {
      const p = document.createElement('p');
      p.textContent = `${log.timestamp}: ${log.type} - ${log.details}`;
      logContainer.appendChild(p);
    });
  });
}

// Initialize log on popup open
updateLog();
