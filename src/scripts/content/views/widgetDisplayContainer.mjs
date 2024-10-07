import { getHighest_zIndex } from "../helpers/getHighest_zIndex.mjs";
import { initShutterWidget } from "./shutter/shutterButton.mjs";
import { initYank } from "./yank/yankButton.mjs";
import { initRecordButton } from "./screen-recording/screenRecordButton.js";
import { initClearSelectionsButton } from "./yank/clearYankClipboardButton.js";
import { initVideoPreview } from "./videoDisplayWidget.mjs";
import { buttonContainerId } from "../constants.mjs";

// Initialize all UI components
export function initComponents() {
  // Get the highest z-index in the document to ensure the button container is always on top
  const highest = getHighest_zIndex();

  // Create and style the button container
  const buttonContainer = createButtonContainer(highest.index || 10);
  document.body.insertBefore(buttonContainer, document.body.firstChild);

  // Initialize and append all buttons to the container
  buttonContainer.appendChild(initShutterWidget());
  buttonContainer.appendChild(initRecordButton());
  buttonContainer.appendChild(initYank());
  buttonContainer.appendChild(initClearSelectionsButton());

  // Initialize the video preview widget
  initVideoPreview();
}

// Create and style the button container
function createButtonContainer(zIndex) {
  const container = document.createElement('div');
  container.id = buttonContainerId;
  container.style.zIndex = `${Math.max(zIndex + 1, 10)}`;
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.right = '0';
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  return container;
}
