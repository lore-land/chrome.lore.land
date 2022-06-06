import {currSelectionKey}   from "../../../constants.mjs";
import {getLocal, setLocal} from "../../chrome/chromeLocalStorage.mjs";
import {commonAncestor}     from "../traversal/commonAncestor.mjs";

async function saveHtmlSnippet(json) {
  const parsed       = json;
  const htmlSnippets = (await getLocal('htmlSnippets')) || [];
  const value        = [parsed, ...htmlSnippets || []];
  let MAX_SNIPPETS   = 10;
  value.length       = Math.min(MAX_SNIPPETS, value.length);
  return setLocal('htmlSnippets', value)
}

export async function yankText(sendResponse, usePrev) {
  if (usePrev) {
    // window[currSelectionKey] = window[prevSelectionKey];
  }

  if (!window[currSelectionKey]) {
    throw new Error('No selection')
  }

  const uri  = document.documentURI || 'null';
  const html = document.body.outerHTML || 'yank_text failed';

  const {parentAnchor, parentFocus, selectionText} = window[currSelectionKey];

  const parent = (parentAnchor === parentFocus)
                 ? parentAnchor
                 : commonAncestor(parentAnchor, parentFocus);

  const selectionNodeHtml          = parent && parent.outerHTML;
  const {width, height, top, left} = parent.getBoundingClientRect();


  const unHighlight = makeElementHighlight();

  setTimeout(() => {unHighlight();}, 500)

  function makeElementHighlight() {
    const square = document.createElement('div');

    let borderThickness     = 2;
    square.style.position   = 'fixed';
    square.style.width      = `${width}px`;
    square.style.height     = `${height}px`;
    square.style.top        = `${top - borderThickness}px`;
    square.style.left       = `${left - borderThickness}px`;
    square.style.border     = `${borderThickness}px solid red`;
    square.style.zIndex     = `9999`;
    square.style.boxSizing  = `content-box`;
    square.style.transition = 'background-color .2s, opacity 1s';
    const inner             = document.createElement('div');
    inner.classList.add('highlight-wrapper');
    inner.innerHTML = selectionNodeHtml;
    square.appendChild(inner);
    inner.firstChild.style.margin = '0';
    parent.parentElement.appendChild(square);

    let i;
    window.requestAnimationFrame(() => {
      i++;
      if (i < 50) return;
      square.style.opacity = `0`;
    });

    return function unmakeElementHighlight() { parent.parentElement.removeChild(square) }
  }

  await saveHtmlSnippet(
    {
      ts:                Date.now(),
      date:              new Date().toLocaleString(),
      uri:               uri,
      selection:         selectionText,
      text:              parent.innerText,
      selectionNodeHtml: selectionNodeHtml,
    }
  );

  return ({
      uri,
      html,
      parentAnchor,
      parentFocus,
      parent,
      selectionText,
      selectionNodeHtml
    }
  );
}


