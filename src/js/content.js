// content.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case 'yank_chapter':
      yankChapterText();
      break;
    case 'navigate_left_section':
      navigateLeftSection();
      break;
    // ... other cases
    default:
      console.warn('Unknown command:', message.command);
  }
});

function yankChapterText() {
  const chapterElement = document.querySelector('.chapter');
  if (chapterElement) {
    const chapterText = chapterElement.innerText;
    chrome.storage.local.set({ yankedText: chapterText }, () => {
      alert('Chapter text yanked!');
    });
  } else {
    console.warn('Chapter element not found.');
  }
}

function navigateLeftSection() {
  // Implement navigation logic here
  console.log('Navigating to the previous section...');
}

// Implement other functions as needed
