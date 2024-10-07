import { clearYanksButtonId } from "../../constants.mjs";
import { setLocal } from "../../helpers/chrome/chromeLocalStorage.mjs";
import { fillYankLog } from "./fillYankLog.mjs";
import { _____log } from "../../../log/log.mjs";

// Initialize the "Clear Selections" button
export function initClearSelectionsButton() {
  const element = document.createElement('div');
  element.classList.add('toplevel-button');
  element.id = clearYanksButtonId;
  element.style.transition = 'background-color 0.2s, opacity 1s';
  element.innerHTML = "<span>Clear Selections</span>";

  // Attach the click event handler
  element.onclick = onClearSelectionsClick;

  return element;
}

// Handle the click event for clearing selections
async function onClearSelectionsClick(e) {
  e.stopPropagation();
  const button = this;
  const { backgroundColor, transition } = button.style;

  // Temporarily change background color to white and restore it after 200ms
  button.style.backgroundColor = 'white';
  setTimeout(() => {
    button.style.backgroundColor = backgroundColor;
    button.style.transition = transition;
  }, 200);

  // Clear the htmlSnippets and update the yank log
  await setLocal('htmlSnippets', []);
  await fillYankLog(() => {
    _____log('fg: filling after clear');
  });
}
