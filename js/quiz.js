/**
 * Quiz and Exam Simulation Engine for ICAI MCQs
 */

const QuizEngine = {
  // Practice state
  practiceState: {
    activeQuestionIndex: 0,
    questions: [],
    selectedAnswers: {}, // index -> optionId
    revealed: {},        // index -> boolean
    filter: {
      subject: "ALL",
      source: "ALL",
      chapter: "ALL",
      starredOnly: false,
      incorrectOnly: false
    }
  },

  // Exam simulator state
  examState: {
    isActive: false,
    durationMinutes: 45, // default 45 mins for 30 marks
    remainingSeconds: 45 * 60,
    timerInterval: null,
    questions: [],
    currentIndex: 0,
    answers: {},       // qId -> selectedOptionId
    status: {},        // qId -> 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked'
    result: null
  },

  initPractice(allMCQs, filter = {}) {
    this.practiceState.filter = { ...this.practiceState.filter, ...filter };
    this.practiceState.questions = this.filterQuestions(allMCQs, this.practiceState.filter);
    this.practiceState.activeQuestionIndex = 0;
    this.practiceState.selectedAnswers = {};
    this.practiceState.revealed = {};
    return this.practiceState;
  },

  filterQuestions(allMCQs, filter) {
    const userData = MCQStats.getUserData();
    const history = userData.history || {};
    const starred = userData.starred || [];

    // Flatten standalone + case study sub-questions
    const flattened = [];
    allMCQs.forEach(q => {
      if (q.type === "case_scenario" && q.subQuestions) {
        q.subQuestions.forEach((sq, i) => {
          flattened.push({
            id: sq.subId,
            parentId: q.id,
            caseTitle: q.title,
            caseScenario: q.scenarioText,
            subjectId: q.subjectId,
            source: q.source,
            chapter: q.chapter,
            examSession: q.examSession,
            type: "case_sub",
            caseSubIndex: i + 1,
            totalSubCount: q.subQuestions.length,
            marks: sq.marks || 2,
            difficulty: q.difficulty || "Medium",
            question: sq.question,
            options: sq.options,
            correctAnswer: sq.correctAnswer,
            explanation: sq.explanation || q.explanation,
            reference: q.reference || sq.reference
          });
        });
      } else {
        flattened.push(q);
      }
    });

    return flattened.filter(q => {
      if (filter.subject && filter.subject !== "ALL" && q.subjectId !== filter.subject) return false;
      if (filter.source && filter.source !== "ALL" && q.source !== filter.source) return false;
      if (filter.chapter && filter.chapter !== "ALL" && q.chapter !== filter.chapter) return false;
      if (filter.difficulty && filter.difficulty !== "ALL" && q.difficulty !== filter.difficulty) return false;
      if (filter.starredOnly && !starred.includes(q.id)) return false;
      if (filter.incorrectOnly) {
        const h = history[q.id];
        if (!h || h.status !== "incorrect") return false;
      }
      return true;
    });
  },

  getCurrentPracticeQuestion() {
    return this.practiceState.questions[this.practiceState.activeQuestionIndex] || null;
  },

  selectPracticeAnswer(questionIndex, optionId) {
    const q = this.practiceState.questions[questionIndex];
    if (!q) return null;

    this.practiceState.selectedAnswers[questionIndex] = optionId;
    this.practiceState.revealed[questionIndex] = true;

    const isCorrect = (optionId === q.correctAnswer);
    MCQStats.recordAttempt(q.id, optionId, isCorrect);

    return {
      selected: optionId,
      correct: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      reference: q.reference
    };
  },

  // Exam Simulator Methods
  startExam(allMCQs, { subjectId = "ALL", questionCount = 15, durationMinutes = 30 } = {}) {
    let pool = this.filterQuestions(allMCQs, { subject: subjectId });
    if (pool.length === 0) pool = this.filterQuestions(allMCQs, {});

    // Shuffle and pick subset
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    this.examState.isActive = true;
    this.examState.durationMinutes = durationMinutes;
    this.examState.remainingSeconds = durationMinutes * 60;
    this.examState.questions = selected;
    this.examState.currentIndex = 0;
    this.examState.answers = {};
    this.examState.status = {};
    this.examState.result = null;

    selected.forEach((q, idx) => {
      this.examState.status[q.id] = idx === 0 ? "not_answered" : "not_visited";
    });

    return this.examState;
  },

  selectExamAnswer(questionId, optionId) {
    if (!this.examState.isActive) return;
    this.examState.answers[questionId] = optionId;
    if (this.examState.status[questionId] === "marked") {
      this.examState.status[questionId] = "answered_marked";
    } else {
      this.examState.status[questionId] = "answered";
    }
  },

  toggleMarkForReview(questionId) {
    if (!this.examState.isActive) return;
    const current = this.examState.status[questionId];
    const hasAnswer = Boolean(this.examState.answers[questionId]);

    if (current === "marked") {
      this.examState.status[questionId] = hasAnswer ? "answered" : "not_answered";
    } else if (current === "answered_marked") {
      this.examState.status[questionId] = "answered";
    } else {
      this.examState.status[questionId] = hasAnswer ? "answered_marked" : "marked";
    }
  },

  clearExamAnswer(questionId) {
    if (!this.examState.isActive) return;
    delete this.examState.answers[questionId];
    this.examState.status[questionId] = "not_answered";
  },

  submitExam() {
    if (!this.examState.isActive && !this.examState.questions.length) return null;

    if (this.examState.timerInterval) {
      clearInterval(this.examState.timerInterval);
      this.examState.timerInterval = null;
    }
    this.examState.isActive = false;

    let totalMarks = 0;
    let marksObtained = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const reviewItems = this.examState.questions.map(q => {
      const marks = q.marks || 2;
      totalMarks += marks;
      const selected = this.examState.answers[q.id];

      if (!selected) {
        unattemptedCount++;
        return {
          question: q,
          selected: null,
          correct: q.correctAnswer,
          isCorrect: false,
          isUnattempted: true,
          marksObtained: 0,
          marksMax: marks
        };
      }

      const isCorrect = (selected === q.correctAnswer);
      if (isCorrect) {
        correctCount++;
        marksObtained += marks;
      } else {
        incorrectCount++;
      }

      // Record in permanent stats
      MCQStats.recordAttempt(q.id, selected, isCorrect);

      return {
        question: q,
        selected,
        correct: q.correctAnswer,
        isCorrect,
        isUnattempted: false,
        marksObtained: isCorrect ? marks : 0,
        marksMax: marks
      };
    });

    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
    const timeTakenSeconds = (this.examState.durationMinutes * 60) - Math.max(0, this.examState.remainingSeconds);

    const result = {
      date: new Date().toISOString(),
      totalQuestions: this.examState.questions.length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      totalMarks,
      marksObtained,
      percentage,
      timeTakenSeconds,
      reviewItems
    };

    this.examState.result = result;
    MCQStats.recordExamResult({
      date: result.date,
      score: marksObtained,
      totalMarks,
      percentage,
      durationSeconds: timeTakenSeconds,
      correctCount,
      totalCount: this.examState.questions.length
    });

    return result;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizEngine;
}
