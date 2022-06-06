import '../../button.css';
import {getLocal, setLocal} from "../content/helpers/chrome/chromeLocalStorage.mjs";


getLocal('app-active')
  .then(active => {
    console.log('active');
    if (!active) {
      getCurrentTab().then(tab => {
        chrome.runtime.sendMessage({text: 'init_app', tab}, () => {
          console.log('app initialized');
        })
      })
      return;
    }

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
<button id="clear-thoughts">clear thoughts</button>

    `;
    document.body.classList.add('app-active');
    const deleteButton = document.getElementById('clear-thoughts');
    deleteButton.addEventListener('click', async () => {
      if (confirm("Clear all thoughts?")) {
        await setLocal('thoughts', {});
        deleteButton.parentElement.removeChild(deleteButton);
      }
    });

    async function getCurrentTab() {
      let queryOptions = {active: true, lastFocusedWindow: true};
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      let [tab]        = await chrome.tabs.query(queryOptions);
      return tab;
    }

    const form = document.getElementById("thoughtForm");
    form.addEventListener("submit", onFormSubmit);

    async function onFormSubmit(e) {

      let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

      await initThought();
      await chrome.scripting.executeScript({target: {tabId: tab.id}, function: saveThought,});

      return true;


      async function initThought() {
        const formData        = getFormData(e.target);
        const currentThoughts = await getLocal('thoughts');
        const entryId         = Date.now();
        await setLocal('activeId', entryId);
        await setLocal('thoughts', {
          [entryId]: {
            ...formData || {},
            ts: Date.now()
          },
          ...currentThoughts
        });

        function getFormData() {
          const object = {};
          new FormData(form).forEach((value, key) => object[key] = value);
          return JSON.parse(JSON.stringify(object));
        }

      }

      function saveThought() {
        async function getMultipleLocal(keys) {
          let res, rej;
          const promise = new Promise((_y, _n) => { [res, rej] = [_y, _n] });
          chrome.storage.local.get(keys, result => res(result));
          return promise;
        }

        return getMultipleLocal(['activeId', 'thoughts']).then(save)

        async function save(things) {
          const {thoughts, activeId} = things;
          /**
           *
           * @property site
           * @property date
           * @property ts
           */
          const thought              =
                  {
                    ...thoughts[activeId],
                    ts:   Date.now(),
                    site: document.documentURI || 'none',
                  };

          await setLocal('thoughts', {...thoughts, [activeId]: thought})
          await getMultipleLocal(['thoughts', 'activeId']);
        }
      }
    }
  })


