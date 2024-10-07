import { screenRecordingVideoId, screenRecordingVideoLinkId, screenshotCanvasId, screenshotImageId, textYankContainerId, widgetContainerId } from "../constants.mjs";

// Initialize the close button for the widget
function initCloseButton(wrapper) {
  const closeButton = document.createElement('button');
  closeButton.innerText = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '0';
  closeButton.style.left = '0';
  wrapper.appendChild(closeButton);
  closeButton.onclick = () => wrapper.classList.add('toggle-hidden');
}

// Initialize the video preview widget
export function initVideoPreview() {
  const wrapper = createWidgetWrapper();
  document.body.appendChild(wrapper);

  // Log Wrapper
  const logWrapper = createSubWrapper('toggle-hidden', 'scroll', '200px', '300px');
  const log = createList(textYankContainerId);
  logWrapper.appendChild(log);
  wrapper.appendChild(logWrapper);
  initCloseButton(logWrapper);

  // Image Wrapper
  const imageWrapper = createSubWrapper('toggle-hidden', 'hidden', '200px', '300px');
  const image = createImage(screenshotImageId);
  imageWrapper.appendChild(image);
  wrapper.appendChild(imageWrapper);
  initCloseButton(imageWrapper);

  // Canvas Wrapper
  const canvasWrapper = createSubWrapper('toggle-hidden', 'hidden', '200px', '300px');
  const canvas = createCanvas(screenshotCanvasId);
  canvasWrapper.appendChild(canvas);
  wrapper.appendChild(canvasWrapper);
  initCloseButton(canvasWrapper);

  // Video Wrapper
  const videoWrapper = createSubWrapper('toggle-hidden', 'hidden', '200px', '300px');
  const video = createVideo(screenRecordingVideoId, '200px');
  const videoNewTab = createLink(screenRecordingVideoLinkId, 'blue', '300px', '200px');
  videoWrapper.appendChild(video);
  videoWrapper.appendChild(videoNewTab);
  wrapper.appendChild(videoWrapper);
  initCloseButton(videoWrapper);
}

// Create the main widget wrapper
function createWidgetWrapper() {
  const wrapper = document.createElement('div');
  wrapper.id = widgetContainerId;
  wrapper.style.display = 'inline-flex';
  wrapper.style.maxHeight = '200px';
  wrapper.style.position = 'fixed';
  wrapper.style.zIndex = '900';
  wrapper.style.bottom = '0';
  wrapper.style.right = '0';
  wrapper.style.margin = '1rem';
  wrapper.style.alignItems = 'center';
  wrapper.style.backgroundColor = 'rgba(44, 230, 238, 0.43)';
  return wrapper;
}

// Create a sub-wrapper with common properties
function createSubWrapper(...classes) {
  const subWrapper = document.createElement('div');
  subWrapper.classList.add(...classes);
  subWrapper.style.height = '200px';
  subWrapper.style.maxWidth = '300px';
  return subWrapper;
}

// Create an unordered list (for logs)
function createList(id) {
  const list = document.createElement('ul');
  list.id = id;
  list.style.margin = '0';
  return list;
}

// Create an image element
function createImage(id) {
  const image = document.createElement('img');
  image.id = id;
  return image;
}

// Create a canvas element
function createCanvas(id) {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  return canvas;
}

// Create a video element
function createVideo(id, height) {
  const video = document.createElement('video');
  video.id = id;
  video.style.height = height;
  return video;
}

// Create a link element for opening the video in a new tab
function createLink(id, background, width, height) {
  const link = document.createElement('a');
  link.id = id;
  link.style.height = height;
  link.style.width = width;
  link.style.position = 'absolute';
  link.style.top = '0';
  link.style.left = '0';
  link.style.background = background;
  return link;
}
