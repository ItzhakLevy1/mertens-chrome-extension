# CorrectTech Job Tracker 🟢

A lightweight Google Chrome Extension tailored for the **CorrectTech** job board. This extension helps you keep track of jobs you have already applied for (by clicking the "More Details" / "פרטים נוספים" button) and marks them with a distinct visual indicator to avoid reviewing the same positions twice.

---

## 🚀 Key Features

* **Active Indicator:** A compact banner in the top-right corner displaying `תוסף המשרות שלי פעיל 🟢`, confirming the extension has loaded successfully.
* **Automated Tracking:** Clicking the "More Details" button on any job card automatically saves its unique `jobid` to local storage.
* **Clear Visual Cues:** Visually darkens applied job cards with a green border, an opacity overlay, and a distinct `✅ Applied` watermark stamp.
* **Persistent Storage:** Data is stored using `localStorage`, ensuring your marked jobs remain saved even after refreshing the page or restarting the browser.
* **Dynamic DOM Support:** Built using a `MutationObserver` to ensure new jobs are detected and marked seamlessly as they load dynamically (e.g., during pagination or continuous scrolling).

---

## 📂 Project Structure

The extension consists of three simple files:
1. `manifest.json` – Handles metadata, permissions, and matching rules for the Chrome browser.
2. `content.js` – Contains the core logic for injecting the banner, listening to click events, and updating storage.
3. `styles.css` – Defines the styling for the indicator banner, the modified look of applied jobs, and the watermark icon.

---

## 🛠️ Installation Instructions

1. **Download the Files:** Save the three extension files (`manifest.json`, `content.js`, `styles.css`) into a dedicated folder on your computer (e.g., `correct-tech-tracker`).
2. **Open Extensions Page:** Open Google Chrome and navigate to the following URL:
   ```text
   chrome://extensions/