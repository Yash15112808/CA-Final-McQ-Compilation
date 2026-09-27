# ICAI CA Final MCQ Master Compilation Portal

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com)

A modern, high-performance, offline-first web application designed for Chartered Accountancy aspirants to compile, practice, and master all MCQs prescribed by the **Institute of Chartered Accountants of India (ICAI)** across all papers under the New Scheme of Education and Training.

---

## 🌟 Key Features

### 1. Complete ICAI Taxonomy & Sources
Categorized across all CA Final Papers:
- **Paper 1: Financial Reporting (FR)**
- **Paper 2: Advanced Financial Management (AFM)**
- **Paper 3: Advanced Auditing, Assurance & Professional Ethics (Audit)**
- **Paper 4: Direct Tax Laws & International Taxation (DT)**
- **Paper 5: Indirect Tax Laws (IDT)**
- **Paper 6: Integrated Business Solutions (IBS)**

Organized by official ICAI source material:
- 📘 **ICAI Study Material (SM)** (Chapter-wise Test Your Knowledge)
- 📗 **ICAI MCQ & Case Scenario Booklet**
- 📙 **Revision Test Papers (RTP)** (Nov 2024, May 2025, etc.)
- 📕 **Mock Test Papers (MTP)** (Series I & Series II)
- 📜 **Past Year Exam Questions (PYQ)**
- 📝 **Self-Study & Mentorship Bank**

### 2. Multi-Disciplinary Case Scenarios
- Native support for ICAI's integrated case scenarios with extensive facts and linked sub-questions (2 marks each).
- Clean side-by-side / split narrative reading view.

### 3. Practice & Flashcard Mode
- Instant evaluation of selected choices with visual cues (Green / Red).
- Complete ICAI statutory rationale, accounting standard paragraphs, and mathematical workings.
- Personal revision notes & mnemonics saved locally per question.
- Star / Bookmark high-yield questions for last-day revision.
- Keyboard shortcuts: `A`, `B`, `C`, `D` to pick options, `→` for next question.

### 4. ICAI Exam Simulator (30 Marks)
- Timed mock exam simulation matching real ICAI 30:70 MCQ test patterns.
- Real-time countdown timer with urgent visual indicators.
- Interactive **Question Palette** showing Answered, Not Answered, Marked for Review, and Not Visited statuses.
- Detailed Scorecard: Marks obtained, accuracy %, time taken per question, and full question-by-question review.

### 5. Mistake Notebook
- Automatically captures every question answered incorrectly.
- 1-click drill to practice only your mistakes until 100% conceptual mastery.

### 6. Intelligent Raw Text Parser & Bulk Importer
- Easily copy-paste questions from ICAI PDFs, booklets, or Telegram channels.
- Smart auto-detection of question stem, `(a)` to `(d)` options, and `Answer: X` lines.
- One-click JSON export/backup and CSV export for spreadsheets.

### 7. Modern UI & Netlify Ready
- Light / Dark mode toggle.
- 100% responsive on mobile devices, tablets, and desktops.
- Print / PDF export mode for offline revision sheets.
- Zero server dependencies—runs entirely in the browser using HTML5, CSS3, and JavaScript with `localStorage` persistence.

---

## 🚀 Continuous Deployment on Netlify

This project includes pre-configured `netlify.toml` and `_redirects` files. Whenever you push commits to your linked GitHub repository's `main` branch, Netlify will automatically build and publish the changes live within seconds.

---

## 🛠️ Local Development & Testing

You can open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari) or serve it with Python:

```bash
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.
