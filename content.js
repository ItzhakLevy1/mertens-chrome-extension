/*************************************************
 * Multi-Site Job Tracker – content.js
 * Minimizes banner indication and tracks applied jobs
 * For: CorrectTech & Malam-Mertens
 *************************************************/

/*************************************************
 * Banner Indicator
 *************************************************/
let bannerClosed = false;

function ensureExtensionBanner() {
  if (!document.body) return;
  if (bannerClosed) return;
  if (document.querySelector(".my-extension-banner")) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = "my-extension-banner";

  const textSpan = document.createElement("span");
  textSpan.innerHTML = `<div>תוסף המשרות שלי פעיל 🟢</div>`;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.className = "my-extension-close";

  closeBtn.addEventListener("click", () => {
    bannerClosed = true;
    messageDiv.remove();
  });

  messageDiv.appendChild(textSpan);
  messageDiv.appendChild(closeBtn);
  document.body.appendChild(messageDiv);
}

/*************************************************
 * Helper: Extract Job ID from element
 *************************************************/
function getJobIdFromElement(button) {
  // 1. בדיקה אם מדובר באתר המקורי (CorrectTech) עם data-jobid
  let jobId = button.getAttribute("data-jobid");
  if (jobId) return jobId;

  // 2. בדיקה אם מדובר באתר החדש (Malam) - שליפת ה-jid מה-href URL
  const href = button.getAttribute("href");
  if (href && href.includes("jid=")) {
    try {
      const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));
      jobId = urlParams.get('jid');
    } catch (e) {
      console.error("Failed to parse Malam jobId from URL", e);
    }
  }
  return jobId;
}

/*************************************************
 * Checking and Marking Applied Jobs
 *************************************************/
function checkAndMarkAppliedJobs() {
  // תמיכה בשני סוגי הקונטיינרים של המשרות
  const jobSelectors = ".jobItemOuterBox, .job-item-container";
  const jobs = document.querySelectorAll(jobSelectors);
  
  const appliedJobIds = JSON.parse(
    localStorage.getItem("appliedJobIds") || "[]"
  );

  jobs.forEach((job) => {
    // מציאת הכפתור הרלוונטי (CorrectTech או Malam) בתוך קונטיינר המשרה
    const button = job.querySelector("a.genBtn[data-jobid], .job-actions a.btn");
    if (!button) return;

    const jobId = getJobIdFromElement(button);
    
    if (jobId && appliedJobIds.includes(jobId)) {
      job.classList.add("applied-job");
    } else {
      job.classList.remove("applied-job");
    }
  });
}

/*************************************************
 * Track applied jobs (Click Listeners)
 *************************************************/
function addApplyButtonListeners() {
  // האזנה לשני סוגי הכפתורים בשני האתרים
  const buttonSelectors = "a.genBtn[data-jobid], .job-actions a.btn";
  const applyLinks = document.querySelectorAll(buttonSelectors);

  applyLinks.forEach((link) => {
    if (link.getAttribute("data-has-listener") === "true") return;
    link.setAttribute("data-has-listener", "true");

    link.addEventListener("click", (event) => {
      const button = event.target.closest(buttonSelectors);
      if (!button) return;

      // מציאת הקונטיינר המתאים לפי האתר הנוכחי
      const jobContainer = button.closest(".jobItemOuterBox, .job-item-container");
      if (!jobContainer) return;

      const jobId = getJobIdFromElement(button);
      if (!jobId) return;

      let appliedJobIds = JSON.parse(
        localStorage.getItem("appliedJobIds") || "[]"
      );
      
      if (!appliedJobIds.includes(jobId)) {
        appliedJobIds.push(jobId);
        localStorage.setItem("appliedJobIds", JSON.stringify(appliedJobIds));
      }

      jobContainer.classList.add("applied-job");
    });
  });
}

/*************************************************
 * Bootstrap & observers
 *************************************************/
function runExtension() {
  ensureExtensionBanner();
  checkAndMarkAppliedJobs();
  addApplyButtonListeners();
}

// Initial load (document_start safety)
const bootInterval = setInterval(() => {
  if (document.body) {
    runExtension();
    clearInterval(bootInterval);
  }
}, 100);

// Observe SPA / dynamic DOM changes
const observer = new MutationObserver(() => {
  runExtension();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});