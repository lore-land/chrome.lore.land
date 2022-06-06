import {screenshotCanvasId} from "../../constants.mjs";
import {_____log}           from "../../../log/log.mjs";

function processImage(context, w, h) {
  const imgData = context.getImageData(0, 0, w, h);
  const data    = imgData.data;

  let r = 0,
      b = 0,
      g = 0;

  for (let i = 0; i < data.length; i += 4) {
    const _red   = data[i];
    r += _red;
    const _green = data[i + 1];
    g += _green;
    const _blue  = data[i + 2];
    b += _blue;

  }

  const red   = r / data.length;
  const blue  = b / data.length;
  const green = g / data.length;
  Math.sqrt(green ** 2 + blue ** 2);

  for (let i = 0; i < data.length; i += 4) {
    const _red   = data[i];
    const _green = data[i + 1];
    const _blue  = data[i + 2];


    const _greenBlueAverage = Math.sqrt(_green ** 2 + _blue ** 2);

    if (
      (_red > red + 10) &&
      // (_greenBlueAverage < averageOfAverages) &&
      (_red > _greenBlueAverage)
    ) {
      data[i]     = _red;
      data[i + 1] = 255;
      data[i + 2] = 0;
    } else {
      data[i]     = _red;
      data[i + 1] = 0;
    }
  }

  _____log(imgData);

  context.putImageData(imgData, 0, 0);
}

export function makeProcessedCanvas(video, [w, h]) {
  try {
    const canvas       = document.getElementById(screenshotCanvasId);
    const oldObjectUrl = canvas.dataset.blobUrl;
    if (oldObjectUrl && oldObjectUrl.startsWith('blob:')) {
      canvas.dataset.blobUrl = ''; // <-- Un-set the src property *before* revoking the object URL.
      URL.revokeObjectURL(oldObjectUrl);
    }
    const canvasWrapper = canvas.parentElement;
    const context       = canvas.getContext('2d');
    canvas.width        = w;
    canvas.height       = h;

    context.drawImage(video, 0, 0);

    console.log({w, h})

    processImage(context, w, h);
    canvasWrapper.classList.remove('toggle-hidden');

    return canvas;
  } catch (e) {
    console.error(e);
    return null;
  }
}