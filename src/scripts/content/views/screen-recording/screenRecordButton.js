import {recordButtonId} from "../../constants.mjs";

export function initRecordButton() {
  const element = document.createElement('div');
  element.classList.add('toplevel-button');
  element.id        = recordButtonId;
  element.innerHTML = "<span>begin recording</span>";
  element.onclick   =
    async function (e) {
      e.stopPropagation();

      const element                       = this;
      const {backgroundColor, transition} = element.style;

      element.style.backgroundColor = 'white';
      element.style.transition      = 'background-color .5s';
      element.style.backgroundColor = backgroundColor;
      setTimeout(() => {element.style.transition = transition}, 500);

      try {
        await chrome.runtime.sendMessage({text: 'record_screen'})
      } catch (e) {
        console.error(e);
      }
    }

  return element;
}