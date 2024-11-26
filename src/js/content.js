// src/js/content.js
// noinspection t

// Polyfill for browser APIs to ensure cross-browser compatibility
const runtime = (typeof browser !== 'undefined') ? browser : chrome;

// Immediately Invoked Function Expression (IIFE) to avoid polluting the global namespace
// noinspection t
(function () {
  // Initialize the script
  run();

  /**
   * Main function to initialize content script functionalities based on hostname.
   */
  function run() {
    switch (window.location.hostname) {
      case "lore.land":
        initLoreLandInteractions();
        break;
      default:
        console.warn(`Unhandled hostname: ${window.location.hostname}`);
    }
  }

  /**
   * Initializes interactions specific to lore.land.
   * Detects custom elements, observes DOM changes, and handles user interactions.
   */
  function initLoreLandInteractions() {
    console.log("Initializing LoreLand specific interactions...");

    // Define CSS selectors for custom elements
    const REFLECTION_SELECTOR = 'custom-reflection';
    const PUZZLE_SELECTOR = 'custom-puzzle';
    const MIRROR_SELECTOR = 'custom-mirror';
    const BUTTON_SELECTOR = 'button.content-button[action="attemptPuzzle"]'; // Targeting buttons with specific action

    /**
     * Sanitizes a string by escaping HTML entities.
     * @param {string} str - The string to sanitize.
     * @returns {string} - The sanitized string.
     */
    function sanitizeString(str) {
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
    }

    let countMap = {

    }
    /**
     * Collects data from a custom element.
     * @param {Element} element - The DOM element representing the custom component.
     * @param {string} type - Type of the custom element (e.g., reflection, puzzle).
     * @returns {Object|null} - The collected data or null if invalid.
     */
    function collectCustomElementData(element, type) {
      try {
        const id = sanitizeString(element.getAttribute('data-id') || (type +'-'+ (countMap[type] ? countMap[type]++ : (countMap[type] = 1))));
        const state = sanitizeString(element.getAttribute('data-state') || 'default');

        // Extract emotion attributes
        const valence = parseFloat(element.getAttribute('data-emotion-valence')) || 0;
        const arousal = parseFloat(element.getAttribute('data-emotion-arousal')) || 0;
        const discreteEmotions = sanitizeString(element.getAttribute('data-emotion-discrete') || '');

        // Extract or define a name property if applicable
        const name = sanitizeString(element.getAttribute('data-name') || `Orb-${id}`);

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

    /**
     * Sends collected custom element data to the background script.
     * @param {Object} data - The data of the custom element.
     */
    function sendDataToBackground(data) {
      if (!data) return;

      runtime.runtime.sendMessage({ command: "collectOrb", data }, (response) => {
        if (runtime.runtime.lastError) {
          console.error("Error sending data to background:", runtime.runtime.lastError);
        } else {
          console.log(`Data for ${data.type} with ID "${data.id}" collected successfully.`);
        }
      });
    }

    /**
     * Processes all existing custom elements on the page.
     */
    function processExistingElements() {
      const reflections = document.querySelectorAll(REFLECTION_SELECTOR);
      reflections.forEach((elem) => {
        if (!elem.dataset.collected) {
          const data = collectCustomElementData(elem, 'reflection');
          sendDataToBackground(data);
          elem.dataset.collected = "true"; // Mark as collected
        }
      });

      const puzzles = document.querySelectorAll(PUZZLE_SELECTOR);
      puzzles.forEach((elem) => {
        if (!elem.dataset.collected) {
          const data = collectCustomElementData(elem, 'puzzle');
          sendDataToBackground(data);
          elem.dataset.collected = "true";
        }
      });

      const mirrors = document.querySelectorAll(MIRROR_SELECTOR);
      mirrors.forEach((elem) => {
        if (!elem.dataset.collected) {
          const data = collectCustomElementData(elem, 'mirror');
          sendDataToBackground(data);
          elem.dataset.collected = "true";
        }
      });

      // Process buttons separately
      const buttons = document.querySelectorAll(BUTTON_SELECTOR);
      buttons.forEach((button) => {
        if (!button.dataset.actionProcessed) {
          // Optionally, you can collect data related to the button here
          // For now, we mark it as processed
          button.dataset.actionProcessed = "true";
        }
      });
    }

    /**
     * Observes DOM mutations to detect dynamically added custom elements.
     */
    function observeCustomElementMutations() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check for each custom element type
                [REFLECTION_SELECTOR, PUZZLE_SELECTOR, MIRROR_SELECTOR, BUTTON_SELECTOR].forEach((selector) => {
                  if (node.matches(selector)) {
                    if (!node.dataset.collected && !node.dataset.actionProcessed) {
                      if (selector === BUTTON_SELECTOR) {
                        // Handle button initialization if needed
                        // For example, attach event listeners or mark as processed
                        node.dataset.actionProcessed = "true";
                      } else {
                        const type = selector.replace('custom-', '');
                        const data = collectCustomElementData(node, type);
                        sendDataToBackground(data);
                        node.dataset.collected = "true";
                      }
                    }
                  }

                  // Also check descendants
                  node.querySelectorAll(selector).forEach((elem) => {
                    if (!elem.dataset.collected && !elem.dataset.actionProcessed) {
                      if (selector === BUTTON_SELECTOR) {
                        // Handle button initialization if needed
                        elem.dataset.actionProcessed = "true";
                      } else {
                        const type = selector.replace('custom-', '');
                        const data = collectCustomElementData(elem, type);
                        sendDataToBackground(data);
                        elem.dataset.collected = "true";
                      }
                    }
                  });
                });
              }
            });
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
      console.log("Started observing DOM mutations for custom elements.");
    }

    /**
     * Handles user interactions with custom elements.
     */
    function handleCustomElementInteractions() {
      document.body.addEventListener('click', (event) => {
        const reflectionElem = event.target.closest(REFLECTION_SELECTOR);
        if (reflectionElem) {
          const data = collectCustomElementData(reflectionElem, 'reflection');
          // Example action: Open a modal or highlight the reflection
          showNotification(`Reflection ID: ${data.id}\nState: ${data.state}`);
          // Further actions can be implemented here
        }

        const puzzleElem = event.target.closest(PUZZLE_SELECTOR);
        if (puzzleElem) {
          const data = collectCustomElementData(puzzleElem, 'puzzle');
          // Example action: Trigger puzzle interaction
          handlePuzzleInteraction(data);
        }

        const mirrorElem = event.target.closest(MIRROR_SELECTOR);
        if (mirrorElem) {
          const data = collectCustomElementData(mirrorElem, 'mirror');
          // Example action: Toggle mirror state
          toggleMirrorState(data, mirrorElem);
        }

        const buttonElem = event.target.closest(BUTTON_SELECTOR);
        if (buttonElem) {
          // Extract action from data-action attribute
          const action = buttonElem.getAttribute('action');
          if (action) {
            handleButtonAction(action);
          }
        }
      }, true); // Use capture to ensure the event is caught early
    }

    /**
     * Handles the "Attempt Puzzle" button action.
     * @param {string} action - The action identifier.
     */
    function handleButtonAction(action) {
      console.log(`Button action triggered: ${action}`);
      switch (action) {
        case 'attemptPuzzle':
          attemptPuzzle();
          break;
        // Add more action cases as needed
        default:
          console.warn(`Unrecognized button action: ${action}`);
      }
    }

    /**
     * Attempts the puzzle interaction.
     * Placeholder function for puzzle logic.
     */
    function attemptPuzzle() {
      try {
        // Implement puzzle interaction logic here
        showNotification('Attempting the puzzle...');
        // Example: Open a modal, send a message to background, etc.
      } catch (error) {
        console.error('Error during puzzle attempt:', error);
        showNotification('An error occurred while attempting the puzzle.');
      }
    }

    /**
     * Toggles the state of a mirror element.
     * @param {Object} data - The data of the mirror element.
     * @param {Element} element - The mirror DOM element.
     */
    function toggleMirrorState(data, element) {
      try {
        if (data.state === 'mirrored') {
          // Revert to original state
          element.setAttribute('data-state', 'default');
          showNotification(`Mirror "${data.id}" reverted to default state.`);
        } else {
          // Set to mirrored state
          element.setAttribute('data-state', 'mirrored');
          showNotification(`Mirror "${data.id}" is now mirrored.`);
        }
      } catch (error) {
        console.error('Error toggling mirror state:', error);
        showNotification('An error occurred while toggling the mirror.');
      }
    }

    /**
     * Handles puzzle interaction logic.
     * @param {Object} data - The data of the puzzle element.
     */
    function handlePuzzleInteraction(data) {
      try {
        // Example: Send a message to the background script to open a puzzle modal
        runtime.runtime.sendMessage({ command: "openPuzzle", puzzleId: data.id }, (response) => {
          if (runtime.runtime.lastError) {
            console.error("Error opening puzzle modal:", runtime.runtime.lastError);
            showNotification('Failed to open the puzzle.');
          } else {
            console.log(`Puzzle "${data.id}" modal opened successfully.`);
            showNotification('Puzzle opened!');
          }
        });
      } catch (error) {
        console.error('Error handling puzzle interaction:', error);
        showNotification('An error occurred while handling the puzzle interaction.');
      }
    }

    /**
     * Displays a custom notification to the user.
     * @param {string} message - The message to display.
     */
    function showNotification(message) {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = 'rgba(0, 123, 255, 0.9)';
      notification.style.color = '#fff';
      notification.style.padding = '1rem';
      notification.style.borderRadius = '0.5rem';
      notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
      notification.style.zIndex = '10000';
      notification.style.transition = 'opacity 0.5s ease';
      notification.style.opacity = '0';
      notification.style.fontFamily = 'Arial, sans-serif';
      notification.style.fontSize = '14px';

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

    /**
     * Listens for custom events dispatched by the application.
     */
    function listenToAppEvents() {
      document.addEventListener('element-clicked', (event) => {
        const { type, state } = event.detail;
        console.log(`Event: <${type}> clicked with state '${state}'`);

        // Perform actions based on the event type and state
        if (type === 'custom-puzzle' && state === 'played') {
          // Example action: Notify the user or update internal state
          showNotification(`Puzzle "${type}" has been played.`);
        }

        // Add more conditions as needed
      });

      document.addEventListener('reflection-submitted', (event) => {
        const { reflectionId, text } = event.detail;
        console.log(`Reflection submitted. ID: ${reflectionId}, Text: ${text}`);

        // Example action: Store reflection data or provide feedback
        showNotification(`Reflection "${reflectionId}" submitted successfully.`);
      });

      document.addEventListener('mirror-toggled', (event) => {
        const { mirrorId, state } = event.detail;
        console.log(`Mirror toggled. ID: ${mirrorId}, New State: ${state}`);

        // Example action: Update UI or trigger animations
        showNotification(`Mirror "${mirrorId}" toggled to "${state}".`);
      });
    }

    /**
     * Executes the defined functionalities after ensuring the DOM is fully loaded
     */
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        processExistingElements();
        observeCustomElementMutations();
        handleCustomElementInteractions();
        listenToAppEvents();
      });
    } else {
      processExistingElements();
      observeCustomElementMutations();
      handleCustomElementInteractions();
      listenToAppEvents();
    }
  }
})();
