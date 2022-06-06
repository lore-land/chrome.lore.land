import {currSelectionKey, prevSelectionKey} from "../../../constants.mjs";
import {_____log}                           from "../../../../log/log.mjs";

export function selectionChangeHandler() {
  document.onselectionchange = handleDocumentSelectionChange;
}

function handleDocumentSelectionChange() {
  document.body.classList.add('can-yank');

  const selection     = document.getSelection();
  const parentAnchor  = (selection.anchorNode || {}).parentNode;
  const parentFocus   = (selection.focusNode || {}).parentNode;
  const selectionText = (selection || '').toString() || '';

  window[prevSelectionKey] = window[currSelectionKey];
  window[currSelectionKey] = {parentAnchor, parentFocus, selectionText};
  _____log('New selection made', window[currSelectionKey]);
}