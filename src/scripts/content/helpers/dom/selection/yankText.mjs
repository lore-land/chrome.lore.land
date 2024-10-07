import { currSelectionKey } from "../../../constants.mjs";
import { getLocal, setLocal } from "../../chrome/chromeLocalStorage.mjs";
import { commonAncestor } from "../traversal/commonAncestor.mjs";

// Save the HTML snippet into local storage
async function saveHtmlSnippet(json) {
  const parsed = json;
  const htmlSnippets = (await getLocal('htmlSnippets')) || [];
  const value = [parsed, ...htmlSnippets].slice(0, 10); // Limit to 10 snippets
  return setLocal('htmlSnippets', value);
}

// Yank the selected text and highlight the selection
export async function yankText(sendResponse, usePrev) {
  if (usePrev) {
    // Optional: handle using previous selection if needed
    // window[currSelectionKey] = window[prevSelectionKey];
  }

  if (!window[currSelectionKey]) {
    throw new Error('No selection available');
  }

  const uri = document.documentURI || 'null';
  const html = document.body.outerHTML || 'yank_text failed';
  const { parentAnchor, parentFocus, selectionText } = window[currSelectionKey];

  const parent = (parentAnchor === parentFocus)
    ? parentAnchor
    : commonAncestor(parentAnchor, parentFocus);

  if (!parent) {
    throw new Error('No common parent found for selection');
  }

  const selectionNodeHtml = parent.outerHTML;
  const { width, height, top, left } = parent.getBoundingClientRect();

  const unHighlight = makeElementHighlight(parent, width, height, top, left);
  setTimeout(() => unHighlight(), 500); // Automatically remove highlight after 500ms

  // Save the selection and context as a snippet
  await saveHtmlSnippet({
    ts: Date.now(),
    date: new Date().toLocaleString(),
    uri,
    selection: selectionText,
    text: parent.innerText,
    selectionNodeHtml
  });

  // Return relevant information for the yanked text
  return {
    uri,
    html,
    parentAnchor,
    parentFocus,
    parent,
    selectionText,
    selectionNodeHtml
  };
}

// Highlight the selected element in the DOM
function makeElementHighlight(parent, width, height, top, left) {
  const square = document.createElement('div');
  const borderThickness = 2;

  square.style.position = 'fixed';
  square.style.width = `${width}px`;
  square.style.height = `${height}px`;
  square.style.top = `${top - borderThickness}px`;
  square.style.left = `${left - borderThickness}px`;
  square.style.border = `${borderThickness}px solid red`;
  square.style.zIndex = '9999';
  square.style.boxSizing = 'content-box';
  square.style.transition = 'background-color .2s, opacity 1s';

  const inner = document.createElement('div');
  inner.classList.add('highlight-wrapper');
  inner.innerHTML = parent.outerHTML;
  square.appendChild(inner);

  // Prevent the first child of the selection from shifting
  inner.firstChild.style.margin = '0';
  parent.parentElement.appendChild(square);

  // Gradually fade out the highlight
  requestAnimationFrame(() => {
    setTimeout(() => {
      square.style.opacity = '0';
    }, 50);
  });

  // Return a function to remove the highlight from the DOM
  return () => {
    if (parent.parentElement) {
      parent.parentElement.removeChild(square);
    }
  };
}
