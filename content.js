/*************************************************
 * CorrectTech Job Tracker – content.js
 * Minimizes banner indication and tracks applied jobs
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
  // שינוי מבנה התפריט למינימום המבוקש
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
 * Checking and Marking Applied Jobs
 *************************************************/
function checkAndMarkAppliedJobs() {
  const jobs = document.querySelectorAll(".jobItemOuterBox");
  const appliedJobIds = JSON.parse(
    localStorage.getItem("appliedJobIds") || "[]"
  );

  jobs.forEach((job) => {
    // מציאת הכפתור שמכיל את ה-jobid בתוך קונטיינר המשרה
    const button = job.querySelector("a.genBtn[data-jobid]");
    if (!button) return;

    const jobId = button.getAttribute("data-jobid");
    
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
  // התאמה לכפתור "פרטים נוספים" המכיל את ה-jobid
  const applyLinks = document.querySelectorAll("a.genBtn[data-jobid]");

  applyLinks.forEach((link) => {
    // מניעת כפל האזנות אם הפונקציה רצה שוב ושוב ב-Observer
    if (link.getAttribute("data-has-listener") === "true") return;
    link.setAttribute("data-has-listener", "true");

    link.addEventListener("click", (event) => {
      const button = event.target.closest("a.genBtn[data-jobid]");
      if (!button) return;

      const jobContainer = button.closest(".jobItemOuterBox");
      if (!jobContainer) return;

      const jobId = button.getAttribute("data-jobid");
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