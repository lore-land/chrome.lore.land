import {selectionChangeHandler} from "./helpers/dom/selection/selectionChangeHandler.mjs";
import {initComponents}         from "./views/widgetDisplayContainer.mjs";
import {fillYankLog}            from "./views/yank/fillYankLog.mjs";
import {_____log}               from "../log/log.mjs";
import {currSelectionKey}       from "./constants.mjs";
import {getLocal, setLocal}     from "./helpers/chrome/chromeLocalStorage.mjs";

setLocal('app-active', false)


let run = false;
window.addEventListener('focus', e => window[currSelectionKey] = e.target);
window.addEventListener('blur', e => window[currSelectionKey] = e.target)


export async function initApp() {
  if (!run) {
    selectionChangeHandler();
  }

  run = true;

  const isActive = await getLocal('app-active');

  if (isActive) return;
  initComponents();

  await fillYankLog(() => {_____log('fg: initial log fill')});
  await setLocal('app-active', true)
}