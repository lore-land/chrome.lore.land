import {getHighest_zIndex}         from "../helpers/getHighest_zIndex.mjs";
import {initShutterWidget}         from "./shutter/shutterButton.mjs";
import {initYank}                  from "./yank/yankButton.mjs";
import {initRecordButton}          from "./screen-recording/screenRecordButton.js";
import {initClearSelectionsButton} from "./yank/clearYankClipboardButton.js";
import {initVideoPreview}          from "./videoDisplayWidget.mjs";
import {buttonContainerId}         from "../constants.mjs";

export function initComponents() {
  const highest         = getHighest_zIndex();
  const buttonContainer = document.createElement('div');
  buttonContainer.id    = buttonContainerId;
  document.body.insertBefore(buttonContainer, document.body.firstChild);
  buttonContainer.style.zIndex     = `${Math.max((highest.index || 10) + 1, 10)}`;
  buttonContainer.style.position   = 'fixed';
  buttonContainer.style.top        = '0';
  buttonContainer.style.right      = '0';
  buttonContainer.style.display    = 'inline-flex';
  buttonContainer.style.alignItems = 'center';

  const shutter        = initShutterWidget();
  const record         = initRecordButton();
  const yank           = initYank();
  const clearSelection = initClearSelectionsButton();

  buttonContainer.appendChild(shutter);
  buttonContainer.appendChild(record);
  buttonContainer.appendChild(yank);
  buttonContainer.appendChild(clearSelection);


  initVideoPreview();
}