import {_____log} from "../../log/log.mjs";

export function getHighest_zIndex() {
  const getMaxZIndex                  = () => {
    const elems = document.querySelectorAll('*');
    let highest = Number.MIN_SAFE_INTEGER || -(Math.pow(2, 53) - 1);
    let secondHighest;
    let obj     = [];
    let all     = [];
    for (let i = 0; i < elems.length; i++) {
      let el       = elems[i];
      const zindex = Number.parseInt(
        document.defaultView.getComputedStyle(el, null).getPropertyValue("z-index"),
        10
      );
      if (zindex > highest) {
        obj[1]        = obj[0];
        obj[0]        = el;
        secondHighest = highest;
        highest       = zindex;
        all           = [el];
      }
      if (zindex === highest) all.push(el);
    }
    return {
      highest:       {index: highest, el: obj[0]},
      secondHighest: {index: secondHighest, el: obj[1]},
      all
    };
  };
  const {all, highest, secondHighest} = getMaxZIndex();
  if (highest.el?.style) {
    _____log({highest, all, secondHighest});
    all.forEach(loc => loc.style.zIndex = secondHighest?.index || highest.index || 100);
  }
  return highest;
}