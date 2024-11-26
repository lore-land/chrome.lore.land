const runtime = typeof browser !== 'undefined' ? browser : chrome;

// RuntimeHandler manages the browser runtime interactions
class RuntimeHandler {
  constructor(runtime) {
    this.runtime = runtime;
  }

  sendMessage(message, callback) {
    this.runtime.runtime.sendMessage(message, callback);
  }

  get lastError() {
    return this.runtime.runtime.lastError;
  }
}

// ElementCollector handles data collection and sanitization from elements
class ElementCollector {
  constructor(selectors) {
    this.selectors = selectors;
    this.countMap = {};
  }

  sanitizeString(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  collectData(element, type) {
    try {
      const id = this.sanitizeString(
        element.getAttribute('data-id') ||
        `${type}-${this.countMap[type] ? this.countMap[type]++ : (this.countMap[type] = 1)}`
      );
      const state = this.sanitizeString(element.getAttribute('data-state') || 'default');

      // Extract emotion attributes
      const valence = parseFloat(element.getAttribute('data-emotion-valence')) || 0;
      const arousal = parseFloat(element.getAttribute('data-emotion-arousal')) || 0;
      const discreteEmotions = this.sanitizeString(element.getAttribute('data-emotion-discrete') || '');

      // Extract or define a name property if applicable
      const name = this.sanitizeString(element.getAttribute('data-name') || `Orb-${id}`);

      // Calculate position if necessary
      const rect = element.getBoundingClientRect();
      const x = rect.left + window.scrollX;
      const y = rect.top + window.scrollY;

      return { id, name, type, state, x, y, valence, arousal, discreteEmotions };
    } catch (error) {
      console.error(`Error collecting data from ${type}:`, error);
      return null;
    }
  }
}

// BackgroundCommunicator manages communication with the background script
class BackgroundCommunicator {
  constructor(runtimeHandler) {
    this.runtimeHandler = runtimeHandler;
  }

  sendData(command, data) {
    if (!data) return;

    this.runtimeHandler.sendMessage({ command, data }, (response) => {
      if (this.runtimeHandler.lastError) {
        console.error(`Error sending data to background (${command}):`, this.runtimeHandler.lastError);
      } else {
        console.log(`Data for ${data.type} with ID "${data.id}" collected successfully.`);
      }
    });
  }

  sendPuzzleCommand(puzzleId) {
    this.sendData('openPuzzle', { puzzleId });
  }
}

// NotificationManager handles creating and displaying notifications
class NotificationManager {
  show(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 123, 255, 0.9)',
      color: '#fff',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      zIndex: '10000',
      transition: 'opacity 0.5s ease',
      opacity: '0',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    });

    document.body.appendChild(notification);

    // Trigger fade-in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.addEventListener('transitionend', () => {
        notification.remove();
      });
    }, 3000);
  }
}

// MutationObserverHandler observes DOM changes for custom elements
class MutationObserverHandler {
  constructor(selectors, callback) {
    this.selectors = selectors;
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.callback = callback;
  }

  start() {
    this.observer.observe(document.body, { childList: true, subtree: true });
    console.log('Started observing DOM mutations for custom elements.');
  }

  handleMutations(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.selectors.forEach((selector) => {
              if (node.matches(selector)) {
                this.callback(node, selector);
              }

              // Also check descendants
              node.querySelectorAll(selector).forEach((elem) => {
                this.callback(elem, selector);
              });
            });
          }
        });
      }
    });
  }
}

// InteractionHandler manages user interactions with custom elements
class InteractionHandler {
  constructor(selectors, elementCollector, backgroundCommunicator, notificationManager) {
    this.selectors = selectors;
    this.elementCollector = elementCollector;
    this.backgroundCommunicator = backgroundCommunicator;
    this.notificationManager = notificationManager;
    this.bindEvents();
  }

  bindEvents() {
    document.body.addEventListener('click', this.handleClick.bind(this), true);
  }

  handleClick(event) {
    const { selectors } = this;
    selectors.forEach((selector) => {
      const elem = event.target.closest(selector);
      if (elem) {
        if (selector === this.selectors.BUTTON_SELECTOR) {
          const action = elem.getAttribute('action');
          if (action) {
            this.handleButtonAction(action);
          }
        } else {
          const type = selector.replace('custom-', '');
          const data = this.elementCollector.collectData(elem, type);
          if (data) {
            switch (type) {
              case 'reflection':
                this.handleReflectionInteraction(data);
                break;
              case 'puzzle':
                this.handlePuzzleInteraction(data);
                break;
              case 'mirror':
                this.handleMirrorInteraction(data, elem);
                break;
              default:
                console.warn(`Unhandled interaction type: ${type}`);
            }
          }
        }
      }
    });
  }

  handleButtonAction(action) {
    console.log(`Button action triggered: ${action}`);
    switch (action) {
      case 'attemptPuzzle':
        this.attemptPuzzle();
        break;
      // Add more action cases as needed
      default:
        console.warn(`Unrecognized button action: ${action}`);
    }
  }

  attemptPuzzle() {
    try {
      // Implement puzzle interaction logic here
      this.notificationManager.show('Attempting the puzzle...');
      // Example: Open a modal, send a message to background, etc.
    } catch (error) {
      console.error('Error during puzzle attempt:', error);
      this.notificationManager.show('An error occurred while attempting the puzzle.');
    }
  }

  handleReflectionInteraction(data) {
    this.notificationManager.show(`Reflection ID: ${data.id}\nState: ${data.state}`);
    // Further actions can be implemented here
  }

  handlePuzzleInteraction(data) {
    try {
      // Send a message to the background script to open a puzzle modal
      this.backgroundCommunicator.sendPuzzleCommand(data.id);
      this.notificationManager.show('Puzzle opened!');
    } catch (error) {
      console.error('Error handling puzzle interaction:', error);
      this.notificationManager.show('An error occurred while handling the puzzle interaction.');
    }
  }

  handleMirrorInteraction(data, element) {
    try {
      if (data.state === 'mirrored') {
        // Revert to original state
        element.setAttribute('data-state', 'default');
        this.notificationManager.show(`Mirror "${data.id}" reverted to default state.`);
      } else {
        // Set to mirrored state
        element.setAttribute('data-state', 'mirrored');
        this.notificationManager.show(`Mirror "${data.id}" is now mirrored.`);
      }
    } catch (error) {
      console.error('Error toggling mirror state:', error);
      this.notificationManager.show('An error occurred while toggling the mirror.');
    }
  }
}

// LoreLandManager orchestrates all components for the lore.land hostname
class LoreLandManager {
  constructor() {
    this.hostname = window.location.hostname;
    this.selectors = {
      REFLECTION_SELECTOR: 'custom-reflection',
      PUZZLE_SELECTOR: 'custom-puzzle',
      MIRROR_SELECTOR: 'custom-mirror',
      BUTTON_SELECTOR: 'button.content-button[action="attemptPuzzle"]',
    };
    this.init();
  }

  init() {
    switch (this.hostname) {
      case 'lore.land':
        this.initLoreLandInteractions();
        break;
      default:
        console.warn(`Unhandled hostname: ${this.hostname}`);
    }
  }

  initLoreLandInteractions() {
    console.log('Initializing LoreLand specific interactions...');

    // Initialize components
    this.runtimeHandler = new RuntimeHandler(runtime);
    this.elementCollector = new ElementCollector(this.selectors);
    this.backgroundCommunicator = new BackgroundCommunicator(this.runtimeHandler);
    this.notificationManager = new NotificationManager();

    // Process existing elements
    this.processExistingElements();

    // Observe DOM mutations
    this.mutationObserver = new MutationObserverHandler(
      Object.values(this.selectors),
      this.handleNewElement.bind(this)
    );
    this.mutationObserver.start();

    // Handle interactions
    this.interactionHandler = new InteractionHandler(
      Object.values(this.selectors),
      this.elementCollector,
      this.backgroundCommunicator,
      this.notificationManager
    );

    // Listen to custom app events
    this.listenToAppEvents();
  }

  processExistingElements() {
    const { REFLECTION_SELECTOR, PUZZLE_SELECTOR, MIRROR_SELECTOR, BUTTON_SELECTOR } = this.selectors;
    const elements = [
      { selector: REFLECTION_SELECTOR, type: 'reflection' },
      { selector: PUZZLE_SELECTOR, type: 'puzzle' },
      { selector: MIRROR_SELECTOR, type: 'mirror' },
      { selector: BUTTON_SELECTOR, type: 'button' },
    ];

    elements.forEach(({ selector, type }) => {
      document.querySelectorAll(selector).forEach((elem) => {
        if (!elem.dataset.collected && !elem.dataset.actionProcessed) {
          if (type === 'button') {
            elem.dataset.actionProcessed = 'true';
          } else {
            const data = this.elementCollector.collectData(elem, type);
            this.backgroundCommunicator.sendData('collectOrb', data);
            elem.dataset.collected = 'true';
          }
        }
      });
    });
  }

  handleNewElement(element, selector) {
    if (selector === this.selectors.BUTTON_SELECTOR) {
      if (!element.dataset.actionProcessed) {
        element.dataset.actionProcessed = 'true';
      }
    } else {
      const type = selector.replace('custom-', '');
      if (!element.dataset.collected) {
        const data = this.elementCollector.collectData(element, type);
        this.backgroundCommunicator.sendData('collectOrb', data);
        element.dataset.collected = 'true';
      }
    }
  }

  listenToAppEvents() {
    document.addEventListener('element-clicked', (event) => {
      const { type, state } = event.detail;
      console.log(`Event: <${type}> clicked with state '${state}'`);

      if (type === 'custom-puzzle' && state === 'played') {
        this.notificationManager.show(`Puzzle "${type}" has been played.`);
      }

      // Add more conditions as needed
    });

    document.addEventListener('reflection-submitted', (event) => {
      const { reflectionId, text } = event.detail;
      console.log(`Reflection submitted. ID: ${reflectionId}, Text: ${text}`);
      this.notificationManager.show(`Reflection "${reflectionId}" submitted successfully.`);
    });

    document.addEventListener('mirror-toggled', (event) => {
      const { mirrorId, state } = event.detail;
      console.log(`Mirror toggled. ID: ${mirrorId}, New State: ${state}`);
      this.notificationManager.show(`Mirror "${mirrorId}" toggled to "${state}".`);
    });
  }
}

// Initialize the manager when the DOM is ready
(function () {
  const manager = new LoreLandManager();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Initialization already handled in constructor
    });
  } else {
    // Initialization already handled in constructor
  }
})();
