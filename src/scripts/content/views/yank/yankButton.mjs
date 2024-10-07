import { yankButtonId as yankId } from "../../constants.mjs";
import { yankText } from "../../helpers/dom/selection/yankText.mjs";
import { fillYankLog } from "./fillYankLog.mjs";
import { _____log } from "../../../log/log.mjs";

// Initialize the "Yank Text" button
export function initYank() {
  const element = document.createElement('div');
  element.classList.add('toplevel-button');
  element.id = yankId;
  element.onclick = onYankClick;
  element.innerHTML = "<span>Yank Text</span>";

  return element;
}

// Handle the yank button click event
async function onYankClick(e) {
  e.stopPropagation();

  const element = this;
  const originalColor = element.style.backgroundColor;

  try {
    // Yank the selected text and log success
    await yankText(() => { _____log('fg: after yanking text'); }, true);
  } catch (error) {
    console.log('Not yanking: no selection made', error);
    return;
  }

  // Temporarily change the button color during the yank process
  element.style.backgroundColor = 'white';
  setTimeout(() => {
    element.style.backgroundColor = originalColor;
  }, 300);

  // Fill the yank log and log completion
  await fillYankLog(() => { _____log('fg: after yank click'); });
}
