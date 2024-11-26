// === src/js/popup.js ===

// RuntimeHandler manages cross-browser runtime interactions
class RuntimeHandler {
  constructor() {
    this.runtime =
      (typeof chrome !== 'undefined' && chrome.runtime) ||
      (typeof browser !== 'undefined' && browser.runtime);
    this.storage =
      (typeof chrome !== 'undefined' && chrome.storage) ||
      (typeof browser !== 'undefined' && browser.storage);
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

  getStorage(key) {
    return new Promise((resolve, reject) => {
      this.storage.local.get(key, (data) => {
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

// Validator ensures data integrity
class Validator {
  static isValidOrb(orb) {
    return (
      orb &&
      typeof orb.name === 'string' &&
      typeof orb.x === 'number' &&
      typeof orb.y === 'number' &&
      typeof orb.r === 'number'
    );
  }

  static isValidOrbsArray(orbs) {
    if (!Array.isArray(orbs)) return false;
    return orbs.every((orb) => Validator.isValidOrb(orb));
  }
}

// OrbManager handles orb-related operations
class OrbManager {
  constructor(runtimeHandler) {
    this.runtimeHandler = runtimeHandler;
  }

  async getOrbs() {
    try {
      const response = await this.runtimeHandler.sendMessage({ command: 'getOrbs' });
      return response.orbs || [];
    } catch (error) {
      console.error('Error getting orbs:', error);
      throw error;
    }
  }

  async collectOrb(orb) {
    try {
      const response = await this.runtimeHandler.sendMessage({ command: 'collectOrb', data: orb });
      if (response.status === 'Orb collected successfully') {
        return;
      } else {
        throw new Error(response.status || 'Failed to collect orb');
      }
    } catch (error) {
      console.error('Error collecting orb:', error);
      throw error;
    }
  }

  async clearOrbs() {
    try {
      const response = await this.runtimeHandler.sendMessage({ command: 'clearOrbs' });
      if (response.status === 'Orbs cleared successfully') {
        return;
      } else {
        throw new Error(response.status || 'Failed to clear orbs');
      }
    } catch (error) {
      console.error('Error clearing orbs:', error);
      throw error;
    }
  }
}

// Recorder manages screen recording functionalities
class Recorder {
  constructor(runtimeHandler) {
    this.runtimeHandler = runtimeHandler;
    this.autoDownload = false;
  }

  async initialize() {
    this.autoDownload = (await this.runtimeHandler.getStorage('autoDownload')).autoDownload || false;
  }

  async startScreenRecording() {
    console.log('Starting screen recording');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        if (this.autoDownload) {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `recording_${new Date().toISOString()}.webm`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // Provide a link to download manually
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.textContent = 'Download Recording';
          downloadLink.download = `recording_${new Date().toISOString()}.webm`;
          document.body.appendChild(downloadLink);
        }

        // Stop all tracks to end the stream
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      // Inform the user that recording has started
      alert('Recording started. Click "Stop Recording" to finish.');

      // Create a stop button dynamically
      const stopButton = document.createElement('button');
      stopButton.textContent = 'Stop Recording';
      stopButton.style.marginTop = '10px';
      stopButton.addEventListener('click', () => {
        mediaRecorder.stop();
        stopButton.remove();
      });
      document.body.appendChild(stopButton);
    } catch (error) {
      alert('Failed to start screen recording: ' + error.message);
      console.error('Screen Recording Error:', error);
    }
  }
}

// ThoughtManager handles thought submissions
class ThoughtManager {
  constructor(runtimeHandler) {
    this.runtimeHandler = runtimeHandler;
  }

  async submitThought(thoughtText) {
    if (!thoughtText.trim()) {
      alert('Please enter a valid thought.');
      return;
    }

    const thought = {
      timestamp: new Date().toISOString(),
      thought: thoughtText.trim(),
    };

    try {
      const data = await this.runtimeHandler.getStorage('thoughts');
      const thoughts = Array.isArray(data.thoughts) ? data.thoughts : [];
      thoughts.push(thought);
      await this.runtimeHandler.setStorage({ thoughts });
      alert('Thought submitted successfully!');
      document.getElementById('thought-input').value = '';
    } catch (error) {
      alert('Failed to submit thought.');
      console.error('Error:', error);
    }
  }
}

// UIManager handles all UI-related operations
class UIManager {
  constructor(orbManager, recorder, thoughtManager) {
    this.orbManager = orbManager;
    this.recorder = recorder;
    this.thoughtManager = thoughtManager;
  }

  sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  displayOrbs(orbs) {
    const orbsList = document.getElementById('orbs-list');
    orbsList.innerHTML = ''; // Clear existing content

    if (orbs.length === 0) {
      orbsList.textContent = 'No orbs collected yet.';
      return;
    }

    orbs.forEach((orb, index) => {
      const orbElement = document.createElement('div');
      orbElement.className = 'orb';
      orbElement.dataset.ordinality = index + 1;

      // Display 'name' if available, else fallback to 'id' or 'type'
      const displayName = orb.name || orb.id || orb.type || '?';
      orbElement.textContent = this.sanitizeText(displayName);

      orbsList.appendChild(orbElement);
      orbElement.onclick = () => {
        const mentionedOrdinality = orbElement.dataset.ordinality;
        document.getElementById('mentioned-ordinality').textContent = `Orb #${mentionedOrdinality}`;
      };
    });
  }

  async refreshOrbs() {
    try {
      const orbs = await this.orbManager.getOrbs();
      this.displayOrbs(orbs);
    } catch (error) {
      alert('Failed to load orbs.');
      console.error('Error:', error);
    }
  }

  async handleAddOrb(event) {
    event.preventDefault();
    const newOrbInput = document.getElementById('new-orb-input').value.trim();

    if (!newOrbInput) {
      alert('Please enter orb data.');
      return;
    }

    try {
      const orbsData = this.parseOrbsInput(newOrbInput);

      // Collect each orb and update the display
      const collectPromises = orbsData.map((orb) => this.orbManager.collectOrb(orb));

      await Promise.all(collectPromises);

      // Clear input after submission
      document.getElementById('new-orb-input').value = '';

      // Refresh displayed orbs
      await this.refreshOrbs();

      // Focus input
      document.getElementById('new-orb-input').focus();

      // Notify user of success
      alert('Orbs added successfully!');
    } catch (error) {
      alert(`Failed to add orb: ${error.message}`);
      console.error('Error:', error);
    }
  }

  async handleClearOrbs() {
    if (confirm('Are you sure you want to clear all orbs?')) {
      try {
        await this.orbManager.clearOrbs();
        this.displayOrbs([]);
        alert('All orbs have been cleared.');
      } catch (error) {
        alert('Failed to clear orbs.');
        console.error('Error:', error);
      }
    }
  }

  parseOrbsInput(input) {
    let orbsData = [];

    try {
      const parsedInput = JSON.parse(input);

      if (Array.isArray(parsedInput)) {
        parsedInput.forEach((node) => {
          if (Validator.isValidOrb(node)) {
            orbsData.push(node);
          } else {
            throw new Error('Invalid orb data in array');
          }
        });
      } else if (parsedInput.hasOwnProperty('nodes') && Array.isArray(parsedInput.nodes)) {
        parsedInput.nodes.forEach((node) => {
          if (Validator.isValidOrb(node)) {
            orbsData.push(node);
          } else {
            throw new Error('Invalid orb data in nodes array');
          }
        });
      } else if (Validator.isValidOrb(parsedInput)) {
        orbsData.push(parsedInput);
      } else {
        throw new Error('Invalid input structure');
      }
    } catch (e) {
      // If parsing fails, treat input as plain text
      if (input) {
        orbsData.push({
          name: input,
          x: Math.random() * 500,
          y: Math.random() * 500,
          r: 30,
        });
      } else {
        throw new Error('Empty input');
      }
    }

    return orbsData;
  }
}

// PopupManager orchestrates all components
class PopupManager {
  constructor() {
    this.runtimeHandler = new RuntimeHandler();
    this.orbManager = new OrbManager(this.runtimeHandler);
    this.recorder = new Recorder(this.runtimeHandler);
    this.thoughtManager = new ThoughtManager(this.runtimeHandler);
    this.uiManager = new UIManager(this.orbManager, this.recorder, this.thoughtManager);
  }

  async initialize() {
    await this.recorder.initialize();
    this.setupEventListeners();
    this.uiManager.refreshOrbs();
  }

  setupEventListeners() {
    // Clear orbs button event listener
    const clearOrbsButton = document.getElementById('clear-orbs');
    if (clearOrbsButton) {
      clearOrbsButton.addEventListener('click', () => this.uiManager.handleClearOrbs());
    }

    // Add orb form event listener
    const addOrbForm = document.getElementById('add-orb-form');
    if (addOrbForm) {
      addOrbForm.addEventListener('submit', (event) => this.uiManager.handleAddOrb(event));
    }

    // Start Recording Button Event Listener
    const startRecordingButton = document.getElementById('start-recording');
    if (startRecordingButton) {
      startRecordingButton.addEventListener('click', () => this.recorder.startScreenRecording());
    }

    // Submit Thought Event Listener
    const submitThoughtButton = document.getElementById('submit-thought');
    if (submitThoughtButton) {
      submitThoughtButton.addEventListener('click', () => {
        const thoughtText = document.getElementById('thought-input').value;
        this.thoughtManager.submitThought(thoughtText);
      });
    }
  }
}

// Initialize the popup when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const popupManager = new PopupManager();
  popupManager.initialize().catch((error) => {
    console.error('Failed to initialize PopupManager:', error);
  });
});
