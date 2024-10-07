// options.js

document.addEventListener('DOMContentLoaded', () => {
  const autoDownloadCheckbox = document.getElementById('auto-download');
  const clearThoughtsButton = document.getElementById('clear-thoughts');
  const thoughtsContainer = document.getElementById('thoughts-container');

  chrome.storage.local.get('autoDownload', (data) => {
    autoDownloadCheckbox.checked = data.autoDownload || false;
  });

  autoDownloadCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ autoDownload: autoDownloadCheckbox.checked });
  });

  clearThoughtsButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all thoughts?')) {
      chrome.storage.local.remove('thoughts', () => {
        updateThoughts();
      });
    }
  });

  function updateThoughts() {
    chrome.storage.local.get('thoughts', (data) => {
      const thoughts = data.thoughts || [];
      thoughtsContainer.innerHTML = '';
      thoughts.forEach((item) => {
        const p = document.createElement('p');
        p.textContent = `${item.timestamp}: ${item.thought}`;
        thoughtsContainer.appendChild(p);
      });
    });
  }

  // Initialize thoughts on options page load
  updateThoughts();
});
