// === src/js/options.js ===
// src/js/options.js

// Polyfill for browser APIs to ensure cross-browser compatibility
const runtime = (typeof browser !== 'undefined') ? browser : chrome;

// Utility to promisify runtime storage methods
const storage = {
  get: (keys) => {
    return new Promise((resolve, reject) => {
      runtime.storage.local.get(keys, (result) => {
        if (runtime.runtime.lastError) {
          reject(runtime.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  },
  set: (items) => {
    return new Promise((resolve, reject) => {
      runtime.storage.local.set(items, () => {
        if (runtime.runtime.lastError) {
          reject(runtime.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
};

// Function to update the thoughts display
function updateThoughts(thoughts) {
  const thoughtsContainer = document.getElementById('thoughts-container');
  thoughtsContainer.innerHTML = '';
  if (thoughts.length === 0) {
    thoughtsContainer.textContent = 'No thoughts recorded.';
    return;
  }
  thoughts.forEach((item) => {
    const p = document.createElement('p');
    p.textContent = `${new Date(item.timestamp).toLocaleString()}: ${item.thought}`;
    thoughtsContainer.appendChild(p);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const autoDownloadCheckbox = document.getElementById('auto-download');
  const clearThoughtsButton = document.getElementById('clear-thoughts');
  const enableExtensionCheckbox = document.getElementById('enable-extension'); // Added

  // Load initial settings
  storage.get(['autoDownload', 'thoughts', 'enabled'])
    .then((data) => {
      autoDownloadCheckbox.checked = data.autoDownload || false;
      enableExtensionCheckbox.checked = data.enabled || false; // Ensures checkbox is checked based on storage
      updateThoughts(data.thoughts || []);
    })
    .catch((error) => {
      console.error("Error loading settings:", error);
    });

  // Event listener for auto-download toggle
  autoDownloadCheckbox.addEventListener('change', () => {
    storage.set({ autoDownload: autoDownloadCheckbox.checked })
      .then(() => {
        // Optionally, notify the user of success
      })
      .catch((error) => {
        alert('Failed to save auto-download setting.');
        console.error("Error saving auto-download setting:", error);
      });
  });

  // Event listener for enabling/disabling the extension
  enableExtensionCheckbox.addEventListener('change', () => {
    storage.set({ enabled: enableExtensionCheckbox.checked })
      .then(() => {
        // Optionally, notify the user of success
      })
      .catch((error) => {
        alert('Failed to save extension enabled setting.');
        console.error("Error saving extension enabled setting:", error);
      });
  });

  // Event listener for clearing thoughts
  clearThoughtsButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all thoughts?')) {
      storage.set({ thoughts: [] })
        .then(() => {
          updateThoughts([]);
          // Optionally, notify the user of success
        })
        .catch((error) => {
          alert('Failed to clear thoughts.');
          console.error("Error clearing thoughts:", error);
        });
    }
  });
});
