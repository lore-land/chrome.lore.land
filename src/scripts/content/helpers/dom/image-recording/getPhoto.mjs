import {screenshotImageId}   from "../../../constants.mjs";
import {makeProcessedCanvas} from "../../image/makeProcessedCanvas.mjs";
import {_____log}            from "../../../../log/log.mjs";

export async function getPhoto(mediaStream, video) {
  const videoTracks = mediaStream.getVideoTracks();
  _____log(videoTracks);
  const currentScene = new ImageCapture(videoTracks[0]);

  const bmp = await currentScene.grabFrame()
  await processImage(bmp, video);
}

async function makePlainImage(bmp, [width, height]) {
  try {
    const canvas  = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    canvas.getContext('bitmaprenderer').transferFromImageBitmap(bmp);

    const blob = await new Promise((res) => canvas.toBlob(res));

    const img          = document.getElementById(screenshotImageId);
    const video        = img;
    const oldObjectUrl = video.currentSrc;
    if (oldObjectUrl && oldObjectUrl.startsWith('blob:')) {
      video.src = ''; // <-- Un-set the src property *before* revoking the object URL.
      URL.revokeObjectURL(oldObjectUrl);
    }

    img.src             = URL.createObjectURL(blob);
    img.style.minHeight = 100 + '%';
    img.style.objectFit = 'cover';
    img.onclick         = () => {
      return window.open(URL.createObjectURL(blob), '_blank');
    }
    return img;
  } catch (e) {
    console.error(e);
  }
}

async function processImage(bmp, video) {
  _____log('Took photo:', bmp);
  const [width, height] = [bmp.width, bmp.height];

  console.log({width, height});

  const img          = await makePlainImage(bmp, [width, height]);
  const outputCanvas = await makeProcessedCanvas(video, [width, height]);

  const blob = await new Promise((res) => outputCanvas.toBlob(res));

  let blobUrl                  = URL.createObjectURL(blob);
  outputCanvas.dataset.bloburl = blobUrl;
  outputCanvas.onclick         = () => window.open(blobUrl, '_blank')
}