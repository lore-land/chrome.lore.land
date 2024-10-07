import { getLocal } from "../../helpers/chrome/chromeLocalStorage.mjs";
import { textYankContainerId } from "../../constants.mjs";
import { _____log } from "../../../log/log.mjs";
import { postThoughtsToBoonLand } from "../../helpers/website/postThoughtsToBoonLand.mjs";

// Fill the yank log with saved snippets and update the UI
export async function fillYankLog(callback) {
  _____log('fg: filling a log');

  const appActive = await getLocal('app-active');
  if (!appActive) return callback(null);

  const snippets = await getLocal('htmlSnippets');
  const itemList = document.getElementById(textYankContainerId);
  itemList.innerHTML = '';

  if (!snippets || snippets.length === 0) {
    // No snippets: update the UI accordingly
    document.body.classList.remove('can-clear-yanks');
    itemList.parentElement.classList.add('toggle-hidden');
    callback(false);
    return;
  } else {
    // Snippets exist: update the UI to show the yank log
    document.body.classList.add('can-clear-yanks');
    itemList.parentElement.classList.remove('toggle-hidden');
  }

  _____log('fg: ', { snippets });

  // Append each snippet to the yank log as a list item
  snippets.forEach(snippet => {
    const { date, selection, text, uri, ts } = snippet;

    const listItem = document.createElement('li');
    const pre = document.createElement('pre');
    pre.style.margin = '0';
    pre.innerText = JSON.stringify({ date, selection, text, ts, uri }, null, 2);

    listItem.appendChild(pre);
    itemList.appendChild(listItem);
  });

  _____log('fg: filled log done');

  // Invoke the callback and post thoughts to BoonLand
  callback({ text: 'just filled log' });
  return postThoughtsToBoonLand();
}
