import {_____log} from "../../../log/log.mjs";
import {yankText} from "../dom/selection/yankText.mjs";

export async function dispatchYankText(messageCallback) {
  try {
    _____log('fg: now yanking');
    const {parent} = await yankText((...args) => {
      _____log('fg: running');
      return messageCallback(...args);
    });

    if (!parent) return;

    parent.classList.add('__highlight');
    parent.classList.add('__highlight__adding');
    const duration2 = 600;
    const duration1 = duration2 / 4;
    parent.style.setProperty('--duration-1', `${duration1}ms`);
    parent.style.setProperty('--duration-2', `${duration2}ms`);
    setTimeout(() => {
      parent.classList.add('__highlight__removing');
      parent.classList.remove('__highlight__adding');
      setTimeout(() => {
        parent.classList.remove('__highlight__removing');
        setTimeout(() => {
          parent.classList.remove('__highlight');
        }, duration2 / 10)
      }, duration2)
    }, duration1)
  } catch (e) {
    console.error(e);
  }
}