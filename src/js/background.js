// === src/js/background.js ===

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
  },
  clear: () => {
    return new Promise((resolve, reject) => {
      runtime.storage.local.clear(() => {
        if (runtime.runtime.lastError) {
          reject(runtime.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
};

// Constants for storage keys
const STORAGE_KEYS = {
  COLLECTED_DATA: 'collectedData', // Renamed for generality
  COLLECTED_ORBS: 'collectedOrbs',
  THOUGHTS: 'thoughts',
  AUTO_DOWNLOAD: 'autoDownload',
  ENABLED: 'enabled'
};

// Initialize storage on installation
const initializeStorage = () => {
  storage.get([
    STORAGE_KEYS.COLLECTED_DATA,
    STORAGE_KEYS.COLLECTED_ORBS,
    STORAGE_KEYS.THOUGHTS,
    STORAGE_KEYS.AUTO_DOWNLOAD,
    STORAGE_KEYS.ENABLED
  ])
    .then((currentData) => {
      // Initialize only if keys are not already set
      const defaults = {};
      if (!currentData[STORAGE_KEYS.COLLECTED_DATA]) {
        defaults[STORAGE_KEYS.COLLECTED_DATA] = [];
      }
      if (!currentData[STORAGE_KEYS.COLLECTED_ORBS]) {
        defaults[STORAGE_KEYS.COLLECTED_ORBS] = [];
      }
      if (!currentData[STORAGE_KEYS.THOUGHTS]) {
        defaults[STORAGE_KEYS.THOUGHTS] = [];
      }
      if (currentData[STORAGE_KEYS.AUTO_DOWNLOAD] === undefined) {
        defaults[STORAGE_KEYS.AUTO_DOWNLOAD] = false;
      }
      if (currentData[STORAGE_KEYS.ENABLED] === undefined) {
        defaults[STORAGE_KEYS.ENABLED] = false;
      }

      if (Object.keys(defaults).length > 0) {
        return storage.set(defaults)
          .then(() => {
            console.log("Extension installed and storage initialized with defaults.");
          });
      } else {
        console.log("Storage already initialized.");
        return Promise.resolve();
      }
    })
    .catch((error) => {
      console.error("Error initializing storage:", error);
    });
};

// Validate orb data structure
const isValidOrb = (orb) => {
  let isValid = orb &&
    typeof orb.id === "string" &&
    typeof orb.type === "string" &&
    typeof orb.state === "string" &&
    typeof orb.x === "number" &&
    typeof orb.y === "number" &&
    typeof orb.valence === "number" &&
    typeof orb.arousal === "number" &&
    typeof orb.discreteEmotions === "string";

  if (typeof orb.name !== 'string') {
    console.log('unknown orb')
  }

  console.log({ orb, isValid });
  return isValid;
};

// Message handler functions
const handleMessage = (request, sender, sendResponse) => {
  console.log("Received message:", request);

  switch (request.command) {
    case "collectData":
      if (!isValidOrb(request.data)) { // Assuming 'data' contains orb or other custom element data
        sendResponse({ status: "Invalid data structure" });
        return false; // No asynchronous response
      }
      storage.get([STORAGE_KEYS.COLLECTED_DATA])
        .then((existingData) => {
          const updatedData = existingData[STORAGE_KEYS.COLLECTED_DATA].concat(request.data);
          return storage.set({ [STORAGE_KEYS.COLLECTED_DATA]: updatedData });
        })
        .then(() => {
          console.log(`Data collected:`, request.data);
          sendResponse({ status: "Data collected successfully" });
        })
        .catch((error) => {
          console.error("Error collecting data:", error);
          sendResponse({ status: "Error collecting data", error: error.message });
        });
      return true; // Indicates that sendResponse will be called asynchronously

    case "openPuzzle":
      // Handle opening puzzle modal
      console.log(`Open Puzzle Command Received for Puzzle ID: ${request.puzzleId}`);
      // Implement puzzle modal logic here, e.g., communicate with a popup or other UI component
      // For demonstration, we'll acknowledge the command
      sendResponse({ status: "Puzzle opened", puzzleId: request.puzzleId });
      return false; // No asynchronous response

    case "collectOrb":
      if (!isValidOrb(request.data)) {
        sendResponse({ status: "Invalid orb data" });
        return false; // No asynchronous response
      }
      storage.get([STORAGE_KEYS.COLLECTED_ORBS])
        .then((orbsData) => {
          const updatedOrbs = orbsData[STORAGE_KEYS.COLLECTED_ORBS].concat(request.data);
          return storage.set({ [STORAGE_KEYS.COLLECTED_ORBS]: updatedOrbs });
        })
        .then(() => {
          console.log(`Orb collected:`, request.data);
          sendResponse({ status: "Orb collected successfully" });
        })
        .catch((error) => {
          console.error("Error collecting orb:", error);
          sendResponse({ status: "Error collecting orb", error: error.message });
        });
      return true; // Indicates that sendResponse will be called asynchronously

    case "getOrbs":
      storage.get([STORAGE_KEYS.COLLECTED_ORBS])
        .then((orbsData) => {
          sendResponse({ orbs: orbsData[STORAGE_KEYS.COLLECTED_ORBS] });
        })
        .catch((error) => {
          console.error("Error retrieving orbs:", error);
          sendResponse({ status: "Error retrieving orbs", error: error.message });
        });
      return true; // Indicates that sendResponse will be called asynchronously

    case "clearOrbs":
      storage.set({ [STORAGE_KEYS.COLLECTED_ORBS]: [] })
        .then(() => {
          console.log("All orbs have been cleared.");
          sendResponse({ status: "Orbs cleared successfully" });
        })
        .catch((error) => {
          console.error("Error clearing orbs:", error);
          sendResponse({ status: "Error clearing orbs", error: error.message });
        });
      return true; // Indicates that sendResponse will be called asynchronously

    // Handle additional commands as needed

    default:
      sendResponse({ status: "Unknown command" });
      return false; // No asynchronous response
  }
};

// Command handler functions (for keyboard commands)
const handleCommands = (command) => {
  console.log(`Command "${command}" triggered`);
  switch (command) {
    case "toggle-feature":
      toggleFeature();
      break;
    // Add more command cases as needed
    default:
      console.warn(`Unrecognized command: ${command}`);
  }
};

// Example function to toggle a feature (placeholder)
const toggleFeature = () => {
  storage.get([STORAGE_KEYS.ENABLED])
    .then((currentState) => {
      const newState = !currentState[STORAGE_KEYS.ENABLED];
      return storage.set({ [STORAGE_KEYS.ENABLED]: newState })
        .then(() => {
          console.log(`Feature toggled to ${newState ? "enabled" : "disabled"}.`);
          // Optionally, send a message to the content script or popup about the state change
          // Example:
          // runtime.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          //   if (tabs[0].id) {
          //     runtime.tabs.sendMessage(tabs[0].id, { command: "featureToggled", enabled: newState });
          //   }
          // });
        });
    })
    .catch((error) => {
      console.error("Error toggling feature:", error);
    });
};

// Register event listeners
const registerEventListeners = () => {
  // Listen for messages from content scripts and other extension parts
  runtime.runtime.onMessage.addListener(handleMessage);

  // Listen for keyboard commands
  runtime.commands.onCommand.addListener(handleCommands);
};

// Initialize the background script
const init = () => {
  // Initialize storage when the extension is installed or updated
  runtime.runtime.onInstalled.addListener(initializeStorage);

  // Register event listeners
  registerEventListeners();
};

// Execute initialization
init();
