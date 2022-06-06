import {screenRecordingVideoId, screenRecordingVideoLinkId, screenshotCanvasId, screenshotImageId, textYankContainerId, widgetContainerId} from "../constants.mjs";


function initCloseButton(logWrapper) {
  const logX          = document.createElement('button')
  logX.innerText      = 'close';
  logX.style.position = 'absolute';
  logX.style.top      = '0';
  logX.style.left     = '0';
  logWrapper.appendChild(logX);
  logX.onclick = () => logWrapper.classList.add('toggle-hidden');
}

export function initVideoPreview() {
  const wrapper = document.createElement('div');
  document.body.appendChild(wrapper);
  wrapper.id                    = widgetContainerId;
  wrapper.style.display         = 'inline-flex';
  wrapper.style.maxHeight       = '200px';
  wrapper.style.position        = 'fixed';
  wrapper.style.zIndex          = '900';
  wrapper.style.bottom          = '0';
  wrapper.style.right           = '0';
  wrapper.style.margin          = `1rem`;
  wrapper.style.alignItems      = `center`;
  wrapper.style.backgroundColor = 'rgba(44,230,238,0.43)';


  const logWrapper = document.createElement('div');
  logWrapper.classList.add('toggle-hidden');
  logWrapper.classList.add('widget-wrapper');
  logWrapper.style.height    = '200px';
  logWrapper.style.maxWidth  = '300px';
  logWrapper.style.overflowY = 'scroll';
  wrapper.appendChild(logWrapper);

  const log        = document.createElement('ul');
  log.id           = textYankContainerId;
  log.style.margin = `0`;
  logWrapper.appendChild(log);

  initCloseButton(logWrapper);

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('widget-wrapper');
  imageWrapper.classList.add('toggle-hidden');
  imageWrapper.style.height   = '200px';
  imageWrapper.style.maxWidth = '300px';
  imageWrapper.style.overflow = 'hidden';
  wrapper.appendChild(imageWrapper);

  const image = document.createElement('img');
  image.id    = screenshotImageId;
  imageWrapper.appendChild(image);
  initCloseButton(imageWrapper);

  const canvasWrapper = document.createElement('div');
  canvasWrapper.classList.add('widget-wrapper');
  canvasWrapper.classList.add('toggle-hidden');
  canvasWrapper.style.height   = '200px';
  canvasWrapper.style.maxWidth = '300px';
  canvasWrapper.style.overflow = 'hidden';
  wrapper.appendChild(canvasWrapper);

  const canvas = document.createElement('canvas');
  canvas.id    = screenshotCanvasId;
  canvasWrapper.appendChild(canvas);
  initCloseButton(canvasWrapper);

  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('widget-wrapper');
  videoWrapper.classList.add('toggle-hidden');
  videoWrapper.style.height   = '200px';
  videoWrapper.style.overflow = 'hidden';
  wrapper.appendChild(videoWrapper);

  const video        = document.createElement('video');
  video.id           = screenRecordingVideoId;
  video.style.height = '200px';
  videoWrapper.appendChild(video);

  const videoNewTab            = document.createElement('a');
  videoNewTab.id               = screenRecordingVideoLinkId;
  videoNewTab.style.height     = '200px';
  videoNewTab.style.width      = '300px';
  videoNewTab.style.position   = 'absolute';
  videoNewTab.style.top        = '0';
  videoNewTab.style.left       = '0';
  videoNewTab.style.background = 'blue';
  videoWrapper.appendChild(videoNewTab);

  initCloseButton(videoWrapper);
}