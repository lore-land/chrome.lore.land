import { screenshotImageId } from "../../../constants.mjs";
import { makeProcessedCanvas } from "../../image/makeProcessedCanvas.mjs";
import { _____log } from "../../../../log/log.mjs";

// Capture a frame from the media stream and process the image
export async function getPhoto(mediaStream, video) {
  try {
    const videoTracks = mediaStream.getVideoTracks();
    _____log('Video Tracks:', videoTracks);

    const currentScene = new ImageCapture(videoTracks[0]);
    const bmp = await currentScene.grabFrame();

    await processImage(bmp, video);
  } catch (error) {
    console.error('Error capturing photo:', error);
  }
}

// Render the plain image from the bitmap onto a canvas
async function makePlainImage(bmp, [width, height]) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('bitmaprenderer').transferFromImageBitmap(bmp);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve));

    const img = document.getElementById(screenshotImageId);
    const oldObjectUrl = img.currentSrc;

    // Clean up the old object URL if it exists
    if (oldObjectUrl && oldObjectUrl.startsWith('blob:')) {
      img.src = ''; // Unset the src before revoking the object URL
      URL.revokeObjectURL(oldObjectUrl);
    }

    img.src = URL.createObjectURL(blob);
    img.style.minHeight = '100%';
    img.style.objectFit = 'cover';

    // Set an event to open the image in a new tab when clicked
    img.onclick = () => window.open(URL.createObjectURL(blob), '_blank');

    return img;
  } catch (error) {
    console.error('Error making plain image:', error);
  }
}

// Process the captured bitmap and create the processed canvas
async function processImage(bmp, video) {
  try {
    _____log('Took photo:', bmp);

    const [width, height] = [bmp.width, bmp.height];
    _____log('Image dimensions:', { width, height });

    // Create the plain image and processed canvas
    const img = await makePlainImage(bmp, [width, height]);
    const outputCanvas = await makeProcessedCanvas(video, [width, height]);

    const blob = await new Promise((resolve) => outputCanvas.toBlob(resolve));

    // Set up the processed canvas blob URL for download
    const blobUrl = URL.createObjectURL(blob);
    outputCanvas.dataset.bloburl = blobUrl;

    // Open the blob in a new tab when clicking the canvas
    outputCanvas.onclick = () => window.open(blobUrl, '_blank');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}
