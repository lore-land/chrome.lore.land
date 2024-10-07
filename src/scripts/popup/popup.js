import '../../button.css';
import { getLocal, setLocal } from "../content/helpers/chrome/chromeLocalStorage.mjs";

// Check if the app is already active
getLocal('app-active').then(active => {
  console.log('active');

  if (!active) {
    // Initialize the app if not active
    getCurrentTab().then(tab => {
      chrome.runtime.sendMessage({ text: 'init_app', tab }, () => {
        console.log('app initialized');
      });
    });
    return;
  }

  // Render the form if the app is active
  document.body.innerHTML = `
    <form id="thoughtForm">
        <div class="row">
            <label for="thought-input">
                <span>What do you think?</span>
                <textarea autofocus id="thought-input" name="thought"></textarea>
            </label>
        </div>
        <button>Submit</button>
        <div id="output"></div>
    </form>
    <button id="clear-thoughts">Clear thoughts</button>
  `;

  document.body.classList.add('app-active');

  // Event listener for clearing thoughts
  const deleteButton = document.getElementById('clear-thoughts');
  deleteButton.addEventListener('click', async () => {
    if (confirm("Clear all thoughts?")) {
      await setLocal('thoughts', {});
      deleteButton.parentElement.removeChild(deleteButton);
    }
  });

  // Form submission handling
  const form = document.getElementById("thoughtForm");
  form.addEventListener("submit", onFormSubmit);

  // Function to get the active tab
  async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  // Form submit handler
  async function onFormSubmit(e) {
    e.preventDefault(); // Prevent the default form submission

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await initThought();
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: saveThought,
    });

    return true;
  }

  // Function to initialize the thought
  async function initThought() {
    const formData = getFormData();
    const currentThoughts = await getLocal('thoughts') || {};
    const entryId = Date.now();
    await setLocal('activeId', entryId);
    await setLocal('thoughts', {
      [entryId]: { ...formData, ts: Date.now() },
      ...currentThoughts
    });
  }

  // Function to extract form data
  function getFormData() {
    const object = {};
    new FormData(form).forEach((value, key) => (object[key] = value));
    return object;
  }

  // Function to save the thought to local storage
  function saveThought() {
    async function getMultipleLocal(keys) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, result => resolve(result));
      });
    }

    return getMultipleLocal(['activeId', 'thoughts']).then(async (things) => {
      const { thoughts, activeId } = things;
      const thought = {
        ...thoughts[activeId],
        ts: Date.now(),
        site: document.documentURI || 'none',
      };

      await setLocal('thoughts', { ...thoughts, [activeId]: thought });
      await getMultipleLocal(['thoughts', 'activeId']);
    });
  }
});
