import { _____log } from "../../log/log.mjs";

// Get the element(s) with the highest z-index
export function getHighest_zIndex() {
  const getMaxZIndex = () => {
    const elems = document.querySelectorAll('*');
    let highest = Number.MIN_SAFE_INTEGER;
    let secondHighest = Number.MIN_SAFE_INTEGER;
    let highestElement = null;
    let secondHighestElement = null;
    const allWithHighest = [];

    // Iterate through all elements and find the highest z-index
    elems.forEach((el) => {
      const zindex = parseInt(
        window.getComputedStyle(el).getPropertyValue("z-index"),
        10
      );

      if (!isNaN(zindex)) {
        if (zindex > highest) {
          secondHighest = highest;
          secondHighestElement = highestElement;
          highest = zindex;
          highestElement = el;
          allWithHighest.length = 0; // Reset the array for new highest value
          allWithHighest.push(el);
        } else if (zindex === highest) {
          allWithHighest.push(el);
        }
      }
    });

    return {
      highest: { index: highest, el: highestElement },
      secondHighest: { index: secondHighest, el: secondHighestElement },
      allWithHighest
    };
  };

  const { highest, secondHighest, allWithHighest } = getMaxZIndex();

  // Log and adjust z-index if applicable
  if (highest.el?.style) {
    _____log({ highest, allWithHighest, secondHighest });

    // Set all elements with the highest z-index to the second highest value, or keep them unchanged
    allWithHighest.forEach(el => {
      el.style.zIndex = (secondHighest?.index || highest.index || 100).toString();
    });
  }

  return highest;
}
