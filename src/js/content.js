const runtime = chrome?.runtime || browser?.runtime;

// Function to collect an orb on boon.land
function collectOrb(orbData) {
  const {x, y, fx, fy, name, r, z} = orbData;
  const orb = {
    name,
    r,
    x, y, z,
    fx, fy,
  };
  console.log(orb);
  runtime.sendMessage(
    {command: "collectOrb", orb: orbData},
    (response) => {
      console.log(response.status);
    }
  );
}

// Function to get all collected orbs when on lore.land
function getOrbs() {
  runtime.sendMessage({command: "getOrbs"}, (response) => {
    console.log("Collected orbs:", response.orbs);
    // Paste orbs into the story
    pasteOrbs(response.orbs);
  });
}

// Function to paste orbs into the story on lore.land
function pasteOrbs(orbs) {
  const storyElement = document.querySelector('#story-content');
  if (storyElement && orbs.length > 0) {
    orbs.forEach((orb) => {
      const orbElement = document.createElement('p');
      orbElement.textContent = `Orb of Borpl: ${orb}`;
      storyElement.appendChild(orbElement);

      // Mutate story based on the orb
      mutateStory(orb);
    });
  }
}

// Mutate the story dynamically based on orb data
function mutateStory(orb) {
  const storyText = document.querySelector('#story-content');
  if (storyText) {
    // Example: Append orb data to the story
    storyText.textContent += `\n The orb of ${orb} has shifted the narrative!`;
  }
}


// Interaction logic on boon.land
if (window.location.hostname === 'boon.land') {
  document.addEventListener('click', (e) => {
    if (e.target.__data__) {

    }
    console.log(e.target, e.target.__data__)
  })
}

// Interaction logic on lore.land
if (window.location.hostname === 'lore.land') {
  // Example: Clicking button to paste orbs
  const pasteButton = document.querySelector('#paste-orbs');
  if (pasteButton) {
    pasteButton.addEventListener('click', () => {
      getOrbs();  // Get orbs and paste them into the story
    });
  }
}
