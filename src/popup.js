const runtime = chrome?.runtime || browser?.runtime;
// Function to display collected orbs
function displayOrbs(orbs) {
  const orbsList = document.getElementById('orbs-list');
  orbsList.innerHTML = '';  // Clear existing content
  orbs.forEach((orb, index) => {
    const orbElement = document.createElement('div');
    orbElement.className = 'orb';
    orbElement.textContent = `Orb ${index + 1}: ${orb}`;
    orbsList.appendChild(orbElement);
  });
}

// Get collected orbs on popup load
runtime.sendMessage({ command: "getOrbs" }, (response) => {
  displayOrbs(response.orbs);
});


document.addEventListener('DOMContentLoaded', () => {

// Clear orbs on button click
  document.getElementById('clear-orbs').addEventListener('click', () => {
    runtime.sendMessage({command: "clearOrbs"}, (response) => {
      console.log(response.status);
      displayOrbs([]);  // Clear UI as well
    });
  });

// Add new orb on button click
  document.getElementById('add-orb').addEventListener('click', () => {
    const newOrbInput = document.getElementById('new-orb-input').value;

    console.log({newOrbInput})
    if (newOrbInput.trim() !== '') {
      runtime.sendMessage({command: "collectOrb", orb: newOrbInput}, (response) => {
        console.log(response.status);
        document.getElementById('new-orb-input').value = '';  // Clear input after submission
        runtime.sendMessage({command: "getOrbs"}, (response) => {
          displayOrbs(response.orbs);
        });
      });
    }
  });

});