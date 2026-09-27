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
    repositoryFilter: {
      search: "",
      subject: "ALL",
      chapter: "ALL",
      source: "ALL",
      difficulty: "ALL"
    },
    writingFilter: {
      search: "",
      subject: "ALL",
      chapter: "ALL",
      source: "ALL"
    },
    practiceFilter: {
      subject: "ALL",
      source: "ALL",
      starredOnly: false,
      incorrectOnly: false
    }
  },

  init() {
    this.loadTheme();
    this.checkAuthStatus();
    this.loadMCQs();
    this.loadWritingQuestions();
    this.setupEventListeners();
    this.renderHeaderSubjects();
    this.populateModalSelects();
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
    let customItems = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_MCQS);
      if (stored) {
        customItems = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading custom MCQs", e);
    }

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

  formatMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/---/g, '<hr style="margin: 14px 0; border: none; border-top: 1px dashed var(--border-color);">');
  },

  switchTab(tabId) {
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
        dashboard: "Analytics & Performance Dashboard",
        repository: "Official ICAI MCQ Master Bank",
        writing: "Descriptive & Practical Writing Problems",
        practice: "Active Recall Practice Mode",
        exam: "Timed ICAI Exam Simulator (30 Marks)",
        cases: "Integrated Case Scenario Studies",
        mistakes: "Mistakes Notebook Drill",
        importer: "Add & Import Questions"
      };
      titleEl.textContent = titles[tabId] || "ICAI CA Final Portal";
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
        this.renderDashboard();
        break;
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
      case "importer":
        // Importer forms already in DOM
        break;
    }
  },

  // ---------------- DASHBOARD ----------------
  renderDashboard() {
    const metrics = MCQStats.computeDashboardMetrics(this.state.allMCQs);

    document.getElementById("statTotalMCQs").textContent = metrics.totalQuestions;
    document.getElementById("statAttempted").textContent = metrics.attemptedCount;
    document.getElementById("statAccuracy").textContent = `${metrics.accuracyRate}%`;
    document.getElementById("statMistakes").textContent = metrics.incorrectCount;
    document.getElementById("statStarred").textContent = metrics.starredCount;

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

  // ---------------- REPOSITORY (ALL MCQs) ----------------
  renderRepository() {
    const listEl = document.getElementById("repositoryList");
    const countEl = document.getElementById("repoFilteredCount");
    if (!listEl) return;

    const searchTerm = (this.state.repositoryFilter.search || "").toLowerCase().trim();
    const filterSub = this.state.repositoryFilter.subject;
    const filterCh = this.state.repositoryFilter.chapter || "ALL";
    const filterSrc = this.state.repositoryFilter.source;
    const filterDiff = this.state.repositoryFilter.difficulty;

    const filtered = this.state.allMCQs.filter(q => {
      if (filterSub !== "ALL" && q.subjectId !== filterSub) return false;
      if (filterCh !== "ALL" && q.chapter !== filterCh) return false;
      if (filterSrc !== "ALL" && q.source !== filterSrc) return false;
      if (filterDiff !== "ALL" && q.difficulty !== filterDiff) return false;

      if (searchTerm) {
        const inStem = (q.question || "").toLowerCase().includes(searchTerm);
        const inCh = (q.chapter || "").toLowerCase().includes(searchTerm);
        const inTitle = (q.title || "").toLowerCase().includes(searchTerm);
        const inScenario = (q.scenarioText || "").toLowerCase().includes(searchTerm);
        const inOpts = q.options ? q.options.some(o => (o.text || "").toLowerCase().includes(searchTerm)) : false;
        if (!inStem && !inCh && !inTitle && !inScenario && !inOpts) return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = `${filtered.length} MCQs found`;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-file-circle-question fa-3x"></i>
          <h3>No MCQs Match Your Filter</h3>
          <p>Try clearing filters or search keywords, or add new MCQs in the Add & Import section.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(q => {
      const isStarred = MCQStats.isStarred(q.id);
      const isCase = q.type === "case_scenario";

      const subMeta = typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.subjects.find(s => s.id === q.subjectId) : null;
      const srcMeta = typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.sources.find(s => s.id === q.source) : null;
      const isOfficialAttemptSource = ["RTP", "MTP", "PYQ"].includes(q.source);

      return `
        <div class="mcq-card ${isCase ? 'case-card' : ''}" id="card-${q.id}">
          <div class="mcq-card-header">
            <div class="tags-group">
              <span class="badge" style="background-color: ${subMeta ? subMeta.color : '#2563eb'}; color: white;">
                ${q.subjectId}
              </span>
              <span class="badge badge-source" style="background-color: ${srcMeta ? srcMeta.badgeColor : '#64748b'}; color: white;">
                ${srcMeta ? srcMeta.label : q.source}
              </span>
              ${isOfficialAttemptSource ? `
                <span class="badge badge-attempt" title="ICAI Exam Attempt / Edition">
                  <i class="fa-regular fa-calendar-check"></i> ${q.examSession || 'Session Specified'}
                </span>
              ` : `
                <span class="badge badge-outline" title="Edition / Source Detail">
                  <i class="fa-solid fa-book"></i> ${q.examSession || 'ICAI Edition'}
                </span>
              `}
              <span class="badge badge-marks">${q.marks || 2} Marks</span>
              ${isCase ? `<span class="badge badge-case"><i class="fa-solid fa-layer-group"></i> Case Scenario (${q.subQuestions ? q.subQuestions.length : 0} MCQs)</span>` : ''}
            </div>
            <div class="card-actions">
              <button class="icon-btn star-btn ${isStarred ? 'starred' : ''}" onclick="App.handleToggleStar('${q.id}')" title="Star / Bookmark">
                <i class="fa-${isStarred ? 'solid' : 'regular'} fa-star"></i>
              </button>
              <button class="icon-btn delete-btn" onclick="App.deleteMCQ('${q.id}')" title="Delete MCQ">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div class="mcq-chapter-title">
            <i class="fa-regular fa-bookmark"></i> ${q.chapter || 'General Topic'}
          </div>

          ${isCase ? `
            <div class="case-header-box">
              <h4 class="case-title">${q.title || 'Integrated Case Study'}</h4>
              <p class="case-preview">${(q.scenarioText || '').substring(0, 220)}...</p>
              <button class="btn btn-sm btn-secondary" onclick="App.openCaseStudy('${q.id}')">
                <i class="fa-solid fa-book-open"></i> Read Full Case & Solve Sub-MCQs
              </button>
            </div>
          ` : `
            <div class="mcq-stem">${q.question}</div>
            <div class="mcq-options-grid">
              ${(q.options || []).map(opt => `
                <div class="mcq-option-item ${opt.id === q.correctAnswer ? 'repo-correct' : ''}">
                  <span class="option-letter">${opt.id}</span>
                  <span class="option-text">${opt.text}</span>
                </div>
              `).join("")}
            </div>

            <details class="mcq-explanation-collapsible">
              <summary><i class="fa-solid fa-lightbulb"></i> View ICAI Statutory Rationale & Reference</summary>
              <div class="explanation-content">
                <p><strong>Correct Option: (${q.correctAnswer})</strong></p>
                <p>${q.explanation || 'No explanation provided.'}</p>
                ${q.reference ? `<p class="reference-tag"><i class="fa-solid fa-book-bookmark"></i> Reference: ${q.reference}</p>` : ''}
              </div>
            </details>
          `}
        </div>
      `;
    }).join("");
  },

  handleToggleStar(qId) {
    MCQStats.toggleStar(qId);
    this.renderCurrentView();
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
    const userNote = MCQStats.getNote(currentQ.id);

    practiceView.innerHTML = `
      <div class="practice-card">
        <div class="practice-top-bar">
          <div class="practice-progress-info">
            <span class="badge badge-primary">Question ${currentIdx + 1} of ${totalQ}</span>
            <span class="badge badge-source">${currentQ.source} • ${currentQ.examSession || ''}</span>
            <span class="badge badge-marks">${currentQ.marks || 2} Marks</span>
            <span class="badge badge-chapter"><i class="fa-regular fa-bookmark"></i> ${currentQ.chapter}</span>
          </div>
          <div class="practice-actions">
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

    const caseScenarios = this.state.allMCQs.filter(q => q.type === "case_scenario");

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
        App.state.repositoryFilter.subject = val;
        App.state.practiceFilter.subject = val;
        const repoSub = document.getElementById("repoSubjectFilter");
        if (repoSub) repoSub.value = val;
        App.renderCurrentView();
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

    // Single MCQ Form Submission
    const singleForm = document.getElementById("addSingleMCQForm");
    if (singleForm) {
      singleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        App.handleAddSingleMCQ();
      });
    }

    // Case Scenario Form Submission
    const caseForm = document.getElementById("addCaseScenarioForm");
    if (caseForm) {
      caseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        App.handleAddCaseScenario();
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

  handleAddSingleMCQ() {
    const subjectId = document.getElementById("modalSubjectSelect").value;
    const chapter = document.getElementById("modalChapterSelect").value;
    const source = document.getElementById("modalSourceSelect").value;
    const examSession = document.getElementById("modalExamSession").value || "General";
    const marks = parseInt(document.getElementById("modalMarks").value) || 2;
    const difficulty = document.getElementById("modalDifficulty").value || "Medium";
    const questionText = document.getElementById("modalQuestionText").value.trim();
    const optA = document.getElementById("modalOptA").value.trim();
    const optB = document.getElementById("modalOptB").value.trim();
    const optC = document.getElementById("modalOptC").value.trim();
    const optD = document.getElementById("modalOptD").value.trim();
    const correctOpt = document.getElementById("modalCorrectAnswer").value;
    const explanation = document.getElementById("modalExplanation").value.trim();
    const reference = document.getElementById("modalReference").value.trim();

    if (!questionText || !optA || !optB || !optC || !optD) {
      alert("Please fill in question text and all 4 options.");
      return;
    }

    const newMCQ = {
      id: `${subjectId}-${Date.now().toString(36).toUpperCase()}`,
      subjectId,
      chapter,
      source,
      examSession,
      type: "standalone",
      marks,
      difficulty,
      question: questionText,
      options: [
        { id: "A", text: optA },
        { id: "B", text: optB },
        { id: "C", text: optC },
        { id: "D", text: optD }
      ],
      correctAnswer: correctOpt,
      explanation,
      reference,
      createdAt: new Date().toISOString()
    };

    this.saveCustomMCQ(newMCQ);
    alert("MCQ saved successfully to your database!");
    document.getElementById("addSingleMCQForm").reset();
    this.switchTab("repository");
  },

  handleAddCaseScenario() {
    const subjectId = document.getElementById("caseSubjectSelect").value;
    const source = document.getElementById("caseSourceSelect").value;
    const title = document.getElementById("caseTitleInput").value.trim();
    const scenarioText = document.getElementById("caseNarrativeInput").value.trim();
    const rawSubQuestions = document.getElementById("caseSubQInput").value.trim();

    if (!title || !scenarioText || !rawSubQuestions) {
      alert("Please fill in Title, Case Narrative, and at least one sub-question.");
      return;
    }

    // Parse sub-questions using MCQImporter
    const parsedSub = MCQImporter.parseRawText(rawSubQuestions, subjectId, source);

    if (parsedSub.length === 0) {
      alert("Could not parse sub-questions. Please format with options (A, B, C, D) and Answer: X.");
      return;
    }

    const caseId = `CASE-${Date.now().toString(36).toUpperCase()}`;
    const subQuestionsFormatted = parsedSub.map((sq, i) => ({
      subId: `${caseId}-Q${i + 1}`,
      question: sq.question,
      options: sq.options,
      correctAnswer: sq.correctAnswer,
      explanation: sq.explanation,
      marks: sq.marks || 2
    }));

    const newCase = {
      id: caseId,
      subjectId,
      chapter: "Integrated Case Study",
      source,
      examSession: "General",
      type: "case_scenario",
      title,
      scenarioText,
      subQuestions: subQuestionsFormatted,
      createdAt: new Date().toISOString()
    };

    this.saveCustomMCQ(newCase);
    alert(`Case study with ${subQuestionsFormatted.length} MCQs added successfully!`);
    document.getElementById("addCaseScenarioForm").reset();
    this.switchTab("cases");
  },

  // Batch Raw Text Import
  handleRawImport() {
    const rawText = document.getElementById("rawImportTextarea").value;
    const subjectId = document.getElementById("rawImportSubject").value;
    const source = document.getElementById("rawImportSource").value;
    const session = document.getElementById("rawImportSession").value;

    if (!rawText.trim()) {
      alert("Please paste text to import.");
      return;
    }

    const parsed = MCQImporter.parseRawText(rawText, subjectId, source, session);

    if (parsed.length === 0) {
      alert("No questions could be identified. Make sure each question has 1., options (a)-(d), and Answer: line.");
      return;
    }

    parsed.forEach(mcq => this.saveCustomMCQ(mcq));
    alert(`Success! Imported ${parsed.length} MCQs directly into your repository.`);
    document.getElementById("rawImportTextarea").value = "";
    this.switchTab("repository");
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
        this.switchTab("dashboard");
      }, 400);
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
    const password = document.getElementById("regPassword").value;

    try {
      const newUser = await Auth.register({ name, regNo, phone, email, dob, attempt, password });
      
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

  // ================= STUDY MANAGEMENT CONTROLLER =================
  renderStudyView() {
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

    const titleEl = document.getElementById("studyTargetAttemptTitle");
    const dateTextEl = document.getElementById("studyTargetDateText");
    const daysEl = document.getElementById("countdownDays");
    const weeksEl = document.getElementById("countdownWeeks");

    if (titleEl) titleEl.textContent = `CA Final ${attempt} Attempt`;
    if (dateTextEl && countdown.targetDate) {
      dateTextEl.textContent = `Target Exam Window: ${countdown.targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
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

    const settings = StudyEngine.loadPomodoroSettings();
    const todayCount = StudyEngine.getPomodoroTotalToday();
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

        return `
          <div class="calendar-day-cell ${customClass}" title="${d.holiday ? d.holiday.name + ': ' + d.holiday.desc : ''}">
            <span>${d.dayNumber}</span>
            ${d.holiday ? `<span class="festival-dot">${d.holiday.name}</span>` : ''}
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

  // Chapter & Lecture Tracker (Custom Faculty Lecture Count, Recorded/Live Modes, Revisions)
  renderChapterTracker() {
    const tabsContainer = document.getElementById("subjectTrackerTabs");
    const summaryContainer = document.getElementById("activeSubSummary");
    const tableBody = document.getElementById("chapterTrackerTableBody");
    const readinessEl = document.getElementById("trackerOverallReadiness");

    const metrics = StudyEngine.computeSyllabusMetrics();
    if (readinessEl) readinessEl.textContent = `${metrics.overallReadiness}%`;

    const subjects = typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.subjects : [];
    const activeSub = this.state.activeTrackerSubject || "FR";

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
    const curMetrics = metrics.subjectMetrics[activeSub] || { totalLectures: 0, completedLectures: 0, lecturePct: 0, r1Pct: 0, r2Pct: 0, r3Pct: 0, readinessPct: 0 };

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div>
          <h4 style="font-size: 1rem; margin-bottom: 2px;">${currentSubMeta.paper}: ${currentSubMeta.name}</h4>
          <small class="text-muted">Lectures Completed: ${curMetrics.completedLectures} / ${curMetrics.totalLectures} (${curMetrics.lecturePct}%)</small>
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
        tableBody.innerHTML = defaultChapters.map(ch => {
          const prog = chProgress[ch.id] || { 
            completedLectures: 0, 
            totalLectures: ch.totalLectures || 10, 
            deliveryMode: 'recorded', 
            liveCompleted: false, 
            lectureDone: false, 
            r1Done: false, 
            r2Done: false, 
            r3Done: false 
          };
          const isLive = prog.deliveryMode === 'live';
          const isRecDone = prog.completedLectures >= prog.totalLectures;
          const escapedName = (ch.name || '').replace(/'/g, "\\'");

          return `
            <tr>
              <td>
                <div style="font-weight: 600; font-size: 0.9rem;">${ch.name}</div>
                <small class="text-muted"><i class="fa-solid fa-chart-simple"></i> ICAI Weightage: ${ch.defaultWeightage || 'Standard'}</small>
              </td>
              <td style="text-align: center;">
                <div class="batch-mode-toggle">
                  <button type="button" class="batch-toggle-pill ${!isLive ? 'active' : ''}" onclick="App.handleDeliveryModeChange('${activeSub}', '${ch.id}', 'recorded')" title="Recorded Lectures Mode">
                    <i class="fa-solid fa-video"></i> Rec
                  </button>
                  <button type="button" class="batch-toggle-pill ${isLive ? 'active' : ''}" onclick="App.handleDeliveryModeChange('${activeSub}', '${ch.id}', 'live')" title="Live Batch Mode">
                    <i class="fa-solid fa-satellite-dish"></i> Live
                  </button>
                </div>
              </td>
              <td style="text-align: center;">
                ${isLive ? `
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <button type="button" class="live-done-btn ${prog.liveCompleted ? 'completed' : ''}" onclick="App.handleLiveToggle('${activeSub}', '${ch.id}')" title="Click to toggle Live batch completion">
                      <i class="fa-solid ${prog.liveCompleted ? 'fa-circle-check' : 'fa-circle'}"></i> ${prog.liveCompleted ? 'Live Batch Done' : 'Mark Live Done'}
                    </button>
                    <small class="text-muted" style="font-size: 0.72rem;">Live Streaming / Physical</small>
                  </div>
                ` : `
                  <div class="recorded-tracking-container">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                      <div class="lecture-stepper">
                        <button type="button" class="stepper-btn" onclick="App.handleLectureStep('${activeSub}', '${ch.id}', -1)" title="Decrement Lecture" ${prog.completedLectures <= 0 ? 'disabled' : ''}>-</button>
                        <span class="stepper-text">${prog.completedLectures} / ${prog.totalLectures}</span>
                        <button type="button" class="stepper-btn" onclick="App.handleLectureStep('${activeSub}', '${ch.id}', 1)" title="Increment Lecture" ${prog.completedLectures >= prog.totalLectures ? 'disabled' : ''}>+</button>
                      </div>
                      <button type="button" class="lecture-edit-btn" onclick="App.openEditLectureModal('${activeSub}', '${ch.id}', '${escapedName}', ${prog.totalLectures})" title="Change faculty total lectures">
                        <i class="fa-solid fa-pen"></i> Total: ${prog.totalLectures}
                      </button>
                    </div>
                    <div style="margin-top: 6px; display: flex; align-items: center; justify-content: center;">
                      <button type="button" class="stepper-quick-done-btn ${isRecDone ? 'done' : ''}" onclick="App.handleMarkChapterComplete('${activeSub}', '${ch.id}')" title="Mark all lectures watched">
                        <i class="fa-solid ${isRecDone ? 'fa-check-double' : 'fa-check'}"></i> ${isRecDone ? 'All Watched' : 'Mark All Done'}
                      </button>
                    </div>
                  </div>
                `}
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

  handleLectureStep(subId, chId, delta) {
    StudyEngine.updateLectureCount(subId, chId, delta);
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  handleDeliveryModeChange(subId, chId, mode) {
    StudyEngine.setDeliveryMode(subId, chId, mode);
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  handleLiveToggle(subId, chId) {
    StudyEngine.toggleLiveCompletion(subId, chId);
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  handleMarkChapterComplete(subId, chId) {
    StudyEngine.markChapterLecturesComplete(subId, chId);
    this.renderChapterTracker();
    this.renderComparisonAnalytics();
  },

  handleRevisionToggle(subId, chId, stage) {
    StudyEngine.toggleRevision(subId, chId, stage);
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

  renderWritingQuestions() {
    const listEl = document.getElementById("writingQuestionsList");
    const countEl = document.getElementById("writingFilteredCount");
    const subFilter = document.getElementById("writingSubjectFilter");
    const srcFilter = document.getElementById("writingSourceFilter");
    const searchInput = document.getElementById("writingSearchInput");

    if (!listEl) return;

    // Populate dropdowns once if empty
    if (subFilter && subFilter.children.length <= 1 && typeof ICAI_METADATA !== "undefined") {
      subFilter.innerHTML = '<option value="ALL">All Subjects</option>';
      ICAI_METADATA.subjects.forEach(s => {
        subFilter.innerHTML += `<option value="${s.id}">${s.paper}: ${s.name}</option>`;
      });
      subFilter.addEventListener("change", (e) => {
        App.state.writingFilter.subject = e.target.value;
        App.state.writingFilter.chapter = "ALL";
        App.updateChapterFilterDropdown("writingChapterFilter", e.target.value);
        App.renderWritingQuestions();
      });
    }

    const chFilter = document.getElementById("writingChapterFilter");
    if (chFilter && !chFilter.dataset.hasListener) {
      chFilter.dataset.hasListener = "true";
      chFilter.addEventListener("change", (e) => {
        App.state.writingFilter.chapter = e.target.value;
        App.renderWritingQuestions();
      });
    }

    if (srcFilter && srcFilter.children.length <= 1) {
      srcFilter.innerHTML = `
        <option value="ALL">All Sources (SM, RTP, MTP, PYQ)</option>
        <option value="RTP">Revision Test Paper (RTP)</option>
        <option value="MTP">Mock Test Paper (MTP)</option>
        <option value="PYQ">Past Year Question (PYQ)</option>
        <option value="SM">Study Material (SM)</option>
      `;
      srcFilter.addEventListener("change", (e) => {
        App.state.writingFilter.source = e.target.value;
        App.renderWritingQuestions();
      });
    }

    if (searchInput && !searchInput.dataset.hasListener) {
      searchInput.dataset.hasListener = "true";
      searchInput.addEventListener("input", (e) => {
        App.state.writingFilter.search = e.target.value;
        App.renderWritingQuestions();
      });
    }

    const searchTerm = (this.state.writingFilter.search || "").toLowerCase().trim();
    const fSub = this.state.writingFilter.subject;
    const fCh = this.state.writingFilter.chapter || "ALL";
    const fSrc = this.state.writingFilter.source;

    const filtered = this.state.allWritingQuestions.filter(q => {
      if (fSub !== "ALL" && q.subjectId !== fSub) return false;
      if (fCh !== "ALL" && q.chapter !== fCh) return false;
      if (fSrc !== "ALL" && q.source !== fSrc) return false;
      if (searchTerm) {
        const inTitle = (q.title || "").toLowerCase().includes(searchTerm);
        const inCh = (q.chapter || "").toLowerCase().includes(searchTerm);
        const inQ = (q.question || "").toLowerCase().includes(searchTerm);
        if (!inTitle && !inCh && !inQ) return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = `${filtered.length} Descriptive Questions found`;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-file-pen fa-3x"></i>
          <h3>No Descriptive Questions Found</h3>
          <p>Try clearing your filters or click "Add Writing Question" to add new practical questions.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(wq => {
      const subMeta = typeof ICAI_METADATA !== "undefined" ? ICAI_METADATA.subjects.find(s => s.id === wq.subjectId) : null;
      const isOfficialAttemptSource = ["RTP", "MTP", "PYQ"].includes(wq.source);

      return `
        <div class="writing-question-card" id="wq-${wq.id}">
          <div class="wq-header">
            <div class="tags-group">
              <span class="badge" style="background-color: ${subMeta ? subMeta.color : '#2563eb'}; color: white;">
                ${wq.subjectId}
              </span>
              <span class="badge badge-source" style="background-color: #8b5cf6; color: white;">
                ${wq.source === 'RTP' ? 'RTP' : wq.source === 'MTP' ? 'MTP' : wq.source === 'PYQ' ? 'Past Exam (PYQ)' : 'Study Material'}
              </span>
              ${isOfficialAttemptSource ? `
                <span class="badge badge-attempt" title="ICAI Exam Attempt / Edition">
                  <i class="fa-regular fa-calendar-check"></i> ${wq.examSession || 'Session Specified'}
                </span>
              ` : `
                <span class="badge badge-outline" title="Study Material Edition">
                  <i class="fa-solid fa-book"></i> ${wq.examSession || 'ICAI Edition'}
                </span>
              `}
              <span class="badge badge-marks">${wq.marks || 8} Marks</span>
              <span class="badge badge-outline"><i class="fa-regular fa-bookmark"></i> ${wq.chapter || 'Practical Question'}</span>
            </div>
          </div>

          <h3 class="wq-title">${wq.title || 'Practical Descriptive Problem'}</h3>

          <div class="wq-stem">${App.formatMarkdown(wq.question)}</div>

          <details class="wq-solution-collapsible">
            <summary><i class="fa-solid fa-graduation-cap"></i> View ICAI Suggested Model Solution & Detailed Working Notes</summary>
            <div class="wq-solution-content">
              ${App.formatMarkdown(wq.solution)}
              ${wq.reference ? `<p class="reference-tag" style="margin-top: 14px;"><i class="fa-solid fa-book-bookmark"></i> <strong>Statutory Reference:</strong> ${wq.reference}</p>` : ''}
            </div>
          </details>
        </div>
      `;
    }).join("");
  },

  openAddWritingModal() {
    const subSel = document.getElementById("wqSubject");

    if (subSel && typeof ICAI_METADATA !== "undefined") {
      subSel.innerHTML = "";
      ICAI_METADATA.subjects.forEach(s => {
        subSel.innerHTML += `<option value="${s.id}">${s.paper}: ${s.name}</option>`;
      });
      subSel.onchange = (e) => this.updateChapterDropdown("wqChapter", e.target.value);
      this.updateChapterDropdown("wqChapter", subSel.value || "FR");
    }

    const modal = document.getElementById("addWritingQuestionModal");
    if (modal) modal.style.display = "flex";
  },

  closeAddWritingModal() {
    const modal = document.getElementById("addWritingQuestionModal");
    if (modal) modal.style.display = "none";
  },

  handleAddWritingQuestion(event) {
    if (event) event.preventDefault();
    const subjectId = document.getElementById("wqSubject").value;
    const chapter = document.getElementById("wqChapter").value;
    const source = document.getElementById("wqSource").value;
    const examSession = document.getElementById("wqExamSession").value || "Nov 2024";
    const marks = parseInt(document.getElementById("wqMarks").value) || 8;
    const title = document.getElementById("wqTitle").value.trim();
    const question = document.getElementById("wqQuestionText").value.trim();
    const solution = document.getElementById("wqSolutionText").value.trim();
    const reference = document.getElementById("wqReference").value.trim();

    if (!title || !question || !solution) {
      alert("Please fill in Question Title, Problem Statement, and Model Solution.");
      return;
    }

    const newWQ = {
      id: `${subjectId}-WQ-${Date.now().toString(36).toUpperCase()}`,
      subjectId,
      chapter,
      source,
      examSession,
      marks,
      title,
      question,
      solution,
      reference,
      createdAt: new Date().toISOString()
    };

    this.saveWritingQuestion(newWQ);
    alert("Descriptive writing question saved successfully!");
    this.closeAddWritingModal();
    document.getElementById("addWritingQuestionForm").reset();
    this.renderWritingQuestions();
  },

  resetAllData() {
    if (confirm("Reset database to factory defaults? Custom added MCQs will be cleared.")) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_MCQS);
      localStorage.removeItem("ICAI_MCQ_USER_DATA_V1");
      this.loadMCQs();
      alert("Database reset to original ICAI master bank.");
      this.switchTab("dashboard");
    }
  }
};

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
});
