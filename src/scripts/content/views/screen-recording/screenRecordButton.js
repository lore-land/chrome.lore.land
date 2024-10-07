import { recordButtonId } from "../../constants.mjs";

// Initialize the recording button and set its behavior
export function initRecordButton() {
  // Create the button element
  const element = document.createElement('div');
  element.classList.add('toplevel-button');
  element.id = recordButtonId;
  element.innerHTML = "<span>Begin Recording</span>";

  // Handle the button click event
  element.onclick = async function (e) {
    e.stopPropagation();

    const button = this;
    const originalBackgroundColor = button.style.backgroundColor;
    const originalTransition = button.style.transition;

    // Temporarily change the background color on click
    button.style.backgroundColor = 'white';
    button.style.transition = 'background-color 0.5s';
    button.style.backgroundColor = originalBackgroundColor;

    // Restore the original transition after 500ms
    setTimeout(() => {
      button.style.transition = originalTransition;
    }, 500);

    try {
      // Send a message to begin screen recording
      await chrome.runtime.sendMessage({ text: 'record_screen' });
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  return element;
}
