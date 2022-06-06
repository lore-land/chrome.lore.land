import {clearYanksButtonId} from "../../constants.mjs";
import {setLocal}    from "../../helpers/chrome/chromeLocalStorage.mjs";
import {fillYankLog} from "./fillYankLog.mjs";
import {_____log}    from "../../../log/log.mjs";

export function initClearSelectionsButton() {
  const element = document.createElement('div');
  element.classList.add('toplevel-button');
  element.id               = clearYanksButtonId;
  element.style.transition = 'background-color .2s, opacity 1s';
  element.innerHTML        = "<span>clear selections</span>";

  element.onclick = onClearSelectionsClick

  return element;
}

async function onClearSelectionsClick(e) {
  e.stopPropagation();
  const element                       = this;
  const {backgroundColor, transition} = element.style;
  element.style.backgroundColor       = 'white';
  setTimeout(() => {
    element.style.backgroundColor = backgroundColor;
    element.style.transition      = transition;
  }, 200);
  await setLocal('htmlSnippets', []);
  await fillYankLog(() => { _____log('fg: filling after clear'); });
}