/**
 * Study Management Engine
 * Features:
 * 1. Remaining Days to Exam Countdown
 * 2. Pomodoro Study Timer with Session Logger
 * 3. Pre-Imported Subject Chapters with Multi-Lecture Tracking and 3-Tier Revisions (R1, R2, R3)
 * 4. Indian Calendar with Festivals & ICAI Schedule
 * 5. Task Manager / Study To-Do List
 */

const StudyEngine = {
  // Pomodoro State
  pomodoro: {
    mode: "study", // study (25m), short_break (5m), long_break (15m)
    remainingSeconds: 25 * 60,
    isRunning: false,
    timerInterval: null,
    sessionsCompleted: 0,
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
      return { totalDays: 0, weeks: 0, remainingDaysAfterWeeks: 0, isPast: true };
    }

    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDaysAfterWeeks = totalDays % 7;

    return { totalDays, weeks, remainingDaysAfterWeeks, isPast: false, targetDate: target };
  },

  // ---------------- CHAPTER & LECTURE TRACKER ----------------
  getStudyProgress() {
    const key = `ICAI_CHAPTER_PROGRESS_${this.getStoragePrefix()}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading study progress", e);
    }

    // Default structure initialized from STUDY_CHAPTERS_DATA
    const initial = {};
    if (typeof STUDY_CHAPTERS_DATA !== 'undefined') {
      Object.entries(STUDY_CHAPTERS_DATA).forEach(([subId, chapters]) => {
        initial[subId] = {};
        chapters.forEach(ch => {
          initial[subId][ch.id] = {
            completedLectures: 0,
            totalLectures: ch.totalLectures || 10,
            lectureDone: false,
            r1Done: false,
            r2Done: false,
            r3Done: false,
            notes: ""
          };
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

  computeSyllabusMetrics() {
    const progress = this.getStudyProgress();
    let totalChapters = 0;
    let totalLecturesGlobal = 0;
    let completedLecturesGlobal = 0;
    let r1Count = 0;
    let r2Count = 0;
    let r3Count = 0;

    const subjectMetrics = {};

    Object.entries(progress).forEach(([subId, chapters]) => {
      let subChCount = 0;
      let subLecturesTotal = 0;
      let subLecturesDone = 0;
      let subR1 = 0;
      let subR2 = 0;
      let subR3 = 0;

      Object.values(chapters).forEach(c => {
        subChCount++;
        totalChapters++;
        subLecturesTotal += c.totalLectures;
        totalLecturesGlobal += c.totalLectures;
        subLecturesDone += c.completedLectures;
        completedLecturesGlobal += c.completedLectures;

        if (c.r1Done) { subR1++; r1Count++; }
        if (c.r2Done) { subR2++; r2Count++; }
        if (c.r3Done) { subR3++; r3Count++; }
      });

      const lecturePct = subLecturesTotal > 0 ? Math.round((subLecturesDone / subLecturesTotal) * 100) : 0;
      const r1Pct = subChCount > 0 ? Math.round((subR1 / subChCount) * 100) : 0;
      const r2Pct = subChCount > 0 ? Math.round((subR2 / subChCount) * 100) : 0;
      const r3Pct = subChCount > 0 ? Math.round((subR3 / subChCount) * 100) : 0;

      // Combined readiness score: Lectures 40%, R1 25%, R2 20%, R3 15%
      const readinessPct = Math.round((lecturePct * 0.4) + (r1Pct * 0.25) + (r2Pct * 0.2) + (r3Pct * 0.15));

      subjectMetrics[subId] = {
        totalChapters: subChCount,
        totalLectures: subLecturesTotal,
        completedLectures: subLecturesDone,
        lecturePct,
        r1Count: subR1,
        r1Pct,
        r2Count: subR2,
        r2Pct,
        r3Count: subR3,
        r3Pct,
        readinessPct
      };
    });

    const overallLecturePct = totalLecturesGlobal > 0 ? Math.round((completedLecturesGlobal / totalLecturesGlobal) * 100) : 0;
    const overallR1Pct = totalChapters > 0 ? Math.round((r1Count / totalChapters) * 100) : 0;
    const overallR2Pct = totalChapters > 0 ? Math.round((r2Count / totalChapters) * 100) : 0;
    const overallR3Pct = totalChapters > 0 ? Math.round((r3Count / totalChapters) * 100) : 0;
    const overallReadiness = Math.round((overallLecturePct * 0.4) + (overallR1Pct * 0.25) + (overallR2Pct * 0.2) + (overallR3Pct * 0.15));

    return {
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

  recordPomodoroSession() {
    const key = `ICAI_POMODORO_STATS_${this.getStoragePrefix()}`;
    const today = new Date().toISOString().slice(0, 10);
    try {
      let stats = JSON.parse(localStorage.getItem(key) || "{}");
      stats[today] = (stats[today] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(stats));
    } catch (e) {}
  },

  getPomodoroTotalToday() {
    const key = `ICAI_POMODORO_STATS_${this.getStoragePrefix()}`;
    const today = new Date().toISOString().slice(0, 10);
    try {
      let stats = JSON.parse(localStorage.getItem(key) || "{}");
      return stats[today] || 0;
    } catch (e) {
      return 0;
    }
  },

  // ---------------- INDIAN CALENDAR & FESTIVALS ----------------
  getCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty lead slots
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false });
    }

    // Days in month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const holiday = typeof INDIAN_HOLIDAYS_AND_FESTIVALS !== "undefined"
        ? INDIAN_HOLIDAYS_AND_FESTIVALS.find(h => h.date === dateStr)
        : null;

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        holiday
      });
    }

    return days;
  },

  // ---------------- TASK MANAGER (TO-DO LIST) ----------------
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

  addTask({ title, subjectId, targetDate, priority }) {
    if (!title || !title.trim()) return;
    const tasks = this.getTasks();
    const newTask = {
      id: `TASK-${Date.now().toString(36)}`,
      title: title.trim(),
      subjectId: subjectId || "GENERAL",
      targetDate: targetDate || new Date().toISOString().slice(0, 10),
      priority: priority || "Medium",
      isCompleted: false,
      createdAt: new Date().toISOString()
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
      this.saveTasks(tasks);
    }
    return t;
  },

  deleteTask(taskId) {
    let tasks = this.getTasks();
    tasks = tasks.filter(x => x.id !== taskId);
    this.saveTasks(tasks);
    return tasks;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudyEngine;
}
