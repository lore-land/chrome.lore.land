import {screenRecordingVideoId, screenRecordingVideoLinkId, screenshotButtonId} from "../../../constants.mjs";
import {onShutterClick}                                                         from "../../shutter/shutterButton.mjs";
import {_____log}                                                               from "../../../../log/log.mjs";
import {getLocal}                                                               from "../../../helpers/chrome/chromeLocalStorage.mjs";

let doDownload = false;


export function beginCapturing(msg, messageCallback) {
  const recordingOptions = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource:   'desktop',
        chromeMediaSourceId: msg.streamid,
        maxWidth:            window.screen.width * 2,
        maxHeight:           window.screen.height * 2
      }
    }
  };
  let onError            = (error) => { _____log(error) };
  navigator.webkitGetUserMedia(
    recordingOptions,
    getRecordingBeginHandler(messageCallback),
    onError
  )
}

function makeUrl(recordedChunks) {
  const blob = new Blob(recordedChunks, {type: "video/webm"});
  return URL.createObjectURL(blob);
}

function getRecordingBeginHandler(closeRecordingHandle) {
  return function onRecordingBegin(mediaStream) {
    const video                                              = document.getElementById(screenRecordingVideoId);
    video.parentElement.style.width                          = 'auto';
    document.getElementById(screenRecordingVideoLinkId).href = '';

    video.onloadedmetadata = () => {
      document.body.classList.add('can-screenshot');
      video.parentElement.classList.remove('toggle-hidden');
      return video.play();
    };

    const options       = {mimeType: "video/webm; codecs=vp9"};
    const mediaRecorder = new MediaRecorder(mediaStream, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();

    const recordedChunks = [];

    let url;

    async function handleDataAvailable(event) {
      if (event.data.size > 0) {

        document.body.classList.remove('can-screenshot');
        recordedChunks.push(event.data);

        closeRecordingHandle();

        url = makeUrl(recordedChunks);

        if (await getLocal("auto-download")) {
          download();
        } else {
          let link                         = document.getElementById(screenRecordingVideoLinkId);
          link.onclick                     = e => e.preventDefault() + window.open(url, '_blank');
          link.href                        = '#';
          video.parentElement.style.width  = '300px';
          video.parentElement.style.height = '200px';
        }


        const shutter            = document.getElementById(screenshotButtonId) || {};
        shutter.style.transition = 'background-color .2s';
        shutter.onclick          = onShutterClick
      }
    }

    function download() {
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style    = "display: none";
      a.href     = url;
      a.download = "test.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      url = null;
      video.parentElement.classList.add('toggle-hidden');
    }

    if ('srcObject' in video) {
      video.srcObject = mediaStream;
    } else {
      video.src = URL.createObjectURL(mediaStream);
    }

    const shutter = document.getElementById(screenshotButtonId);
    shutter.makeShutterFunction(mediaStream, video);
  };
}
