/*************************************************
 * Multi-Site Job Tracker – content.js
 * Minimizes banner indication and tracks applied jobs
 * For: CorrectTech, Malam-Mertens & AdamTotal
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
  // Set minimized active status message
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
 * Helper: Extract Job ID from element or page
 *************************************************/
function getJobIdFromElement(button) {
  // 1. CorrectTech platform (via data-jobid attribute)
  let jobId = button.getAttribute("data-jobid");
  if (jobId) return jobId;

  // 2. Malam-Mertens platform (via jid URL Parameter)
  const href = button.getAttribute("href");
  if (href && href.includes("jid=")) {
    try {
      const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));
      jobId = urlParams.get('jid');
      if (jobId) return jobId;
    } catch (e) {
      console.error("Failed to parse Malam jobId from URL", e);
    }
  }

  // 3. AdamTotal platform - extract the ID from the text node containing the job number
  const jobSpan = document.querySelector("span.inline-flex.items-center.gap-2");
  if (jobSpan && jobSpan.innerText.includes("מספר משרה:")) {
    const match = jobSpan.innerText.match(/\d+/);
    if (match) return match[0];
  }

  return null;
}

/*************************************************
 * Helper: Find AdamTotal Container
 *************************************************/
function getAdamTotalContainer() {
  const jobTitle = document.querySelector("#job_title");
  // Locates the main wrapper div enclosing the job title header
  return jobTitle ? jobTitle.parentElement : null;
}

/*************************************************
 * Checking and Marking Applied Jobs
 *************************************************/
function checkAndMarkAppliedJobs() {
  const appliedJobIds = JSON.parse(
    localStorage.getItem("appliedJobIds") || "[]"
  );

  // A. Process standard job board listings (CorrectTech & Malam-Mertens)
  const listJobSelectors = ".jobItemOuterBox, .job-item-container";
  const listJobs = document.querySelectorAll(listJobSelectors);

  listJobs.forEach((job) => {
    const button = job.querySelector("a.genBtn[data-jobid], .job-actions a.btn");
    if (!button) return;

    const jobId = getJobIdFromElement(button);
    if (jobId && appliedJobIds.includes(jobId)) {
      job.classList.add("applied-job");
    } else {
      job.classList.remove("applied-job");
    }
  });

  // B. Process single-page landing layouts (AdamTotal) - highlight inner wrapper container only
  if (window.location.hostname.includes("adamtotal.co.il")) {
    const adamContainer = getAdamTotalContainer();
    if (adamContainer) {
      const currentJobId = getJobIdFromElement(adamContainer);
      if (currentJobId && appliedJobIds.includes(currentJobId)) {
        adamContainer.classList.add("applied-job");
      } else {
        adamContainer.classList.remove("applied-job");
      }
    }
  }
}

/*************************************************
 * Track applied jobs (Click Listeners)
 *************************************************/
function addApplyButtonListeners() {
  // Aggregate application button selectors from all three targeted platforms
  const buttonSelectors = "a.genBtn[data-jobid], .job-actions a.btn, #Apply_for_This_Position_button";
  const applyLinks = document.querySelectorAll(buttonSelectors);

  applyLinks.forEach((link) => {
    // Prevent attaching duplicate event handlers during continuous MutationObserver cycles
    if (link.getAttribute("data-has-listener") === "true") return;
    link.setAttribute("data-has-listener", "true");

    link.addEventListener("click", (event) => {
      const button = event.target.closest(buttonSelectors);
      if (!button) return;

      const jobId = getJobIdFromElement(button);
      if (!jobId) return;

      let appliedJobIds = JSON.parse(
        localStorage.getItem("appliedJobIds") || "[]"
      );
      
      if (!appliedJobIds.includes(jobId)) {
        appliedJobIds.push(jobId);
        localStorage.setItem("appliedJobIds", JSON.stringify(appliedJobIds));
      }

      // Determine the target UI element to style based on the originating host platform
      let jobContainer;
      if (button.id === "Apply_for_This_Position_button") {
        jobContainer = getAdamTotalContainer();
      } else {
        jobContainer = button.closest(".jobItemOuterBox, .job-item-container");
      }

      if (jobContainer) {
        jobContainer.classList.add("applied-job");
      }
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