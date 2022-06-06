import {getLocal, setLocal} from "../content/helpers/chrome/chromeLocalStorage.mjs";

async function extracted() {
  document.getElementById('do-download').checked = await getLocal('auto-download');
}

extracted();
document.getElementById('do-download').onchange = async (e) => {
  await setLocal('auto-download', e.target.checked);
}