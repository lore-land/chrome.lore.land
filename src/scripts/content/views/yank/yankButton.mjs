import {yankButtonId as yankId} from "../../constants.mjs";
import {yankText}               from "../../helpers/dom/selection/yankText.mjs";
import {fillYankLog}            from "./fillYankLog.mjs";
import {_____log}               from "../../../log/log.mjs";


export function initYank() {
  const element = document.createElement('div');
  element.classList.add('toplevel-button');
  element.id        = yankId;
  element.onclick   = onYankClick;
  element.innerHTML = "<span>Yank Text</span>";

  return element;
}

async function onYankClick(e) {
  e.stopPropagation();
  const element   = this;
  const yankColor = element.style.backgroundColor;

  try {
    await yankText(() => {_____log('fg: after yanking text')}, true);
  } catch (e) {
    console.log('not yanking: no selection made', e);
    return;
  }

  element.style.backgroundColor = 'white';
  setTimeout(() => {
    element.style.backgroundColor = yankColor;
  }, 300);
  await fillYankLog(() => {_____log('fg: after yank click')});
}
