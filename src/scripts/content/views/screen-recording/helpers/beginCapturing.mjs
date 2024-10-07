import { screenRecordingVideoId, screenRecordingVideoLinkId, screenshotButtonId } from "../../../constants.mjs";
import { onShutterClick } from "../../shutter/shutterButton.mjs";
import { _____log } from "../../../../log/log.mjs";
import { getLocal } from "../../../helpers/chrome/chromeLocalStorage.mjs";

let doDownload = false;

// Begin capturing the screen recording
export function beginCapturing(msg, messageCallback) {
  const recordingOptions = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: msg.streamid,
        maxWidth: window.screen.width * 2,
        maxHeight: window.screen.height * 2
      }
    }
  };

  const onError = (error) => {
    _____log(error);
  };

  // Start capturing the media stream
  navigator.webkitGetUserMedia(
    recordingOptions,
    getRecordingBeginHandler(messageCallback),
    onError
  );
}

// Generate a URL for the recorded video chunks
function makeUrl(recordedChunks) {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  return URL.createObjectURL(blob);
}

// Handle the beginning of the recording process
function getRecordingBeginHandler(closeRecordingHandle) {
  return function onRecordingBegin(mediaStream) {
    const video = document.getElementById(screenRecordingVideoId);
    const videoLink = document.getElementById(screenRecordingVideoLinkId);

    video.parentElement.style.width = 'auto';
    videoLink.href = '';

    video.onloadedmetadata = () => {
      document.body.classList.add('can-screenshot');
      video.parentElement.classList.remove('toggle-hidden');
      return video.play();
    };

    const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "video/webm; codecs=vp9" });
    const recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => handleDataAvailable(event, recordedChunks, closeRecordingHandle, video, videoLink);
    mediaRecorder.start();

    // Set up video source for playback
    if ('srcObject' in video) {
      video.srcObject = mediaStream;
    } else {
      video.src = URL.createObjectURL(mediaStream);
    }

    // Setup shutter button functionality
    const shutter = document.getElementById(screenshotButtonId);
    shutter.makeShutterFunction(mediaStream, video);
  };
}

// Handle available media data and process recording completion
async function handleDataAvailable(event, recordedChunks, closeRecordingHandle, video, videoLink) {
  if (event.data.size > 0) {
    document.body.classList.remove('can-screenshot');
    recordedChunks.push(event.data);
    closeRecordingHandle();

    const url = makeUrl(recordedChunks);

    if (await getLocal("auto-download")) {
      downloadRecording(url, video);
    } else {
      setupVideoLink(url, video, videoLink);
    }

    // Setup the shutter button for taking screenshots
    const shutter = document.getElementById(screenshotButtonId) || {};
    shutter.style.transition = 'background-color .2s';
    shutter.onclick = onShutterClick;
  }
}

// Setup the download process for the recorded video
function downloadRecording(url, video) {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "recording.webm";
  a.click();
  window.URL.revokeObjectURL(url);

  video.parentElement.classList.add('toggle-hidden');
}

// Set up the video link for preview and configure the video element's dimensions
function setupVideoLink(url, video, videoLink) {
  videoLink.href = '#';
  videoLink.onclick = (e) => {
    e.preventDefault();
    window.open(url, '_blank');
  };
  video.parentElement.style.width = '300px';
  video.parentElement.style.height = '200px';
}
