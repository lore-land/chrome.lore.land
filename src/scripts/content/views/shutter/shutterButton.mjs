import {screenshotButtonId, screenshotImageId} from "../../constants.mjs";
import {getPhoto}                              from "../../helpers/dom/image-recording/getPhoto.mjs";

export function initShutterWidget() {
  const element = document.createElement('div');
  element.classList.add('toplevel-button');
  element.id                  = screenshotButtonId;
  element.onclick             = onShutterClick;
  element.innerHTML           = "<span>Take Photo</span>";
  element.makeShutterFunction =
    function (mediaStream, video) {
      const shutter   = document.getElementById(screenshotButtonId);
      const image     = document.getElementById(screenshotImageId);
      shutter.onclick =
        async function () {
          const {backgroundColor, transition} = element.style;

          element.style.backgroundColor = 'red';

          await getPhoto(mediaStream, video);

          image.parentElement.classList.remove('toggle-hidden');
          element.style.transition      = 'background-color .5s';
          element.style.backgroundColor = backgroundColor;
          setTimeout(() => {element.style.transition = transition}, 500)
        }
    }
  return element;
}

export async function onShutterClick(e) {
  e.stopPropagation();
}
