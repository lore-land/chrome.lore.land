// === src/js/background.js ===

// RuntimeHandler manages the browser runtime interactions
class RuntimeHandler {
  constructor() {
    this.runtime = typeof browser !== 'undefined' ? browser : chrome;
  }

  sendMessage(message, callback) {
    this.runtime.runtime.sendMessage(message, callback);
  }

  get lastError() {
    return this.runtime.runtime.lastError;
  }

  onMessage(listener) {
    this.runtime.runtime.onMessage.addListener(listener);
  }

  onInstalled(listener) {
    this.runtime.runtime.onInstalled.addListener(listener);
  }

  onCommand(listener) {
    this.runtime.commands.onCommand.addListener(listener);
  }

  queryTabs(queryInfo, callback) {
    this.runtime.tabs.query(queryInfo, callback);
  }

  sendMessageToTab(tabId, message, callback) {
    this.runtime.tabs.sendMessage(tabId, message, callback);
  }
}

// StorageHandler encapsulates storage operations with Promises
class StorageHandler {
  constructor(runtimeHandler) {
    this.runtime = runtimeHandler.runtime;
  }

  get(keys) {
    return new Promise((resolve, reject) => {
      this.runtime.storage.local.get(keys, (result) => {
        if (this.runtime.lastError) {
          reject(this.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }

  set(items) {
    return new Promise((resolve, reject) => {
      this.runtime.storage.local.set(items, () => {
        if (this.runtime.lastError) {
          reject(this.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.runtime.storage.local.clear(() => {
        if (this.runtime.lastError) {
          reject(this.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

// OrbValidator ensures the integrity of orb data structures
class OrbValidator {
  static isValidOrb(orb) {
    const isValid =
      orb &&
      typeof orb.id === 'string' &&
      typeof orb.type === 'string' &&
      typeof orb.state === 'string' &&
      typeof orb.x === 'number' &&
      typeof orb.y === 'number' &&
      typeof orb.valence === 'number' &&
      typeof orb.arousal === 'number' &&
      typeof orb.discreteEmotions === 'string' &&
      typeof orb.name === 'string';

    if (!isValid) {
      console.warn('Invalid orb data structure:', orb);
    }

    return isValid;
  }
}

// MessageHandler manages incoming messages and their responses
class MessageHandler {
  constructor(storageHandler, runtimeHandler) {
    this.storage = storageHandler;
    this.runtime = runtimeHandler;
    this.STORAGE_KEYS = {
      COLLECTED_DATA: 'collectedData',
      COLLECTED_ORBS: 'collectedOrbs',
      THOUGHTS: 'thoughts',
      AUTO_DOWNLOAD: 'autoDownload',
      ENABLED: 'enabled',
    };
  }

  handleMessage(request, sender, sendResponse) {
    console.log('Received message:', request);

    switch (request.command) {
      case 'collectData':
        this.collectData(request.data)
          .then((status) => sendResponse({ status }))
          .catch((error) => sendResponse({ status: 'Error collecting data', error: error.message }));
        return true; // Indicates that sendResponse will be called asynchronously

      case 'collectOrb':
        console.log('here');
        this.collectOrb(request.data)
          .then((status) => sendResponse({ status }))
          .catch((error) => sendResponse({ status: 'Error collecting orb', error: error.message }));
        return true; // Indicates that sendResponse will be called asynchronously

      case 'openPuzzle':
        this.openPuzzle(request.puzzleId, sendResponse);
        return false; // No asynchronous response

      case 'getOrbs':
        this.getOrbs(sendResponse);
        return true; // Indicates that sendResponse will be called asynchronously

      case 'clearOrbs':
        this.clearOrbs(sendResponse);
        return true; // Indicates that sendResponse will be called asynchronously

      // Handle additional commands as needed

      default:
        sendResponse({ status: 'Unknown command' });
        return false; // No asynchronous response
    }
  }

  collectData(data) {
    return new Promise((resolve, reject) => {
      if (!OrbValidator.isValidOrb(data)) {
        reject(new Error('Invalid data structure'));
        return;
      }

      this.storage
        .get([this.STORAGE_KEYS.COLLECTED_DATA])
        .then((existingData) => {
          const updatedData = existingData[this.STORAGE_KEYS.COLLECTED_DATA].concat(data);
          return this.storage.set({ [this.STORAGE_KEYS.COLLECTED_DATA]: updatedData });
        })
        .then(() => {
          console.log('Data collected:', data);
          resolve('Data collected successfully');
        })
        .catch((error) => {
          console.error('Error collecting data:', error);
          reject(error);
        });
    });
  }

  collectOrb(data) {
    return new Promise((resolve, reject) => {
      if (!OrbValidator.isValidOrb(data)) {
        reject(new Error('Invalid orb data'));
        return;
      }

      this.storage
        .get([this.STORAGE_KEYS.COLLECTED_ORBS])
        .then((orbsData) => {
          const updatedOrbs = orbsData[this.STORAGE_KEYS.COLLECTED_ORBS].concat(data);
          return this.storage.set({ [this.STORAGE_KEYS.COLLECTED_ORBS]: updatedOrbs });
        })
        .then(() => {
          console.log('Orb collected:', data);
          resolve('Orb collected successfully');
        })
        .catch((error) => {
          console.error('Error collecting orb:', error);
          reject(error);
        });
    });
  }

  getOrbs(sendResponse) {
    this.storage
      .get([this.STORAGE_KEYS.COLLECTED_ORBS])
      .then((orbsData) => {
        sendResponse({ orbs: orbsData[this.STORAGE_KEYS.COLLECTED_ORBS] });
      })
      .catch((error) => {
        console.error('Error retrieving orbs:', error);
        sendResponse({ status: 'Error retrieving orbs', error: error.message });
      });
  }

  clearOrbs(sendResponse) {
    this.storage
      .set({ [this.STORAGE_KEYS.COLLECTED_ORBS]: [] })
      .then(() => {
        console.log('All orbs have been cleared.');
        sendResponse({ status: 'Orbs cleared successfully' });
      })
      .catch((error) => {
        console.error('Error clearing orbs:', error);
        sendResponse({ status: 'Error clearing orbs', error: error.message });
      });
  }

  openPuzzle(puzzleId, sendResponse) {
    console.log(`Open Puzzle Command Received for Puzzle ID: ${puzzleId}`);
    // Implement puzzle modal logic here, e.g., communicate with a popup or other UI component
    // For demonstration, we'll acknowledge the command
    sendResponse({ status: 'Puzzle opened', puzzleId });
    return false; // No asynchronous response
  }
}

// CommandHandler manages keyboard commands and their actions
class CommandHandler {
  constructor(storageHandler, runtimeHandler) {
    this.storage = storageHandler;
    this.runtime = runtimeHandler;
  }

  handleCommand(command) {
    console.log(`Command "${command}" triggered`);

    switch (command) {
      case 'toggle-feature':
        this.toggleFeature();
        break;
      // Add more command cases as needed
      default:
        console.warn(`Unrecognized command: ${command}`);
    }
  }

  toggleFeature() {
    this.storage
      .get(['enabled'])
      .then((currentState) => {
        const newState = !currentState.enabled;
        return this.storage.set({ enabled: newState }).then(() => newState);
      })
      .then((newState) => {
        console.log(`Feature toggled to ${newState ? 'enabled' : 'disabled'}.`);

        // Optionally, notify active tabs about the state change
        this.runtime.queryTabs({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            this.runtime.sendMessageToTab(tabs[0].id, { command: 'featureToggled', enabled: newState });
          }
        });
      })
      .catch((error) => {
        console.error('Error toggling feature:', error);
      });
  }
}

// FeatureToggle provides additional feature management (if needed)
class FeatureToggle {
  constructor(storageHandler) {
    this.storage = storageHandler;
    // Additional initialization if necessary
  }

  // Implement feature toggle methods as needed
}

// BackgroundManager orchestrates all background script functionalities
class BackgroundManager {
  constructor() {
    this.runtimeHandler = new RuntimeHandler();
    this.storageHandler = new StorageHandler(this.runtimeHandler);
    this.messageHandler = new MessageHandler(this.storageHandler, this.runtimeHandler);
    this.commandHandler = new CommandHandler(this.storageHandler, this.runtimeHandler);
    this.featureToggle = new FeatureToggle(this.storageHandler);
    this.STORAGE_KEYS = this.messageHandler.STORAGE_KEYS;

    this.initialize();
  }

  initialize() {
    this.initializeStorage()
      .then(() => {
        this.registerEventListeners();
      })
      .catch((error) => {
        console.error('Initialization failed:', error);
      });
  }

  initializeStorage() {
    return this.storageHandler
      .get([
        this.STORAGE_KEYS.COLLECTED_DATA,
        this.STORAGE_KEYS.COLLECTED_ORBS,
        this.STORAGE_KEYS.THOUGHTS,
        this.STORAGE_KEYS.AUTO_DOWNLOAD,
        this.STORAGE_KEYS.ENABLED,
      ])
      .then((currentData) => {
        const defaults = {};
        if (!currentData[this.STORAGE_KEYS.COLLECTED_DATA]) {
          defaults[this.STORAGE_KEYS.COLLECTED_DATA] = [];
        }
        if (!currentData[this.STORAGE_KEYS.COLLECTED_ORBS]) {
          defaults[this.STORAGE_KEYS.COLLECTED_ORBS] = [];
        }
        if (!currentData[this.STORAGE_KEYS.THOUGHTS]) {
          defaults[this.STORAGE_KEYS.THOUGHTS] = [];
        }
        if (currentData[this.STORAGE_KEYS.AUTO_DOWNLOAD] === undefined) {
          defaults[this.STORAGE_KEYS.AUTO_DOWNLOAD] = false;
        }
        if (currentData[this.STORAGE_KEYS.ENABLED] === undefined) {
          defaults[this.STORAGE_KEYS.ENABLED] = false;
        }

        if (Object.keys(defaults).length > 0) {
          return this.storageHandler.set(defaults).then(() => {
            console.log('Extension installed and storage initialized with defaults.');
          });
        } else {
          console.log('Storage already initialized.');
          return Promise.resolve();
        }
      })
      .catch((error) => {
        console.error('Error initializing storage:', error);
      });
  }

  registerEventListeners() {
    // Listen for messages from content scripts and other extension parts
    this.runtimeHandler.onMessage(this.messageHandler.handleMessage.bind(this.messageHandler));

    // Listen for keyboard commands
    this.runtimeHandler.onCommand(this.commandHandler.handleCommand.bind(this.commandHandler));

    // Additional event listeners can be registered here
  }
}

// Initialize the BackgroundManager when the script is loaded
(function () {
  const backgroundManager = new BackgroundManager();
})();
