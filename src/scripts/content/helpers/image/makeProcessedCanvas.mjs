import { screenshotCanvasId } from "../../constants.mjs";
import { _____log } from "../../../log/log.mjs";

// Process the image data by modifying the red channel and adjusting colors
function processImage(context, width, height) {
  const imgData = context.getImageData(0, 0, width, height);
  const data = imgData.data;

  let totalR = 0, totalG = 0, totalB = 0;

  // Calculate total values for red, green, and blue channels
  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i];     // Red
    totalG += data[i + 1]; // Green
    totalB += data[i + 2]; // Blue
  }

  const avgR = totalR / (data.length / 4);
  const avgG = totalG / (data.length / 4);
  const avgB = totalB / (data.length / 4);

  // Process each pixel and modify color channels based on thresholds
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    const greenBlueAverage = Math.sqrt(green ** 2 + blue ** 2);

    if (red > avgR + 10 && red > greenBlueAverage) {
      data[i] = red;       // Keep red channel
      data[i + 1] = 255;   // Set green to max (highlight)
      data[i + 2] = 0;     // Set blue to 0
    } else {
      data[i] = red;       // Keep red channel
      data[i + 1] = 0;     // Set green to 0
    }
  }

  _____log("Processed image data", imgData);

  // Update the canvas with modified image data
  context.putImageData(imgData, 0, 0);
}

// Draw video on canvas and process it
export function makeProcessedCanvas(video, [width, height]) {
  try {
    const canvas = document.getElementById(screenshotCanvasId);
    const oldObjectUrl = canvas.dataset.blobUrl;

    // Clean up old blob URL if it exists
    if (oldObjectUrl && oldObjectUrl.startsWith('blob:')) {
      canvas.dataset.blobUrl = '';
      URL.revokeObjectURL(oldObjectUrl);
    }

    const canvasWrapper = canvas.parentElement;
    const context = canvas.getContext('2d');

    // Set canvas dimensions and draw the video frame
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0);

    console.log("Canvas dimensions:", { width, height });

    // Process the drawn image on the canvas
    processImage(context, width, height);

    // Make the canvas visible
    canvasWrapper.classList.remove('toggle-hidden');

    return canvas;
  } catch (error) {
    console.error("Error processing canvas:", error);
    return null;
  }
}
