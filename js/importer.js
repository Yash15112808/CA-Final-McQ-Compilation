/**
 * Importer and Parser Utilities for ICAI MCQs
 * Supports:
 * 1. Intelligent raw text parsing (copy-pasting from PDFs, booklets, Telegram, WhatsApp)
 * 2. JSON import/export
 * 3. CSV parsing
 */

const MCQImporter = {
  /**
   * Parse unformatted / raw text into structured MCQ objects.
   * Handles patterns such as:
   * 1. Question stem...
   * (a) Option A / (A) Option A / A. Option A / A) Option A
   * (b) Option B / (B) Option B / B. Option B / B) Option B
   * (c) Option C / (C) Option C / C. Option C / C) Option C
   * (d) Option D / (D) Option D / D. Option D / D) Option D
   * Ans / Answer: (b) or B
   * Explanation / Reason: ...
   */
  parseRawText(rawText, defaultSubject = "FR", defaultSource = "SM", defaultSession = "Nov 2024") {
    if (!rawText || !rawText.trim()) return [];

    // Clean Windows CRLF to standard LF
    const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Split text into question blocks based on common question starters:
    // e.g., "1.", "Q1.", "Q.1", "Question 1:", "[1]", etc.
    const questionBlocks = [];
    const lines = normalized.split("\n");
    let currentBlock = [];

    const questionStartRegex = /^(?:(?:Q(?:uestion)?[\s\.\:]*|MCQ[\s\.\:]*)?\s*(\d+)[\.\:\)\-\s]+)(.*)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(questionStartRegex);
      
      // If line looks like a new question and we already have content
      if (match && (currentBlock.length > 0) && (line.length > 4)) {
        // Check if current block already contains options or answer before splitting
        const blockText = currentBlock.join("\n");
        if (/[A-D]\s*[\.\)\:]/i.test(blockText) || /ans(?:wer)?/i.test(blockText)) {
          questionBlocks.push(blockText);
          currentBlock = [];
        }
      }
      currentBlock.push(line);
    }
    if (currentBlock.length > 0) {
      questionBlocks.push(currentBlock.join("\n"));
    }

    // If no distinct numbered blocks were detected, treat the entire text as one block
    if (questionBlocks.length === 0 && normalized.trim().length > 0) {
      questionBlocks.push(normalized);
    }

    const parsedMCQs = [];

    questionBlocks.forEach((block, idx) => {
      const parsed = this.parseSingleBlock(block, defaultSubject, defaultSource, defaultSession, idx + 1);
      if (parsed) {
        parsedMCQs.push(parsed);
      }
    });

    return parsedMCQs;
  },

  parseSingleBlock(blockText, defaultSubject, defaultSource, defaultSession, fallbackIndex) {
    const lines = blockText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) return null;

    let questionLines = [];
    let options = { A: "", B: "", C: "", D: "" };
    let correctAnswer = "";
    let explanationLines = [];
    let state = "QUESTION"; // states: QUESTION, OPTIONS, EXPLANATION

    const optionRegex = /^(?:\(?([a-dA-D])\)|\b([a-dA-D])[\.\:\)])\s*(.*)$/;
    const answerRegex = /^(?:Ans(?:wer)?|Correct\s*Option|Key)[\s\:\-\=]+(?:\(?([a-dA-D])\)?|(.*))$/i;
    const explanationRegex = /^(?:Explanation|Reason(?:ing)?|Hint|Reference|Note)[\s\:\-\=]+(.*)$/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for Answer line
      const ansMatch = line.match(answerRegex);
      if (ansMatch) {
        state = "ANSWER";
        const letter = ansMatch[1] || (ansMatch[2] ? ansMatch[2].trim().charAt(0) : "");
        if (letter && /[a-dA-D]/.test(letter)) {
          correctAnswer = letter.toUpperCase();
        }
        continue;
      }

      // Check for Explanation line
      const expMatch = line.match(explanationRegex);
      if (expMatch) {
        state = "EXPLANATION";
        if (expMatch[1]) explanationLines.push(expMatch[1].trim());
        continue;
      }

      // Check for Options (A, B, C, D)
      const optMatch = line.match(optionRegex);
      if (optMatch && (state === "QUESTION" || state === "OPTIONS")) {
        state = "OPTIONS";
        const letter = (optMatch[1] || optMatch[2]).toUpperCase();
        options[letter] = (optMatch[3] || "").trim();
        continue;
      }

      // Depending on current state, append text
      if (state === "QUESTION") {
        // Strip question prefix number if present (e.g., "1. What is...")
        let cleaned = line;
        if (questionLines.length === 0) {
          cleaned = line.replace(/^(?:(?:Q(?:uestion)?|MCQ)[\s\.\:]*)?\s*\d+[\.\:\)\-\s]+/i, "").trim();
        }
        if (cleaned) questionLines.push(cleaned);
      } else if (state === "OPTIONS") {
        // Could be multi-line option text
        const lastOptKey = Object.keys(options).reverse().find(k => options[k]);
        if (lastOptKey) {
          options[lastOptKey] += " " + line;
        }
      } else if (state === "EXPLANATION") {
        explanationLines.push(line);
      }
    }

    const questionStem = questionLines.join(" ").trim();
    if (!questionStem) return null;

    // Build structured options array
    const formattedOptions = [
      { id: "A", text: options.A || "Option A" },
      { id: "B", text: options.B || "Option B" },
      { id: "C", text: options.C || "Option C" },
      { id: "D", text: options.D || "Option D" }
    ];

    return {
      id: `${defaultSubject}-IMP-${Date.now().toString(36)}-${fallbackIndex}`,
      subjectId: defaultSubject,
      chapter: "General / Imported",
      source: defaultSource,
      examSession: defaultSession,
      type: "standalone",
      marks: 2,
      difficulty: "Medium",
      question: questionStem,
      options: formattedOptions,
      correctAnswer: correctAnswer || "A",
      explanation: explanationLines.join(" ").trim() || "Refer to ICAI Study Material for detailed legal provisions and working notes.",
      reference: `${defaultSource} - ${defaultSession}`,
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Export all MCQs as JSON file download
   */
  exportToJSON(mcqs, filename = "ICAI_CA_Final_MCQs_Compilation.json") {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mcqs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Export MCQs to CSV
   */
  exportToCSV(mcqs, filename = "ICAI_MCQs_Export.csv") {
    const headers = ["ID", "Subject", "Chapter", "Source", "Exam Session", "Marks", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Explanation", "Reference"];
    
    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""').replace(/\n/g, " ");
      return `"${clean}"`;
    };

    const rows = mcqs.map(q => {
      const optMap = {};
      (q.options || []).forEach(o => { optMap[o.id] = o.text; });
      return [
        escapeCsv(q.id),
        escapeCsv(q.subjectId),
        escapeCsv(q.chapter),
        escapeCsv(q.source),
        escapeCsv(q.examSession),
        q.marks || 2,
        escapeCsv(q.question),
        escapeCsv(optMap.A || ""),
        escapeCsv(optMap.B || ""),
        escapeCsv(optMap.C || ""),
        escapeCsv(optMap.D || ""),
        escapeCsv(q.correctAnswer),
        escapeCsv(q.explanation),
        escapeCsv(q.reference)
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MCQImporter;
}
