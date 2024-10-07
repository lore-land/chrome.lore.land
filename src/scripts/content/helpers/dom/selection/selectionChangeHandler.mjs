import { currSelectionKey, prevSelectionKey } from "../../../constants.mjs";
import { _____log } from "../../../../log/log.mjs";

// Initialize the selection change handler
export function selectionChangeHandler() {
  document.onselectionchange = handleDocumentSelectionChange;
}

// Handle selection changes in the document
function handleDocumentSelectionChange() {
  document.body.classList.add('can-yank');

  const selection = document.getSelection();
  const parentAnchor = selection?.anchorNode?.parentNode || null;
  const parentFocus = selection?.focusNode?.parentNode || null;
  const selectionText = selection?.toString() || '';

  // Update selection states
  window[prevSelectionKey] = window[currSelectionKey];
  window[currSelectionKey] = { parentAnchor, parentFocus, selectionText };

  // Log the new selection details
  _____log('New selection made:', window[currSelectionKey]);
}
