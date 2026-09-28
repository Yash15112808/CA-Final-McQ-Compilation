/**
 * Analytics and Performance Tracker for ICAI MCQs
 */

const MCQStats = {
  getStorageKey() {
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    return user ? `ICAI_MCQ_USER_DATA_${user.regNo}` : "ICAI_MCQ_USER_DATA_V1";
  },

  getUserData() {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.impList) parsed.impList = [];
        return parsed;
      }
    } catch (e) {
      console.error("Error reading user data", e);
    }
    return {
      history: {}, // qId -> { attempts: number, correctCount: number, lastAttempted: string, lastSelected: string }
      starred: [], // [qId]
      impList: [], // [qId] marked as important
      notes: {},   // qId -> string
      examHistory: [] // [{ date, score, totalMarks, percentage, subject, durationSeconds }]
    };
  },

  saveUserData(userData) {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(userData));
    } catch (e) {
      console.error("Error saving user data", e);
    }
  },

  recordAttempt(questionId, selectedOption, isCorrect) {
    const data = this.getUserData();
    if (!data.history[questionId]) {
      data.history[questionId] = {
        attempts: 0,
        correctCount: 0,
        lastAttempted: null,
        lastSelected: null,
        status: "unattempted"
      };
    }
    const item = data.history[questionId];
    item.attempts += 1;
    if (isCorrect) item.correctCount += 1;
    item.lastAttempted = new Date().toISOString();
    item.lastSelected = selectedOption;
    item.status = isCorrect ? "correct" : "incorrect";

    this.saveUserData(data);
    return data;
  },

  toggleStar(questionId) {
    const data = this.getUserData();
    const idx = data.starred.indexOf(questionId);
    let isStarred = false;
    if (idx > -1) {
      data.starred.splice(idx, 1);
      isStarred = false;
    } else {
      data.starred.push(questionId);
      isStarred = true;
    }
    this.saveUserData(data);
    return isStarred;
  },

  isStarred(questionId) {
    const data = this.getUserData();
    return data.starred.includes(questionId);
  },

  toggleImp(questionId) {
    const data = this.getUserData();
    if (!Array.isArray(data.impList)) data.impList = [];
    const idx = data.impList.indexOf(questionId);
    let isImp = false;
    if (idx > -1) {
      data.impList.splice(idx, 1);
      isImp = false;
    } else {
      data.impList.push(questionId);
      isImp = true;
    }
    this.saveUserData(data);
    return isImp;
  },

  isImp(questionId) {
    const data = this.getUserData();
    return Array.isArray(data.impList) && data.impList.includes(questionId);
  },

  getImpList() {
    const data = this.getUserData();
    return Array.isArray(data.impList) ? data.impList : [];
  },

  saveNote(questionId, noteText) {
    const data = this.getUserData();
    if (!data.notes) data.notes = {};
    if (!noteText || !noteText.trim()) {
      delete data.notes[questionId];
    } else {
      data.notes[questionId] = noteText.trim();
    }
    this.saveUserData(data);
  },

  getNote(questionId) {
    const data = this.getUserData();
    return data.notes[questionId] || "";
  },

  recordExamResult(result) {
    const data = this.getUserData();
    if (!data.examHistory) data.examHistory = [];
    data.examHistory.unshift(result);
    // Keep last 30 exam attempts
    if (data.examHistory.length > 30) data.examHistory.pop();
    this.saveUserData(data);
  },

  computeDashboardMetrics(allMCQs) {
    const userData = this.getUserData();
    const history = userData.history || {};
    const starredList = userData.starred || [];

    // Flatten case scenarios for accurate counts
    let totalQuestions = 0;
    const questionsList = [];

    allMCQs.forEach(q => {
      if (q.type === "case_scenario" && q.subQuestions) {
        q.subQuestions.forEach(sq => {
          questionsList.push({
            id: sq.subId,
            parentId: q.id,
            subjectId: q.subjectId,
            source: q.source,
            marks: sq.marks || 2,
            type: "case_sub"
          });
          totalQuestions++;
        });
      } else {
        questionsList.push(q);
        totalQuestions++;
      }
    });

    let attemptedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    questionsList.forEach(q => {
      const h = history[q.id];
      if (h && h.attempts > 0) {
        attemptedCount++;
        if (h.status === "correct") correctCount++;
        else if (h.status === "incorrect") incorrectCount++;
      }
    });

    const accuracyRate = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const completionRate = totalQuestions > 0 ? Math.round((attemptedCount / totalQuestions) * 100) : 0;

    // Subject Breakdown
    const subjectMetrics = {};
    if (typeof ICAI_METADATA !== "undefined") {
      ICAI_METADATA.subjects.forEach(s => {
        subjectMetrics[s.id] = {
          name: s.name,
          color: s.color,
          total: 0,
          attempted: 0,
          correct: 0
        };
      });
    }

    questionsList.forEach(q => {
      const sId = q.subjectId;
      if (!subjectMetrics[sId]) {
        subjectMetrics[sId] = { name: sId, color: "#4f46e5", total: 0, attempted: 0, correct: 0 };
      }
      subjectMetrics[sId].total++;
      const h = history[q.id];
      if (h && h.attempts > 0) {
        subjectMetrics[sId].attempted++;
        if (h.status === "correct") subjectMetrics[sId].correct++;
      }
    });

    // Source Breakdown
    const sourceMetrics = {};
    if (typeof ICAI_METADATA !== "undefined") {
      ICAI_METADATA.sources.forEach(s => {
        sourceMetrics[s.id] = { name: s.label, count: 0, color: s.badgeColor };
      });
    }

    allMCQs.forEach(q => {
      const src = q.source || "CUSTOM";
      if (!sourceMetrics[src]) {
        sourceMetrics[src] = { name: src, count: 0, color: "#6b7280" };
      }
      const count = q.type === "case_scenario" && q.subQuestions ? q.subQuestions.length : 1;
      sourceMetrics[src].count += count;
    });

    return {
      totalQuestions,
      attemptedCount,
      correctCount,
      incorrectCount,
      starredCount: starredList.length,
      accuracyRate,
      completionRate,
      subjectMetrics,
      sourceMetrics,
      recentExams: userData.examHistory || []
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MCQStats;
}
