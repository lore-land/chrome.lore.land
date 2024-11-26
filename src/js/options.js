// === src/js/options.js ===

// RuntimeHandler manages cross-browser runtime interactions
class RuntimeHandler {
  constructor() {
    this.runtime =
      (typeof browser !== 'undefined' && browser.runtime) ||
      (typeof chrome !== 'undefined' && chrome.runtime);
    this.storage =
      (typeof browser !== 'undefined' && browser.storage) ||
      (typeof chrome !== 'undefined' && chrome.storage);
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      this.runtime.sendMessage(message, (response) => {
        if (this.runtime.lastError) {
          reject(this.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  getStorage(keys) {
    return new Promise((resolve, reject) => {
      this.storage.local.get(keys, (data) => {
        if (this.runtime.lastError) {
          reject(this.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
  }

  setStorage(items) {
    return new Promise((resolve, reject) => {
      this.storage.local.set(items, () => {
        if (this.runtime.lastError) {
          reject(this.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

// UIManager handles all UI-related operations
class UIManager {
  constructor(storageHandler) {
    this.storageHandler = storageHandler;
    this.thoughtsContainer = document.getElementById('thoughts-container');
    this.autoDownloadCheckbox = document.getElementById('auto-download');
    this.clearThoughtsButton = document.getElementById('clear-thoughts');
    this.enableExtensionCheckbox = document.getElementById('enable-extension');
  }

  // Sanitize text to prevent XSS
  sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Update the thoughts display
  updateThoughts(thoughts) {
    this.thoughtsContainer.innerHTML = '';
    if (thoughts.length === 0) {
      this.thoughtsContainer.textContent = 'No thoughts recorded.';
      return;
    }
    thoughts.forEach((item) => {
      const p = document.createElement('p');
      p.textContent = `${new Date(item.timestamp).toLocaleString()}: ${item.thought}`;
      this.thoughtsContainer.appendChild(p);
    });
  }

  // Initialize UI with stored settings
  async initializeUI() {
    try {
      const data = await this.storageHandler.getStorage(['autoDownload', 'thoughts', 'enabled']);
      this.autoDownloadCheckbox.checked = data.autoDownload || false;
      this.enableExtensionCheckbox.checked = data.enabled || false;
      this.updateThoughts(data.thoughts || []);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  // Bind event listeners for UI elements
  bindEventListeners() {
    // Event listener for auto-download toggle
    this.autoDownloadCheckbox.addEventListener('change', async () => {
      try {
        await this.storageHandler.setStorage({ autoDownload: this.autoDownloadCheckbox.checked });
        // Optionally, notify the user of success
        console.log('Auto-download setting updated.');
      } catch (error) {
        alert('Failed to save auto-download setting.');
        console.error("Error saving auto-download setting:", error);
        // Revert the checkbox state in case of error
        this.autoDownloadCheckbox.checked = !this.autoDownloadCheckbox.checked;
      }
    });

    // Event listener for enabling/disabling the extension
    this.enableExtensionCheckbox.addEventListener('change', async () => {
      try {
        await this.storageHandler.setStorage({ enabled: this.enableExtensionCheckbox.checked });
        // Optionally, notify the user of success
        console.log('Extension enabled setting updated.');
      } catch (error) {
        alert('Failed to save extension enabled setting.');
        console.error("Error saving extension enabled setting:", error);
        // Revert the checkbox state in case of error
        this.enableExtensionCheckbox.checked = !this.enableExtensionCheckbox.checked;
      }
    });

    // Event listener for clearing thoughts
    this.clearThoughtsButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear all thoughts?')) {
        try {
          await this.storageHandler.setStorage({ thoughts: [] });
          this.updateThoughts([]);
          // Optionally, notify the user of success
          alert('All thoughts have been cleared.');
        } catch (error) {
          alert('Failed to clear thoughts.');
          console.error("Error clearing thoughts:", error);
        }
      }
    });
  }
}

// OptionsManager orchestrates all components
class OptionsManager {
  constructor() {
    this.runtimeHandler = new RuntimeHandler();
    this.uiManager = new UIManager(this.runtimeHandler);
  }

  async initialize() {
    await this.uiManager.initializeUI();
    this.uiManager.bindEventListeners();
  }
}

// Initialize the options page when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const optionsManager = new OptionsManager();
  optionsManager.initialize().catch((error) => {
    console.error('Failed to initialize OptionsManager:', error);
  });
});
