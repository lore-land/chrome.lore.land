import { getMultipleLocal } from "../chrome/chromeLocalStorage.mjs";

// Post HTML snippets and thoughts to Boon.Land via postMessage
export async function postThoughtsToBoonLand() {
  const domain = "boon.land";
  const url = `https://${domain}`;

  // Only post thoughts if the current domain is boon.land
  if (document.domain !== domain) {
    return;
  }

  try {
    // Retrieve htmlSnippets and thoughts from local storage
    const data = await getMultipleLocal(['htmlSnippets', 'thoughts']);

    // Post message to boon.land
    window.postMessage(data, url);
  } catch (error) {
    console.error("Error posting thoughts to BoonLand:", error);
  }
}
