// === src/js/popup.js ===

// Initialize runtime for cross-browser compatibility
const runtime = (typeof chrome !== 'undefined' && chrome.runtime) ||
  (typeof browser !== 'undefined' && browser.runtime);

// Function to sanitize text to prevent XSS
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Function to display collected orbs
function displayOrbs(orbs) {
  const orbsList = document.getElementById('orbs-list');
  orbsList.innerHTML = '';  // Clear existing content

  if (orbs.length === 0) {
    orbsList.textContent = 'No orbs collected yet.';
    return;
  }

  orbs.forEach((orb, index) => {
    const orbElement = document.createElement('div');
    orbElement.className = 'orb';
    orbElement.dataset.ordinality = index + 1;

    // Display 'name' if available, else fallback to 'id' or 'type'
    const displayName = orb.name || orb.id || orb.type || '?';
    orbElement.textContent = sanitizeText(displayName);

    orbsList.appendChild(orbElement);
    orbElement.onclick = () => {
      const mentionedOrdinality = orbElement.dataset.ordinality;
      document.getElementById('mentioned-ordinality').textContent = `Orb #${mentionedOrdinality}`;
    };
  });
}

// Function to get orbs from background script
function getOrbs() {
  return new Promise((resolve, reject) => {
    runtime.sendMessage({ command: "getOrbs" }, (response) => {
      if (runtime.lastError) {
        console.error('Error getting orbs:', runtime.lastError);
        reject(runtime.lastError);
      } else if (response && response.orbs) {
        resolve(response.orbs);
      } else {
        resolve([]);
      }
    });
  });
}

// Function to collect an orb
function collectOrb(orb) {
  return new Promise((resolve, reject) => {
    runtime.sendMessage({ command: "collectOrb", orb: orb }, (response) => {
      if (runtime.lastError) {
        console.error('Error collecting orb:', runtime.lastError);
        reject(runtime.lastError);
      } else if (response && response.status === "Orb collected!") {
        resolve();
      } else {
        reject(new Error('Failed to collect orb'));
      }
    });
  });
}

// Function to clear orbs
function clearOrbs() {
  return new Promise((resolve, reject) => {
    runtime.sendMessage({ command: "clearOrbs" }, (response) => {
      if (runtime.lastError) {
        console.error('Error clearing orbs:', runtime.lastError);
        reject(runtime.lastError);
      } else if (response && response.status === "Orbs cleared!") {
        resolve();
      } else {
        reject(new Error('Failed to clear orbs'));
      }
    });
  });
}

// Function to validate orb data
function isValidOrb(orb) {
  return orb &&
    typeof orb.name === 'string' &&
    typeof orb.x === 'number' &&
    typeof orb.y === 'number' &&
    typeof orb.r === 'number';
}

// Function to parse user input into orbs
function parseOrbsInput(input) {
  let orbsData = [];

  try {
    const parsedInput = JSON.parse(input);

    if (Array.isArray(parsedInput)) {
      parsedInput.forEach((node) => {
        if (isValidOrb(node)) {
          orbsData.push(node);
        } else {
          throw new Error('Invalid orb data in array');
        }
      });
    } else if (parsedInput.hasOwnProperty('nodes') && Array.isArray(parsedInput.nodes)) {
      parsedInput.nodes.forEach((node) => {
        if (isValidOrb(node)) {
          orbsData.push(node);
        } else {
          throw new Error('Invalid orb data in nodes array');
        }
      });
    } else if (isValidOrb(parsedInput)) {
      orbsData.push(parsedInput);
    } else {
      throw new Error('Invalid input structure');
    }
  } catch (e) {
    // If parsing fails, treat input as plain text
    if (input) {
      orbsData.push({
        name: input,
        x: Math.random() * 500,
        y: Math.random() * 500,
        r: 30
      });
    } else {
      throw new Error('Empty input');
    }
  }

  return orbsData;
}

// Helper function to check if auto-download is enabled
function autoDownloadEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get('autoDownload', (data) => {
      resolve(data.autoDownload || false);
    });
  });
}

// Function to start screen recording
function startScreenRecording() {
  console.log('Starting screen recording');
  navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false
  })
    .then((stream) => {
      // Implement recording logic using MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        autoDownloadEnabled()
          .then((autoDownload) => {
            if (autoDownload) {
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = `recording_${new Date().toISOString()}.webm`;
              document.body.appendChild(a);
              a.click();
              URL.revokeObjectURL(url);
            } else {
              // Provide a link to download manually
              const downloadLink = document.createElement('a');
              downloadLink.href = url;
              downloadLink.textContent = 'Download Recording';
              downloadLink.download = `recording_${new Date().toISOString()}.webm`;
              document.body.appendChild(downloadLink);
            }
          });

        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      // Provide a way to stop recording
      alert('Recording started. Click "Stop Recording" to finish.');

      // Create a stop button dynamically
      const stopButton = document.createElement('button');
      stopButton.textContent = 'Stop Recording';
      stopButton.style.marginTop = '10px';
      stopButton.addEventListener('click', () => {
        mediaRecorder.stop();
        stopButton.remove();
      });
      document.body.appendChild(stopButton);
    })
    .catch((error) => {
      alert('Failed to start screen recording: ' + error.message);
      console.error('Screen Recording Error:', error);
    });
}

// Function to submit a thought
function submitThought(thoughtText) {
  if (!thoughtText.trim()) {
    alert('Please enter a valid thought.');
    return;
  }

  const thought = {
    timestamp: new Date().toISOString(),
    thought: thoughtText.trim()
  };

  chrome.storage.local.get(['thoughts'], (data) => {
    const thoughts = Array.isArray(data.thoughts) ? data.thoughts : [];
    thoughts.push(thought);
    chrome.storage.local.set({ thoughts: thoughts }, () => {
      if (chrome.runtime.lastError) {
        alert('Failed to submit thought.');
      } else {
        alert('Thought submitted successfully!');
        document.getElementById('thought-input').value = '';
      }
    });
  });
}

// Function to handle adding new orbs
function handleAddOrb() {
  const newOrbInput = document.getElementById('new-orb-input').value.trim();

  if (!newOrbInput) {
    alert('Please enter orb data.');
    return;
  }

  try {
    const orbsData = parseOrbsInput(newOrbInput);

    // Collect each orb and update the display
    let collectPromises = [];
    orbsData.forEach((orb) => {
      collectPromises.push(collectOrb(orb));
    });

    Promise.all(collectPromises)
      .then(() => {
        // Clear input after submission
        document.getElementById('new-orb-input').value = '';

        // Refresh displayed orbs
        return getOrbs();
      })
      .then((orbs) => {
        displayOrbs(orbs);
        // Focus input
        document.getElementById('new-orb-input').focus();
        // Notify user of success
        alert('Orbs added successfully!');
      })
      .catch((error) => {
        alert(`Failed to add orb: ${error.message}`);
        console.error('Error:', error);
      });
  } catch (error) {
    alert(`Failed to add orb: ${error.message}`);
    console.error('Error:', error);
  }
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  getOrbs()
    .then((orbs) => {
      displayOrbs(orbs);
    })
    .catch((error) => {
      alert('Failed to load orbs.');
      console.error('Error:', error);
    });

  // Clear orbs button event listener
  document.getElementById('clear-orbs').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all orbs?')) {
      clearOrbs()
        .then(() => {
          displayOrbs([]);
          alert('All orbs have been cleared.');
        })
        .catch((error) => {
          alert('Failed to clear orbs.');
          console.error('Error:', error);
        });
    }
  });

  // Add orb button event listener
  document.getElementById('add-orb-form').addEventListener('submit', handleAddOrb);

  // Start Recording Button Event Listener
  document.getElementById('start-recording').addEventListener('click', startScreenRecording);

  // Submit Thought Event Listener (if present in popup.html)
  const submitThoughtButton = document.getElementById('submit-thought');
  if (submitThoughtButton) {
    submitThoughtButton.addEventListener('click', () => {
      const thoughtText = document.getElementById('thought-input').value;
      submitThought(thoughtText);
    });
  }
});
