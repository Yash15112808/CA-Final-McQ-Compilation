/**
 * Main Application Controller for ICAI CA Final MCQ Portal
 */

const STORAGE_KEY_CUSTOM_MCQS = "ICAI_MCQ_CUSTOM_ITEMS_V1";
const STORAGE_KEY_THEME = "ICAI_MCQ_THEME";

const App = {
  state: {
    allMCQs: [],
    allWritingQuestions: [],
    activeTrackerSubject: "FR",
    currentTab: "study",
    studySubtab: "countdown-calendar",
    comparisonPeriod: "today",
    editingChapter: null,
    theme: "light",
    repositoryState: {
      activeSubject: "FR",
      currentCaseIndex: 0,
      currentQuestionIndex: 0,
      selectedAnswers: {},
      submittedAnswers: {},
      submittedCases: {},
      reviewStatus: {},
      skippedStatus: {},
      chapterFilter: "ALL",
      sourceFilter: "ALL",
      statusFilter: "ALL",
      impFilter: "ALL",
      searchTerm: "",
      isCaseExpanded: false
    },
    repositoryFilter: {
      search: "",
      subject: "FR",
      chapter: "ALL",
      source: "ALL",
      difficulty: "ALL",
      imp: "ALL"
    },
    writingState: {
      activeSubject: "FR",
      currentIndex: 0,
      chapterFilter: "ALL",
      sourceFilter: "ALL",
      searchTerm: ""
    },
    writingHiddenAnswers: new Set(),
    activeFullViewWqId: null,
    practiceFilter: {
      subject: "ALL",
      source: "ALL",
      starredOnly: false,
      impOnly: false,
      incorrectOnly: false
    }
  },

  init() {
    this.loadTheme();
    this.checkAuthStatus();
    this.loadCaseAttempts();
    this.loadMCQs();
    this.loadWritingQuestions();
    this.setupEventListeners();
    this.renderHeaderSubjects();
    this.populateModalSelects();
    this.initSidebarAutoHide();
  },

  checkAuthStatus() {
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    const overlay = document.getElementById("authGatewayOverlay");
    const sessionBadge = document.getElementById("userSessionBadge");
    const headerName = document.getElementById("headerStudentName");
    const headerAttempt = document.getElementById("headerStudentAttempt");
    const sidebarCard = document.getElementById("sidebarStudentCard");
    const sidebarName = document.getElementById("sidebarStudentName");
    const sidebarAttempt = document.getElementById("sidebarStudentAttempt");
    const sidebarLogout = document.getElementById("sidebarLogoutBtn");

    if (user) {
      if (overlay) overlay.style.display = "none";
      if (sessionBadge) sessionBadge.style.display = "flex";
      if (headerName) headerName.textContent = user.name;
      if (headerAttempt) headerAttempt.textContent = `${user.regNo} • ${user.attempt}`;
      if (sidebarCard) sidebarCard.style.display = "flex";
      if (sidebarName) sidebarName.textContent = user.name;
      if (sidebarAttempt) sidebarAttempt.textContent = user.attempt;
      if (sidebarLogout) sidebarLogout.style.display = "block";
      this.switchTab(this.state.currentTab || "study");
    } else {
      if (overlay) overlay.style.display = "flex";
      if (sessionBadge) sessionBadge.style.display = "none";
      if (sidebarCard) sidebarCard.style.display = "none";
      if (sidebarLogout) sidebarLogout.style.display = "none";
    }
  },

  // Theme Management
  loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || "light";
    this.setTheme(savedTheme);
  },

  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.innerHTML = theme === "dark" 
        ? '<i class="fa-solid fa-sun"></i> <span>Light Mode</span>' 
        : '<i class="fa-solid fa-moon"></i> <span>Dark Mode</span>';
    }
  },

  toggleTheme() {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  },

  // MCQ Data Loading
  loadMCQs() {
    // Purge legacy demo questions to ensure fresh official May 2026 Case Scenario MCQs
    const versionKey = "ICAI_MCQ_BANK_VERSION";
    const currentVersion = "MAY_2026_CSB_V1";
    if (localStorage.getItem(versionKey) !== currentVersion) {
      localStorage.setItem(versionKey, currentVersion);
      localStorage.removeItem(STORAGE_KEY_CUSTOM_MCQS);
    }

    let customItems = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_MCQS);
      if (stored) {
        customItems = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading custom MCQs", e);
    }

    const legacyDemoIds = ["FR-001", "FR-002", "FR-003", "FR-004", "AFM-001", "AFM-002", "AUDIT-001", "AUDIT-002", "DT-001", "DT-002", "IDT-001", "IDT-002", "CASE-001", "CASE-002"];
    customItems = customItems.filter(item => !legacyDemoIds.includes(item.id));

    const defaultItems = typeof DEFAULT_MCQS !== "undefined" ? DEFAULT_MCQS : [];
    
    // Combine defaults and custom items (ensuring no duplicate IDs)
    const customMap = new Map();
    customItems.forEach(item => customMap.set(item.id, item));

    const merged = [];
    defaultItems.forEach(item => {
      if (customMap.has(item.id)) {
        merged.push(customMap.get(item.id));
        customMap.delete(item.id);
      } else {
        merged.push(item);
      }
    });

    // Add remaining custom items
    customMap.forEach(item => merged.push(item));
    this.state.allMCQs = merged;
  },

  saveCustomMCQ(newMCQ) {
    let customItems = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_MCQS);
      if (stored) customItems = JSON.parse(stored);
    } catch (e) {}

    const existingIdx = customItems.findIndex(x => x.id === newMCQ.id);
    if (existingIdx > -1) {
      customItems[existingIdx] = newMCQ;
    } else {
      customItems.push(newMCQ);
    }

    localStorage.setItem(STORAGE_KEY_CUSTOM_MCQS, JSON.stringify(customItems));
    this.loadMCQs();
  },

  deleteMCQ(id) {
    const code = prompt("🔒 Developer Security Passcode Required:\nOnly Developers can delete MCQs from the Master Bank. Enter Developer Passcode:");
    if (!code) return;
    if (code !== "DEV@ICAI2026") {
      alert("❌ Unauthorized: Invalid Developer Passcode. Deleting MCQs from the Master Bank is restricted to Developer role only.");
      return;
    }

    if (!confirm("Developer Confirmation: Are you sure you want to permanently delete this MCQ from the Master Bank?")) return;
    let customItems = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_MCQS);
      if (stored) customItems = JSON.parse(stored);
    } catch (e) {}

    customItems = customItems.filter(x => x.id !== id);
    localStorage.setItem(STORAGE_KEY_CUSTOM_MCQS, JSON.stringify(customItems));

    // Also remove from state if it was a default item or reload
    this.state.allMCQs = this.state.allMCQs.filter(x => x.id !== id);
    this.renderCurrentView();
  },

  // Header & Navigation
  renderHeaderSubjects() {
    const select = document.getElementById("globalSubjectFilter");
    if (!select || typeof ICAI_METADATA === "undefined") return;

    select.innerHTML = '<option value="ALL">All Subjects (CA Final)</option>';
    ICAI_METADATA.subjects.forEach(sub => {
      select.innerHTML += `<option value="${sub.id}">${sub.paper}: ${sub.name}</option>`;
    });
  },

  populateModalSelects() {
    if (typeof ICAI_METADATA === "undefined") return;

    const subjectSelects = [
      document.getElementById("modalSubjectSelect"),
      document.getElementById("caseSubjectSelect"),
      document.getElementById("rawImportSubject"),
      document.getElementById("repoSubjectFilter"),
      document.getElementById("examSubjectSelect")
    ];

    subjectSelects.forEach(sel => {
      if (!sel) return;
      const isFilter = sel.id.includes("Filter") || sel.id.includes("exam");
      sel.innerHTML = isFilter ? '<option value="ALL">All Subjects</option>' : '';
      ICAI_METADATA.subjects.forEach(sub => {
        sel.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
      });
    });

    const sourceSelects = [
      document.getElementById("modalSourceSelect"),
      document.getElementById("caseSourceSelect"),
      document.getElementById("rawImportSource"),
      document.getElementById("repoSourceFilter")
    ];

    sourceSelects.forEach(sel => {
      if (!sel) return;
      const isFilter = sel.id.includes("Filter");
      sel.innerHTML = isFilter ? '<option value="ALL">All Sources</option>' : '';
      ICAI_METADATA.sources.forEach(src => {
        sel.innerHTML += `<option value="${src.id}">${src.name} (${src.label})</option>`;
      });
    });

    // Populate chapters dynamically when modal subject changes
    const modalSubject = document.getElementById("modalSubjectSelect");
    if (modalSubject) {
      modalSubject.addEventListener("change", (e) => {
        this.updateChapterDropdown("modalChapterSelect", e.target.value);
      });
      this.updateChapterDropdown("modalChapterSelect", modalSubject.value || "FR");
    }

    // Populate chapter filters for Repository and Writing sections
    this.updateChapterFilterDropdown("repoChapterFilter", "ALL");
    this.updateChapterFilterDropdown("writingChapterFilter", "ALL");
  },

  updateChapterDropdown(dropdownId, subjectId) {
    const chapterSelect = document.getElementById(dropdownId);
    if (!chapterSelect || typeof ICAI_METADATA === "undefined") return;

    const sub = ICAI_METADATA.subjects.find(s => s.id === subjectId);
    chapterSelect.innerHTML = "";
    if (sub && sub.chapters) {
      sub.chapters.forEach(ch => {
        chapterSelect.innerHTML += `<option value="${ch}">${ch}</option>`;
      });
    } else {
      chapterSelect.innerHTML = '<option value="General">General / All Topics</option>';
    }
  },

  updateChapterFilterDropdown(dropdownId, subjectId) {
    const sel = document.getElementById(dropdownId);
    if (!sel || typeof ICAI_METADATA === "undefined") return;

    sel.innerHTML = '<option value="ALL">All Chapters</option>';
    if (!subjectId || subjectId === "ALL") {
      const allChs = new Set();
      ICAI_METADATA.subjects.forEach(s => {
        (s.chapters || []).forEach(ch => allChs.add(ch));
      });
      allChs.forEach(ch => {
        sel.innerHTML += `<option value="${ch}">${ch}</option>`;
      });
    } else {
      const sub = ICAI_METADATA.subjects.find(s => s.id === subjectId);
      if (sub && sub.chapters) {
        sub.chapters.forEach(ch => {
          sel.innerHTML += `<option value="${ch}">${ch}</option>`;
        });
      }
    }
  },

  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  },

  formatMarkdown(raw) {
    if (!raw) return "";
    let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Replace backtick currency marks: ` 500 or `500 with ₹
    text = text.replace(/`\s*(\d)/g, '₹$1');

    // Fenced code blocks
    text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre class="wq-code-block" style="background: var(--bg-muted); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); overflow-x: auto; font-family: monospace; font-size: 0.88rem; margin: 12px 0;"><code>${esc}</code></pre>`;
    });

    // Tables: lines starting and ending with |
    const lines = text.split("\n");
    let inTable = false;
    let tableHtml = "";
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableHtml = `<table class="wq-table" style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 0.88rem;">`;
          // Header row
          const cells = line.split("|").slice(1, -1).map(c => `<th style="border: 1px solid var(--border-color); padding: 8px 12px; background: var(--bg-muted); font-weight: 700; text-align: left;">${c.trim()}</th>`).join("");
          tableHtml += `<thead><tr>${cells}</tr></thead><tbody>`;
          // Skip divider line like |:---|:---|
          if (i + 1 < lines.length && lines[i + 1].trim().startsWith("|") && lines[i + 1].includes("---")) {
            i++;
          }
        } else {
          const cells = line.split("|").slice(1, -1).map(c => `<td style="border: 1px solid var(--border-color); padding: 8px 12px; text-align: left;">${c.trim()}</td>`).join("");
          tableHtml += `<tr>${cells}</tr>`;
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += `</tbody></table>`;
          newLines.push(tableHtml);
          tableHtml = "";
        }
        newLines.push(lines[i]);
      }
    }
    if (inTable) {
      tableHtml += `</tbody></table>`;
      newLines.push(tableHtml);
    }
    text = newLines.join("\n");

    // Headers
    text = text.replace(/^### (.*$)/gim, '<h4 style="font-weight: 700; margin: 14px 0 8px; color: var(--primary); font-size: 1.05rem;">$1</h4>');
    text = text.replace(/^## (.*$)/gim, '<h3 style="font-weight: 700; margin: 18px 0 10px; color: var(--primary); font-size: 1.15rem;">$1</h3>');

    // Bold, Italic, Inline Code
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
    text = text.replace(/---/g, '<hr style="margin: 16px 0; border: none; border-top: 1px dashed var(--border-color);">');

    // Convert paragraphs
    const chunks = text.split(/(<table[\s\S]*?<\/table>|<pre[\s\S]*?<\/pre>)/i);
    return chunks.map(chunk => {
      if (chunk.startsWith("<table") || chunk.startsWith("<pre")) {
        return chunk;
      }
      return chunk.split(/\n{2,}/).map(para => {
        const trimmed = para.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("<h") || trimmed.startsWith("<hr")) return trimmed;
        return `<p style="margin-bottom: 10px; line-height: 1.7;">${trimmed.replace(/\n/g, "<br>")}</p>`;
      }).join("");
    }).join("");
  },

  switchTab(tabId) {
    if (tabId === "dashboard") tabId = "study";
    this.state.currentTab = tabId;
    this.toggleSidebar(false);

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.dataset.tab === tabId);
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.remove("active");
    });

    const activePane = document.getElementById(`tab-${tabId}`);
    if (activePane) activePane.classList.add("active");

    const titleEl = document.getElementById("activeTabHeading");
    if (titleEl) {
      const titles = {
        study: "Study Management Hub",
        repository: "Official ICAI MCQ Master Bank",
        writing: "Descriptive & Practical Writing Problems",
        practice: "Active Recall Practice Mode",
        exam: "Timed ICAI Exam Simulator (30 Marks)",
        cases: "Integrated Case Scenario Studies",
        mistakes: "Mistakes Notebook Drill"
      };
      titleEl.textContent = titles[tabId] || "ICAI CA Final Portal";
    }

    if (tabId === "repository") {
      this.syncGlobalSubjectHeaderForRepository(true);
    } else {
      this.syncGlobalSubjectHeaderForRepository(false);
    }

    this.renderCurrentView();
  },

  toggleSidebar(open) {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (!sidebar) return;

    if (open) {
      document.body.classList.add("sidebar-open");
      sidebar.classList.add("open");
      if (backdrop) backdrop.classList.add("active");
    } else {
      document.body.classList.remove("sidebar-open");
      sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("active");
    }
  },

  initSidebarAutoHide() {
    const sidebar = document.getElementById("appSidebar");
    if (!sidebar) return;

    sidebar.addEventListener("mouseenter", () => {
      this.cancelSidebarAutoHide();
    });

    sidebar.addEventListener("mouseleave", () => {
      this.scheduleSidebarAutoHide();
    });

    // Reveal when mouse moves near left edge (<= 15px)
    document.addEventListener("mousemove", (e) => {
      if (e.clientX <= 15 && document.body.classList.contains("sidebar-auto-hidden")) {
        this.revealSidebar();
      }
    });
  },

  scheduleSidebarAutoHide() {
    this.cancelSidebarAutoHide();
    // Only auto-hide on desktop screens (> 992px)
    if (window.innerWidth <= 992) return;

    this.sidebarHideTimer = setTimeout(() => {
      this.autoHideSidebar();
    }, 5000);
  },

  cancelSidebarAutoHide() {
    if (this.sidebarHideTimer) {
      clearTimeout(this.sidebarHideTimer);
      this.sidebarHideTimer = null;
    }
  },

  autoHideSidebar() {
    if (window.innerWidth <= 992) return;
    document.body.classList.add("sidebar-auto-hidden");
    const revealTab = document.getElementById("sidebarRevealTab");
    if (revealTab) revealTab.style.display = "flex";
  },

  revealSidebar() {
    this.cancelSidebarAutoHide();
    document.body.classList.remove("sidebar-auto-hidden");
    const revealTab = document.getElementById("sidebarRevealTab");
    if (revealTab) revealTab.style.display = "none";
  },

  switchStudySubtab(subtabId) {
    this.state.studySubtab = subtabId;
    document.querySelectorAll(".study-subnav-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.subtab === subtabId);
    });

    document.querySelectorAll(".study-subpane").forEach(pane => {
      pane.style.display = "none";
      pane.classList.remove("active");
    });

    const activePane = document.getElementById(`study-subtab-${subtabId}`);
    if (activePane) {
      activePane.style.display = "block";
      activePane.classList.add("active");
    }

    if (subtabId === "countdown-calendar") {
      this.renderStudyCountdown();
      this.renderCalendar();
    } else if (subtabId === "pomodoro-todo") {
      this.renderPomodoro();
      this.renderTasksList();
      this.renderComparisonAnalytics();
    } else if (subtabId === "subject-tracker") {
      this.renderChapterTracker();
    }
  },

  renderCurrentView() {
    switch (this.state.currentTab) {
      case "dashboard":
      case "study":
        this.renderStudyView();
        break;
      case "repository":
        this.renderRepository();
        break;
      case "writing":
        this.renderWritingQuestions();
        break;
      case "practice":
        this.renderPractice();
        break;
      case "exam":
        this.renderExamView();
        break;
      case "cases":
        this.renderCasesView();
        break;
      case "mistakes":
        this.renderMistakesView();
        break;
    }
  },

  // ---------------- DASHBOARD ----------------
  renderDashboard() {
    const metrics = (typeof MCQStats !== 'undefined' && MCQStats.computeDashboardMetrics) 
      ? MCQStats.computeDashboardMetrics(this.state.allMCQs || []) 
      : { totalQuestions: 0, attemptedCount: 0, accuracyRate: 0, incorrectCount: 0, starredCount: 0, subjectMetrics: {} };

    const totalEl = document.getElementById("statTotalMCQs");
    const attemptedEl = document.getElementById("statAttempted");
    const accuracyEl = document.getElementById("statAccuracy");
    const mistakesEl = document.getElementById("statMistakes");
    const starredEl = document.getElementById("statStarred");

    if (totalEl) totalEl.textContent = metrics.totalQuestions;
    if (attemptedEl) attemptedEl.textContent = metrics.attemptedCount;
    if (accuracyEl) accuracyEl.textContent = `${metrics.accuracyRate}%`;
    if (mistakesEl) mistakesEl.textContent = metrics.incorrectCount;
    if (starredEl) starredEl.textContent = metrics.starredCount;

    // Subject breakdown bars
    const subjectListEl = document.getElementById("dashboardSubjectList");
    if (subjectListEl) {
      subjectListEl.innerHTML = "";
      Object.entries(metrics.subjectMetrics).forEach(([id, sub]) => {
        const pct = sub.total > 0 ? Math.round((sub.attempted / sub.total) * 100) : 0;
        const accuracy = sub.attempted > 0 ? Math.round((sub.correct / sub.attempted) * 100) : 0;
        subjectListEl.innerHTML += `
          <div class="subject-stat-card">
            <div class="stat-card-header">
              <span class="subject-badge" style="background-color: ${sub.color || '#4f46e5'}; color: #fff;">${id}</span>
              <span class="stat-name">${sub.name}</span>
              <span class="stat-count">${sub.attempted}/${sub.total} MCQs</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${sub.color || '#4f46e5'}"></div>
            </div>
            <div class="stat-card-footer">
              <span>Coverage: ${pct}%</span>
              <span>Accuracy: ${accuracy}%</span>
            </div>
          </div>
        `;
      });
    }

    // Source breakdown badges
    const sourceListEl = document.getElementById("dashboardSourceList");
    if (sourceListEl) {
      sourceListEl.innerHTML = "";
      Object.entries(metrics.sourceMetrics).forEach(([srcId, src]) => {
        sourceListEl.innerHTML += `
          <div class="source-card">
            <div class="source-badge" style="border-left: 4px solid ${src.color};">
              <h4>${src.name}</h4>
              <p class="source-count">${src.count} MCQs</p>
            </div>
          </div>
        `;
      });
    }

    // Recent Exam attempts table
    const recentExamsEl = document.getElementById("dashboardRecentExams");
    if (recentExamsEl) {
      if (metrics.recentExams.length === 0) {
        recentExamsEl.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No simulated exam attempts yet. Start an exam from the Exam Simulator tab!</td></tr>`;
      } else {
        recentExamsEl.innerHTML = metrics.recentExams.slice(0, 5).map(e => `
          <tr>
            <td>${new Date(e.date).toLocaleDateString()} ${new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td><strong>${e.score} / ${e.totalMarks}</strong></td>
            <td>
              <span class="badge ${e.percentage >= 70 ? 'badge-success' : e.percentage >= 40 ? 'badge-warning' : 'badge-danger'}">
                ${e.percentage}%
              </span>
            </td>
            <td>${Math.round(e.durationSeconds / 60)} mins</td>
            <td>${e.correctCount} / ${e.totalCount}</td>
          </tr>
        `).join("");
      }
    }
  },

  // ---------------- REPOSITORY STATE & PERSISTENCE ----------------
  loadCaseAttempts() {
    try {
      const saved = localStorage.getItem("ICAI_MCQ_CASE_ATTEMPTS_V1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.submittedAnswers) this.state.repositoryState.submittedAnswers = parsed.submittedAnswers;
        if (parsed.selectedAnswers) this.state.repositoryState.selectedAnswers = parsed.selectedAnswers;
        if (parsed.submittedCases) this.state.repositoryState.submittedCases = parsed.submittedCases;
        if (parsed.reviewStatus) this.state.repositoryState.reviewStatus = parsed.reviewStatus;
        if (parsed.skippedStatus) this.state.repositoryState.skippedStatus = parsed.skippedStatus;
      }
    } catch (e) {
      console.warn("Could not load case attempts", e);
    }
  },

  saveCaseAttempts() {
    try {
      localStorage.setItem("ICAI_MCQ_CASE_ATTEMPTS_V1", JSON.stringify({
        submittedAnswers: this.state.repositoryState.submittedAnswers,
        selectedAnswers: this.state.repositoryState.selectedAnswers,
        submittedCases: this.state.repositoryState.submittedCases || {},
        reviewStatus: this.state.repositoryState.reviewStatus,
        skippedStatus: this.state.repositoryState.skippedStatus
      }));
    } catch (e) {
      console.warn("Could not save case attempts", e);
    }
  },

  getCaseKey(caseData) {
    if (!caseData) return "";
    return `${caseData.subjectId}___${(caseData.caseTitle || caseData.chapter || '').trim()}`;
  },

  isCaseCompleted(caseData) {
    if (!caseData || !caseData.questions || caseData.questions.length === 0) return false;
    const caseKey = this.getCaseKey(caseData);
    if (this.state.repositoryState.submittedCases && this.state.repositoryState.submittedCases[caseKey]?.submitted) {
      return true;
    }
    return caseData.questions.every(q => Boolean(this.state.repositoryState.submittedAnswers[q.id]));
  },

  formatExplanationText(raw) {
    if (!raw) return "<p>Refer to relevant statutory provisions and ICAI study guidelines.</p>";
    let text = this.escapeHTML(raw);
    text = text.replace(/`\s*(\d)/g, '₹$1').replace(/`/g, '₹');
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    if (paras.length <= 1) {
      return `<p>${text.replace(/\n/g, "<br>")}</p>`;
    }
    return paras.map(p => `<p class="explanation-paragraph">${p.replace(/\n/g, "<br>")}</p>`).join("");
  },

  getSubjectCaseStudies(subjectId) {
    const map = new Map();
    this.state.allMCQs.forEach(q => {
      if (q.subjectId !== subjectId) return;
      const hasScenario = Boolean(q.scenarioText && q.scenarioText.trim());
      const groupKey = hasScenario
        ? (q.caseTitle || q.chapter || 'Case Scenario').trim()
        : `standalone___${q.id}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          caseKey: groupKey,
          isCase: hasScenario,
          subjectId: q.subjectId,
          chapter: q.chapter,
          caseTitle: q.caseTitle || `Case Scenario: ${q.chapter || 'Comprehensive'}`,
          scenarioText: q.scenarioText || "",
          source: q.source || "BOOKLET",
          examSession: q.examSession || "ICAI May 2026 Case Scenario Booklet",
          questions: []
        });
      }
      map.get(groupKey).questions.push(q);
    });
    return Array.from(map.values());
  },

  getFilteredCaseStudies() {
    const activeSub = this.state.repositoryState.activeSubject || "FR";
    let cases = this.getSubjectCaseStudies(activeSub);

    const chFilter = this.state.repositoryState.chapterFilter || "ALL";
    if (chFilter !== "ALL") {
      cases = cases.filter(c => c.chapter === chFilter || c.questions.some(q => q.chapter === chFilter));
    }

    const srcFilter = this.state.repositoryState.sourceFilter || "ALL";
    if (srcFilter !== "ALL") {
      cases = cases.filter(c => c.source === srcFilter || c.questions.some(q => q.source === srcFilter));
    }

    const statusFilter = this.state.repositoryState.statusFilter || this.state.repositoryState.impFilter || "ALL";
    if (statusFilter === "COMPLETED") {
      cases = cases.filter(c => this.isCaseCompleted(c));
    } else if (statusFilter === "PENDING") {
      cases = cases.filter(c => !this.isCaseCompleted(c));
    } else if (statusFilter === "IMP") {
      cases = cases.filter(c => c.questions.some(q => MCQStats.isImp(q.id)));
    } else if (statusFilter === "WITH_NOTES") {
      cases = cases.filter(c => c.questions.some(q => Boolean(MCQStats.getNote(q.id))));
    }

    const term = (this.state.repositoryState.searchTerm || "").toLowerCase().trim();
    if (term) {
      cases = cases.filter(c => {
        const inTitle = (c.caseTitle || "").toLowerCase().includes(term);
        const inScenario = (c.scenarioText || "").toLowerCase().includes(term);
        const inChapter = (c.chapter || "").toLowerCase().includes(term);
        const inQuestions = c.questions.some(q => {
          const inStem = (q.question || "").toLowerCase().includes(term);
          const inOpts = (q.options || []).some(o => (o.text || "").toLowerCase().includes(term));
          const inNote = (MCQStats.getNote(q.id) || "").toLowerCase().includes(term);
          return inStem || inOpts || inNote;
        });
        return inTitle || inScenario || inChapter || inQuestions;
      });
    }

    return cases;
  },

  getActiveCaseData() {
    const cases = this.getFilteredCaseStudies();
    if (cases.length === 0) return null;
    let idx = this.state.repositoryState.currentCaseIndex || 0;
    if (idx >= cases.length) idx = 0;
    if (idx < 0) idx = 0;
    this.state.repositoryState.currentCaseIndex = idx;
    return cases[idx];
  },

  formatScenarioText(raw) {
    if (!raw) return "";
    let text = this.escapeHTML(raw);
    text = text.replace(/`\s*(\d)/g, '₹$1').replace(/`/g, '₹');
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    // Ensure list items start as separate paragraphs
    text = text.replace(/\n\s*(\([a-zA-Z0-9]+\)|\d+\.|\([ivxlcdmIVXLCDM]+\))\s*/g, "\n\n$1 ");
    const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    return paras.map(p => {
      const cleanP = p.replace(/\s*\n\s*/g, " ").trim();
      const isList = /^(\([a-zA-Z0-9]+\)|\d+\.|\([ivxlcdmIVXLCDM]+\))/.test(cleanP);
      if (isList) {
        return `<p class="case-list-item">${cleanP}</p>`;
      }
      return `<p class="case-paragraph">${cleanP}</p>`;
    }).join("");
  },

  // ---------------- REPOSITORY (OFFICIAL ICAI MCQ MASTER BANK) ----------------
  renderRepository() {
    const listEl = document.getElementById("repositoryList");
    if (!listEl) return;

    // 1. Sync global header dropdown to strictly subject-wise (no "ALL")
    this.syncGlobalSubjectHeaderForRepository(true);

    // 2. Render Subject Strip (FR, AFM, AUDIT, DT, IDT, IBS)
    this.renderRepoSubjectTabs();

    // 3. Populate Chapter Filter Dropdown for the active subject
    this.populateRepoChapterFilter();

    // 4. Retrieve filtered Case Studies for active subject
    const activeSub = this.state.repositoryState.activeSubject || "FR";
    const allSubjectCases = this.getSubjectCaseStudies(activeSub);
    const completedSubjectCases = allSubjectCases.filter(c => this.isCaseCompleted(c)).length;
    const pendingSubjectCases = allSubjectCases.length - completedSubjectCases;

    const statusFilter = this.state.repositoryState.statusFilter || this.state.repositoryState.impFilter || "ALL";
    const statusSelect = document.getElementById("repoStatusFilter") || document.getElementById("repoImpFilter");
    if (statusSelect) {
      statusSelect.value = statusFilter;
    }

    const cases = this.getFilteredCaseStudies();
    const totalCases = cases.length;
    let currentCaseIdx = this.state.repositoryState.currentCaseIndex || 0;
    if (currentCaseIdx >= totalCases) currentCaseIdx = Math.max(0, totalCases - 1);
    this.state.repositoryState.currentCaseIndex = currentCaseIdx;

    // 5. Update Navigation Controls (Index chip, Case selector, Prev/Next buttons)
    const indexChip = document.getElementById("repoCaseIndexChip");
    if (indexChip) {
      if (totalCases > 0) {
        let filterSuffix = "";
        if (statusFilter === "COMPLETED") {
          filterSuffix = ` <span class="case-chip-filter-tag font-bold text-success">• Completed (${completedSubjectCases})</span>`;
        } else if (statusFilter === "PENDING") {
          filterSuffix = ` <span class="case-chip-filter-tag font-bold text-warning">• Pending (${pendingSubjectCases})</span>`;
        } else {
          filterSuffix = ` <span class="case-chip-stats text-muted">(${completedSubjectCases} Completed / ${pendingSubjectCases} Pending)</span>`;
        }
        indexChip.innerHTML = `<i class="fa-solid fa-book-open"></i> Case Scenario ${currentCaseIdx + 1} of ${totalCases} ${filterSuffix}`;
      } else {
        indexChip.innerHTML = `<i class="fa-solid fa-book-open"></i> 0 Cases Found`;
      }
    }

    const caseSelect = document.getElementById("repoCaseSelect");
    if (caseSelect) {
      if (totalCases === 0) {
        caseSelect.innerHTML = '<option value="-1">No Case Studies matching filters</option>';
        caseSelect.disabled = true;
      } else {
        caseSelect.disabled = false;
        caseSelect.innerHTML = cases.map((c, idx) => {
          const isDone = this.isCaseCompleted(c);
          const statusTag = isDone ? "✓ Completed" : "⏳ Pending";
          return `
            <option value="${idx}" ${idx === currentCaseIdx ? 'selected' : ''}>
              Case ${idx + 1}: ${c.caseTitle.replace(/Case Scenario \d+:\s*/i, '').slice(0, 42)} [${statusTag}] (${c.questions.length} Qs)
            </option>
          `;
        }).join("");
      }
    }

    const btnPrev = document.getElementById("btnPrevCase");
    if (btnPrev) {
      btnPrev.disabled = (currentCaseIdx <= 0 || totalCases === 0);
    }

    const btnNext = document.getElementById("btnNextCase");
    if (btnNext) {
      btnNext.disabled = (currentCaseIdx >= totalCases - 1 || totalCases === 0);
      btnNext.innerHTML = (currentCaseIdx >= totalCases - 1 && totalCases > 0)
        ? `<span>Last Case</span> <i class="fa-solid fa-flag-checkered"></i>`
        : `<span>Next Case Study</span> <i class="fa-solid fa-chevron-right"></i>`;
    }

    // 6. Handle Empty State
    if (totalCases === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-file-circle-question fa-3x"></i>
          <h3>No Case Scenarios Match Your Filter</h3>
          <p>No Case Studies in ${this.state.repositoryState.activeSubject} matched your chapter or search criteria.</p>
          <button class="btn btn-primary" onclick="App.resetRepoFilters()">
            <i class="fa-solid fa-rotate-left"></i> Reset Subject Filters
          </button>
        </div>
      `;
      return;
    }

    // 7. Render Active Case Study & 1-by-1 MCQ
    this.renderActiveCaseStudy(cases[currentCaseIdx], totalCases);
  },

  renderRepoSubjectTabs() {
    const tabsContainer = document.getElementById("repoSubjectTabs");
    if (!tabsContainer || typeof ICAI_METADATA === "undefined") return;

    const activeSub = this.state.repositoryState.activeSubject || "FR";
    const subjects = ICAI_METADATA.subjects;

    tabsContainer.innerHTML = subjects.map(sub => {
      const isActive = sub.id === activeSub;
      const count = this.getSubjectCaseStudies(sub.id).length;
      return `
        <button 
          type="button"
          class="repo-sub-pill ${isActive ? 'active' : ''}" 
          style="${isActive ? `background-color: ${sub.color};` : ''}"
          onclick="App.setRepositorySubject('${sub.id}')"
          title="${sub.paper}: ${sub.name}">
          <i class="fa-solid ${sub.icon || 'fa-book'}"></i>
          <span>${sub.id}</span>
          <span class="repo-sub-pill-count">${count} Cases</span>
        </button>
      `;
    }).join("");
  },

  populateRepoChapterFilter() {
    const sel = document.getElementById("repoChapterFilter");
    if (!sel || typeof ICAI_METADATA === "undefined") return;

    const activeSub = this.state.repositoryState.activeSubject || "FR";
    const currentVal = this.state.repositoryState.chapterFilter || "ALL";

    const cases = this.getSubjectCaseStudies(activeSub);
    const chapterCounts = {};
    let totalQuestions = 0;

    cases.forEach(c => {
      const qCount = (c.questions || []).length;
      totalQuestions += qCount;
      const ch = c.chapter || "General / Integrated";
      chapterCounts[ch] = (chapterCounts[ch] || 0) + qCount;
      (c.questions || []).forEach(q => {
        if (q.chapter && q.chapter !== c.chapter) {
          chapterCounts[q.chapter] = (chapterCounts[q.chapter] || 0) + 1;
        }
      });
    });

    sel.innerHTML = `<option value="ALL">All Chapters in Subject (${totalQuestions} MCQs)</option>`;
    Object.keys(chapterCounts).sort().forEach(ch => {
      const count = chapterCounts[ch];
      sel.innerHTML += `<option value="${this.escapeHTML(ch)}" ${ch === currentVal ? 'selected' : ''}>${this.escapeHTML(ch)} (${count} MCQs)</option>`;
    });
  },

  renderActiveCaseStudy(caseData, totalCases) {
    const listEl = document.getElementById("repositoryList");
    if (!listEl || !caseData) return;

    const questions = caseData.questions || [];
    const totalQs = questions.length;
    let currentQIdx = this.state.repositoryState.currentQuestionIndex || 0;
    if (currentQIdx >= totalQs) currentQIdx = 0;
    this.state.repositoryState.currentQuestionIndex = currentQIdx;

    const currentQ = questions[currentQIdx];
    if (!currentQ) return;

    const subMeta = typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.subjects.find(s => s.id === caseData.subjectId) : null;
    const subColor = subMeta ? subMeta.color : "#2563eb";
    const subName = subMeta ? subMeta.name : caseData.subjectId;

    const formattedNarrative = this.formatScenarioText(caseData.scenarioText);
    const isExpanded = Boolean(this.state.repositoryState.isCaseExpanded);

    const isStarred = MCQStats.isStarred(currentQ.id);
    const isImp = MCQStats.isImp(currentQ.id);
    const userNote = MCQStats.getNote(currentQ.id);

    const isCaseCompleted = this.isCaseCompleted(caseData);
    const caseKey = this.getCaseKey(caseData);

    const submission = this.state.repositoryState.submittedAnswers[currentQ.id];
    const isReview = Boolean(this.state.repositoryState.reviewStatus[currentQ.id]);
    const selectedAnswer = this.state.repositoryState.selectedAnswers[currentQ.id];

    // Compute case scorecard marks according to ICAI scheme
    let caseTotalMarks = 0;
    let caseMarksObtained = 0;
    let caseCorrectCount = 0;
    let caseWrongCount = 0;
    let caseSkippedCount = 0;

    questions.forEach(q => {
      const qMarks = q.marks || 2;
      caseTotalMarks += qMarks;
      const sub = this.state.repositoryState.submittedAnswers[q.id];
      if (sub && sub.isCorrect) {
        caseMarksObtained += qMarks;
        caseCorrectCount++;
      } else if (sub && sub.selected) {
        caseWrongCount++;
      } else {
        caseSkippedCount++;
      }
    });

    const casePct = caseTotalMarks > 0 ? Math.round((caseMarksObtained / caseTotalMarks) * 100) : 0;

    const cleanStem = this.escapeHTML(currentQ.question)
      .replace(/`\s*(\d)/g, '₹$1')
      .replace(/`/g, '₹');

    listEl.innerHTML = `
      <div class="case-study-workspace" id="caseStudyWorkspace">
        <!-- 1. FIXED & SCROLLABLE CASE SCENARIO HERO BOX (No Blank Space, Full Width) -->
        <div class="case-scenario-hero-box" id="caseScenarioHero">
          <div class="case-hero-header">
            <div class="case-hero-tagline">
              <span class="case-hero-pill-badge" style="background-color: ${subColor};">
                <i class="fa-solid fa-graduation-cap"></i> ${caseData.subjectId} • ${subName}
              </span>
              <span class="case-hero-source-badge">
                <i class="fa-solid fa-book-open"></i> ${caseData.source || 'ICAI Case Scenario'}
              </span>
              ${caseData.examSession ? `
                <span class="badge badge-attempt" title="ICAI Exam Attempt / Edition">
                  <i class="fa-regular fa-calendar-check"></i> ${caseData.examSession}
                </span>
              ` : ''}
              <span class="badge badge-outline" title="Chapter / Ind AS Reference">
                <i class="fa-regular fa-folder-open"></i> ${caseData.chapter || 'Comprehensive'}
              </span>
              ${isCaseCompleted ? `
                <span class="badge badge-success" style="font-weight: 800; font-size: 0.72rem;">
                  <i class="fa-solid fa-circle-check"></i> Whole Case Submitted
                </span>
              ` : `
                <span class="badge badge-warning" style="font-weight: 700; font-size: 0.72rem;">
                  <i class="fa-solid fa-clock"></i> In Progress
                </span>
              `}
            </div>

            <div class="case-hero-actions">
              <button 
                type="button" 
                class="btn btn-sm btn-outline case-resize-btn" 
                onclick="App.toggleCaseScenarioHeight()" 
                id="caseResizeBtn" 
                title="Expand / Scroll Case Scenario Narrative">
                <i class="fa-solid ${isExpanded ? 'fa-compress' : 'fa-expand'}"></i>
                <span>${isExpanded ? 'Scroll View' : 'Full Expand'}</span>
              </button>
            </div>
          </div>

          <div class="case-hero-title-row">
            <div class="case-hero-kicker">
              <i class="fa-solid fa-scale-balanced"></i> OFFICIAL ICAI CASE SCENARIO
            </div>
            <h3 class="case-hero-title">
              <i class="fa-solid fa-file-contract"></i> ${caseData.caseTitle}
            </h3>
          </div>

          <!-- Untruncated narrative flowing smoothly across full container width -->
          <div class="case-scenario-content-body ${isExpanded ? 'expanded' : ''}" id="caseNarrativeBody">
            <div class="case-narrative-text">
              ${formattedNarrative}
            </div>
          </div>
        </div>

        <!-- 2. WHOLE CASE SCENARIO SCORECARD & ICAI EVALUATION REPORT (SHOWN WHEN SUBMITTED) -->
        ${isCaseCompleted ? `
          <div class="case-whole-scorecard" id="caseScenarioScorecard">
            <div class="scorecard-top-row">
              <div class="scorecard-title-group">
                <div class="scorecard-kicker"><i class="fa-solid fa-award"></i> ICAI CASE SCENARIO EVALUATION REPORT</div>
                <h3 class="scorecard-heading">Score: ${caseMarksObtained} / ${caseTotalMarks} Marks <span class="scorecard-pct">(${casePct}%)</span></h3>
              </div>
              <div class="scorecard-badge-wrap">
                <span class="scorecard-eval-badge ${casePct >= 70 ? 'badge-distinction' : (casePct >= 50 ? 'badge-pass' : 'badge-revision')}">
                  ${casePct >= 70 ? '★ Distinction Standard (≥ 70%)' : (casePct >= 50 ? '✓ ICAI Passing Standard (≥ 50%)' : '⚠ Revision Recommended (< 50%)')}
                </span>
              </div>
              <div class="scorecard-actions">
                <button type="button" class="btn btn-sm btn-outline" onclick="App.reattemptCaseScenario('${this.escapeHTML(caseKey)}')" title="Reset and re-attempt this Case Scenario">
                  <i class="fa-solid fa-rotate-left"></i> Re-attempt Case
                </button>
                <button type="button" class="btn btn-sm btn-primary" onclick="App.nextCaseStudy()" title="Proceed to Next Case Study">
                  <span>Next Case Study</span> <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <div class="scorecard-stats-grid">
              <div class="scorecard-kpi-card kpi-correct">
                <div class="kpi-num">${caseCorrectCount} / ${totalQs}</div>
                <div class="kpi-lbl">Correct Answers</div>
              </div>
              <div class="scorecard-kpi-card kpi-incorrect">
                <div class="kpi-num">${caseWrongCount} / ${totalQs}</div>
                <div class="kpi-lbl">Incorrect Answers</div>
              </div>
              <div class="scorecard-kpi-card kpi-skipped">
                <div class="kpi-num">${caseSkippedCount} / ${totalQs}</div>
                <div class="kpi-lbl">Unattempted</div>
              </div>
              <div class="scorecard-kpi-card kpi-total">
                <div class="kpi-num">${caseMarksObtained} / ${caseTotalMarks}</div>
                <div class="kpi-lbl">Marks (ICAI Scheme)</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3. QUESTION SECTION: 1-BY-1 MCQ BELOW THE CASE SCENARIO -->
        <div class="case-question-workspace" id="caseQuestionWorkspace">
          <!-- Question Header & Navigation Pills -->
          <div class="question-nav-header">
            <div class="q-progress-info">
              <span class="sub-q-number-pill">Question ${currentQIdx + 1} of ${totalQs}</span>
              ${isCaseCompleted ? `
                ${submission && submission.isCorrect
                  ? `<span class="badge badge-success" style="font-weight: 800;"><i class="fa-solid fa-circle-check"></i> +${currentQ.marks || 2} / ${currentQ.marks || 2} Marks Awarded</span>`
                  : `<span class="badge badge-danger" style="font-weight: 800;"><i class="fa-solid fa-circle-xmark"></i> 0 / ${currentQ.marks || 2} Marks</span>`
                }
              ` : `
                <span class="badge badge-marks">${currentQ.marks || 2} Marks</span>
              `}
              ${currentQ.source && currentQ.source !== 'BOOKLET' ? `
                <span class="badge badge-source" style="background-color: #8b5cf6; color: white;">
                  ${currentQ.source}
                </span>
              ` : ''}
              ${currentQ.examSession ? `
                <span class="badge badge-attempt" title="ICAI Exam Attempt / Edition">
                  <i class="fa-regular fa-calendar-check"></i> ${currentQ.examSession}
                </span>
              ` : ''}
              ${userNote ? '<span class="badge badge-success badge-note-indicator" title="Personal Note Attached"><i class="fa-solid fa-note-sticky"></i> Note Added</span>' : ''}
              ${isImp ? '<span class="badge badge-imp-indicator" style="background-color: #f59e0b; color: white;" title="Marked as Important"><i class="fa-solid fa-star"></i> IMP</span>' : ''}
              ${!isCaseCompleted && isReview ? '<span class="badge badge-warning" title="Flagged to Review Later"><i class="fa-solid fa-flag"></i> Marked for Review</span>' : ''}
            </div>

            <div class="question-pill-selector">
              <span class="q-selector-label">Questions:</span>
              <div class="q-pills-list">
                ${questions.map((q, idx) => {
                  const isCurrent = idx === currentQIdx;
                  let statusClass = "q-pill-unvisited";

                  if (isCaseCompleted) {
                    const qSub = this.state.repositoryState.submittedAnswers[q.id];
                    if (qSub && qSub.isCorrect) statusClass = "q-pill-correct";
                    else if (qSub && qSub.selected) statusClass = "q-pill-incorrect";
                    else statusClass = "q-pill-skipped";
                  } else {
                    const isSel = Boolean(this.state.repositoryState.selectedAnswers[q.id]);
                    const isRev = Boolean(this.state.repositoryState.reviewStatus[q.id]);
                    const isSkip = Boolean(this.state.repositoryState.skippedStatus[q.id]);
                    if (isRev) statusClass = "q-pill-review";
                    else if (isSel) statusClass = "q-pill-answered";
                    else if (isSkip) statusClass = "q-pill-skipped";
                  }

                  return `
                    <button 
                      type="button"
                      class="q-jump-pill ${statusClass} ${isCurrent ? 'active' : ''}" 
                      onclick="App.jumpToCaseQuestion(${idx})" 
                      title="Jump to Question ${idx + 1}">
                      ${idx + 1}
                    </button>
                  `;
                }).join("")}
              </div>
            </div>

            <div class="q-header-actions">
              <button 
                type="button" 
                class="imp-toggle-btn ${isImp ? 'imp-active' : ''}" 
                onclick="App.handleToggleImp('${currentQ.id}')" 
                title="${isImp ? 'Unmark IMP' : 'Mark as Important (IMP)'}">
                <i class="fa-${isImp ? 'solid' : 'regular'} fa-bookmark"></i>
                <span>${isImp ? '★ IMP' : 'Mark IMP'}</span>
              </button>
              <button 
                type="button" 
                class="icon-btn star-btn ${isStarred ? 'starred' : ''}" 
                onclick="App.handleToggleStar('${currentQ.id}')" 
                title="Star / Bookmark">
                <i class="fa-${isStarred ? 'solid' : 'regular'} fa-star"></i>
              </button>
            </div>
          </div>

          <!-- Question Stem -->
          <div class="case-active-q-stem">
            ${cleanStem}
          </div>

          <!-- Options List (Interactive during attempt, evaluated after whole case submit) -->
          <div class="case-options-container">
            ${(currentQ.options || []).map(opt => {
              const cleanOpt = this.escapeHTML(opt.text).replace(/`\s*(\d)/g, '₹$1').replace(/`/g, '₹');
              const isSelected = selectedAnswer === opt.id;
              let optClass = "";
              let optBadge = "";

              if (isCaseCompleted) {
                if (opt.id === currentQ.correctAnswer) {
                  optClass = "opt-correct";
                  optBadge = isSelected
                    ? '<span class="opt-verdict-badge verdict-student-right"><i class="fa-solid fa-circle-check"></i> Your Choice & Official Answer ✓</span>'
                    : '<span class="opt-verdict-badge verdict-official"><i class="fa-solid fa-circle-check"></i> ICAI Official Answer ✓</span>';
                } else if (isSelected) {
                  optClass = "opt-incorrect";
                  optBadge = '<span class="opt-verdict-badge verdict-student-wrong"><i class="fa-solid fa-circle-xmark"></i> Your Choice ✗</span>';
                }
              } else if (isSelected) {
                optClass = "opt-selected";
              }

              return `
                <div 
                  class="case-option-item ${optClass} ${isCaseCompleted ? 'opt-disabled' : ''}" 
                  onclick="${isCaseCompleted ? '' : `App.selectCaseOption('${currentQ.id}', '${opt.id}')`}">
                  <span class="option-letter">${opt.id}</span>
                  <span class="option-text">${cleanOpt}</span>
                  ${optBadge}
                </div>
              `;
            }).join("")}
          </div>

          <!-- ACTION BUTTONS: ATTENDEE MODE VS SUBMITTED REVIEW MODE -->
          <div class="case-q-action-bar">
            ${!isCaseCompleted ? `
              <div class="q-actions-left">
                <!-- OPTION 1: MARK FOR REVIEW -->
                <button 
                  type="button" 
                  class="btn btn-warning ${isReview ? 'active' : ''}" 
                  onclick="App.handleCaseMarkForReview('${currentQ.id}')" 
                  title="Flag this question for review">
                  <i class="fa-solid fa-flag"></i> 
                  <span>${isReview ? 'Marked for Review ✓' : 'Mark for Review'}</span>
                </button>

                <!-- OPTION 2: SKIP -->
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  onclick="App.handleCaseSkip('${currentQ.id}')" 
                  title="Skip this question and move to next">
                  <i class="fa-solid fa-forward"></i> 
                  <span>Skip</span>
                </button>
              </div>

              <div class="q-actions-right">
                ${currentQIdx < totalQs - 1 ? `
                  <button type="button" class="btn btn-outline" onclick="App.handleCaseNextQuestion()">
                    <span>Save & Next Question</span> <i class="fa-solid fa-arrow-right"></i>
                  </button>
                ` : ''}

                <!-- PROMINENT BUTTON: SUBMIT WHOLE CASE SCENARIO -->
                <button 
                  type="button" 
                  class="btn btn-success btn-submit-whole-case" 
                  onclick="App.submitWholeCaseScenario()" 
                  title="Submit all answers for this Case Scenario and evaluate marks according to ICAI scheme">
                  <i class="fa-solid fa-paper-plane"></i> Submit Whole Case Scenario
                </button>
              </div>
            ` : `
              <div class="q-actions-left">
                ${currentQIdx > 0 ? `
                  <button type="button" class="btn btn-outline" onclick="App.jumpToCaseQuestion(${currentQIdx - 1})">
                    <i class="fa-solid fa-chevron-left"></i> Previous Question
                  </button>
                ` : ''}
              </div>

              <div class="q-actions-right">
                ${currentQIdx < totalQs - 1 ? `
                  <button type="button" class="btn btn-primary" onclick="App.jumpToCaseQuestion(${currentQIdx + 1})">
                    <span>Next Question Solution</span> <i class="fa-solid fa-chevron-right"></i>
                  </button>
                ` : `
                  <button type="button" class="btn btn-success" onclick="App.nextCaseStudy()">
                    <span>Next Case Study</span> <i class="fa-solid fa-forward-step"></i>
                  </button>
                `}
              </div>
            `}
          </div>

          ${!isCaseCompleted ? `
            <div class="case-attempt-note">
              <i class="fa-solid fa-circle-info"></i> Answer questions in this case scenario, then click <strong>Submit Whole Case Scenario</strong> to evaluate your marks and reveal full official ICAI statutory explanations.
            </div>
          ` : ''}

          <!-- 4. FULL ICAI OFFICIAL LOGIC & STATUTORY EXPLANATION (SHOWN ONLY AFTER WHOLE CASE SUBMISSION) -->
          ${isCaseCompleted ? `
            <div class="case-full-icai-explanation-card">
              <div class="explanation-card-header">
                <div class="explanation-header-title">
                  <i class="fa-solid fa-scale-balanced text-primary"></i>
                  <h4>Full ICAI Official Logic & Statutory Rationale</h4>
                </div>
                <div class="explanation-verdict-chip">
                  ${submission && submission.isCorrect
                    ? `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> +${currentQ.marks || 2} Marks Awarded (Correct)</span>`
                    : `<span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> 0 / ${currentQ.marks || 2} Marks • Official: Option (${currentQ.correctAnswer})</span>`
                  }
                </div>
              </div>

              <div class="explanation-card-body">
                <div class="explanation-student-choice-banner">
                  <div class="choice-col">Your Selection: <strong>Option (${selectedAnswer || 'Not Answered'})</strong></div>
                  <div class="choice-col official-col">ICAI Official Answer: <strong>Option (${currentQ.correctAnswer})</strong></div>
                </div>

                <div class="explanation-statutory-text">
                  <div class="statutory-logic-title"><i class="fa-solid fa-landmark"></i> Official Statutory Logic & Working:</div>
                  ${this.formatExplanationText(currentQ.explanation)}
                </div>

                ${currentQ.reference ? `
                  <div class="statutory-reference-callout">
                    <i class="fa-solid fa-book-bookmark"></i>
                    <span><strong>Statutory Citation / Standard Reference:</strong> ${this.escapeHTML(currentQ.reference)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- COMPREHENSIVE CASE REVIEW (ALL QUESTIONS & ICAI EXPLANATIONS TOGETHER) -->
            <details class="full-case-summary-accordion">
              <summary><i class="fa-solid fa-list-check"></i> View Full Case Scenario Analysis & Logic (All ${totalQs} Questions Together)</summary>
              <div class="full-case-summary-content">
                ${questions.map((q, idx) => {
                  const qSub = this.state.repositoryState.submittedAnswers[q.id];
                  const isCorr = qSub && qSub.isCorrect;
                  return `
                    <div class="case-summary-q-row ${isCorr ? 'summary-corr' : 'summary-incorr'}">
                      <div class="summary-q-header">
                        <span class="badge ${isCorr ? 'badge-success' : 'badge-danger'}">Question ${idx + 1} • ${isCorr ? `+${q.marks || 2} Marks` : '0 Marks'}</span>
                        <span class="summary-q-stem">${this.escapeHTML(q.question).slice(0, 160)}...</span>
                      </div>
                      <div class="summary-q-ans">
                        <span>Your Choice: <strong>(${qSub?.selected || 'Not Attempted'})</strong></span> | 
                        <span>ICAI Official Answer: <strong>Option (${q.correctAnswer})</strong></span>
                      </div>
                      <div class="summary-q-expl">
                        <div class="summary-expl-label"><i class="fa-solid fa-scale-balanced"></i> Statutory Reasoning:</div>
                        ${this.formatExplanationText(q.explanation)}
                      </div>
                      ${q.reference ? `<div class="summary-q-ref"><i class="fa-solid fa-book-bookmark"></i> Reference: ${this.escapeHTML(q.reference)}</div>` : ''}
                    </div>
                  `;
                }).join("")}
              </div>
            </details>
          ` : ''}

          <!-- STUDENT PERSONAL NOTE DRAWER -->
          <div class="mcq-student-note-card ${userNote ? 'has-note' : ''}" id="note-card-${currentQ.id}">
            <div class="mcq-note-header" onclick="App.toggleNoteAccordion('${currentQ.id}')">
              <div class="note-title-left">
                <i class="fa-solid fa-pen-to-square"></i>
                <strong>Student Personal Note / Memory Key</strong>
                ${userNote ? '<span class="note-badge-pill">Saved</span>' : ''}
              </div>
              <div class="note-expand-indicator">
                <small class="text-muted">${userNote ? 'View / Edit Note' : 'Add Note'}</small>
                <i class="fa-solid fa-chevron-down ${userNote ? 'rotated' : ''}" id="note-chevron-${currentQ.id}"></i>
              </div>
            </div>
            <div class="mcq-note-drawer" id="note-drawer-${currentQ.id}" style="${userNote ? 'display: block;' : 'display: none;'}">
              <textarea 
                class="student-note-textarea" 
                id="student-note-${currentQ.id}" 
                placeholder="Write your personal tips, memory keys, tricky points, or statutory notes to remember for this question..."
                oninput="App.handleStudentNoteInput('${currentQ.id}', this.value)"
              >${this.escapeHTML(userNote || '')}</textarea>
              <div class="note-drawer-actions">
                <small class="text-muted note-status-msg" id="note-status-${currentQ.id}">
                  ${userNote ? 'Note saved in your account ✓' : 'Notes auto-save as you type'}
                </small>
                <div style="display: flex; gap: 6px;">
                  ${userNote ? `
                    <button type="button" class="btn btn-sm btn-outline text-danger" onclick="App.handleClearStudentNote('${currentQ.id}')" title="Delete Note">
                      <i class="fa-regular fa-trash-can"></i> Clear
                    </button>
                  ` : ''}
                  <button type="button" class="btn btn-sm btn-primary" onclick="App.handleSaveStudentNote('${currentQ.id}')">
                    <i class="fa-solid fa-floppy-disk"></i> Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectCaseOption(qId, optId) {
    const caseData = this.getActiveCaseData();
    if (this.isCaseCompleted(caseData)) return; // Locked once case is submitted
    this.state.repositoryState.selectedAnswers[qId] = optId;
    delete this.state.repositoryState.skippedStatus[qId];
    this.saveCaseAttempts();
    this.renderActiveCaseStudy(caseData);
  },

  handleCaseMarkForReview(qId) {
    const isRev = !this.state.repositoryState.reviewStatus[qId];
    this.state.repositoryState.reviewStatus[qId] = isRev;
    this.saveCaseAttempts();

    const caseData = this.getActiveCaseData();
    if (caseData && this.state.repositoryState.currentQuestionIndex < caseData.questions.length - 1) {
      this.state.repositoryState.currentQuestionIndex++;
    }
    this.renderActiveCaseStudy(caseData);
  },

  handleCaseSkip(qId) {
    this.state.repositoryState.skippedStatus[qId] = true;
    this.saveCaseAttempts();

    const caseData = this.getActiveCaseData();
    if (caseData && this.state.repositoryState.currentQuestionIndex < caseData.questions.length - 1) {
      this.state.repositoryState.currentQuestionIndex++;
    }
    this.renderActiveCaseStudy(caseData);
  },

  handleCaseNextQuestion() {
    const caseData = this.getActiveCaseData();
    if (!caseData) return;
    if (this.state.repositoryState.currentQuestionIndex < caseData.questions.length - 1) {
      this.state.repositoryState.currentQuestionIndex++;
      this.renderActiveCaseStudy(caseData);
      const qWorkspace = document.getElementById("caseQuestionWorkspace");
      if (qWorkspace) qWorkspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },

  handleCaseSubmitAnswer(qId) {
    const selected = this.state.repositoryState.selectedAnswers[qId];
    if (!selected) {
      alert("Please select an option (A, B, C, or D) before proceeding.");
      return;
    }
    const caseData = this.getActiveCaseData();
    if (!caseData) return;
    if (this.state.repositoryState.currentQuestionIndex < caseData.questions.length - 1) {
      this.handleCaseNextQuestion();
    } else {
      this.submitWholeCaseScenario();
    }
  },

  submitWholeCaseScenario() {
    const caseData = this.getActiveCaseData();
    if (!caseData || !caseData.questions || caseData.questions.length === 0) return;

    const questions = caseData.questions;
    const answeredCount = questions.filter(q => Boolean(this.state.repositoryState.selectedAnswers[q.id])).length;
    const unattemptedCount = questions.length - answeredCount;

    if (unattemptedCount > 0) {
      const confirmSubmit = confirm(`You have answered ${answeredCount} of ${questions.length} questions (${unattemptedCount} unattempted).\n\nDo you want to submit the whole Case Scenario now and evaluate your marks with full official ICAI solutions?`);
      if (!confirmSubmit) return;
    }

    let totalMarks = 0;
    let marksObtained = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    questions.forEach(q => {
      const qMarks = q.marks || 2;
      totalMarks += qMarks;
      const selected = this.state.repositoryState.selectedAnswers[q.id];

      if (selected) {
        const isCorrect = (selected === q.correctAnswer);
        if (isCorrect) {
          marksObtained += qMarks;
          correctCount++;
        } else {
          wrongCount++;
        }
        this.state.repositoryState.submittedAnswers[q.id] = {
          selected,
          isCorrect,
          marks: isCorrect ? qMarks : 0,
          submitted: true,
          submittedAt: Date.now()
        };
      } else {
        skippedCount++;
        this.state.repositoryState.submittedAnswers[q.id] = {
          selected: null,
          isCorrect: false,
          marks: 0,
          submitted: true,
          submittedAt: Date.now()
        };
      }
      delete this.state.repositoryState.reviewStatus[q.id];
      delete this.state.repositoryState.skippedStatus[q.id];

      if (typeof MCQStats !== 'undefined' && typeof MCQStats.recordAttempt === 'function') {
        MCQStats.recordAttempt(q.id, selected || "SKIPPED", selected === q.correctAnswer);
      }
    });

    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
    const caseKey = this.getCaseKey(caseData);

    if (!this.state.repositoryState.submittedCases) {
      this.state.repositoryState.submittedCases = {};
    }
    this.state.repositoryState.submittedCases[caseKey] = {
      submitted: true,
      submittedAt: Date.now(),
      totalMarks,
      marksObtained,
      percentage,
      correctCount,
      wrongCount,
      skippedCount,
      totalQuestions: questions.length
    };

    this.saveCaseAttempts();
    this.renderRepository();

    const scorecardEl = document.getElementById("caseScenarioScorecard") || document.getElementById("caseQuestionWorkspace");
    if (scorecardEl) {
      scorecardEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  reattemptCaseScenario(caseKey) {
    if (!confirm("Are you sure you want to re-attempt this Case Scenario? Your previous selections for this case will be reset.")) return;
    const caseData = this.getActiveCaseData();
    if (!caseData) return;

    if (this.state.repositoryState.submittedCases) {
      delete this.state.repositoryState.submittedCases[caseKey];
    }
    (caseData.questions || []).forEach(q => {
      delete this.state.repositoryState.submittedAnswers[q.id];
      delete this.state.repositoryState.selectedAnswers[q.id];
      delete this.state.repositoryState.reviewStatus[q.id];
      delete this.state.repositoryState.skippedStatus[q.id];
    });

    this.state.repositoryState.currentQuestionIndex = 0;
    this.saveCaseAttempts();
    this.renderRepository();
  },

  nextCaseStudy() {
    const cases = this.getFilteredCaseStudies();
    if (this.state.repositoryState.currentCaseIndex < cases.length - 1) {
      this.state.repositoryState.currentCaseIndex++;
      this.state.repositoryState.currentQuestionIndex = 0;
      this.renderRepository();
      const hero = document.getElementById("caseScenarioHero");
      if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  prevCaseStudy() {
    if (this.state.repositoryState.currentCaseIndex > 0) {
      this.state.repositoryState.currentCaseIndex--;
      this.state.repositoryState.currentQuestionIndex = 0;
      this.renderRepository();
      const hero = document.getElementById("caseScenarioHero");
      if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  jumpToCaseQuestion(idx) {
    const caseData = this.getActiveCaseData();
    if (!caseData) return;
    if (idx >= 0 && idx < caseData.questions.length) {
      this.state.repositoryState.currentQuestionIndex = idx;
      this.renderActiveCaseStudy(caseData);
      const qWorkspace = document.getElementById("caseQuestionWorkspace");
      if (qWorkspace) qWorkspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },

  handleCaseSelectChange(idx) {
    const parsed = parseInt(idx, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      this.state.repositoryState.currentCaseIndex = parsed;
      this.state.repositoryState.currentQuestionIndex = 0;
      this.renderRepository();
      const hero = document.getElementById("caseScenarioHero");
      if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  handleRepoChapterFilterChange(val) {
    this.state.repositoryState.chapterFilter = val;
    this.state.repositoryState.currentCaseIndex = 0;
    this.state.repositoryState.currentQuestionIndex = 0;
    this.renderRepository();
  },

  handleRepoSourceFilterChange(val) {
    this.state.repositoryState.sourceFilter = val;
    this.state.repositoryState.currentCaseIndex = 0;
    this.state.repositoryState.currentQuestionIndex = 0;
    this.renderRepository();
  },

  handleRepoStatusFilterChange(val) {
    this.state.repositoryState.statusFilter = val;
    this.state.repositoryState.impFilter = val;
    this.state.repositoryState.currentCaseIndex = 0;
    this.state.repositoryState.currentQuestionIndex = 0;
    this.renderRepository();
  },

  handleRepoImpFilterChange(val) {
    this.handleRepoStatusFilterChange(val);
  },

  handleRepoSearch(keyword) {
    this.state.repositoryState.searchTerm = keyword;
    this.state.repositoryState.currentCaseIndex = 0;
    this.state.repositoryState.currentQuestionIndex = 0;
    this.renderRepository();
  },

  toggleCaseScenarioHeight() {
    this.state.repositoryState.isCaseExpanded = !this.state.repositoryState.isCaseExpanded;
    const body = document.getElementById("caseNarrativeBody");
    const btn = document.getElementById("caseResizeBtn");
    if (body) {
      body.classList.toggle("expanded", this.state.repositoryState.isCaseExpanded);
    }
    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid ${this.state.repositoryState.isCaseExpanded ? 'fa-compress' : 'fa-expand'}"></i>
        <span>${this.state.repositoryState.isCaseExpanded ? 'Scroll View' : 'Full Expand'}</span>
      `;
    }
  },

  setRepositorySubject(subjectId) {
    this.state.repositoryState.activeSubject = subjectId;
    this.state.repositoryState.currentCaseIndex = 0;
    this.state.repositoryState.currentQuestionIndex = 0;
    this.state.repositoryState.chapterFilter = "ALL";
    this.state.repositoryState.sourceFilter = "ALL";
    this.state.repositoryState.searchTerm = "";

    // Sync global filter
    const globalSel = document.getElementById("globalSubjectFilter");
    if (globalSel) globalSel.value = subjectId;

    this.renderRepository();
  },

  resetRepoFilters() {
    this.state.repositoryState.chapterFilter = "ALL";
    this.state.repositoryState.sourceFilter = "ALL";
    this.state.repositoryState.statusFilter = "ALL";
    this.state.repositoryState.impFilter = "ALL";
    this.state.repositoryState.searchTerm = "";
    this.state.repositoryState.currentCaseIndex = 0;
    this.state.repositoryState.currentQuestionIndex = 0;
    const chSelect = document.getElementById("repoChapterFilter");
    if (chSelect) chSelect.value = "ALL";
    const srcSelect = document.getElementById("repoSourceFilter");
    if (srcSelect) srcSelect.value = "ALL";
    const statusSelect = document.getElementById("repoStatusFilter") || document.getElementById("repoImpFilter");
    if (statusSelect) statusSelect.value = "ALL";
    const sInput = document.getElementById("repoSearchInput");
    if (sInput) sInput.value = "";
    this.renderRepository();
  },

  syncGlobalSubjectHeaderForRepository(isRepo) {
    const globalSelect = document.getElementById("globalSubjectFilter");
    if (!globalSelect || typeof ICAI_METADATA === "undefined") return;

    if (isRepo) {
      // Remove "ALL" option in repository mode
      globalSelect.innerHTML = ICAI_METADATA.subjects.map(s => 
        `<option value="${s.id}">${s.paper}: ${s.name}</option>`
      ).join("");
      globalSelect.value = this.state.repositoryState.activeSubject || "FR";
    } else {
      // Restore "ALL" option in other modes
      globalSelect.innerHTML = '<option value="ALL">All CA Final Subjects</option>' + 
        ICAI_METADATA.subjects.map(s => `<option value="${s.id}">${s.paper}: ${s.name}</option>`).join("");
    }
  },

  handleToggleStar(qId) {
    const isStarred = MCQStats.toggleStar(qId);
    const starBtn = document.querySelector(".star-btn");
    if (starBtn) {
      starBtn.classList.toggle("starred", isStarred);
      starBtn.innerHTML = `<i class="fa-${isStarred ? 'solid' : 'regular'} fa-star"></i>`;
    }
  },

  handleToggleImp(qId) {
    const isImp = MCQStats.toggleImp(qId);
    const impBtn = document.querySelector(".imp-toggle-btn");
    if (impBtn) {
      impBtn.classList.toggle("imp-active", isImp);
      impBtn.title = isImp ? "Marked as Important (Click to unmark)" : "Mark as Important (IMP)";
      impBtn.innerHTML = `
        <i class="fa-${isImp ? 'solid' : 'regular'} fa-bookmark"></i>
        <span>${isImp ? '★ IMP' : 'Mark IMP'}</span>
      `;
    }

    const progressInfo = document.querySelector(".q-progress-info");
    if (progressInfo) {
      let impBadge = progressInfo.querySelector(".badge-imp-indicator");
      if (isImp) {
        if (!impBadge) {
          impBadge = document.createElement("span");
          impBadge.className = "badge badge-imp-indicator";
          impBadge.style.cssText = "background-color: #f59e0b; color: white;";
          impBadge.title = "Marked as Important";
          impBadge.innerHTML = '<i class="fa-solid fa-star"></i> IMP';
          progressInfo.appendChild(impBadge);
        }
      } else if (impBadge) {
        impBadge.remove();
      }
    }
  },

  toggleNoteAccordion(qId) {
    const drawer = document.getElementById(`note-drawer-${qId}`);
    const chevron = document.getElementById(`note-chevron-${qId}`);
    if (!drawer) return;
    const isHidden = drawer.style.display === "none";
    drawer.style.display = isHidden ? "block" : "none";
    if (chevron) chevron.classList.toggle("rotated", isHidden);
    if (isHidden) {
      const textarea = document.getElementById(`student-note-${qId}`);
      if (textarea) textarea.focus();
    }
  },

  handleStudentNoteInput(qId, val) {
    MCQStats.saveNote(qId, val);
    const statusEl = document.getElementById(`note-status-${qId}`);
    if (statusEl) statusEl.textContent = val.trim() ? "Saving note..." : "Note cleared";
    if (this._noteTimer) clearTimeout(this._noteTimer);
    this._noteTimer = setTimeout(() => {
      if (statusEl) statusEl.textContent = val.trim() ? "Note saved in your account ✓" : "Notes auto-save as you type";
      const card = document.getElementById(`note-card-${qId}`);
      if (card) card.classList.toggle("has-note", Boolean(val.trim()));
    }, 400);
  },

  handleSaveStudentNote(qId) {
    const textarea = document.getElementById(`student-note-${qId}`);
    const val = textarea ? textarea.value : "";
    MCQStats.saveNote(qId, val);
    const statusEl = document.getElementById(`note-status-${qId}`);
    if (statusEl) statusEl.textContent = "Saved successfully! ✓";

    const noteCard = document.getElementById(`note-card-${qId}`);
    if (noteCard) {
      noteCard.classList.toggle("has-note", Boolean(val.trim()));
      const titleLeft = noteCard.querySelector(".note-title-left");
      if (titleLeft) {
        let pill = titleLeft.querySelector(".note-badge-pill");
        if (val.trim()) {
          if (!pill) {
            pill = document.createElement("span");
            pill.className = "note-badge-pill";
            pill.textContent = "Saved";
            titleLeft.appendChild(pill);
          }
        } else if (pill) {
          pill.remove();
        }
      }
    }

    const progressInfo = document.querySelector(".q-progress-info");
    if (progressInfo) {
      let noteBadge = progressInfo.querySelector(".badge-note-indicator");
      if (val.trim()) {
        if (!noteBadge) {
          noteBadge = document.createElement("span");
          noteBadge.className = "badge badge-success badge-note-indicator";
          noteBadge.title = "Personal Note Attached";
          noteBadge.innerHTML = '<i class="fa-solid fa-note-sticky"></i> Note Added';
          progressInfo.appendChild(noteBadge);
        }
      } else if (noteBadge) {
        noteBadge.remove();
      }
    }
  },

  handleClearStudentNote(qId) {
    if (confirm("Are you sure you want to clear your personal note for this question?")) {
      MCQStats.saveNote(qId, "");
      this.handleSaveStudentNote(qId);
    }
  },

  // ---------------- PRACTICE MODE ----------------
  renderPractice() {
    const practiceView = document.getElementById("practiceContainer");
    if (!practiceView) return;

    if (!QuizEngine.practiceState.questions || QuizEngine.practiceState.questions.length === 0) {
      QuizEngine.initPractice(this.state.allMCQs, this.state.practiceFilter);
    }

    const currentQ = QuizEngine.getCurrentPracticeQuestion();
    const totalQ = QuizEngine.practiceState.questions.length;
    const currentIdx = QuizEngine.practiceState.activeQuestionIndex;

    if (!currentQ || totalQ === 0) {
      practiceView.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-chalkboard-user fa-3x"></i>
          <h3>No Questions Found for this Filter</h3>
          <p>Please change the practice filter settings or reset filters.</p>
          <button class="btn btn-primary" onclick="App.resetPracticeFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    const selectedOption = QuizEngine.practiceState.selectedAnswers[currentIdx];
    const isRevealed = Boolean(QuizEngine.practiceState.revealed[currentIdx]);
    const isStarred = MCQStats.isStarred(currentQ.id);
    const isImp = MCQStats.isImp(currentQ.id);
    const userNote = MCQStats.getNote(currentQ.id);

    practiceView.innerHTML = `
      <div class="practice-card ${isImp ? 'is-imp-mcq' : ''}">
        <div class="practice-top-bar">
          <div class="practice-progress-info">
            <span class="badge badge-primary">Question ${currentIdx + 1} of ${totalQ}</span>
            <span class="badge badge-source">${currentQ.source} • ${currentQ.examSession || ''}</span>
            <span class="badge badge-marks">${currentQ.marks || 2} Marks</span>
            <span class="badge badge-chapter"><i class="fa-regular fa-bookmark"></i> ${currentQ.chapter}</span>
            ${isImp ? `<span class="badge" style="background-color: #f59e0b; color: white;"><i class="fa-solid fa-star"></i> IMP</span>` : ''}
          </div>
          <div class="practice-actions" style="display: flex; gap: 8px; align-items: center;">
            <button class="imp-toggle-btn ${isImp ? 'imp-active' : ''}" onclick="App.handleToggleImp('${currentQ.id}')" title="Mark as Important (IMP)">
              <i class="fa-${isImp ? 'solid' : 'regular'} fa-bookmark"></i>
              <span>${isImp ? '★ IMP' : 'Mark IMP'}</span>
            </button>
            <button class="icon-btn star-btn ${isStarred ? 'starred' : ''}" onclick="App.togglePracticeStar('${currentQ.id}')" title="Star / Bookmark">
              <i class="fa-${isStarred ? 'solid' : 'regular'} fa-star"></i>
            </button>
          </div>
        </div>

        ${currentQ.caseScenario ? `
          <div class="practice-case-banner">
            <div class="case-banner-header">
              <i class="fa-solid fa-layer-group"></i>
              <strong>${currentQ.caseTitle || 'Linked Case Scenario'} (Sub-Question ${currentQ.caseSubIndex} of ${currentQ.totalSubCount})</strong>
            </div>
            <div class="case-banner-body">${currentQ.caseScenario}</div>
          </div>
        ` : ''}

        <div class="practice-stem">${currentQ.question}</div>

        <div class="practice-options">
          ${(currentQ.options || []).map(opt => {
            let stateClass = "";
            if (isRevealed) {
              if (opt.id === currentQ.correctAnswer) stateClass = "correct-choice";
              else if (opt.id === selectedOption) stateClass = "wrong-choice";
            } else if (opt.id === selectedOption) {
              stateClass = "selected-choice";
            }
            return `
              <button class="practice-option-btn ${stateClass}" onclick="App.handlePracticeSelect('${opt.id}')" ${isRevealed ? 'disabled' : ''}>
                <span class="opt-letter">${opt.id}</span>
                <span class="opt-text">${opt.text}</span>
                ${isRevealed && opt.id === currentQ.correctAnswer ? '<i class="fa-solid fa-check opt-status-icon"></i>' : ''}
                ${isRevealed && opt.id === selectedOption && opt.id !== currentQ.correctAnswer ? '<i class="fa-solid fa-xmark opt-status-icon"></i>' : ''}
              </button>
            `;
          }).join("")}
        </div>

        ${!isRevealed ? `
          <div class="practice-submit-action" style="margin: 18px 0; text-align: center;">
            <button class="btn btn-primary btn-lg" onclick="App.submitPracticeChoice()" ${!selectedOption ? 'disabled' : ''} style="min-width: 260px;">
              <i class="fa-solid fa-paper-plane"></i> Submit Answer to Reveal Solution
            </button>
            ${!selectedOption ? '<p class="text-muted" style="font-size: 0.8rem; margin-top: 6px;">Select an option above, then click Submit to verify and view statutory rationale.</p>' : '<p class="text-muted" style="font-size: 0.8rem; margin-top: 6px;">Option (' + selectedOption + ') selected. Click Submit to verify and reveal ICAI reasoning.</p>'}
          </div>
        ` : ''}

        ${isRevealed ? `
          <div class="practice-feedback-box ${selectedOption === currentQ.correctAnswer ? 'feedback-correct' : 'feedback-wrong'}">
            <div class="feedback-header">
              <i class="fa-solid ${selectedOption === currentQ.correctAnswer ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
              <h4>${selectedOption === currentQ.correctAnswer ? 'Correct! Outstanding conceptual grasp.' : 'Incorrect! Review the ICAI rationale below.'}</h4>
            </div>
            <div class="feedback-body">
              <p><strong>Correct Answer: Option (${currentQ.correctAnswer})</strong></p>
              <p>${currentQ.explanation || 'Refer to ICAI official material.'}</p>
              ${currentQ.reference ? `<p class="reference-tag"><i class="fa-solid fa-book-bookmark"></i> Reference: ${currentQ.reference}</p>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Personal Notes Section -->
        <div class="practice-notes-section">
          <details ${userNote ? 'open' : ''}>
            <summary><i class="fa-regular fa-note-sticky"></i> Your Personal Revision Notes & Mnemonics</summary>
            <div class="notes-input-box">
              <textarea id="practiceNoteInput" placeholder="Add your private notes, tricky mnemonics, or section tricks for this MCQ...">${userNote}</textarea>
              <button class="btn btn-sm btn-secondary" onclick="App.savePracticeNote('${currentQ.id}')">Save Notes</button>
            </div>
          </details>
        </div>

        <!-- Navigation Buttons -->
        <div class="practice-nav-controls">
          <button class="btn btn-outline" onclick="App.prevPracticeQuestion()" ${currentIdx === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-left"></i> Previous
          </button>
          <div class="keyboard-hints">
            <small class="text-muted"><kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> to pick | <kbd>Enter</kbd> to Submit | <kbd>→</kbd> Next</small>
          </div>
          <button class="btn btn-primary" onclick="App.nextPracticeQuestion()" ${currentIdx >= totalQ - 1 ? 'disabled' : ''}>
            Next <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  },

  handlePracticeSelect(optionId) {
    const currentIdx = QuizEngine.practiceState.activeQuestionIndex;
    QuizEngine.selectPracticeAnswer(currentIdx, optionId);
    this.renderPractice();
  },

  submitPracticeChoice() {
    const currentIdx = QuizEngine.practiceState.activeQuestionIndex;
    QuizEngine.submitPracticeAnswer(currentIdx);
    this.renderPractice();
  },

  nextPracticeQuestion() {
    if (QuizEngine.practiceState.activeQuestionIndex < QuizEngine.practiceState.questions.length - 1) {
      QuizEngine.practiceState.activeQuestionIndex++;
      this.renderPractice();
    }
  },

  prevPracticeQuestion() {
    if (QuizEngine.practiceState.activeQuestionIndex > 0) {
      QuizEngine.practiceState.activeQuestionIndex--;
      this.renderPractice();
    }
  },

  togglePracticeStar(qId) {
    MCQStats.toggleStar(qId);
    this.renderPractice();
  },

  savePracticeNote(qId) {
    const input = document.getElementById("practiceNoteInput");
    if (input) {
      MCQStats.saveNote(qId, input.value);
      alert("Note saved successfully!");
    }
  },

  resetPracticeFilters() {
    this.state.practiceFilter = { subject: "ALL", source: "ALL", starredOnly: false, incorrectOnly: false };
    QuizEngine.initPractice(this.state.allMCQs, this.state.practiceFilter);
    this.renderPractice();
  },

  // ---------------- EXAM SIMULATOR ----------------
  renderExamView() {
    const examContainer = document.getElementById("examContainer");
    if (!examContainer) return;

    if (!QuizEngine.examState.isActive && !QuizEngine.examState.result) {
      // Show Exam Setup screen
      examContainer.innerHTML = `
        <div class="exam-setup-card">
          <div class="setup-icon"><i class="fa-solid fa-stopwatch-20 fa-3x"></i></div>
          <h2>ICAI 30-Mark MCQ Exam Simulator</h2>
          <p class="setup-subtitle">Simulate real ICAI exam conditions with timed countdown, question palette, and instant diagnostic report.</p>

          <div class="exam-setup-form">
            <div class="form-group">
              <label for="examSubjectSelect">Target Subject</label>
              <select id="examSubjectSelect" class="form-control">
                <option value="ALL">All CA Final Papers (Grand Mock)</option>
                ${(typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.subjects : []).map(s => `
                  <option value="${s.id}">${s.paper}: ${s.name}</option>
                `).join("")}
              </select>
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label for="examQuestionCount">Number of Questions</label>
                <select id="examQuestionCount" class="form-control">
                  <option value="15" selected>15 Questions (30 Marks - Standard ICAI)</option>
                  <option value="10">10 Questions (20 Marks)</option>
                  <option value="5">5 Questions (Quick Test)</option>
                </select>
              </div>

              <div class="form-group col">
                <label for="examDuration">Exam Duration</label>
                <select id="examDuration" class="form-control">
                  <option value="45" selected>45 Minutes (ICAI standard)</option>
                  <option value="30">30 Minutes (Speed run)</option>
                  <option value="15">15 Minutes (Rapid fire)</option>
                </select>
              </div>
            </div>

            <div class="exam-rules-box">
              <h4><i class="fa-solid fa-circle-info"></i> Instructions</h4>
              <ul>
                <li>Total Marks: 2 Marks per question (No negative marking as per standard ICAI guidelines).</li>
                <li>Timer counts down continuously; test auto-submits when time expires.</li>
                <li>Use the Question Palette to jump between questions or mark for review.</li>
              </ul>
            </div>

            <button class="btn btn-primary btn-block btn-lg" onclick="App.startSimulatedExam()">
              <i class="fa-solid fa-play"></i> Start Timed Exam Now
            </button>
          </div>
        </div>
      `;
      return;
    }

    if (QuizEngine.examState.isActive) {
      this.renderActiveExam(examContainer);
      return;
    }

    if (QuizEngine.examState.result) {
      this.renderExamScorecard(examContainer, QuizEngine.examState.result);
      return;
    }
  },

  startSimulatedExam() {
    const subSel = document.getElementById("examSubjectSelect");
    const countSel = document.getElementById("examQuestionCount");
    const durSel = document.getElementById("examDuration");

    const subjectId = subSel ? subSel.value : "ALL";
    const questionCount = countSel ? parseInt(countSel.value) : 15;
    const durationMinutes = durSel ? parseInt(durSel.value) : 45;

    QuizEngine.startExam(this.state.allMCQs, { subjectId, questionCount, durationMinutes });

    // Start timer interval
    if (QuizEngine.examState.timerInterval) clearInterval(QuizEngine.examState.timerInterval);
    QuizEngine.examState.timerInterval = setInterval(() => {
      QuizEngine.examState.remainingSeconds--;
      App.updateExamTimerDisplay();
      if (QuizEngine.examState.remainingSeconds <= 0) {
        clearInterval(QuizEngine.examState.timerInterval);
        alert("Time is up! Submitting exam now...");
        App.submitExamNow();
      }
    }, 1000);

    this.renderCurrentView();
  },

  updateExamTimerDisplay() {
    const timerEl = document.getElementById("examTimerClock");
    if (!timerEl) return;
    const rem = Math.max(0, QuizEngine.examState.remainingSeconds);
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (rem < 300) {
      timerEl.classList.add("timer-urgent");
    }
  },

  renderActiveExam(container) {
    const state = QuizEngine.examState;
    const currentQ = state.questions[state.currentIndex];
    const currentAns = state.answers[currentQ.id];
    const qStatus = state.status[currentQ.id];

    container.innerHTML = `
      <div class="exam-live-wrapper">
        <div class="exam-live-main">
          <!-- Exam Header -->
          <div class="exam-top-bar">
            <div>
              <h3>ICAI CA Final Simulation Test</h3>
              <small class="text-muted">Question ${state.currentIndex + 1} of ${state.questions.length} • Marks: ${currentQ.marks || 2}</small>
            </div>
            <div class="exam-timer-box">
              <i class="fa-regular fa-clock"></i>
              <span id="examTimerClock" class="timer-digits">--:--</span>
            </div>
          </div>

          <!-- Question Content -->
          <div class="exam-question-body">
            ${currentQ.caseScenario ? `
              <div class="practice-case-banner">
                <div class="case-banner-header">
                  <i class="fa-solid fa-layer-group"></i>
                  <strong>${currentQ.caseTitle || 'Integrated Case Study'}</strong>
                </div>
                <div class="case-banner-body">${currentQ.caseScenario}</div>
              </div>
            ` : ''}

            <div class="exam-question-stem">${currentQ.question}</div>

            <div class="exam-options-list">
              ${(currentQ.options || []).map(opt => `
                <label class="exam-option-item ${currentAns === opt.id ? 'selected' : ''}">
                  <input type="radio" name="examOpt" value="${opt.id}" ${currentAns === opt.id ? 'checked' : ''} onchange="App.handleExamSelect('${currentQ.id}', '${opt.id}')">
                  <span class="exam-opt-letter">${opt.id}</span>
                  <span class="exam-opt-text">${opt.text}</span>
                </label>
              `).join("")}
            </div>
          </div>

          <!-- Exam Action Buttons -->
          <div class="exam-action-bar">
            <div class="left-actions">
              <button class="btn btn-outline" onclick="App.toggleExamMarkForReview('${currentQ.id}')">
                <i class="fa-solid fa-flag"></i> ${qStatus && qStatus.includes('marked') ? 'Unmark Review' : 'Mark for Review'}
              </button>
              <button class="btn btn-outline" onclick="App.clearExamChoice('${currentQ.id}')">
                <i class="fa-solid fa-eraser"></i> Clear Choice
              </button>
            </div>
            <div class="right-actions">
              <button class="btn btn-secondary" onclick="App.prevExamQuestion()" ${state.currentIndex === 0 ? 'disabled' : ''}>
                <i class="fa-solid fa-arrow-left"></i> Prev
              </button>
              ${state.currentIndex < state.questions.length - 1 ? `
                <button class="btn btn-primary" onclick="App.nextExamQuestion()">
                  Next <i class="fa-solid fa-arrow-right"></i>
                </button>
              ` : `
                <button class="btn btn-success" onclick="App.confirmExamSubmit()">
                  <i class="fa-solid fa-check-double"></i> Submit Exam
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- Question Palette Sidebar -->
        <div class="exam-palette-sidebar">
          <h4>Question Palette</h4>
          <div class="palette-legend">
            <span><span class="legend-dot status-answered"></span> Answered</span>
            <span><span class="legend-dot status-not-answered"></span> Unanswered</span>
            <span><span class="legend-dot status-marked"></span> Marked</span>
            <span><span class="legend-dot status-not-visited"></span> Not Visited</span>
          </div>

          <div class="palette-grid">
            ${state.questions.map((q, idx) => {
              const st = state.status[q.id] || 'not_visited';
              const isCurrent = idx === state.currentIndex;
              return `
                <button class="palette-btn ${st} ${isCurrent ? 'current-active' : ''}" onclick="App.jumpToExamQuestion(${idx})">
                  ${idx + 1}
                </button>
              `;
            }).join("")}
          </div>

          <div class="exam-submit-box">
            <button class="btn btn-danger btn-block" onclick="App.confirmExamSubmit()">
              <i class="fa-solid fa-paper-plane"></i> Final Submit
            </button>
          </div>
        </div>
      </div>
    `;

    this.updateExamTimerDisplay();
  },

  handleExamSelect(qId, optId) {
    QuizEngine.selectExamAnswer(qId, optId);
    this.renderActiveExam(document.getElementById("examContainer"));
  },

  toggleExamMarkForReview(qId) {
    QuizEngine.toggleMarkForReview(qId);
    this.renderActiveExam(document.getElementById("examContainer"));
  },

  clearExamChoice(qId) {
    QuizEngine.clearExamAnswer(qId);
    this.renderActiveExam(document.getElementById("examContainer"));
  },

  jumpToExamQuestion(idx) {
    QuizEngine.examState.currentIndex = idx;
    const q = QuizEngine.examState.questions[idx];
    if (QuizEngine.examState.status[q.id] === 'not_visited') {
      QuizEngine.examState.status[q.id] = 'not_answered';
    }
    this.renderActiveExam(document.getElementById("examContainer"));
  },

  nextExamQuestion() {
    if (QuizEngine.examState.currentIndex < QuizEngine.examState.questions.length - 1) {
      this.jumpToExamQuestion(QuizEngine.examState.currentIndex + 1);
    }
  },

  prevExamQuestion() {
    if (QuizEngine.examState.currentIndex > 0) {
      this.jumpToExamQuestion(QuizEngine.examState.currentIndex - 1);
    }
  },

  confirmExamSubmit() {
    const answeredCount = Object.keys(QuizEngine.examState.answers).length;
    const totalCount = QuizEngine.examState.questions.length;
    const msg = `You have answered ${answeredCount} of ${totalCount} questions.\n\nAre you sure you want to finish and submit the test?`;
    if (confirm(msg)) {
      this.submitExamNow();
    }
  },

  submitExamNow() {
    QuizEngine.submitExam();
    this.renderCurrentView();
  },

  renderExamScorecard(container, result) {
    container.innerHTML = `
      <div class="exam-scorecard-wrapper">
        <div class="scorecard-hero">
          <div class="scorecard-badge">
            <i class="fa-solid ${result.percentage >= 60 ? 'fa-award' : 'fa-chart-pie'} fa-3x"></i>
            <h2>${result.marksObtained} / ${result.totalMarks}</h2>
            <p>Score: ${result.percentage}%</p>
          </div>
          <div class="scorecard-stats-grid">
            <div class="card-item stat-correct">
              <span class="val">${result.correctCount}</span>
              <span class="lbl">Correct</span>
            </div>
            <div class="card-item stat-wrong">
              <span class="val">${result.incorrectCount}</span>
              <span class="lbl">Incorrect</span>
            </div>
            <div class="card-item stat-unattempted">
              <span class="val">${result.unattemptedCount}</span>
              <span class="lbl">Unattempted</span>
            </div>
            <div class="card-item stat-time">
              <span class="val">${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s</span>
              <span class="lbl">Time Taken</span>
            </div>
          </div>
          <div class="scorecard-actions">
            <button class="btn btn-primary" onclick="App.restartExamSetup()">
              <i class="fa-solid fa-rotate-right"></i> Take Another Test
            </button>
            <button class="btn btn-secondary" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Print / Save Result
            </button>
          </div>
        </div>

        <!-- Detailed Review Section -->
        <div class="scorecard-review-section">
          <h3>Question-by-Question Review</h3>
          <div class="review-items-list">
            ${result.reviewItems.map((item, idx) => `
              <div class="review-item-card ${item.isCorrect ? 'rev-correct' : item.isUnattempted ? 'rev-unattempted' : 'rev-incorrect'}">
                <div class="review-header">
                  <span class="q-num">Q${idx + 1} (${item.question.subjectId})</span>
                  <span class="q-status-badge">
                    ${item.isCorrect ? '<i class="fa-solid fa-check"></i> Correct (+'+item.marksObtained+' Marks)' : item.isUnattempted ? '<i class="fa-solid fa-minus"></i> Unattempted' : '<i class="fa-solid fa-xmark"></i> Incorrect (0 Marks)'}
                  </span>
                </div>
                <div class="review-stem">${item.question.question}</div>
                <div class="review-answers-box">
                  <p><strong>Your Answer:</strong> ${item.selected ? item.selected : 'Not Answered'}</p>
                  <p><strong>Correct Answer:</strong> Option (${item.correct})</p>
                  <p class="review-explanation"><strong>Explanation:</strong> ${item.question.explanation || 'Refer to ICAI materials.'}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  },

  restartExamSetup() {
    QuizEngine.examState.isActive = false;
    QuizEngine.examState.result = null;
    this.renderCurrentView();
  },

  // ---------------- CASE SCENARIOS VIEW ----------------
  renderCasesView() {
    const container = document.getElementById("casesContainer");
    if (!container) return;

    let caseScenarios = this.state.allMCQs.filter(q => q.type === "case_scenario");

    if (caseScenarios.length === 0) {
      const map = new Map();
      this.state.allMCQs.forEach(q => {
        if (!q.scenarioText || !q.scenarioText.trim()) return;
        const key = `${q.subjectId}___${q.caseTitle || q.chapter}`;
        if (!map.has(key)) {
          map.set(key, {
            id: q.id,
            subjectId: q.subjectId,
            source: q.source || "BOOKLET",
            examSession: q.examSession || "ICAI May 2026 Case Scenario Booklet",
            title: q.caseTitle || `Case Scenario: ${q.chapter || 'Comprehensive'}`,
            scenarioText: q.scenarioText,
            subQuestions: []
          });
        }
        map.get(key).subQuestions.push({
          subId: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: q.marks || 2
        });
      });
      caseScenarios = Array.from(map.values());
    }

    if (caseScenarios.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-layer-group fa-3x"></i>
          <h3>No Case Scenarios Available</h3>
          <p>Add a new Case Scenario in the Add & Import section to practice multi-disciplinary case questions.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = caseScenarios.map(cs => `
      <div class="case-study-block" id="case-block-${cs.id}">
        <div class="case-study-header">
          <div class="case-badges">
            <span class="badge badge-primary">${cs.subjectId}</span>
            <span class="badge badge-source">${cs.source}</span>
            <span class="badge badge-outline">${cs.examSession || ''}</span>
            <span class="badge badge-marks">${(cs.subQuestions || []).length} Linked MCQs</span>
          </div>
          <h3>${cs.title || 'Integrated Case Scenario'}</h3>
        </div>

        <div class="case-study-narrative">
          <h4><i class="fa-solid fa-file-contract"></i> Case Narrative & Facts:</h4>
          <div class="narrative-body">${cs.scenarioText.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>")}</div>
        </div>

        <div class="case-subquestions-container">
          <h4><i class="fa-solid fa-list-ol"></i> Multiple Choice Questions Based on Case:</h4>
          ${(cs.subQuestions || []).map((sq, sIdx) => {
            const isStarred = MCQStats.isStarred(sq.subId);
            return `
              <div class="case-subq-card" id="subq-${sq.subId}">
                <div class="subq-top">
                  <span class="badge badge-secondary">Question ${sIdx + 1} (${sq.marks || 2} Marks)</span>
                  <button class="icon-btn star-btn ${isStarred ? 'starred' : ''}" onclick="App.handleToggleStar('${sq.subId}')">
                    <i class="fa-${isStarred ? 'solid' : 'regular'} fa-star"></i>
                  </button>
                </div>
                <div class="subq-stem">${sq.question}</div>
                <div class="subq-options-grid">
                  ${(sq.options || []).map(opt => `
                    <div class="subq-option ${opt.id === sq.correctAnswer ? 'opt-ans' : ''}">
                      <strong>${opt.id}.</strong> ${opt.text}
                    </div>
                  `).join("")}
                </div>
                <details class="subq-rationale">
                  <summary><i class="fa-solid fa-lightbulb"></i> View Solution & Working</summary>
                  <p><strong>Correct Option: (${sq.correctAnswer})</strong></p>
                  <p>${sq.explanation || 'Refer to statutory provisions.'}</p>
                </details>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `).join("");
  },

  openCaseStudy(caseId) {
    this.switchTab("cases");
    setTimeout(() => {
      const el = document.getElementById(`case-block-${caseId}`);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  },

  // ---------------- MISTAKES NOTEBOOK ----------------
  renderMistakesView() {
    const container = document.getElementById("mistakesContainer");
    if (!container) return;

    const userData = MCQStats.getUserData();
    const history = userData.history || {};

    // Find all questions marked incorrect
    const incorrectQIds = Object.keys(history).filter(qId => history[qId].status === "incorrect");

    if (incorrectQIds.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-circle-check fa-3x" style="color: #10b981;"></i>
          <h3>Clean Mistake Sheet!</h3>
          <p>You have no incorrectly answered questions logged right now. Keep practicing!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="mistakes-header-bar">
        <div>
          <h3><i class="fa-solid fa-triangle-exclamation"></i> Mistake Notebook (${incorrectQIds.length} MCQs to Master)</h3>
          <p class="text-muted">Targeted revision of all questions you've previously gotten wrong.</p>
        </div>
        <button class="btn btn-primary" onclick="App.practiceMistakes()">
          <i class="fa-solid fa-play"></i> Drill These Mistakes in Practice Mode
        </button>
      </div>

      <div class="mistakes-list">
        ${incorrectQIds.map(qId => {
          // Look up question in allMCQs (or subquestions)
          let found = null;
          this.state.allMCQs.forEach(q => {
            if (q.id === qId) found = q;
            if (q.subQuestions) {
              const sq = q.subQuestions.find(s => s.subId === qId);
              if (sq) found = { ...sq, subjectId: q.subjectId, source: q.source, chapter: q.chapter };
            }
          });

          if (!found) return "";
          const h = history[qId];

          return `
            <div class="mistake-item-card">
              <div class="mistake-top">
                <span class="badge badge-danger">Incorrect Answer</span>
                <span class="badge badge-primary">${found.subjectId}</span>
                <span class="badge badge-source">${found.source || 'ICAI'}</span>
                <small class="text-muted">Attempts: ${h.attempts}</small>
              </div>
              <div class="mistake-stem">${found.question}</div>
              <div class="mistake-details">
                <p><strong>Your Last Choice:</strong> Option (${h.lastSelected || 'N/A'})</p>
                <p><strong>Correct Answer:</strong> Option (${found.correctAnswer})</p>
                <p class="mistake-explanation"><strong>ICAI Reasoning:</strong> ${found.explanation || ''}</p>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  practiceMistakes() {
    this.state.practiceFilter = {
      subject: "ALL",
      source: "ALL",
      starredOnly: false,
      incorrectOnly: true
    };
    QuizEngine.initPractice(this.state.allMCQs, this.state.practiceFilter);
    this.switchTab("practice");
  },

  // ---------------- EVENT LISTENERS ----------------
  setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        if (tab) App.switchTab(tab);
      });
    });

    // Theme toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => App.toggleTheme());
    }

    // Global subject filter in header
    const globalSub = document.getElementById("globalSubjectFilter");
    if (globalSub) {
      globalSub.addEventListener("change", (e) => {
        const val = e.target.value;
        if (App.state.currentTab === "repository") {
          App.setRepositorySubject(val);
        } else {
          App.state.repositoryFilter.subject = val;
          App.state.practiceFilter.subject = val;
          App.renderCurrentView();
        }
      });
    }

    // Repository filters
    const searchInput = document.getElementById("repoSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        App.state.repositoryFilter.search = e.target.value;
        App.renderRepository();
      });
    }

    const repoSubFilter = document.getElementById("repoSubjectFilter");
    if (repoSubFilter) {
      repoSubFilter.addEventListener("change", (e) => {
        App.state.repositoryFilter.subject = e.target.value;
        App.state.repositoryFilter.chapter = "ALL";
        App.updateChapterFilterDropdown("repoChapterFilter", e.target.value);
        App.renderRepository();
      });
    }

    const repoChFilter = document.getElementById("repoChapterFilter");
    if (repoChFilter) {
      repoChFilter.addEventListener("change", (e) => {
        App.state.repositoryFilter.chapter = e.target.value;
        App.renderRepository();
      });
    }

    const repoSrcFilter = document.getElementById("repoSourceFilter");
    if (repoSrcFilter) {
      repoSrcFilter.addEventListener("change", (e) => {
        App.state.repositoryFilter.source = e.target.value;
        App.renderRepository();
      });
    }

    const repoImpFilter = document.getElementById("repoImpFilter");
    if (repoImpFilter) {
      repoImpFilter.addEventListener("change", (e) => {
        App.state.repositoryFilter.imp = e.target.value;
        App.renderRepository();
      });
    }

    // Auth Forms
    const loginForm = document.getElementById("authLoginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        App.handleAuthLogin();
      });
    }

    const registerForm = document.getElementById("authRegisterForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        App.handleAuthRegister();
      });
    }

    // Keyboard Shortcuts for Practice Mode
    window.addEventListener("keydown", (e) => {
      if (App.state.currentTab !== "practice") return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        App.handlePracticeSelect(key);
      } else if (e.key === "Enter") {
        App.submitPracticeChoice();
      } else if (e.key === "ArrowRight") {
        App.nextPracticeQuestion();
      } else if (e.key === "ArrowLeft") {
        App.prevPracticeQuestion();
      }
    });
  },

  // Export & Backup
  exportDataJSON() {
    MCQImporter.exportToJSON(this.state.allMCQs, `ICAI_CA_Final_MCQs_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  },

  exportDataCSV() {
    MCQImporter.exportToCSV(this.state.allMCQs, `ICAI_MCQs_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  },

  triggerJSONFileImport() {
    const input = document.getElementById("jsonFileInput");
    if (input) input.click();
  },

  handleJSONFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          data.forEach(item => App.saveCustomMCQ(item));
          alert(`Successfully imported ${data.length} MCQs from file!`);
          App.switchTab("repository");
        } else {
          alert("Invalid file format: Expected an array of MCQ objects.");
        }
      } catch (err) {
        alert("Error parsing JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  },

  // ---------------- AUTHENTICATION & ACCESS CONTROL ----------------
  switchAuthTab(tab) {
    const isLogin = tab === 'login';
    const tabLogin = document.getElementById("tabBtnLogin");
    const tabReg = document.getElementById("tabBtnRegister");
    const formLogin = document.getElementById("authLoginForm");
    const formReg = document.getElementById("authRegisterForm");
    const alertBox = document.getElementById("authAlertBox");

    if (alertBox) alertBox.style.display = "none";
    if (tabLogin) tabLogin.classList.toggle("active", isLogin);
    if (tabReg) tabReg.classList.toggle("active", !isLogin);
    if (formLogin) formLogin.style.display = isLogin ? "block" : "none";
    if (formReg) formReg.style.display = isLogin ? "none" : "block";
  },

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPwd = input.type === "password";
    input.type = isPwd ? "text" : "password";
    const btn = input.nextElementSibling;
    if (btn && btn.querySelector("i")) {
      btn.querySelector("i").className = isPwd ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    }
  },

  showAuthAlert(message, type = "error") {
    const alertBox = document.getElementById("authAlertBox");
    if (!alertBox) return;
    alertBox.className = `auth-alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
    alertBox.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
      <span>${message}</span>
    `;
    alertBox.style.display = "flex";
  },

  async handleAuthLogin() {
    const regNo = document.getElementById("loginRegNo").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const user = await Auth.login(regNo, password);
      this.showAuthAlert("Login successful! Welcome, " + user.name, "success");
      setTimeout(() => {
        this.checkAuthStatus();
        this.switchTab("study");
      }, 350);
    } catch (err) {
      this.showAuthAlert(err.message, "error");
    }
  },

  async handleDemoLogin() {
    try {
      const demoUser = await Auth.loginDemo();
      this.showAuthAlert("Demo Student Login successful! Entering portal...", "success");
      setTimeout(() => {
        this.checkAuthStatus();
        this.switchTab("study");
      }, 350);
    } catch (err) {
      this.showAuthAlert(err.message, "error");
    }
  },

  async handleAuthRegister() {
    const name = document.getElementById("regName").value;
    const regNo = document.getElementById("regRegNo").value;
    const phone = document.getElementById("regPhone").value;
    const email = document.getElementById("regEmail").value;
    const dob = document.getElementById("regDob").value;
    const attempt = document.getElementById("regAttempt").value;
    const examGroup = document.getElementById("regExamGroup")?.value || "BOTH";
    const password = document.getElementById("regPassword").value;

    try {
      const newUser = await Auth.register({ name, regNo, phone, email, dob, attempt, examGroup, password });
      StudyEngine.setSelectedExamGroup(examGroup);
      
      // Reset the registration form
      const regForm = document.getElementById("authRegisterForm");
      if (regForm) regForm.reset();

      // Switch to Login tab directly (do NOT grant direct access yet)
      this.switchAuthTab('login');

      // Pre-fill the login registration number with the newly created account's regNo
      const loginReg = document.getElementById("loginRegNo");
      if (loginReg) {
        loginReg.value = newUser.regNo;
      }

      // Show clear message on login tab prompting the user to login with their credentials
      this.showAuthAlert(`Account for ${newUser.name} (${newUser.regNo}) created successfully! Please enter your Password to login and access the portal.`, "success");

      // Focus password field on login form
      const pwdInput = document.getElementById("loginPassword");
      if (pwdInput) {
        pwdInput.value = "";
        pwdInput.focus();
      }
    } catch (err) {
      this.showAuthAlert(err.message, "error");
    }
  },

  handleLogout() {
    if (confirm("Are you sure you want to log out? This will lock the MCQ portal.")) {
      Auth.logout();
      this.closeProfileModal();
      this.checkAuthStatus();
      this.switchAuthTab('login');
      const loginForm = document.getElementById("authLoginForm");
      if (loginForm) loginForm.reset();
    }
  },

  openProfileModal() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const detailsEl = document.getElementById("studentProfileDetails");
    const activeGroup = StudyEngine.getSelectedExamGroup();
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div class="profile-field-row">
          <span class="profile-field-label">Student Name:</span>
          <span class="profile-field-value">${user.name}</span>
        </div>
        <div class="profile-field-row">
          <span class="profile-field-label">Registration No.:</span>
          <span class="profile-field-value" style="color: var(--primary);">${user.regNo}</span>
        </div>
        <div class="profile-field-row">
          <span class="profile-field-label">Target Exam Attempt:</span>
          <span class="profile-field-value"><span class="badge badge-primary">${user.attempt}</span></span>
        </div>
        <div class="profile-field-row">
          <span class="profile-field-label">Upcoming Exam Category:</span>
          <span class="profile-field-value">
            <select id="profileExamGroupSelect" class="form-control" style="width: auto; display: inline-block; padding: 4px 8px; font-size: 0.85rem;" onchange="App.setExamGroupCategory(this.value); App.openProfileModal();">
              <option value="BOTH" ${activeGroup === 'BOTH' ? 'selected' : ''}>Both Groups (All 6 Papers)</option>
              <option value="G1" ${activeGroup === 'G1' ? 'selected' : ''}>Group 1 (Papers 1, 2 & 3)</option>
              <option value="G2" ${activeGroup === 'G2' ? 'selected' : ''}>Group 2 (Papers 4, 5 & 6)</option>
            </select>
          </span>
        </div>
        <div class="profile-field-row">
          <span class="profile-field-label">Phone Number:</span>
          <span class="profile-field-value">${user.phone}</span>
        </div>
        <div class="profile-field-row">
          <span class="profile-field-label">Email ID:</span>
          <span class="profile-field-value">${user.email}</span>
        </div>
        <div class="profile-field-row">
          <span class="profile-field-label">Date of Birth:</span>
          <span class="profile-field-value">${user.dob}</span>
        </div>
        <div class="profile-field-row">
          <span class="profile-field-label">Account Created:</span>
          <span class="profile-field-value">${user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A'}</span>
        </div>
      `;
    }
    const modal = document.getElementById("studentProfileModal");
    if (modal) modal.style.display = "flex";
  },

  closeProfileModal() {
    const modal = document.getElementById("studentProfileModal");
    if (modal) modal.style.display = "none";
  },

  // ================= STUDY MANAGEMENT CONTROLLER =================
  setExamGroupCategory(group) {
    StudyEngine.setSelectedExamGroup(group);

    // Ensure active tracker subject is within the newly selected group
    const allowed = StudyEngine.getGroupSubjects(group);
    if (!allowed.includes(this.state.activeTrackerSubject)) {
      this.state.activeTrackerSubject = allowed[0] || "FR";
    }

    this.renderExamGroupSelector();
    this.renderPreparationProgressBanner();
    this.renderStudyCountdown();
    this.renderChapterTracker();
  },

  renderExamGroupSelector() {
    const activeGroup = StudyEngine.getSelectedExamGroup();
    const groupInfo = StudyEngine.getGroupInfo(activeGroup);

    const titleEl = document.getElementById("activeExamCategoryDisplay");
    if (titleEl) {
      titleEl.textContent = `${groupInfo.name} (${groupInfo.papersCount} Papers: ${groupInfo.subjects.join(", ")})`;
    }

    document.querySelectorAll(".category-toggle-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.group === activeGroup);
    });
  },

  renderPreparationProgressBanner() {
    const metrics = StudyEngine.computeSyllabusMetrics();
    const groupInfo = metrics.groupInfo;

    const readinessEl = document.getElementById("prepOverallReadinessPct");
    const scopeEl = document.getElementById("prepCategoryScopeText");
    const ratioEl = document.getElementById("prepLectureRatioText");
    const barEl = document.getElementById("prepReadinessFillBar");
    const badgeLec = document.getElementById("prepBadgeLectures");
    const badgeR1 = document.getElementById("prepBadgeR1");
    const badgeR2 = document.getElementById("prepBadgeR2");
    const badgeR3 = document.getElementById("prepBadgeR3");

    if (readinessEl) readinessEl.textContent = `${metrics.overallReadiness}%`;
    if (scopeEl) scopeEl.textContent = `Target Scope: ${groupInfo.name} (${metrics.totalPapers} Papers • ${metrics.totalChapters} Chapters)`;
    if (ratioEl) ratioEl.textContent = `${metrics.completedLecturesGlobal} / ${metrics.totalChapters} Chapters with Lectures Completed (${metrics.overallLecturePct}%)`;
    if (barEl) barEl.style.width = `${metrics.overallReadiness}%`;

    if (badgeLec) badgeLec.textContent = `${metrics.overallLecturePct}%`;
    if (badgeR1) badgeR1.textContent = `${metrics.overallR1Pct}%`;
    if (badgeR2) badgeR2.textContent = `${metrics.overallR2Pct}%`;
    if (badgeR3) badgeR3.textContent = `${metrics.overallR3Pct}%`;
  },

  renderStudyView() {
    this.renderExamGroupSelector();
    this.renderPreparationProgressBanner();
    this.switchStudySubtab(this.state.studySubtab || "countdown-calendar");
    this.renderStudyCountdown();
    this.renderCalendar();
    this.renderPomodoro();
    this.renderTasksList();
    this.renderComparisonAnalytics();
    this.renderChapterTracker();
  },

  renderStudyCountdown() {
    const countdown = StudyEngine.calculateRemainingDays();
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    const attempt = user ? user.attempt : "Nov 2026";
    const groupInfo = StudyEngine.getGroupInfo();

    const titleEl = document.getElementById("studyTargetAttemptTitle");
    const dateTextEl = document.getElementById("studyTargetDateText");
    const daysEl = document.getElementById("countdownDays");
    const weeksEl = document.getElementById("countdownWeeks");

    if (titleEl) titleEl.textContent = `CA Final ${attempt} Attempt • ${groupInfo.name}`;
    if (dateTextEl && countdown.targetDate) {
      dateTextEl.textContent = `Target Exam Window: ${countdown.targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • ${groupInfo.label}`;
    }
    if (daysEl) daysEl.textContent = countdown.totalDays;
    if (weeksEl) weeksEl.textContent = countdown.weeks;
  },

  openCustomDateModal() {
    const current = StudyEngine.getTargetExamDate();
    const input = document.getElementById("customExamDateInput");
    if (input) {
      input.value = current.toISOString().slice(0, 10);
    }
    const modal = document.getElementById("customExamDateModal");
    if (modal) modal.style.display = "flex";
  },

  closeCustomDateModal() {
    const modal = document.getElementById("customExamDateModal");
    if (modal) modal.style.display = "none";
  },

  saveCustomExamDate() {
    const input = document.getElementById("customExamDateInput");
    if (input && input.value) {
      localStorage.setItem(`ICAI_CUSTOM_EXAM_DATE_${StudyEngine.getStoragePrefix()}`, input.value);
      this.closeCustomDateModal();
      this.renderStudyCountdown();
      alert("Target examination date saved successfully!");
    }
  },

  // Historical Comparison Analytics (Today vs Yesterday vs Week vs Month)
  setComparisonPeriod(period) {
    this.state.comparisonPeriod = period;
    document.querySelectorAll(".comp-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.period === period);
    });
    this.renderComparisonAnalytics();
  },

  renderComparisonAnalytics() {
    const period = this.state.comparisonPeriod || "today";
    const data = StudyEngine.getComparisonData(period);

    const titleEl = document.getElementById("compActivePeriodTitle");
    const tasksDoneEl = document.getElementById("compTasksCompleted");
    const tasksPendingEl = document.getElementById("compTasksPending");
    const pomoCountEl = document.getElementById("compPomoCount");
    const pomoMinutesEl = document.getElementById("compPomoMinutes");

    if (titleEl) titleEl.textContent = data.periodLabel;
    if (tasksDoneEl) tasksDoneEl.textContent = data.tasksDone;
    if (tasksPendingEl) tasksPendingEl.textContent = data.tasksPending;
    if (pomoCountEl) pomoCountEl.textContent = `${data.pomoCount} Sessions`;
    if (pomoMinutesEl) pomoMinutesEl.textContent = `${data.focusMinutes} Mins`;
  },

  // Pomodoro
  renderPomodoro() {
    const clock = document.getElementById("pomodoroClockDisplay");
    const sessionsBadge = document.getElementById("pomodoroSessionsToday");
    const toggleBtn = document.getElementById("pomodoroToggleBtn");
    const targetBarFill = document.getElementById("pomoTargetBarFill");
    const targetSummary = document.getElementById("pomoTargetSummary");
    const subjectSelect = document.getElementById("pomoActiveSubject");
    const logsList = document.getElementById("pomoLogsList");
    const logsCount = document.getElementById("pomoLogsCount");

    const settings = (typeof StudyEngine !== 'undefined' && StudyEngine.loadPomodoroSettings) 
      ? (StudyEngine.loadPomodoroSettings() || {}) 
      : {};
    const todayCount = (typeof StudyEngine !== 'undefined' && StudyEngine.getPomodoroTotalToday) 
      ? StudyEngine.getPomodoroTotalToday() 
      : 0;
    const target = settings.dailyTarget || 8;
    const targetPct = Math.min(100, Math.round((todayCount / target) * 100));

    const rem = Math.max(0, StudyEngine.pomodoro.remainingSeconds);
    const m = Math.floor(rem / 60);
    const s = rem % 60;

    if (clock) clock.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    if (sessionsBadge) sessionsBadge.textContent = `${todayCount} / ${target} Sessions Today`;
    if (targetBarFill) targetBarFill.style.width = `${targetPct}%`;
    if (targetSummary) targetSummary.textContent = `${todayCount} of ${target} Target Sessions Completed (${targetPct}%)`;

    if (subjectSelect) {
      subjectSelect.value = settings.currentSubject || "FR";
    }

    if (toggleBtn) {
      toggleBtn.innerHTML = StudyEngine.pomodoro.isRunning
        ? '<i class="fa-solid fa-pause"></i> Pause Focus'
        : '<i class="fa-solid fa-play"></i> Start Focus';
      toggleBtn.className = StudyEngine.pomodoro.isRunning ? "btn btn-danger btn-lg" : "btn btn-primary btn-lg";
    }

    // Highlight active mode button
    document.querySelectorAll(".pomo-mode-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === StudyEngine.pomodoro.mode);
    });

    // Render timestamped session logs drawer
    const logs = StudyEngine.getPomodoroLogs();
    if (logsCount) logsCount.textContent = logs.length;
    if (logsList) {
      if (logs.length === 0) {
        logsList.innerHTML = `<p class="text-muted" style="font-size: 0.8rem; padding: 10px 0;">No completed focus sessions logged yet today.</p>`;
      } else {
        logsList.innerHTML = logs.slice(0, 15).map(log => `
          <div class="pomo-log-item">
            <span class="pomo-log-time"><i class="fa-regular fa-clock"></i> ${log.timeStr || new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span class="badge badge-primary" style="font-size: 0.7rem;">${log.subjectId || 'GENERAL'}</span>
            <span class="pomo-log-duration">${log.durationMinutes || 25} Mins Focused</span>
          </div>
        `).join("");
      }
    }
  },

  setPomodoroMode(mode) {
    StudyEngine.setPomodoroMode(mode);
    this.renderPomodoro();
  },

  togglePomodoro() {
    StudyEngine.togglePomodoro(
      (rem) => {
        const clock = document.getElementById("pomodoroClockDisplay");
        const m = Math.floor(rem / 60);
        const s = rem % 60;
        if (clock) clock.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      },
      (completedMode) => {
        alert(`🔔 Pomodoro session completed! Great work on your CA Final study goal! Time for ${completedMode === 'study' ? 'a break' : 'focused study'}.`);
        App.renderPomodoro();
        App.renderComparisonAnalytics();
      }
    );
    this.renderPomodoro();
  },

  resetPomodoro() {
    StudyEngine.resetPomodoro();
    this.renderPomodoro();
  },

  handlePomodoroSubjectChange(val) {
    const settings = StudyEngine.loadPomodoroSettings();
    settings.currentSubject = val;
    StudyEngine.savePomodoroSettings(settings);
  },

  openPomodoroSettingsModal() {
    const settings = StudyEngine.loadPomodoroSettings();
    const studyInput = document.getElementById("pomoStudyMins");
    const shortInput = document.getElementById("pomoShortMins");
    const longInput = document.getElementById("pomoLongMins");
    const targetInput = document.getElementById("pomoDailyTarget");
    const subjectInput = document.getElementById("pomoDefaultSubject");

    if (studyInput) studyInput.value = settings.study;
    if (shortInput) shortInput.value = settings.short_break;
    if (longInput) longInput.value = settings.long_break;
    if (targetInput) targetInput.value = settings.dailyTarget;
    if (subjectInput) subjectInput.value = settings.currentSubject;

    const modal = document.getElementById("pomodoroSettingsModal");
    if (modal) modal.style.display = "flex";
  },

  closePomodoroSettingsModal() {
    const modal = document.getElementById("pomodoroSettingsModal");
    if (modal) modal.style.display = "none";
  },

  savePomodoroSettings(event) {
    if (event) event.preventDefault();
    const study = parseInt(document.getElementById("pomoStudyMins")?.value) || 25;
    const short_break = parseInt(document.getElementById("pomoShortMins")?.value) || 5;
    const long_break = parseInt(document.getElementById("pomoLongMins")?.value) || 15;
    const dailyTarget = parseInt(document.getElementById("pomoDailyTarget")?.value) || 8;
    const currentSubject = document.getElementById("pomoDefaultSubject")?.value || "FR";

    StudyEngine.savePomodoroSettings({ study, short_break, long_break, dailyTarget, currentSubject });
    this.closePomodoroSettingsModal();
    this.renderPomodoro();
    this.renderComparisonAnalytics();
    alert("Pomodoro focus settings and daily target saved successfully!");
  },

  // Task Manager (To-Do List)
  handleAddTask(event) {
    if (event) event.preventDefault();
    const titleInput = document.getElementById("taskTitleInput");
    const subSelect = document.getElementById("taskSubjectSelect");
    const prioritySelect = document.getElementById("taskPrioritySelect");

    if (!titleInput || !titleInput.value.trim()) return;

    StudyEngine.addTask({
      title: titleInput.value.trim(),
      subjectId: subSelect ? subSelect.value : "FR",
      priority: prioritySelect ? prioritySelect.value : "Medium"
    });

    titleInput.value = "";
    this.renderTasksList();
    this.renderComparisonAnalytics();
  },

  handleToggleTask(taskId) {
    StudyEngine.toggleTask(taskId);
    this.renderTasksList();
    this.renderComparisonAnalytics();
  },

  handleDeleteTask(taskId) {
    StudyEngine.deleteTask(taskId);
    this.renderTasksList();
    this.renderComparisonAnalytics();
  },

  renderTasksList() {
    const container = document.getElementById("tasksListContainer");
    const summary = document.getElementById("tasksCountSummary");
    if (!container) return;

    const tasks = StudyEngine.getTasks();
    const pending = tasks.filter(t => !t.isCompleted).length;
    if (summary) summary.textContent = `${pending} Pending Goal${pending === 1 ? '' : 's'}`;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <p class="text-muted"><i class="fa-solid fa-clipboard-check"></i> No tasks logged yet. Add your daily study targets above!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(t => {
      const priorityColor = t.priority === "High" ? "var(--danger)" : t.priority === "Medium" ? "var(--warning)" : "var(--success)";
      const createdDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
      const completedInfo = t.isCompleted && t.completedAt ? ` • Done ${new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';

      return `
        <div class="task-item ${t.isCompleted ? 'completed' : ''}" style="border-left-color: ${priorityColor};">
          <div class="task-left">
            <input type="checkbox" class="task-checkbox" ${t.isCompleted ? 'checked' : ''} onchange="App.handleToggleTask('${t.id}')">
            <div>
              <span class="task-title-text">${t.title}</span>
              <div class="task-time-meta" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                <i class="fa-regular fa-clock"></i> Added ${createdDate}${completedInfo}
              </div>
            </div>
          </div>
          <div class="task-meta-tags">
            <span class="badge badge-outline" style="font-size: 0.65rem;">${t.subjectId}</span>
            <button class="icon-btn delete-btn" onclick="App.handleDeleteTask('${t.id}')" title="Delete Task" style="padding: 4px;">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  // Indian Calendar
  renderCalendar() {
    const year = StudyEngine.calendar.currentYear;
    const month = StudyEngine.calendar.currentMonth;
    const titleEl = document.getElementById("calendarCurrentMonthTitle");
    const gridEl = document.getElementById("calendarDaysGrid");
    const festivalsListEl = document.getElementById("calendarMonthFestivalsList");

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

    const days = StudyEngine.getCalendarDays(year, month);
    const todayStr = new Date().toISOString().slice(0, 10);

    if (gridEl) {
      gridEl.innerHTML = days.map(d => {
        if (!d.isCurrentMonth) return `<div class="calendar-day-cell empty-slot"></div>`;

        const isToday = d.dateStr === todayStr;
        const hasFestival = d.holiday && d.holiday.type === "festival";
        const hasIcai = d.holiday && d.holiday.type === "icai";
        const hasNational = d.holiday && d.holiday.type === "national";

        let customClass = isToday ? "is-today " : "";
        if (hasIcai) customClass += "has-icai ";
        else if (hasFestival || hasNational) customClass += "has-festival ";

        // Build chips for holiday and custom events
        const chips = [];
        if (d.holiday) {
          const chipClass = d.holiday.type === 'icai' ? 'cal-chip-icai' : 'cal-chip-festival';
          chips.push(`
            <span class="cal-chip ${chipClass}" title="${d.holiday.name}: ${d.holiday.desc}">
              <i class="fa-solid ${d.holiday.type === 'icai' ? 'fa-building-columns' : 'fa-sun'}"></i> ${d.holiday.name}
            </span>
          `);
        }

        if (d.customEvents && d.customEvents.length > 0) {
          d.customEvents.forEach(evt => {
            chips.push(`
              <span class="cal-chip cal-chip-custom" title="${evt.title}${evt.time ? ' (' + evt.time + ')' : ''}">
                <i class="fa-solid fa-calendar-check"></i> ${evt.title}
              </span>
            `);
          });
        }

        let chipsHtml = "";
        if (chips.length > 0) {
          const visibleChips = chips.slice(0, 2);
          const moreCount = chips.length - 2;
          chipsHtml = `
            <div class="cal-chips-container">
              ${visibleChips.join("")}
              ${moreCount > 0 ? `<span class="cal-chip-more">+${moreCount} more</span>` : ""}
            </div>
          `;
        }

        return `
          <div class="calendar-day-cell ${customClass}" onclick="App.openDateEventsModal('${d.dateStr}', ${d.dayNumber})" title="Click to view, add, or delete events on ${d.dateStr}">
            <div class="cal-day-header">
              <span class="cal-day-num">${d.dayNumber}</span>
              <span class="cal-add-icon" title="Add / View events"><i class="fa-solid fa-plus"></i></span>
            </div>
            ${chipsHtml}
          </div>
        `;
      }).join("");
    }

    if (festivalsListEl) {
      const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
      const monthFestivals = (typeof INDIAN_HOLIDAYS_AND_FESTIVALS !== "undefined" ? INDIAN_HOLIDAYS_AND_FESTIVALS : []).filter(h => h.date.startsWith(monthPrefix));

      if (monthFestivals.length === 0) {
        festivalsListEl.innerHTML = `<p class="text-muted" style="font-size: 0.85rem; padding: 10px 0;">No major holidays listed for this month.</p>`;
      } else {
        festivalsListEl.innerHTML = `
          <div class="festivals-list-container">
            ${monthFestivals.map(f => `
              <div class="festival-item-pill" style="border-left: 4px solid ${f.type === 'icai' ? '#dc2626' : '#d97706'};">
                <strong>${f.name}</strong>
                <small class="text-muted">${new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • ${f.desc}</small>
              </div>
            `).join("")}
          </div>
        `;
      }
    }
  },

  openDateEventsModal(dateStr, dayNumber) {
    if (!dateStr) return;
    const modal = document.getElementById("dateEventModal");
    const formattedTitle = document.getElementById("modalDateFormatted");
    const targetInput = document.getElementById("modalTargetDateStr");
    const titleInput = document.getElementById("modalNewEventTitle");
    const timeInput = document.getElementById("modalNewEventTime");

    if (formattedTitle) {
      const parts = dateStr.split("-");
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      formattedTitle.textContent = d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }

    if (targetInput) targetInput.value = dateStr;
    if (titleInput) titleInput.value = "";
    if (timeInput) timeInput.value = "";

    this.renderDateEventsList(dateStr);

    if (modal) modal.style.display = "flex";
  },

  closeDateEventsModal() {
    const modal = document.getElementById("dateEventModal");
    if (modal) modal.style.display = "none";
  },

  renderDateEventsList(dateStr) {
    const container = document.getElementById("modalDateEventsList");
    if (!container) return;

    const events = StudyEngine.getEventsForDate(dateStr);
    const holiday = typeof INDIAN_HOLIDAYS_AND_FESTIVALS !== "undefined"
      ? INDIAN_HOLIDAYS_AND_FESTIVALS.find(h => h.date === dateStr)
      : null;

    let html = "";

    if (holiday) {
      html += `
        <div class="cal-modal-event-item" style="border-left: 3px solid ${holiday.type === 'icai' ? '#dc2626' : '#d97706'};">
          <div class="cal-modal-event-left">
            <div class="cal-modal-event-title">${holiday.name}</div>
            <div class="cal-modal-event-meta">${holiday.type === 'icai' ? 'ICAI Milestone' : 'Gazetted Holiday / Festival'} • ${holiday.desc}</div>
          </div>
          <span class="badge" style="font-size: 0.7rem; background: ${holiday.type === 'icai' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}; color: ${holiday.type === 'icai' ? '#dc2626' : '#d97706'};">Official</span>
        </div>
      `;
    }

    if (events.length === 0 && !holiday) {
      html = `<p class="text-muted" style="font-size: 0.82rem; margin: 6px 0;">No events or study targets set for this date yet. Use the form below to add one!</p>`;
    } else {
      events.forEach(evt => {
        const typeLabels = {
          study: "📚 Study Target",
          revision: "📝 Revision Goal",
          exam: "⏱️ Mock / Exam",
          reminder: "🔔 Reminder"
        };
        const label = typeLabels[evt.type] || "Study Event";

        html += `
          <div class="cal-modal-event-item">
            <div class="cal-modal-event-left">
              <div class="cal-modal-event-title">${evt.title}</div>
              <div class="cal-modal-event-meta">${label}${evt.time ? ' • ' + evt.time : ''}</div>
            </div>
            <button type="button" class="cal-event-delete-btn" onclick="App.handleDeleteCalendarEvent('${evt.id}', '${dateStr}')" title="Delete this event">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  },

  handleSaveDateEvent(e) {
    if (e) e.preventDefault();
    const targetInput = document.getElementById("modalTargetDateStr");
    const titleInput = document.getElementById("modalNewEventTitle");
    const typeSelect = document.getElementById("modalNewEventType");
    const timeInput = document.getElementById("modalNewEventTime");

    const dateStr = targetInput ? targetInput.value : "";
    const title = titleInput ? titleInput.value.trim() : "";
    const type = typeSelect ? typeSelect.value : "study";
    const time = timeInput ? timeInput.value.trim() : "";

    if (!dateStr || !title) return;

    StudyEngine.addCalendarEvent({ dateStr, title, type, time });

    if (titleInput) titleInput.value = "";
    if (timeInput) timeInput.value = "";

    this.renderDateEventsList(dateStr);
    this.renderCalendar();
  },

  handleDeleteCalendarEvent(eventId, dateStr) {
    if (!eventId) return;
    StudyEngine.deleteCalendarEvent(eventId);
    this.renderDateEventsList(dateStr);
    this.renderCalendar();
  },

  prevCalendarMonth() {
    if (StudyEngine.calendar.currentMonth === 0) {
      StudyEngine.calendar.currentMonth = 11;
      StudyEngine.calendar.currentYear--;
    } else {
      StudyEngine.calendar.currentMonth--;
    }
    this.renderCalendar();
  },

  nextCalendarMonth() {
    if (StudyEngine.calendar.currentMonth === 11) {
      StudyEngine.calendar.currentMonth = 0;
      StudyEngine.calendar.currentYear++;
    } else {
      StudyEngine.calendar.currentMonth++;
    }
    this.renderCalendar();
  },

  // Chapter & Lecture Tracker (Simple Lecture Completion State, Revisions)
  renderChapterTracker() {
    const tabsContainer = document.getElementById("subjectTrackerTabs");
    const summaryContainer = document.getElementById("activeSubSummary");
    const tableBody = document.getElementById("chapterTrackerTableBody");
    const readinessEl = document.getElementById("trackerOverallReadiness");

    const metrics = StudyEngine.computeSyllabusMetrics();
    if (readinessEl) readinessEl.textContent = `${metrics.overallReadiness}% (${metrics.groupInfo.name})`;

    const allowed = StudyEngine.getGroupSubjects();
    const allSubjects = typeof ICAI_METADATA !== "undefined" && ICAI_METADATA.subjects ? ICAI_METADATA.subjects : [];
    const subjects = allSubjects.filter(s => allowed.includes(s.id));

    if (!allowed.includes(this.state.activeTrackerSubject)) {
      this.state.activeTrackerSubject = (subjects[0] && subjects[0].id) || allowed[0] || "FR";
    }
    const activeSub = this.state.activeTrackerSubject;

    if (tabsContainer) {
      tabsContainer.innerHTML = subjects.map(s => {
        const subM = metrics.subjectMetrics[s.id] || { readinessPct: 0, lecturePct: 0 };
        return `
          <button class="sub-tracker-pill ${s.id === activeSub ? 'active' : ''}" onclick="App.setStudyTrackerSubject('${s.id}')">
            ${s.id} (${subM.readinessPct}%)
          </button>
        `;
      }).join("");
    }

    const currentSubMeta = subjects.find(s => s.id === activeSub) || { name: activeSub, paper: "" };
    const curMetrics = metrics.subjectMetrics[activeSub] || { totalChapters: 0, completedLectures: 0, lecturePct: 0, r1Pct: 0, r2Pct: 0, r3Pct: 0, readinessPct: 0 };

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div>
          <h4 style="font-size: 1rem; margin-bottom: 2px;">${currentSubMeta.paper}: ${currentSubMeta.name}</h4>
          <small class="text-muted">Chapters Completed with Lecture: ${curMetrics.completedLectures} / ${curMetrics.totalChapters} (${curMetrics.lecturePct}%)</small>
        </div>
        <div style="display: flex; gap: 14px; font-size: 0.85rem; flex-wrap: wrap;">
          <span><strong>R1:</strong> ${curMetrics.r1Pct}%</span>
          <span><strong>R2:</strong> ${curMetrics.r2Pct}%</span>
          <span><strong>R3:</strong> ${curMetrics.r3Pct}%</span>
          <span><strong>Subject Readiness:</strong> <span class="badge badge-primary">${curMetrics.readinessPct}%</span></span>
        </div>
      `;
    }

    // Chapters rows
    const progress = StudyEngine.getStudyProgress();
    const chProgress = progress[activeSub] || {};
    const defaultChapters = typeof STUDY_CHAPTERS_DATA !== "undefined" && STUDY_CHAPTERS_DATA[activeSub] ? STUDY_CHAPTERS_DATA[activeSub] : [];

    if (tableBody) {
      if (defaultChapters.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No pre-imported chapters for this subject.</td></tr>`;
      } else {
        tableBody.innerHTML = defaultChapters.map((ch, index) => {
          const prog = chProgress[ch.id] || { 
            lectureDone: false, 
            r1Done: false, 
            r2Done: false, 
            r3Done: false 
          };

          return `
            <tr>
              <td style="text-align: center;">
                <span class="ch-sr-badge">${index + 1}</span>
              </td>
              <td>
                <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-main);">${ch.name}</div>
                <small class="text-muted"><i class="fa-solid fa-chart-simple"></i> ICAI Weightage: ${ch.defaultWeightage || 'Standard'}</small>
              </td>
              <td style="text-align: center;">
                <button type="button" 
                        class="ch-lecture-status-btn ${prog.lectureDone ? 'completed' : 'pending'}" 
                        onclick="App.handleToggleChapterLecture('${activeSub}', '${ch.id}')"
                        title="Click to toggle whether chapter is completed with lecture">
                  <i class="fa-solid ${prog.lectureDone ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                  <span>${prog.lectureDone ? 'Lecture Completed' : 'Not Completed'}</span>
                </button>
              </td>
              <td style="text-align: center;">
                <button type="button" class="rev-check-btn ${prog.r1Done ? 'checked' : ''}" onclick="App.handleRevisionToggle('${activeSub}', '${ch.id}', 'r1')" title="Toggle Revision 1">
                  ${prog.r1Done ? '<i class="fa-solid fa-check"></i>' : ''}
                </button>
              </td>
              <td style="text-align: center;">
                <button type="button" class="rev-check-btn ${prog.r2Done ? 'checked' : ''}" onclick="App.handleRevisionToggle('${activeSub}', '${ch.id}', 'r2')" title="Toggle Revision 2">
                  ${prog.r2Done ? '<i class="fa-solid fa-check"></i>' : ''}
                </button>
              </td>
              <td style="text-align: center;">
                <button type="button" class="rev-check-btn ${prog.r3Done ? 'checked' : ''}" onclick="App.handleRevisionToggle('${activeSub}', '${ch.id}', 'r3')" title="Toggle Revision 3">
                  ${prog.r3Done ? '<i class="fa-solid fa-check"></i>' : ''}
                </button>
              </td>
            </tr>
          `;
        }).join("");
      }
    }
  },

  setStudyTrackerSubject(subId) {
    this.state.activeTrackerSubject = subId;
    this.renderChapterTracker();
  },

  handleToggleChapterLecture(subId, chId) {
    StudyEngine.toggleChapterLecture(subId, chId);
    this.renderPreparationProgressBanner();
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  handleLectureStep(subId, chId, delta) {
    this.handleToggleChapterLecture(subId, chId);
  },

  handleDeliveryModeChange(subId, chId, mode) {
    StudyEngine.setDeliveryMode(subId, chId, mode);
    this.renderPreparationProgressBanner();
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  handleLiveToggle(subId, chId) {
    this.handleToggleChapterLecture(subId, chId);
  },

  handleMarkChapterComplete(subId, chId) {
    this.handleToggleChapterLecture(subId, chId);
  },

  handleRevisionToggle(subId, chId, stage) {
    StudyEngine.toggleRevision(subId, chId, stage);
    this.renderPreparationProgressBanner();
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  openEditLectureModal(subId, chId, chName, currentTotal) {
    this.state.editingChapter = { subId, chId };
    const nameEl = document.getElementById("editFacultyLectureChName");
    const inputEl = document.getElementById("editFacultyLectureInput");

    if (nameEl) nameEl.textContent = chName;
    if (inputEl) inputEl.value = currentTotal || 10;

    const modal = document.getElementById("editFacultyLecturesModal");
    if (modal) modal.style.display = "flex";
  },

  closeEditLectureModal() {
    this.state.editingChapter = null;
    const modal = document.getElementById("editFacultyLecturesModal");
    if (modal) modal.style.display = "none";
  },

  saveFacultyLectureTotal(event) {
    if (event) event.preventDefault();
    if (!this.state.editingChapter) return;

    const { subId, chId } = this.state.editingChapter;
    const inputEl = document.getElementById("editFacultyLectureInput");
    const total = parseInt(inputEl?.value) || 10;

    StudyEngine.setLectureTotal(subId, chId, total);
    this.closeEditLectureModal();
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  // ================= WRITING QUESTIONS CONTROLLER =================
  loadWritingQuestions() {
    const key = "ICAI_WRITING_QUESTIONS_V1";
    let custom = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) custom = JSON.parse(stored);
    } catch (e) {}

    const defaults = typeof DEFAULT_WRITING_QUESTIONS !== "undefined" ? DEFAULT_WRITING_QUESTIONS : [];
    const map = new Map();
    custom.forEach(item => map.set(item.id, item));

    const merged = [];
    defaults.forEach(item => {
      if (map.has(item.id)) {
        merged.push(map.get(item.id));
        map.delete(item.id);
      } else {
        merged.push(item);
      }
    });
    map.forEach(item => merged.push(item));

    this.state.allWritingQuestions = merged;
  },

  saveWritingQuestion(item) {
    const key = "ICAI_WRITING_QUESTIONS_V1";
    let custom = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) custom = JSON.parse(stored);
    } catch (e) {}

    const idx = custom.findIndex(x => x.id === item.id);
    if (idx > -1) custom[idx] = item;
    else custom.push(item);

    localStorage.setItem(key, JSON.stringify(custom));
    this.loadWritingQuestions();
  },

  setWritingSubject(subjectId) {
    this.state.writingState.activeSubject = subjectId;
    this.state.writingState.currentIndex = 0;
    this.state.writingState.chapterFilter = "ALL";
    this.state.writingState.sourceFilter = "ALL";
    this.state.writingState.searchTerm = "";

    const chSel = document.getElementById("writingChapterFilter");
    if (chSel) chSel.value = "ALL";
    const srcSel = document.getElementById("writingSourceFilter");
    if (srcSel) srcSel.value = "ALL";
    const sInput = document.getElementById("writingSearchInput");
    if (sInput) sInput.value = "";

    this.renderWritingQuestions();
  },

  renderWritingSubjectTabs() {
    const tabsContainer = document.getElementById("writingSubjectTabs");
    if (!tabsContainer || typeof ICAI_METADATA === "undefined") return;

    const activeSub = this.state.writingState.activeSubject || "FR";
    const subjects = ICAI_METADATA.subjects;
    const allQuestions = this.state.allWritingQuestions || [];

    tabsContainer.innerHTML = subjects.map(sub => {
      const isActive = sub.id === activeSub;
      const count = allQuestions.filter(q => q.subjectId === sub.id).length;
      return `
        <button 
          type="button"
          class="repo-sub-pill ${isActive ? 'active' : ''}" 
          style="${isActive ? `background-color: ${sub.color};` : ''}"
          onclick="App.setWritingSubject('${sub.id}')"
          title="${sub.paper}: ${sub.name}">
          <i class="fa-solid ${sub.icon || 'fa-pen-to-square'}"></i>
          <span>${sub.id}</span>
          <span class="repo-sub-pill-count">${count} Questions</span>
        </button>
      `;
    }).join("");
  },

  populateWritingChapterFilter() {
    const sel = document.getElementById("writingChapterFilter");
    if (!sel) return;

    const activeSub = this.state.writingState.activeSubject || "FR";
    const currentVal = this.state.writingState.chapterFilter || "ALL";
    const allQuestions = this.state.allWritingQuestions || [];

    const subjectQuestions = allQuestions.filter(q => q.subjectId === activeSub);
    const chapterCounts = {};
    subjectQuestions.forEach(q => {
      const ch = q.chapter || "General / Practical";
      chapterCounts[ch] = (chapterCounts[ch] || 0) + 1;
    });

    sel.innerHTML = `<option value="ALL">All Chapters (${subjectQuestions.length})</option>`;
    Object.keys(chapterCounts).sort().forEach(ch => {
      const count = chapterCounts[ch];
      sel.innerHTML += `<option value="${this.escapeHTML(ch)}" ${ch === currentVal ? 'selected' : ''}>${this.escapeHTML(ch)} (${count})</option>`;
    });
  },

  getFilteredWritingQuestions() {
    const activeSub = this.state.writingState.activeSubject || "FR";
    const chFilter = this.state.writingState.chapterFilter || "ALL";
    const srcFilter = this.state.writingState.sourceFilter || "ALL";
    const searchTerm = (this.state.writingState.searchTerm || "").toLowerCase().trim();

    return (this.state.allWritingQuestions || []).filter(q => {
      if (q.subjectId !== activeSub) return false;
      if (chFilter !== "ALL" && q.chapter !== chFilter) return false;
      if (srcFilter !== "ALL" && q.source !== srcFilter) return false;
      if (searchTerm) {
        const inTitle = (q.title || "").toLowerCase().includes(searchTerm);
        const inCh = (q.chapter || "").toLowerCase().includes(searchTerm);
        const inQ = (q.question || "").toLowerCase().includes(searchTerm);
        const inRef = (q.reference || "").toLowerCase().includes(searchTerm);
        const inItem = (q.itemRef || "").toLowerCase().includes(searchTerm);
        if (!inTitle && !inCh && !inQ && !inRef && !inItem) return false;
      }
      return true;
    });
  },

  renderWritingQuestions() {
    // 1. Render Subject Tabs with counts
    this.renderWritingSubjectTabs();

    // 2. Populate Chapter Filter Dropdown with counts
    this.populateWritingChapterFilter();

    // 3. Sync Toolbar Filters
    const chSel = document.getElementById("writingChapterFilter");
    if (chSel && this.state.writingState.chapterFilter) {
      chSel.value = this.state.writingState.chapterFilter;
    }
    const srcSel = document.getElementById("writingSourceFilter");
    if (srcSel && this.state.writingState.sourceFilter) {
      srcSel.value = this.state.writingState.sourceFilter;
    }
    const searchInput = document.getElementById("writingSearchInput");
    if (searchInput && this.state.writingState.searchTerm !== undefined) {
      searchInput.value = this.state.writingState.searchTerm;
    }

    // 4. Retrieve filtered descriptive questions
    const filtered = this.getFilteredWritingQuestions();
    const totalQs = filtered.length;

    // Boundary check for current index
    if (this.state.writingState.currentIndex >= totalQs) {
      this.state.writingState.currentIndex = Math.max(0, totalQs - 1);
    }
    if (this.state.writingState.currentIndex < 0) {
      this.state.writingState.currentIndex = 0;
    }
    const currentIdx = this.state.writingState.currentIndex;

    // 5. Update Navigation Toolbar
    const indexChip = document.getElementById("writingQuestionIndexChip");
    if (indexChip) {
      if (totalQs === 0) {
        indexChip.innerHTML = `<i class="fa-solid fa-file-circle-question"></i> No Questions Found`;
      } else {
        indexChip.innerHTML = `<i class="fa-solid fa-file-pen"></i> Descriptive Question ${currentIdx + 1} of ${totalQs}`;
      }
    }

    // Quick jump dropdown
    const qSelect = document.getElementById("writingQuestionSelect");
    if (qSelect) {
      if (totalQs === 0) {
        qSelect.innerHTML = `<option value="">No Questions</option>`;
        qSelect.disabled = true;
      } else {
        qSelect.disabled = false;
        qSelect.innerHTML = filtered.map((wq, i) => {
          const titleSnippet = (wq.title || "Question").substring(0, 48);
          return `<option value="${i}" ${i === currentIdx ? 'selected' : ''}>Q${i + 1}: ${this.escapeHTML(titleSnippet)} (${wq.marks || 8}M)</option>`;
        }).join("");
      }
    }

    // Prev / Next button states in toolbar
    const btnPrev = document.getElementById("btnPrevWritingQuestion");
    const btnNext = document.getElementById("btnNextWritingQuestion");
    if (btnPrev) btnPrev.disabled = currentIdx <= 0 || totalQs === 0;
    if (btnNext) btnNext.disabled = currentIdx >= totalQs - 1 || totalQs === 0;

    // 6. Render Workspace (1 Question & Answer on 1 Page)
    const workspace = document.getElementById("writingWorkspace");
    if (!workspace) return;

    if (totalQs === 0) {
      workspace.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-file-circle-question fa-3x" style="color: var(--text-muted); margin-bottom: 12px;"></i>
          <h3>No Descriptive Questions Found</h3>
          <p>No questions match your current chapter, source, or search criteria. Try selecting "All Chapters" or "All Sources".</p>
          <button class="btn btn-primary" onclick="App.resetWritingFilters()" style="margin-top: 14px;">
            <i class="fa-solid fa-rotate-left"></i> Reset Writing Filters
          </button>
        </div>
      `;
      return;
    }

    const currentWQ = filtered[currentIdx];
    const subMeta = typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.subjects.find(s => s.id === currentWQ.subjectId) : null;
    const isSM = (currentWQ.source === "SM");
    const isAnswerHidden = Boolean(this.state.writingHiddenAnswers && this.state.writingHiddenAnswers.has(currentWQ.id));

    // Jump Pills HTML
    const jumpPillsHtml = filtered.map((wq, i) => {
      const isActive = i === currentIdx;
      return `
        <button 
          type="button" 
          class="q-jump-pill ${isActive ? 'active' : ''}" 
          onclick="App.jumpToWritingQuestion(${i})" 
          title="Jump to Question ${i + 1}: ${this.escapeHTML(wq.title || '')}">
          ${i + 1}
        </button>
      `;
    }).join("");

    workspace.innerHTML = `
      <!-- TOP QUESTION JUMP PILLS STRIP -->
      <div class="wq-jump-pills-row">
        <span class="wq-jump-pills-label">
          <i class="fa-solid fa-list-ol"></i> Question Navigator:
        </span>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          ${jumpPillsHtml}
        </div>
      </div>

      <!-- SINGLE QUESTION & ANSWER CARD (1 PER PAGE) -->
      <div class="writing-question-card" id="wq-${currentWQ.id}" style="margin-bottom: 0;">
        <div class="wq-header">
          <div class="tags-group">
            <span class="badge" style="background-color: ${subMeta ? subMeta.color : '#2563eb'}; color: white;">
              ${currentWQ.subjectId}
            </span>
            <span class="badge badge-source" style="background-color: ${isSM ? '#0ea5e9' : '#8b5cf6'}; color: white;">
              ${currentWQ.source === 'RTP' ? 'Revision Test Paper (RTP)' : currentWQ.source === 'MTP' ? 'Model Test Paper (MTP)' : currentWQ.source === 'PYQ' ? 'Past Exam Paper (PYQ)' : 'Study Material (SM)'}
            </span>
            ${isSM ? `
              ${currentWQ.pageNo ? `<span class="badge badge-page" title="ICAI Study Material Page Number"><i class="fa-solid fa-file-lines"></i> ${currentWQ.pageNo}</span>` : ''}
              ${currentWQ.itemRef ? `<span class="badge badge-ill" title="Illustration / Practice Problem No"><i class="fa-solid fa-shapes"></i> ${currentWQ.itemRef}</span>` : ''}
            ` : `
              ${currentWQ.examSession ? `
                <span class="badge badge-attempt" title="ICAI Exam Attempt / Edition">
                  <i class="fa-regular fa-calendar-check"></i> ${currentWQ.examSession}
                </span>
              ` : ''}
              ${currentWQ.itemRef ? `<span class="badge badge-outline" title="Question Reference"><i class="fa-solid fa-tag"></i> ${currentWQ.itemRef}</span>` : ''}
            `}
            <span class="badge badge-marks">${currentWQ.marks || 8} Marks</span>
            <span class="badge badge-outline"><i class="fa-regular fa-folder-open"></i> ${currentWQ.chapter || 'Practical Problem'}</span>
          </div>

          <div class="wq-card-actions">
            <button 
              type="button" 
              class="btn btn-sm btn-outline wq-toggle-ans-btn" 
              id="wq-btn-${currentWQ.id}" 
              onclick="App.toggleWritingAnswer('${currentWQ.id}')"
              title="Hide / Show Answer for self-practice">
              <i class="fa-solid ${isAnswerHidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
              <span>${isAnswerHidden ? 'Show Answer' : 'Hide Answer'}</span>
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-primary wq-fullview-btn" 
              onclick="App.openWritingFullView('${currentWQ.id}')"
              title="Open Distraction-Free Full View with complete calculations & working notes">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
              <span>Full View</span>
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-outline" 
              onclick="window.print()"
              title="Print Question and Model Solution">
              <i class="fa-solid fa-print"></i>
              <span>Print</span>
            </button>
          </div>
        </div>

        <h3 class="wq-title">${this.escapeHTML(currentWQ.title || 'Practical Descriptive Problem')}</h3>

        <div class="wq-stem">${App.formatMarkdown(currentWQ.question)}</div>

        <!-- INLINE SOLUTION SECTION (ON SAME PAGE, WITH HIDE / SHOW OPTION) -->
        <div class="wq-solution-box ${isAnswerHidden ? 'hidden' : ''}" id="wq-ans-${currentWQ.id}">
          <div class="wq-solution-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px dashed var(--border-color);">
            <div style="font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 6px; font-size: 0.95rem;">
              <i class="fa-solid fa-graduation-cap"></i> ICAI Model Suggested Solution & Step-by-Step Working Notes
            </div>
            <button type="button" class="btn btn-xs btn-outline" onclick="App.toggleWritingAnswer('${currentWQ.id}')" style="font-size: 0.75rem; padding: 2px 8px;">
              <i class="fa-solid fa-eye-slash"></i> Hide Answer
            </button>
          </div>
          <div class="wq-solution-content">
            ${App.formatMarkdown(currentWQ.solution)}
            ${currentWQ.reference ? `<p class="reference-tag" style="margin-top: 16px;"><i class="fa-solid fa-book-bookmark"></i> <strong>Statutory / Official Reference:</strong> ${this.escapeHTML(currentWQ.reference)}</p>` : ''}
          </div>
        </div>

        ${isAnswerHidden ? `
          <div style="margin-top: 16px; padding: 14px 18px; background: rgba(16, 185, 129, 0.08); border: 1.5px dashed #10b981; border-radius: var(--radius-sm); text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--text-main);">
              <i class="fa-solid fa-lightbulb" style="color: #f59e0b; margin-right: 6px;"></i>
              <strong>Self-Practice Mode:</strong> The suggested solution is currently hidden. Attempt solving this question on paper, then click below to verify your workings.
            </p>
            <button type="button" class="btn btn-sm btn-primary" onclick="App.toggleWritingAnswer('${currentWQ.id}')">
              <i class="fa-solid fa-eye"></i> Show Suggested Answer & Calculations
            </button>
          </div>
        ` : ''}

        <!-- BOTTOM NAVIGATION BAR (PREV / JUMP / NEXT) -->
        <div class="wq-bottom-nav">
          <button 
            type="button" 
            class="btn btn-outline" 
            id="btnPrevWQBottom" 
            onclick="App.prevWritingQuestion()" 
            ${currentIdx <= 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i> Previous Question
          </button>

          <span class="text-muted" style="font-size: 0.85rem; font-weight: 700;">
            Question ${currentIdx + 1} of ${totalQs}
          </span>

          <button 
            type="button" 
            class="btn btn-primary" 
            id="btnNextWQBottom" 
            onclick="App.nextWritingQuestion()" 
            ${currentIdx >= totalQs - 1 ? 'disabled' : ''}>
            <span>Next Question</span> <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  },

  prevWritingQuestion() {
    if (this.state.writingState.currentIndex > 0) {
      this.state.writingState.currentIndex--;
      this.renderWritingQuestions();
      const ws = document.getElementById("writingWorkspace");
      if (ws) ws.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  nextWritingQuestion() {
    const filtered = this.getFilteredWritingQuestions();
    if (this.state.writingState.currentIndex < filtered.length - 1) {
      this.state.writingState.currentIndex++;
      this.renderWritingQuestions();
      const ws = document.getElementById("writingWorkspace");
      if (ws) ws.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  jumpToWritingQuestion(idx) {
    this.state.writingState.currentIndex = idx;
    this.renderWritingQuestions();
    const ws = document.getElementById("writingWorkspace");
    if (ws) ws.scrollIntoView({ behavior: "smooth", block: "start" });
  },

  handleWritingQuestionSelectChange(val) {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      this.jumpToWritingQuestion(parsed);
    }
  },

  handleWritingChapterFilterChange(val) {
    this.state.writingState.chapterFilter = val;
    this.state.writingState.currentIndex = 0;
    this.renderWritingQuestions();
  },

  handleWritingSourceFilterChange(val) {
    this.state.writingState.sourceFilter = val;
    this.state.writingState.currentIndex = 0;
    this.renderWritingQuestions();
  },

  handleWritingSearch(val) {
    this.state.writingState.searchTerm = val;
    this.state.writingState.currentIndex = 0;
    this.renderWritingQuestions();
  },

  resetWritingFilters() {
    this.state.writingState.chapterFilter = "ALL";
    this.state.writingState.sourceFilter = "ALL";
    this.state.writingState.searchTerm = "";
    this.state.writingState.currentIndex = 0;
    this.renderWritingQuestions();
  },

  toggleWritingAnswer(id) {
    if (!this.state.writingHiddenAnswers) {
      this.state.writingHiddenAnswers = new Set();
    }
    if (this.state.writingHiddenAnswers.has(id)) {
      this.state.writingHiddenAnswers.delete(id);
    } else {
      this.state.writingHiddenAnswers.add(id);
    }
    this.renderWritingQuestions();
  },

  openWritingFullView(id) {
    const wq = (this.state.allWritingQuestions || []).find(q => q.id === id);
    if (!wq) return;

    this.state.activeFullViewWqId = id;
    const modal = document.getElementById("wqFullViewModal");
    if (!modal) return;

    const subMeta = typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.subjects.find(s => s.id === wq.subjectId) : null;
    const isSM = (wq.source === "SM");

    const badgesContainer = document.getElementById("wqFullViewBadges");
    if (badgesContainer) {
      badgesContainer.innerHTML = `
        <span class="badge" style="background-color: ${subMeta ? subMeta.color : '#2563eb'}; color: white;">
          ${wq.subjectId} • ${subMeta ? subMeta.name : ''}
        </span>
        <span class="badge badge-source" style="background-color: ${isSM ? '#0ea5e9' : '#8b5cf6'}; color: white;">
          ${wq.source === 'RTP' ? 'Revision Test Paper (RTP)' : wq.source === 'MTP' ? 'Model Test Paper (MTP)' : wq.source === 'PYQ' ? 'Past Exam Paper (PYQ)' : 'Study Material (SM)'}
        </span>
        ${isSM ? `
          ${wq.pageNo ? `<span class="badge badge-page"><i class="fa-solid fa-file-lines"></i> ${wq.pageNo}</span>` : ''}
          ${wq.itemRef ? `<span class="badge badge-ill"><i class="fa-solid fa-shapes"></i> ${wq.itemRef}</span>` : ''}
        ` : `
          ${wq.examSession ? `<span class="badge badge-attempt"><i class="fa-regular fa-calendar-check"></i> ${wq.examSession}</span>` : ''}
          ${wq.itemRef ? `<span class="badge badge-outline"><i class="fa-solid fa-tag"></i> ${wq.itemRef}</span>` : ''}
        `}
        <span class="badge badge-marks">${wq.marks || 8} Marks</span>
        <span class="badge badge-outline"><i class="fa-regular fa-folder-open"></i> ${wq.chapter || 'Practical Problem'}</span>
      `;
    }

    const titleEl = document.getElementById("wqFullViewTitle");
    if (titleEl) titleEl.textContent = wq.title || "Practical Descriptive Problem";

    const stemEl = document.getElementById("wqFullViewStem");
    if (stemEl) stemEl.innerHTML = App.formatMarkdown(wq.question);

    const solEl = document.getElementById("wqFullViewSolution");
    if (solEl) solEl.innerHTML = App.formatMarkdown(wq.solution);

    const refEl = document.getElementById("wqFullViewRef");
    if (refEl) {
      refEl.innerHTML = wq.reference ? `<i class="fa-solid fa-book-bookmark"></i> <strong>Statutory / Official Reference:</strong> ${wq.reference}` : '';
    }

    const footerMeta = document.getElementById("wqFullViewFooterMeta");
    if (footerMeta) {
      footerMeta.textContent = `${wq.subjectId} • ${wq.chapter} • ${wq.source} (${wq.examSession || wq.pageNo || ''})`;
    }

    const toggleBtn = document.getElementById("wqFullViewToggleAnsBtn");
    const solWrap = document.getElementById("wqFullViewSolutionWrap");
    if (solWrap) solWrap.classList.remove("hidden");
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> <span>Hide Solution</span>';
    }

    modal.style.display = "flex";
  },

  closeWritingFullView() {
    const modal = document.getElementById("wqFullViewModal");
    if (modal) modal.style.display = "none";
    this.state.activeFullViewWqId = null;
  },

  toggleFullViewAnswer() {
    const solWrap = document.getElementById("wqFullViewSolutionWrap");
    const toggleBtn = document.getElementById("wqFullViewToggleAnsBtn");
    if (!solWrap || !toggleBtn) return;

    const isHidden = solWrap.classList.toggle("hidden");
    toggleBtn.innerHTML = `
      <i class="fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
      <span>${isHidden ? 'Show Solution' : 'Hide Solution'}</span>
    `;
  },

  resetAllData() {
    if (confirm("Reset database to factory defaults? Custom added MCQs will be cleared.")) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_MCQS);
      localStorage.removeItem("ICAI_MCQ_USER_DATA_V1");
      this.loadMCQs();
      alert("Database reset to original ICAI master bank.");
      this.switchTab("study");
    }
  }
};

window.App = App;

// Bootstrap application on window load
window.addEventListener("DOMContentLoaded", () => {
  App.init();

  // Remove any Netlify injected badge / floating banner
  const purgeNetlifyBadge = () => {
    const selectors = [
      '#netlify-badge',
      '.netlify-badge',
      '[id*="netlify-badge"]',
      '[class*="netlify-badge"]',
      '[class*="netlify-drawer"]',
      '[data-netlify-deploy-id]',
      'iframe[title*="Netlify"]',
      'iframe[src*="netlify"]',
      'div[class*="netlify-feedback"]',
      'a[href*="netlify.com"]'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  };

  purgeNetlifyBadge();
  setTimeout(purgeNetlifyBadge, 500);
  setTimeout(purgeNetlifyBadge, 1500);

  // Observer to catch any dynamically injected elements
  const netlifyObserver = new MutationObserver(() => {
    purgeNetlifyBadge();
  });
  netlifyObserver.observe(document.body, { childList: true, subtree: true });

  // Global close on backdrop click and Escape key for modal dialogs
  window.addEventListener("click", (e) => {
    if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) {
      e.target.style.display = "none";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop").forEach(m => {
        m.style.display = "none";
      });
    }
  });
});
