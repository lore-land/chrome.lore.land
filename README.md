# Lore.land Chrome Extension

**Lore.land** is a Chrome extension designed as a companion app for interactive story navigation. It enhances your reading experience by providing features like text yanking, screen recording, bookmarking, and more.

This guide is intended for hobbyist developers who wish to explore, modify, or extend the Lore.land extension. It provides instructions on setting up the extension, understanding its functionality, and guidelines for contributing to the project.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
    - [Loading the Extension](#loading-the-extension)
    - [Testing the Extension](#testing-the-extension)
- [Features](#features)
    - [Screen Recording](#screen-recording)
    - [Yank Text](#yank-text)
    - [Interaction Logging](#interaction-logging)
    - [Thought Submission](#thought-submission)
    - [Keyboard Shortcuts](#keyboard-shortcuts)
- [Modifying and Extending](#modifying-and-extending)
    - [Editing Files](#editing-files)
    - [Testing Changes](#testing-changes)
    - [Debugging](#debugging)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Learning Resources](#learning-resources)
- [License](#license)

---

## Prerequisites

- **Basic Knowledge of JavaScript and Web Development**: Familiarity with HTML, CSS, and JavaScript.
- **Google Chrome Browser**: Ensure you have the latest version installed.
- **Text Editor or IDE**: Such as Visual Studio Code, Sublime Text, or Atom.
- **(Optional) Git**: For version control if you plan to track changes.

---

## Project Structure

```
- manifest.json
- js/
  - background.js
  - content.js
  - popup.js
  - options.js
- css/
  - popup.css
  - options.css
- images/
  - get_started16.png
  - get_started32.png
  - get_started48.png
  - get_started128.png
- popup.html
- options.html
```

- **manifest.json**: Configuration file for the Chrome extension.
- **js/**: Contains JavaScript files for background processes, content scripts, and the popup and options pages.
- **css/**: Contains CSS stylesheets.
- **images/**: Contains icons used by the extension.
- **popup.html** and **options.html**: HTML files for the popup and options pages.

---

## Installation

### 1. Download the Extension Files

You can obtain the extension's source code by:

- **Cloning the Repository**:

  ```bash
  git clone https://github.com/yourusername/lore-land-extension.git
  ```

- **Downloading as ZIP**:

    - If you have a ZIP file of the source code, extract it to a convenient location on your computer.

Ensure that the folder structure matches the one outlined above.

### 2. Open Chrome and Navigate to the Extensions Page

- Type `chrome://extensions` in the address bar and press Enter.

### 3. Enable Developer Mode

- In the top right corner of the page, toggle the **Developer mode** switch to the **On** position.

### 4. Load Unpacked Extension

- Click the **Load unpacked** button.
- In the file dialog, navigate to the directory containing the extension's files (the folder with `manifest.json`) and select it.

### 5. Verify the Extension is Loaded

- You should now see **Lore.land** listed among your extensions.
- If there are any errors, Chrome will display them. Ensure that all file paths in `manifest.json` are correct.

---

## Usage

### Loading the Extension

After following the installation steps, the Lore.land extension should be active in your Chrome browser.

### Testing the Extension

- **Toolbar Icon**:

    - The extension's icon should appear in the Chrome toolbar.
    - Click the icon to open the popup interface.

- **Popup Interface**:

    - The popup includes buttons like **Start Recording**, **Yank Text**, **Clear Log**, and **Submit Thought**.
    - Click these buttons to test their functionality.

- **Options Page**:

    - Right-click the extension's icon and select **Options**.
    - Alternatively, navigate to `chrome://extensions`, find **Lore.land**, and click **Details** followed by **Extension options**.
    - Test settings like **Enable Auto-Download for Recordings** and **Clear All Thoughts**.

- **Keyboard Shortcuts**:

    - The extension defines several commands with keyboard shortcuts.
    - To see or customize these, go to `chrome://extensions/shortcuts`.
    - Test the shortcuts in a web page to see if they trigger the expected actions.

---

## Features

### Screen Recording

- **Start Recording**:

    - Click the **Start Recording** button in the popup to initiate screen recording.
    - The extension will prompt you to select what to share (your entire screen, a window, or a tab).
    - **Note**: Screen recording requires the `desktopCapture` permission.

- **Auto-Download**:

    - Enable **Auto-Download for Recordings** in the options page to automatically download recordings after stopping.

### Yank Text

- **Yank Text**:

    - Select text on a web page.
    - Click the **Yank Text** button in the popup.
    - The selected text is stored and can be viewed in the popup's log.

### Interaction Logging

- **View Logs**:

    - The popup displays a log of interactions.
    - Click **Clear Log** to remove all entries.

### Thought Submission

- **Submit Thought**:

    - Click the **Submit Thought** button.
    - Enter your thought in the prompt.
    - Thoughts are stored and can be managed in the options page.

### Keyboard Shortcuts

The extension defines several keyboard shortcuts for quick actions:

- **Yank Chapter**: `Ctrl+Y` / `Command+Y`
- **Navigate Left Section**: `Ctrl+H` / `Command+H`
- **Navigate Right Section**: `Ctrl+L` / `Command+L`
- **Navigate Up Chapter**: `Ctrl+K` / `Command+K`
- **Navigate Down Chapter**: `Ctrl+J` / `Command+J`
- **Open Character Profile**: `Ctrl+O` / `Command+O`
- **Open Timeline**: `Ctrl+T` / `Command+T`
- **Bookmark Location**: `Ctrl+B` / `Command+B`
- **Jump to Bookmark**: `Ctrl+G` / `Command+G`
- **Search Story**: `/`
- **Execute Primary Action**: `Ctrl+P` / `Command+P`

Customize these shortcuts at `chrome://extensions/shortcuts`.

---

## Modifying and Extending

### Editing Files

- Open the files in your preferred text editor.
- Make changes to the JavaScript, HTML, or CSS files as desired.
- Ensure that any changes comply with Chrome's extension policies.

### Testing Changes

- After making changes, go back to `chrome://extensions`.
- Click the **Reload** button (circular arrow) on the **Lore.land** extension to apply your changes.
- Test the extension to ensure your changes work as expected.

### Debugging

- Use Chrome's Developer Tools (`F12` or `Ctrl+Shift+I`) to debug your scripts.
- For background scripts, click **Inspect views: background page** on the extension's details page.
- For content scripts, open the Developer Tools on any web page where the script is injected.

---

## Contributing

If you wish to contribute to the Lore.land extension:

- **Fork the Repository**:

    - If the project is hosted on a platform like GitHub, fork it to your account.

- **Make Changes**:

    - Implement your improvements or new features.

- **Submit a Pull Request**:

    - Push your changes to your forked repository.
    - Submit a pull request to the original repository with a description of your changes.

- **Reporting Issues**:

    - Use the repository's issue tracker to report bugs or suggest features.

---

## Troubleshooting

### Common Issues

- **Extension Fails to Load**:

    - Check the `manifest.json` for syntax errors.
    - Ensure all file paths are correct and files exist.

- **Permissions Errors**:

    - Ensure that the required permissions are declared in `manifest.json`.
    - Some permissions, like `desktopCapture`, require user interaction to function.

- **Scripts Not Executing**:

    - Use console logs to debug.
    - Ensure that your content scripts match the correct URLs.

### Getting Help

- **Chrome Extension Documentation**:

    - Refer to the [Chrome Extension Developer Documentation](https://developer.chrome.com/docs/extensions/) for detailed information on APIs and best practices.

- **Community Support**:

    - Engage with developer communities, such as Stack Overflow or Reddit's [r/ChromeExtensions](https://www.reddit.com/r/ChromeExtensions/), for help and inspiration.

---

## Learning Resources

- **Chrome Extensions Samples**: Explore [sample extensions](https://github.com/GoogleChrome/chrome-extensions-samples) provided by Google.

- **MDN Web Docs**: The [MDN documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) offers resources on extension development (though focused on Firefox, much is applicable to Chrome).

- **JavaScript Tutorials**:

    - [freeCodeCamp](https://www.freecodecamp.org/)
    - [Codecademy](https://www.codecademy.com/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Enjoy experimenting with the Lore.land extension!**

If you have any questions or run into issues, don't hesitate to seek help from the developer community. Happy coding!