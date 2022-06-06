import {fillYankLog}                          from "../../views/yank/fillYankLog.mjs";
import {_____log}                             from "../../../log/log.mjs";
import {beginCapturing}                       from "../../views/screen-recording/helpers/beginCapturing.mjs";
import {postThoughtsToBoonLand}               from "../website/postThoughtsToBoonLand.mjs";
import {initApp}                              from "../../initApp.mjs";
import {getLocal, setLocal}                   from "./chromeLocalStorage.mjs";
import {buttonContainerId, widgetContainerId} from "../../constants.mjs";
import {dispatchYankText}                     from "./dispatchYankText.mjs";

async function changeTab(messageCallback) {
  const uri = document.documentURI || 'null';
  uri && messageCallback(uri);

  await postThoughtsToBoonLand();

  return true;
}

export function initRuntimeListener() {
  chrome.runtime.onMessage.addListener(async function (msg, sender, messageCallback) {
    _____log('fg: listening to something', msg);
    switch (msg.text) {
      case 'beginCapturing': {
        if (!await getLocal('app-active')) {
          await initApp();
          return messageCallback(null);
        }

        _____log('fg: beginning capture');
        return beginCapturing(msg, messageCallback);
      }
      case 'dispatch_init_app': {
        initApp().then(
          () => messageCallback()
        );
        return;
      }
      case 'dispatch_yank_text': {
        _____log('fg: dispatching yank text');
        return dispatchYankText(messageCallback);
      }
      case 'dispatch_fill_log': {
        _____log('fg: receive dispatching fill log');
        return fillYankLog(messageCallback).catch(console.error)
      }
      case 'change_dimension_1': {
        _____log('fg: yanking into register');
        if (await getLocal('app-active')) {
          document.getElementById(widgetContainerId).innerHTML = '';
          document.getElementById(buttonContainerId).innerHTML = '';
          await setLocal('app-active', false);
        }
        break;
        // return yankIntoRegister(messageCallback);
      }
      case 'log_change_tab': {
        _____log('fg: logging tab change');
        return changeTab(messageCallback);
      }
    }

    return true;
  });
}