/**
 * Study Management Engine
 * Features:
 * 1. Remaining Days to Exam Countdown & Indian Calendar
 * 2. Focus Pomodoro Timer with Timestamped Logging & Customizable Settings
 * 3. Daily Goals / Tasks with Historical Comparison (Today vs Yesterday vs Week vs Month)
 * 4. Chapter & Lecture Tracker with Faculty Customization, Live vs Recorded Modes, and R1/R2/R3 Revisions
 */

const StudyEngine = {
  // Pomodoro State
  pomodoro: {
    mode: "study", // study, short_break, long_break
    remainingSeconds: 25 * 60,
    isRunning: false,
    timerInterval: null,
    sessionsCompleted: 0,
    dailyTarget: 8,
    currentSubject: "FR",
    customMinutes: {
      study: 25,
      short_break: 5,
      long_break: 15
    }
  },

  // Calendar State
  calendar: {
    currentYear: 2026,
    currentMonth: 8 // 0-indexed (8 = September)
  },

  getStoragePrefix() {
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    return user ? user.regNo : "GUEST";
  },

  init() {
    this.loadPomodoroSettings();
  },

  // ---------------- EXAM CATEGORY (GROUP 1 / GROUP 2 / BOTH GROUPS) ----------------
  getSelectedExamGroup() {
    const key = `ICAI_SELECTED_EXAM_GROUP_${this.getStoragePrefix()}`;
    const saved = localStorage.getItem(key);
    if (saved && ["G1", "G2", "BOTH"].includes(saved)) return saved;
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    if (user && user.examGroup && ["G1", "G2", "BOTH"].includes(user.examGroup)) {
      return user.examGroup;
    }
    return "BOTH";
  },

  setSelectedExamGroup(group) {
    const valid = ["G1", "G2", "BOTH"].includes(group) ? group : "BOTH";
    const key = `ICAI_SELECTED_EXAM_GROUP_${this.getStoragePrefix()}`;
    localStorage.setItem(key, valid);

    if (typeof Auth !== 'undefined') {
      const user = Auth.getCurrentUser();
      if (user) {
        user.examGroup = valid;
        Auth.setCurrentUser(user);
      }
    }
    return valid;
  },

  getGroupSubjects(group = null) {
    const grp = group || this.getSelectedExamGroup();
    if (grp === "G1") return ["FR", "AFM", "AUDIT"];
    if (grp === "G2") return ["DT", "IDT", "IBS"];
    return ["FR", "AFM", "AUDIT", "DT", "IDT", "IBS"];
  },

  getGroupInfo(group = null) {
    const grp = group || this.getSelectedExamGroup();
    if (grp === "G1") {
      return {
        id: "G1",
        name: "Group 1",
        label: "Group 1 (Papers 1, 2 & 3)",
        desc: "Paper 1 (FR) + Paper 2 (AFM) + Paper 3 (AUDIT)",
        papersCount: 3,
        subjects: ["FR", "AFM", "AUDIT"]
      };
    }
    if (grp === "G2") {
      return {
        id: "G2",
        name: "Group 2",
        label: "Group 2 (Papers 4, 5 & 6)",
        desc: "Paper 4 (DT) + Paper 5 (IDT) + Paper 6 (IBS)",
        papersCount: 3,
        subjects: ["DT", "IDT", "IBS"]
      };
    }
    return {
      id: "BOTH",
      name: "Both Groups",
      label: "Both Groups (All 6 Papers)",
      desc: "Group 1 (FR, AFM, AUDIT) + Group 2 (DT, IDT, IBS)",
      papersCount: 6,
      subjects: ["FR", "AFM", "AUDIT", "DT", "IDT", "IBS"]
    };
  },

  // ---------------- REMAINING DAYS TO EXAM ----------------
  getTargetExamDate() {
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    const attempt = user ? user.attempt : "Nov 2026";

    // Saved custom exam date override if any
    const savedCustomDate = localStorage.getItem(`ICAI_CUSTOM_EXAM_DATE_${this.getStoragePrefix()}`);
    if (savedCustomDate) return new Date(savedCustomDate);

    // Standard ICAI dates
    if (attempt && attempt.includes("Nov 2026")) return new Date("2026-11-01T09:00:00");
    if (attempt && attempt.includes("May 2027")) return new Date("2027-05-02T09:00:00");
    if (attempt && attempt.includes("Nov 2027")) return new Date("2027-11-01T09:00:00");
    if (attempt && attempt.includes("May 2028")) return new Date("2028-05-02T09:00:00");
    if (attempt && attempt.includes("Nov 2028")) return new Date("2028-11-01T09:00:00");
    if (attempt && attempt.includes("May 2029")) return new Date("2029-05-02T09:00:00");

    return new Date("2026-11-01T09:00:00");
  },

  calculateRemainingDays() {
    const target = this.getTargetExamDate();
    const now = new Date();
    const diffMs = target - now;

    if (diffMs <= 0) {
      return { totalDays: 0, weeks: 0, remainingDaysAfterWeeks: 0, isPast: true, targetDate: target };
    }

    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDaysAfterWeeks = totalDays % 7;

    return { totalDays, weeks, remainingDaysAfterWeeks, isPast: false, targetDate: target };
  },

  // ---------------- CHAPTER & LECTURE TRACKER ----------------
  getStudyProgress() {
    const key = `ICAI_CHAPTER_PROGRESS_${this.getStoragePrefix()}`;
    let storedProgress = {};
    try {
      const stored = localStorage.getItem(key);
      if (stored) storedProgress = JSON.parse(stored);
    } catch (e) {
      console.error("Error reading study progress", e);
    }

    // Merge defaults from STUDY_CHAPTERS_DATA with user overrides
    const initial = {};
    if (typeof STUDY_CHAPTERS_DATA !== 'undefined') {
      Object.entries(STUDY_CHAPTERS_DATA).forEach(([subId, chapters]) => {
        initial[subId] = {};
        const savedSub = storedProgress[subId] || {};

        chapters.forEach(ch => {
          const savedCh = savedSub[ch.id] || {};
          initial[subId][ch.id] = {
            completedLectures: typeof savedCh.completedLectures === 'number' ? savedCh.completedLectures : 0,
            totalLectures: typeof savedCh.totalLectures === 'number' ? savedCh.totalLectures : (ch.totalLectures || 10),
            deliveryMode: savedCh.deliveryMode || "recorded", // "recorded" or "live"
            liveCompleted: Boolean(savedCh.liveCompleted),
            lectureDone: Boolean(savedCh.lectureDone),
            r1Done: Boolean(savedCh.r1Done),
            r2Done: Boolean(savedCh.r2Done),
            r3Done: Boolean(savedCh.r3Done),
            notes: savedCh.notes || ""
          };

          // Synchronize lectureDone flag
          if (initial[subId][ch.id].deliveryMode === "live") {
            initial[subId][ch.id].lectureDone = Boolean(initial[subId][ch.id].liveCompleted);
          } else {
            initial[subId][ch.id].lectureDone = (initial[subId][ch.id].completedLectures >= initial[subId][ch.id].totalLectures);
          }
        });
      });
    }
    return initial;
  },

  saveStudyProgress(data) {
    const key = `ICAI_CHAPTER_PROGRESS_${this.getStoragePrefix()}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving study progress", e);
    }
  },

  setDeliveryMode(subjectId, chapterId, mode) {
    const progress = this.getStudyProgress();
    if (!progress[subjectId] || !progress[subjectId][chapterId]) return;

    const ch = progress[subjectId][chapterId];
    ch.deliveryMode = mode === "live" ? "live" : "recorded";
    if (ch.deliveryMode === "live") {
      ch.lectureDone = Boolean(ch.liveCompleted);
      if (ch.liveCompleted) ch.completedLectures = ch.totalLectures;
    } else {
      ch.lectureDone = (ch.completedLectures >= ch.totalLectures);
    }

    this.saveStudyProgress(progress);
    return ch;
  },

  toggleLiveCompletion(subjectId, chapterId) {
    const progress = this.getStudyProgress();
    if (!progress[subjectId] || !progress[subjectId][chapterId]) return;

    const ch = progress[subjectId][chapterId];
    ch.liveCompleted = !ch.liveCompleted;
    if (ch.liveCompleted) {
      ch.completedLectures = ch.totalLectures;
      ch.lectureDone = true;
    } else {
      ch.completedLectures = 0;
      ch.lectureDone = false;
    }

    this.saveStudyProgress(progress);
    return ch;
  },

  markChapterLecturesComplete(subjectId, chapterId) {
    const progress = this.getStudyProgress();
    if (!progress[subjectId] || !progress[subjectId][chapterId]) return;

    const ch = progress[subjectId][chapterId];
    if (ch.completedLectures >= ch.totalLectures) {
      ch.completedLectures = 0;
      ch.lectureDone = false;
      ch.liveCompleted = false;
    } else {
      ch.completedLectures = ch.totalLectures;
      ch.lectureDone = true;
      ch.liveCompleted = true;
    }

    this.saveStudyProgress(progress);
    return ch;
  },

  toggleChapterLecture(subjectId, chapterId) {
    const progress = this.getStudyProgress();
    if (!progress[subjectId] || !progress[subjectId][chapterId]) return;

    const ch = progress[subjectId][chapterId];
    ch.lectureDone = !ch.lectureDone;
    ch.completedLectures = ch.lectureDone ? 1 : 0;
    ch.totalLectures = 1;

    this.saveStudyProgress(progress);
    return ch;
  },

  updateLectureCount(subjectId, chapterId, delta) {
    const progress = this.getStudyProgress();
    if (!progress[subjectId] || !progress[subjectId][chapterId]) return;

    const ch = progress[subjectId][chapterId];
    ch.completedLectures = Math.max(0, Math.min(ch.totalLectures, ch.completedLectures + delta));
    ch.lectureDone = (ch.completedLectures >= ch.totalLectures);

    this.saveStudyProgress(progress);
    return ch;
  },

  setLectureTotal(subjectId, chapterId, newTotal) {
    const progress = this.getStudyProgress();
    if (!progress[subjectId] || !progress[subjectId][chapterId]) return;

    const ch = progress[subjectId][chapterId];
    ch.totalLectures = Math.max(1, parseInt(newTotal) || 1);
    ch.completedLectures = Math.min(ch.completedLectures, ch.totalLectures);
    ch.lectureDone = (ch.completedLectures >= ch.totalLectures);

    this.saveStudyProgress(progress);
    return ch;
  },

  toggleRevision(subjectId, chapterId, revisionStage) {
    const progress = this.getStudyProgress();
    if (!progress[subjectId] || !progress[subjectId][chapterId]) return;

    const ch = progress[subjectId][chapterId];
    const key = `${revisionStage}Done`;
    ch[key] = !ch[key];

    this.saveStudyProgress(progress);
    return ch;
  },

  computeSyllabusMetrics(selectedGroup = null) {
    const activeGroup = selectedGroup || this.getSelectedExamGroup();
    const allowedSubjects = this.getGroupSubjects(activeGroup);
    const progress = this.getStudyProgress();

    let totalChapters = 0;
    let completedLecturesGlobal = 0;
    let r1Count = 0;
    let r2Count = 0;
    let r3Count = 0;

    const subjectMetrics = {};

    Object.entries(progress).forEach(([subId, chapters]) => {
      let subChCount = 0;
      let subLecturesDone = 0;
      let subR1 = 0;
      let subR2 = 0;
      let subR3 = 0;

      const isSubInGroup = allowedSubjects.includes(subId);

      Object.values(chapters).forEach(c => {
        subChCount++;
        if (isSubInGroup) {
          totalChapters++;
        }

        const isDone = Boolean(c.lectureDone);
        if (isDone) {
          subLecturesDone++;
          if (isSubInGroup) {
            completedLecturesGlobal++;
          }
        }

        if (c.r1Done) {
          subR1++;
          if (isSubInGroup) r1Count++;
        }
        if (c.r2Done) {
          subR2++;
          if (isSubInGroup) r2Count++;
        }
        if (c.r3Done) {
          subR3++;
          if (isSubInGroup) r3Count++;
        }
      });

      const lecturePct = subChCount > 0 ? Math.round((subLecturesDone / subChCount) * 100) : 0;
      const r1Pct = subChCount > 0 ? Math.round((subR1 / subChCount) * 100) : 0;
      const r2Pct = subChCount > 0 ? Math.round((subR2 / subChCount) * 100) : 0;
      const r3Pct = subChCount > 0 ? Math.round((subR3 / subChCount) * 100) : 0;

      // Combined readiness score: Lectures 40%, R1 25%, R2 20%, R3 15%
      const readinessPct = Math.round((lecturePct * 0.4) + (r1Pct * 0.25) + (r2Pct * 0.2) + (r3Pct * 0.15));

      subjectMetrics[subId] = {
        totalChapters: subChCount,
        totalLectures: subChCount,
        completedLectures: subLecturesDone,
        lecturePct,
        r1Count: subR1,
        r1Pct,
        r2Count: subR2,
        r2Pct,
        r3Count: subR3,
        r3Pct,
        readinessPct,
        isInSelectedGroup: isSubInGroup
      };
    });

    const totalLecturesGlobal = totalChapters;
    const overallLecturePct = totalLecturesGlobal > 0 ? Math.round((completedLecturesGlobal / totalLecturesGlobal) * 100) : 0;
    const overallR1Pct = totalChapters > 0 ? Math.round((r1Count / totalChapters) * 100) : 0;
    const overallR2Pct = totalChapters > 0 ? Math.round((r2Count / totalChapters) * 100) : 0;
    const overallR3Pct = totalChapters > 0 ? Math.round((r3Count / totalChapters) * 100) : 0;
    const overallReadiness = Math.round((overallLecturePct * 0.4) + (overallR1Pct * 0.25) + (overallR2Pct * 0.2) + (overallR3Pct * 0.15));

    return {
      selectedGroup: activeGroup,
      groupInfo: this.getGroupInfo(activeGroup),
      allowedSubjects,
      totalPapers: allowedSubjects.length,
      totalChapters,
      totalLecturesGlobal,
      completedLecturesGlobal,
      overallLecturePct,
      r1Count,
      overallR1Pct,
      r2Count,
      overallR2Pct,
      r3Count,
      overallR3Pct,
      overallReadiness,
      subjectMetrics
    };
  },

  // ---------------- POMODORO TIMER ----------------
  loadPomodoroSettings() {
    const key = `ICAI_POMO_SETTINGS_${this.getStoragePrefix()}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const s = JSON.parse(stored);
        this.pomodoro.customMinutes.study = parseInt(s.study) || 25;
        this.pomodoro.customMinutes.short_break = parseInt(s.short_break) || 5;
        this.pomodoro.customMinutes.long_break = parseInt(s.long_break) || 15;
        this.pomodoro.dailyTarget = parseInt(s.dailyTarget) || 8;
        this.pomodoro.currentSubject = s.currentSubject || "FR";
      }
    } catch (e) {}

    if (!this.pomodoro.isRunning) {
      const mins = this.pomodoro.customMinutes[this.pomodoro.mode] || 25;
      this.pomodoro.remainingSeconds = mins * 60;
    }

    return {
      study: this.pomodoro.customMinutes.study,
      short_break: this.pomodoro.customMinutes.short_break,
      long_break: this.pomodoro.customMinutes.long_break,
      dailyTarget: this.pomodoro.dailyTarget,
      currentSubject: this.pomodoro.currentSubject
    };
  },

  savePomodoroSettings(settings) {
    const key = `ICAI_POMO_SETTINGS_${this.getStoragePrefix()}`;
    this.pomodoro.customMinutes.study = Math.max(1, parseInt(settings.study) || 25);
    this.pomodoro.customMinutes.short_break = Math.max(1, parseInt(settings.short_break) || 5);
    this.pomodoro.customMinutes.long_break = Math.max(1, parseInt(settings.long_break) || 15);
    this.pomodoro.dailyTarget = Math.max(1, parseInt(settings.dailyTarget) || 8);
    this.pomodoro.currentSubject = settings.currentSubject || "FR";

    const saved = {
      study: this.pomodoro.customMinutes.study,
      short_break: this.pomodoro.customMinutes.short_break,
      long_break: this.pomodoro.customMinutes.long_break,
      dailyTarget: this.pomodoro.dailyTarget,
      currentSubject: this.pomodoro.currentSubject
    };

    try {
      localStorage.setItem(key, JSON.stringify(saved));
    } catch (e) {}

    if (!this.pomodoro.isRunning) {
      const mins = this.pomodoro.customMinutes[this.pomodoro.mode] || 25;
      this.pomodoro.remainingSeconds = mins * 60;
    }

    return saved;
  },

  setPomodoroMode(mode) {
    if (this.pomodoro.timerInterval) {
      clearInterval(this.pomodoro.timerInterval);
      this.pomodoro.timerInterval = null;
    }
    this.pomodoro.mode = mode;
    this.pomodoro.isRunning = false;
    const mins = this.pomodoro.customMinutes[mode] || 25;
    this.pomodoro.remainingSeconds = mins * 60;
  },

  togglePomodoro(onTick, onComplete) {
    if (this.pomodoro.isRunning) {
      clearInterval(this.pomodoro.timerInterval);
      this.pomodoro.timerInterval = null;
      this.pomodoro.isRunning = false;
      return false;
    }

    this.pomodoro.isRunning = true;
    this.pomodoro.timerInterval = setInterval(() => {
      this.pomodoro.remainingSeconds--;
      if (typeof onTick === 'function') onTick(this.pomodoro.remainingSeconds);

      if (this.pomodoro.remainingSeconds <= 0) {
        clearInterval(this.pomodoro.timerInterval);
        this.pomodoro.timerInterval = null;
        this.pomodoro.isRunning = false;

        if (this.pomodoro.mode === "study") {
          this.pomodoro.sessionsCompleted++;
          this.recordPomodoroSession();
        }

        if (typeof onComplete === 'function') onComplete(this.pomodoro.mode);
      }
    }, 1000);

    return true;
  },

  resetPomodoro() {
    if (this.pomodoro.timerInterval) clearInterval(this.pomodoro.timerInterval);
    this.pomodoro.timerInterval = null;
    this.pomodoro.isRunning = false;
    const mins = this.pomodoro.customMinutes[this.pomodoro.mode] || 25;
    this.pomodoro.remainingSeconds = mins * 60;
  },

  recordPomodoroSession(subjectId = null) {
    const keyLogs = `ICAI_POMODORO_LOGS_${this.getStoragePrefix()}`;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sub = subjectId || this.pomodoro.currentSubject || "FR";
    const duration = this.pomodoro.customMinutes[this.pomodoro.mode] || 25;

    const sessionEntry = {
      id: `POMO-${Date.now().toString(36)}`,
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      mode: this.pomodoro.mode,
      durationMinutes: duration,
      subjectId: sub
    };

    try {
      let logs = JSON.parse(localStorage.getItem(keyLogs) || "[]");
      logs.unshift(sessionEntry);
      if (logs.length > 500) logs = logs.slice(0, 500);
      localStorage.setItem(keyLogs, JSON.stringify(logs));
    } catch (e) {}

    // Update stats tally map
    const keyStats = `ICAI_POMODORO_STATS_${this.getStoragePrefix()}`;
    try {
      let stats = JSON.parse(localStorage.getItem(keyStats) || "{}");
      stats[dateStr] = (stats[dateStr] || 0) + 1;
      localStorage.setItem(keyStats, JSON.stringify(stats));
    } catch (e) {}

    return sessionEntry;
  },

  getPomodoroLogs() {
    const keyLogs = `ICAI_POMODORO_LOGS_${this.getStoragePrefix()}`;
    try {
      return JSON.parse(localStorage.getItem(keyLogs) || "[]");
    } catch (e) {
      return [];
    }
  },

  getPomodoroTotalToday() {
    const keyStats = `ICAI_POMODORO_STATS_${this.getStoragePrefix()}`;
    const today = new Date().toISOString().slice(0, 10);
    try {
      let stats = JSON.parse(localStorage.getItem(keyStats) || "{}");
      return stats[today] || 0;
    } catch (e) {
      return 0;
    }
  },

  // ---------------- CALENDAR CUSTOM EVENTS & TASKS (ADD/DELETE) ----------------
  getCalendarEvents() {
    const key = `ICAI_CALENDAR_EVENTS_${this.getStoragePrefix()}`;
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  },

  saveCalendarEvents(events) {
    const key = `ICAI_CALENDAR_EVENTS_${this.getStoragePrefix()}`;
    try {
      localStorage.setItem(key, JSON.stringify(events));
    } catch (e) {}
  },

  addCalendarEvent({ dateStr, title, type, time }) {
    if (!title || !title.trim() || !dateStr) return null;
    const events = this.getCalendarEvents();
    const newEvent = {
      id: `CEVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      dateStr,
      title: title.trim(),
      type: type || "study", // "study", "revision", "exam", "reminder"
      time: time ? time.trim() : "",
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    this.saveCalendarEvents(events);
    return newEvent;
  },

  deleteCalendarEvent(eventId) {
    let events = this.getCalendarEvents();
    events = events.filter(e => e.id !== eventId);
    this.saveCalendarEvents(events);
    return true;
  },

  getEventsForDate(dateStr) {
    const events = this.getCalendarEvents();
    return events.filter(e => e.dateStr === dateStr);
  },

  // ---------------- INDIAN CALENDAR & FESTIVALS ----------------
  getCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty lead slots
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false, dateStr: null, holiday: null, customEvents: [] });
    }

    // Days in month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const holiday = typeof INDIAN_HOLIDAYS_AND_FESTIVALS !== "undefined"
        ? INDIAN_HOLIDAYS_AND_FESTIVALS.find(h => h.date === dateStr)
        : null;

      const customEvents = this.getEventsForDate(dateStr);

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        holiday,
        customEvents
      });
    }

    // Trailing empty slots to make rows strictly 7 equal columns
    const remainder = days.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      for (let j = 0; j < needed; j++) {
        days.push({ dayNumber: null, isCurrentMonth: false, dateStr: null, holiday: null, customEvents: [] });
      }
    }

    return days;
  },

  // ---------------- TASK MANAGER & COMPARATIVE ANALYTICS ----------------
  getTasks() {
    const key = `ICAI_TASKS_${this.getStoragePrefix()}`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveTasks(tasks) {
    const key = `ICAI_TASKS_${this.getStoragePrefix()}`;
    try {
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (e) {}
  },

  addTask({ title, subjectId, priority, targetDate }) {
    if (!title || !title.trim()) return;
    const tasks = this.getTasks();
    const now = new Date();
    const newTask = {
      id: `TASK-${Date.now().toString(36)}`,
      title: title.trim(),
      subjectId: subjectId || "GENERAL",
      targetDate: targetDate || now.toISOString().slice(0, 10),
      priority: priority || "Medium",
      isCompleted: false,
      createdAt: now.toISOString(),
      completedAt: null
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  toggleTask(taskId) {
    const tasks = this.getTasks();
    const t = tasks.find(x => x.id === taskId);
    if (t) {
      t.isCompleted = !t.isCompleted;
      t.completedAt = t.isCompleted ? new Date().toISOString() : null;
      this.saveTasks(tasks);
    }
    return t;
  },

  deleteTask(taskId) {
    let tasks = this.getTasks();
    tasks = tasks.filter(x => x.id !== taskId);
    this.saveTasks(tasks);
    return tasks;
  },

  // Comparative Analytics for Tasks & Pomodoros
  getComparisonData(period = "today") {
    const tasks = this.getTasks();
    const pomoLogs = this.getPomodoroLogs();

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const isToday = (dStr) => dStr && dStr.slice(0, 10) === todayStr;
    const isYesterday = (dStr) => dStr && dStr.slice(0, 10) === yesterdayStr;

    // Last 7 days vs previous 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current Month vs Previous Month
    const curMonthPrefix = todayStr.slice(0, 7);
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

    let currentTasks = [];
    let prevTasks = [];
    let currentPomos = [];
    let prevPomos = [];
    let currentLabel = "Today";
    let prevLabel = "Yesterday";

    if (period === "today") {
      currentLabel = "Today";
      prevLabel = "Yesterday";
      currentTasks = tasks.filter(t => isToday(t.createdAt) || (t.isCompleted && isToday(t.completedAt)));
      prevTasks = tasks.filter(t => isYesterday(t.createdAt) || (t.isCompleted && isYesterday(t.completedAt)));
      currentPomos = pomoLogs.filter(p => p.dateStr === todayStr);
      prevPomos = pomoLogs.filter(p => p.dateStr === yesterdayStr);
    } else if (period === "yesterday") {
      currentLabel = "Yesterday";
      prevLabel = "Day Before Yesterday";
      const dayBefore = new Date(now);
      dayBefore.setDate(now.getDate() - 2);
      const dayBeforeStr = dayBefore.toISOString().slice(0, 10);
      currentTasks = tasks.filter(t => isYesterday(t.createdAt) || (t.isCompleted && isYesterday(t.completedAt)));
      prevTasks = tasks.filter(t => t.createdAt?.slice(0, 10) === dayBeforeStr || (t.isCompleted && t.completedAt?.slice(0, 10) === dayBeforeStr));
      currentPomos = pomoLogs.filter(p => p.dateStr === yesterdayStr);
      prevPomos = pomoLogs.filter(p => p.dateStr === dayBeforeStr);
    } else if (period === "week") {
      currentLabel = "This Week";
      prevLabel = "Last Week";
      currentTasks = tasks.filter(t => {
        const d = new Date(t.createdAt);
        return d >= sevenDaysAgo && d <= now;
      });
      prevTasks = tasks.filter(t => {
        const d = new Date(t.createdAt);
        return d >= fourteenDaysAgo && d < sevenDaysAgo;
      });
      currentPomos = pomoLogs.filter(p => {
        const d = new Date(p.timestamp);
        return d >= sevenDaysAgo && d <= now;
      });
      prevPomos = pomoLogs.filter(p => {
        const d = new Date(p.timestamp);
        return d >= fourteenDaysAgo && d < sevenDaysAgo;
      });
    } else if (period === "month") {
      currentLabel = "This Month";
      prevLabel = "Last Month";
      currentTasks = tasks.filter(t => t.createdAt && t.createdAt.startsWith(curMonthPrefix));
      prevTasks = tasks.filter(t => t.createdAt && t.createdAt.startsWith(prevMonthPrefix));
      currentPomos = pomoLogs.filter(p => p.dateStr && p.dateStr.startsWith(curMonthPrefix));
      prevPomos = pomoLogs.filter(p => p.dateStr && p.dateStr.startsWith(prevMonthPrefix));
    }

    const curCompletedTasks = currentTasks.filter(t => t.isCompleted).length;
    const prevCompletedTasks = prevTasks.filter(t => t.isCompleted).length;
    const curPomoCount = currentPomos.length;
    const prevPomoCount = prevPomos.length;
    const curFocusMinutes = currentPomos.reduce((acc, p) => acc + (p.durationMinutes || 25), 0);
    const prevFocusMinutes = prevPomos.reduce((acc, p) => acc + (p.durationMinutes || 25), 0);

    return {
      period,
      currentLabel,
      prevLabel,
      current: {
        totalTasks: currentTasks.length,
        completedTasks: curCompletedTasks,
        pendingTasks: currentTasks.length - curCompletedTasks,
        pomoCount: curPomoCount,
        focusMinutes: curFocusMinutes,
        tasks: currentTasks,
        pomos: currentPomos
      },
      previous: {
        totalTasks: prevTasks.length,
        completedTasks: prevCompletedTasks,
        pomoCount: prevPomoCount,
        focusMinutes: prevFocusMinutes
      },
      diffTasks: curCompletedTasks - prevCompletedTasks,
      diffPomos: curPomoCount - prevPomoCount,
      diffMinutes: curFocusMinutes - prevFocusMinutes
    };
  }
};

// Auto-initialize settings on load
if (typeof window !== 'undefined') {
  StudyEngine.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudyEngine;
}
