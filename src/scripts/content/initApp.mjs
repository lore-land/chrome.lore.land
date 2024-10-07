import { selectionChangeHandler } from "./helpers/dom/selection/selectionChangeHandler.mjs";
import { initComponents } from "./views/widgetDisplayContainer.mjs";
import { fillYankLog } from "./views/yank/fillYankLog.mjs";
import { _____log } from "../log/log.mjs";
import { currSelectionKey } from "./constants.mjs";
import { getLocal, setLocal } from "./helpers/chrome/chromeLocalStorage.mjs";

// Set the app as inactive in local storage initially
setLocal('app-active', false);

let run = false;

// Event listeners to update the current selection key on focus/blur
window.addEventListener('focus', (e) => window[currSelectionKey] = e.target);
window.addEventListener('blur', (e) => window[currSelectionKey] = e.target);

// Initialize the application
export async function initApp() {
  if (!run) {
    selectionChangeHandler(); // Set up the selection change handler only once
    run = true;
  }

  const isActive = await getLocal('app-active');
  if (isActive) return; // Prevent re-initialization if the app is already active

  initComponents(); // Initialize UI components

  // Fill yank log and mark the app as active
  await fillYankLog(() => { _____log('fg: initial log fill'); });
  await setLocal('app-active', true);
}
