import { getLocal, setLocal } from "../content/helpers/chrome/chromeLocalStorage.mjs";

// Function to initialize the checkbox state
async function initAutoDownloadCheckbox() {
  try {
    // Retrieve the stored value for 'auto-download' and set the checkbox state
    const autoDownload = await getLocal('auto-download');
    document.getElementById('do-download').checked = autoDownload;
  } catch (error) {
    console.error('Failed to initialize checkbox:', error);
  }
}

// Attach event listener for checkbox change
function attachCheckboxListener() {
  document.getElementById('do-download').onchange = async (e) => {
    try {
      // Store the user's selection in local storage
      await setLocal('auto-download', e.target.checked);
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };
}

// Ensure the DOM is fully loaded before initialization
document.addEventListener('DOMContentLoaded', () => {
  initAutoDownloadCheckbox();
  attachCheckboxListener();
});
