import {getLocal}               from "../../helpers/chrome/chromeLocalStorage.mjs";
import {textYankContainerId}    from "../../constants.mjs";
import {_____log}               from "../../../log/log.mjs";
import {postThoughtsToBoonLand} from "../../helpers/website/postThoughtsToBoonLand.mjs";


export async function fillYankLog(callback) {
  _____log('fg: filling a log');

  if (!await getLocal('app-active')) return callback(null);

  const snippets     = await getLocal('htmlSnippets');
  const itemList     = document.getElementById(textYankContainerId);
  itemList.innerHTML = '';

  if (!snippets.length) {
    document.body.classList.remove('can-clear-yanks');
    itemList.parentElement.classList.add('toggle-hidden');

    callback(false);
    return;
  } else {
    document.body.classList.add('can-clear-yanks')
    itemList.parentElement.classList.remove('toggle-hidden');
  }

  _____log('fg: ', {snippets});


  snippets && snippets.forEach(snippet => {
    const listItem = document.createElement('li');
    const pre      = document.createElement('pre');
    listItem.appendChild(pre);
    pre.style.margin                       = `0`;
    const {date, selection, text, uri, ts} = snippet;
    pre.innerText                          = JSON.stringify(
      {
        date,
        selection,
        text,
        ts,
        uri
      },
      null,
      2
    )
    itemList.appendChild(listItem)
  });

  _____log('fg: filled log done');

  callback({text: 'just filled log'});

  return postThoughtsToBoonLand();
}