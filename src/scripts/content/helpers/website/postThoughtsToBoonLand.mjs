import {getMultipleLocal} from "../chrome/chromeLocalStorage.mjs";

export async function postThoughtsToBoonLand() {
  if (document.domain !== 'boon.land') {
    return;
  }
  window.postMessage(await getMultipleLocal(['htmlSnippets', 'thoughts']), "https://boon.land");
}