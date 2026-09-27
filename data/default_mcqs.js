/**
 * Comprehensive Default ICAI MCQs Bank
 * Covers Study Material, Booklet, RTP, MTP, PYQs across all CA Final Papers
 */

const DEFAULT_MCQS = [
  // ================= FINANCIAL REPORTING (FR) =================
  {
    id: "FR-001",
    subjectId: "FR",
    chapter: "Ind AS 115: Revenue from Contracts with Customers",
    source: "BOOKLET",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "A Ltd. enters into a contract with a customer on 1st April 2024 to build a commercial complex for ₹ 50 Crores with an incentive bonus of ₹ 5 Crores if completed within 24 months. At inception, A Ltd. estimates 90% probability of completion within 24 months. On 30th September 2024, due to sudden labor unrest, A Ltd. revises its estimate and concludes it is highly probable that a significant reversal in cumulative revenue will occur if the incentive is included. As per Ind AS 115, how should the variable consideration be recognized for the quarter ended 30th September 2024?",
    options: [
      { id: "A", text: "Continue recognizing 90% of the ₹ 5 Crores incentive on a proportionate basis as estimate changes are accounted only at completion." },
      { id: "B", text: "Exclude the entire ₹ 5 Crores incentive bonus from the transaction price and adjust cumulative revenue recognized to date." },
      { id: "C", text: "Recognize 50% of the incentive bonus under expected value approach regardless of the constraint." },
      { id: "D", text: "Treat the incentive bonus as an onerous contract provision under Ind AS 37 instead of Ind AS 115." }
    ],
    correctAnswer: "B",
    explanation: "Under Ind AS 115, paragraph 56 (Constraint on variable consideration), variable consideration is included in the transaction price only to the extent that it is highly probable that a significant reversal in cumulative revenue recognized will not occur. When circumstances change such that this threshold is no longer met, the variable consideration must be excluded and cumulative revenue recognized must be revised prospectively with a cumulative catch-up adjustment.",
    reference: "Ind AS 115, Paras 56-58; ICAI Study Material Chapter 4"
  },
  {
    id: "FR-002",
    subjectId: "FR",
    chapter: "Ind AS 116: Leases",
    source: "RTP",
    examSession: "Nov 2024",
    type: "standalone",
    marks: 2,
    difficulty: "Hard",
    question: "Entity X leases an equipment for 5 years with annual lease payments of ₹ 1,00,000 payable at the end of each year. The interest rate implicit in the lease is 8% (PV factor of annuity @ 8% for 5 years = 3.9927). At the end of Year 2, the lease agreement is modified to extend the lease term by an additional 2 years with revised annual rentals of ₹ 1,10,000. The modification is not a separate lease. At the modification date, Entity X's incremental borrowing rate is 7%. How should Entity X account for this lease modification?",
    options: [
      { id: "A", text: "Recognize the difference between old and new present value immediately in Profit and Loss." },
      { id: "B", text: "Remeasure the lease liability using the original discount rate of 8% and adjust the Right-of-Use (ROU) asset." },
      { id: "C", text: "Remeasure the lease liability discounting remaining payments using the revised discount rate of 7% and adjust the carrying amount of the ROU asset." },
      { id: "D", text: "Terminate the original lease, derecognize the ROU asset and liability, and recognize a new lease starting from Year 3." }
    ],
    correctAnswer: "C",
    explanation: "Under Ind AS 116, paragraph 45(c), for a lease modification that is not accounted for as a separate lease and increases the lease term, the lessee shall remeasure the lease liability by discounting the revised lease payments using a revised discount rate at the effective date of modification, with a corresponding adjustment to the Right-of-Use asset.",
    reference: "Ind AS 116, Paragraph 45; ICAI RTP Nov 2024"
  },
  {
    id: "FR-003",
    subjectId: "FR",
    chapter: "Ind AS 109 & 32: Financial Instruments",
    source: "SM",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 1,
    difficulty: "Easy",
    question: "Which of the following financial assets CANNOT be irrevocably designated at Fair Value Through Other Comprehensive Income (FVTOCI) by an entity at initial recognition?",
    options: [
      { id: "A", text: "Equity instruments not held for trading" },
      { id: "B", text: "Debt instruments whose business model is both to collect contractual cash flows and sell financial assets, meeting SPPI test" },
      { id: "C", text: "Equity instruments held for active short-term trading" },
      { id: "D", text: "Strategic long-term investments in unquoted equity shares of an associate where significant influence does not exist" }
    ],
    correctAnswer: "C",
    explanation: "Under Ind AS 109, paragraph 5.7.5, an entity may make an irrevocable election at initial recognition to present subsequent changes in fair value in OCI for particular investments in equity instruments that are *not* held for trading. Equity instruments held for trading must mandatorily be measured at FVTPL.",
    reference: "Ind AS 109, Para 5.7.5; ICAI Study Material Module 2"
  },
  {
    id: "FR-004",
    subjectId: "FR",
    chapter: "Ind AS 103: Business Combinations",
    source: "PYQ",
    examSession: "May 2024",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "Alpha Ltd. acquires 80% equity interest in Beta Ltd. on 1st July 2023 for ₹ 400 Crores. On that date, Beta Ltd.'s identifiable net assets have a fair value of ₹ 450 Crores. Alpha Ltd. elects to measure Non-Controlling Interest (NCI) at its proportionate share of the identifiable net assets. What is the Goodwill or Bargain Purchase Gain arising on this acquisition?",
    options: [
      { id: "A", text: "Goodwill of ₹ 40 Crores" },
      { id: "B", text: "Gain on Bargain Purchase of ₹ 40 Crores" },
      { id: "C", text: "Goodwill of ₹ 50 Crores" },
      { id: "D", text: "Gain on Bargain Purchase of ₹ 50 Crores" }
    ],
    correctAnswer: "A",
    explanation: "Identifiable net assets = ₹ 450 Cr. Proportionate share of NCI (20%) = ₹ 90 Cr. Purchase Consideration = ₹ 400 Cr. Net Identifiable Assets acquired (80% of ₹ 450 Cr) = ₹ 360 Cr. Goodwill = Consideration (₹ 400 Cr) + NCI (₹ 90 Cr) - Net Assets (₹ 450 Cr) = ₹ 40 Crores.",
    reference: "Ind AS 103, Paragraph 32; ICAI Past Paper May 2024"
  },

  // ================= ADVANCED FINANCIAL MANAGEMENT (AFM) =================
  {
    id: "AFM-001",
    subjectId: "AFM",
    chapter: "Foreign Exchange Exposure and Risk Management",
    source: "BOOKLET",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "An Indian exporter has a receivable of USD 5,00,000 due in 3 months. The spot rate is USD/INR 83.20/83.22. The 3-month forward rate is USD/INR 83.60/83.65. The 3-month borrowing rates are 8.00% p.a. in India and 5.00% p.a. in the US. If the exporter covers the receivable via a forward contract, what is the locked-in rupee inflow?",
    options: [
      { id: "A", text: "₹ 4,16,00,000" },
      { id: "B", text: "₹ 4,18,00,000" },
      { id: "C", text: "₹ 4,18,25,000" },
      { id: "D", text: "₹ 4,16,10,000" }
    ],
    correctAnswer: "B",
    explanation: "The exporter will sell USD forward to the bank. The bank will buy USD at its BID rate for forward contract: USD/INR 83.60. Total Rupee inflow = USD 5,00,000 × 83.60 = ₹ 4,18,00,000.",
    reference: "AFM Chapter 10: Foreign Exchange Risk Management; ICAI MCQ Booklet"
  },
  {
    id: "AFM-002",
    subjectId: "AFM",
    chapter: "Derivatives Analysis and Valuation",
    source: "MTP",
    examSession: "May 2025",
    type: "standalone",
    marks: 2,
    difficulty: "Hard",
    question: "Nifty 50 index spot is currently at 22,000. The risk-free rate of interest is 7% p.a. continuously compounded. The annual dividend yield on Nifty is expected to be 1.5% continuously compounded. According to the Cost of Carry model, what is the fair price of a 6-month Nifty futures contract? [Given: e^(0.0275) = 1.02788]",
    options: [
      { id: "A", text: "22,613.36" },
      { id: "B", text: "22,965.20" },
      { id: "C", text: "21,405.12" },
      { id: "D", text: "22,350.00" }
    ],
    correctAnswer: "A",
    explanation: "Under continuous compounding, Futures Price F = S × e^((r - q) × T). Here, r - q = 0.07 - 0.015 = 0.055. T = 6/12 = 0.5 year. Exponent = 0.055 × 0.5 = 0.0275. Given e^(0.0275) = 1.02788. F = 22,000 × 1.02788 = 22,613.36.",
    reference: "AFM Chapter 9: Derivatives Analysis; ICAI MTP Series I"
  },
  {
    id: "AFM-003",
    subjectId: "AFM",
    chapter: "Portfolio Management",
    source: "SM",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 1,
    difficulty: "Medium",
    question: "Portfolio P has an expected return of 18%, standard deviation of 20%, and Beta of 1.25. The market return is 14% with a market standard deviation of 15%, and the risk-free rate is 6%. What is the Treynor's Measure and Jensen's Alpha for Portfolio P?",
    options: [
      { id: "A", text: "Treynor = 9.60%, Alpha = +2.00%" },
      { id: "B", text: "Treynor = 0.60, Alpha = -1.50%" },
      { id: "C", text: "Treynor = 9.60%, Alpha = +3.50%" },
      { id: "D", text: "Treynor = 12.00%, Alpha = +1.00%" }
    ],
    correctAnswer: "A",
    explanation: "Treynor Ratio = (Rp - Rf) / Beta = (18% - 6%) / 1.25 = 12% / 1.25 = 9.60%. Expected return as per CAPM = Rf + Beta × (Rm - Rf) = 6% + 1.25 × (14% - 6%) = 6% + 10% = 16%. Jensen's Alpha = Rp - CAPM Return = 18% - 16% = +2.00%.",
    reference: "AFM Chapter 6: Portfolio Management; ICAI Study Material"
  },

  // ================= AUDIT & PROFESSIONAL ETHICS =================
  {
    id: "AUD-001",
    subjectId: "AUDIT",
    chapter: "Professional Ethics & Code of Conduct (Chartered Accountants Act, 1949)",
    source: "BOOKLET",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "CA Smart, a practicing Chartered Accountant, is offered statutory audit of Zenith Ltd. for FY 2024-25. Zenith Ltd. has also engaged CA Smart's proprietary consulting firm to maintain its books of accounts and prepare internal financial controls reports for the same financial year. As per Section 144 of the Companies Act, 2013 and ICAI Code of Ethics, which of the following is correct?",
    options: [
      { id: "A", text: "CA Smart can accept the audit provided audit fees and consulting fees are separately billed and disclosed." },
      { id: "B", text: "CA Smart is disqualified from accepting the statutory audit because accounting and book-keeping services are prohibited under Section 144 of the Companies Act, 2013." },
      { id: "C", text: "CA Smart can accept if the audit committee gives unanimous prior approval." },
      { id: "D", text: "CA Smart can accept if he assigns the book-keeping task to an articled assistant." }
    ],
    correctAnswer: "B",
    explanation: "Under Section 144 of the Companies Act, 2013, an auditor cannot provide accounting and book-keeping services, internal audit, or design/implementation of financial information systems to the company, holding, or subsidiary company, directly or through relatives/associates. Doing so disqualifies the auditor and constitutes professional misconduct under the CA Act, 1949.",
    reference: "Companies Act 2013, Sec 144; ICAI Code of Ethics; Audit Chapter 13"
  },
  {
    id: "AUD-002",
    subjectId: "AUDIT",
    chapter: "Reporting (SA 700, 701, 705, 706)",
    source: "PYQ",
    examSession: "Nov 2023",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "Under SA 701, which of the following matters should be communicated as a Key Audit Matter (KAM) in the auditor's report of a listed entity?",
    options: [
      { id: "A", text: "Matters that resulted in a qualified or adverse opinion as per SA 705." },
      { id: "B", text: "Matters that, in the auditor's professional judgment, were of most significance in the audit of the financial statements of the current period, selected from matters communicated with TCWG." },
      { id: "C", text: "Any confidential matter specifically prohibited from disclosure by the Board of Directors." },
      { id: "D", text: "All matters discussed during the entrance meeting with the management." }
    ],
    correctAnswer: "B",
    explanation: "SA 701, paragraph 8 defines Key Audit Matters as those matters that, in the auditor's professional judgment, were of most significance in the audit of the financial statements of the current period. These are selected from matters communicated with those charged with governance (TCWG). Note that matters resulting in a modified opinion are reported in the Basis for Modification section, not as KAM (SA 701.12).",
    reference: "SA 701, Paras 8 & 12; ICAI Study Material Module 1"
  },
  {
    id: "AUD-003",
    subjectId: "AUDIT",
    chapter: "Quality Control (SQC 1 & SA 220)",
    source: "RTP",
    examSession: "May 2024",
    type: "standalone",
    marks: 1,
    difficulty: "Easy",
    question: "Under SQC 1, what is the mandatory retention period for audit documentation (working papers) for audit engagements from the date of the auditor's report?",
    options: [
      { id: "A", text: "Not shorter than 5 years" },
      { id: "B", text: "Not shorter than 7 years" },
      { id: "C", text: "Not shorter than 8 years" },
      { id: "D", text: "Not shorter than 10 years" }
    ],
    correctAnswer: "B",
    explanation: "SQC 1 requires that the retention period for audit documentation is ordinarily no shorter than seven years from the date of the auditor's report, or, if later, the date of the group auditor's report.",
    reference: "SQC 1, Para 83; ICAI Study Material Paper 3"
  },

  // ================= DIRECT TAX LAWS (DT) =================
  {
    id: "DT-001",
    subjectId: "DT",
    chapter: "Transfer Pricing & Other Anti-Avoidance Measures (GAAR)",
    source: "SM",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "Under Section 92CE of the Income-tax Act, 1961, secondary adjustment is applicable when primary adjustment to transfer price exceeds which monetary threshold and pertains to which assessment year onwards?",
    options: [
      { id: "A", text: "Exceeds ₹ 50 Lakhs made in respect of AY 2018-19 onwards" },
      { id: "B", text: "Exceeds ₹ 1 Crore made in respect of AY 2017-18 onwards" },
      { id: "C", text: "Exceeds ₹ 2 Crores made in respect of AY 2020-21 onwards" },
      { id: "D", text: "Exceeds ₹ 5 Crores made in respect of any assessment year" }
    ],
    correctAnswer: "B",
    explanation: "Section 92CE(2) provides that secondary adjustment shall not apply if the amount of primary adjustment made in the case of an assessee in any previous year does not exceed ₹ 1 Crore, AND the primary adjustment is made in respect of Assessment Year 2017-18 or any earlier year.",
    reference: "Income-tax Act, Sec 92CE; ICAI DT Study Material Chapter 11"
  },
  {
    id: "DT-002",
    subjectId: "DT",
    chapter: "Tax Deduction and Collection at Source (TDS/TCS)",
    source: "BOOKLET",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 2,
    difficulty: "Hard",
    question: "During FY 2024-25, Buyer B (turnover of ₹ 15 Crores in FY 2023-24) purchases goods worth ₹ 65 Lakhs from Seller S (turnover of ₹ 12 Crores in FY 2023-24). Both Section 194Q (TDS on purchase of goods) and Section 206C(1H) (TCS on sale of goods) potentially apply. How should the transaction be subjected to tax withholding/collection?",
    options: [
      { id: "A", text: "Seller S must collect TCS @ 0.1% u/s 206C(1H) on ₹ 15 Lakhs; Section 194Q does not apply." },
      { id: "B", text: "Buyer B must deduct TDS @ 0.1% u/s 194Q on ₹ 15 Lakhs; Section 206C(1H) will not apply as Section 194Q takes precedence." },
      { id: "C", text: "Both TDS @ 0.1% and TCS @ 0.1% must be applied simultaneously on ₹ 15 Lakhs." },
      { id: "D", text: "Neither TDS nor TCS applies as threshold of ₹ 1 Crore per transaction is not breached." }
    ],
    correctAnswer: "B",
    explanation: "Under Section 206C(1H), the second proviso explicitly stipulates that TCS shall not apply if the buyer is liable to deduct tax at source under any other provision of the Act (including Section 194Q) and has deducted such amount. Thus, Section 194Q has overriding priority over Section 206C(1H). Buyer B deducts TDS @ 0.1% on the amount exceeding ₹ 50 Lakhs (i.e. ₹ 15 Lakhs).",
    reference: "Income-tax Act, Sec 194Q & 206C(1H); CBDT Circular No. 13/2021"
  },
  {
    id: "DT-003",
    subjectId: "DT",
    chapter: "Taxation of Companies (including MAT u/s 115JB & Concessional regimes)",
    source: "PYQ",
    examSession: "May 2024",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "While computing Book Profit under Section 115JB for FY 2024-25, which of the following items is DEDUCTED from the net profit shown in the statement of profit and loss?",
    options: [
      { id: "A", text: "Expenditure relatable to exempt income under Section 10(1)" },
      { id: "B", text: "Amount carried to any reserve by whatever name called" },
      { id: "C", text: "Lower of brought forward unabsorbed business loss or unabsorbed depreciation as per books of account" },
      { id: "D", text: "Provision for diminution in the value of any asset" }
    ],
    correctAnswer: "C",
    explanation: "Under Explanation 1 to Section 115JB(2), clause (iii), the amount of loss brought forward or unabsorbed depreciation, whichever is less as per books of account, is deducted. If either loss or depreciation is Nil, no deduction is allowed (unless the company is under CIRP/IBC).",
    reference: "Income-tax Act, Sec 115JB(2) Explanation 1; ICAI Study Material"
  },

  // ================= INDIRECT TAX LAWS (IDT) =================
  {
    id: "IDT-001",
    subjectId: "IDT",
    chapter: "GST: Input Tax Credit (ITC - Sec 16, 17, 18 & Rules 36, 37, 42, 43)",
    source: "BOOKLET",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "Under Section 17(5)(a) of the CGST Act, 2017, input tax credit is blocked on motor vehicles for transportation of persons having approved seating capacity of not more than 13 persons (including driver), EXCEPT when they are used for which of the following specified purposes?",
    options: [
      { id: "A", text: "Transportation of company directors between factory and head office" },
      { id: "B", text: "Making further taxable supply of such motor vehicles, transportation of passengers, or imparting training on driving such motor vehicles" },
      { id: "C", text: "Sales executives visiting client locations across multiple states" },
      { id: "D", text: "Security personnel patrolling company premises" }
    ],
    correctAnswer: "B",
    explanation: "Section 17(5)(a) allows ITC on motor vehicles for transportation of persons (seating capacity <= 13) ONLY when used for: (A) further supply of such vehicles, (B) transportation of passengers, or (C) imparting training on driving such vehicles. All other business uses are blocked.",
    reference: "CGST Act 2017, Sec 17(5)(a); ICAI IDT Study Material Chapter 8"
  },
  {
    id: "IDT-002",
    subjectId: "IDT",
    chapter: "GST: Place of Supply of Goods & Services (IGST Sec 10-13)",
    source: "RTP",
    examSession: "Nov 2024",
    type: "standalone",
    marks: 2,
    difficulty: "Hard",
    question: "Mr. Raj, an unregistered person residing in Jaipur (Rajasthan), attends an in-person 3-day corporate tax seminar organized by an event management company registered in Mumbai (Maharashtra). The seminar is physically conducted at a convention resort in Goa. What is the Place of Supply and the nature of GST payable?",
    options: [
      { id: "A", text: "Jaipur (Rajasthan); Inter-state IGST payable" },
      { id: "B", text: "Mumbai (Maharashtra); Intra-state CGST + SGST payable" },
      { id: "C", text: "Goa; Inter-state IGST payable" },
      { id: "D", text: "Goa; Intra-state Goa CGST + SGST payable" }
    ],
    correctAnswer: "C",
    explanation: "Under Section 12(7)(a)(ii) of the IGST Act, the place of supply of services provided by way of organization of a cultural, artistic, educational, or entertainment event to an UNREGISTERED person is the place where the event is actually held. The event was held in Goa. Supplier is in Mumbai (Maharashtra), place of supply is Goa; hence it is an Inter-State supply liable to IGST.",
    reference: "IGST Act, Sec 12(7); ICAI RTP Nov 2024"
  },
  {
    id: "IDT-003",
    subjectId: "IDT",
    chapter: "Customs: Levy, Exemptions, Classification & Valuation",
    source: "SM",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "standalone",
    marks: 2,
    difficulty: "Medium",
    question: "An importer imports machinery with FOB value of USD 10,000. Sea freight is not ascertainable from the documents, and insurance is USD 112.50. Under Rule 10(2) of the Customs Valuation (Determination of Value of Imported Goods) Rules, 2007, what amount shall be added towards freight/transportation for arriving at CIF value?",
    options: [
      { id: "A", text: "20% of FOB value (USD 2,000)" },
      { id: "B", text: "1.125% of FOB value (USD 112.50)" },
      { id: "C", text: "Actual cost of destination port charges only" },
      { id: "D", text: "10% of FOB value (USD 1,000)" }
    ],
    correctAnswer: "A",
    explanation: "Under the third proviso to Rule 10(2) of Customs Valuation Rules, 2007, where sea freight is not ascertainable, it shall be taken as 20% of the FOB value of goods (i.e. 20% of USD 10,000 = USD 2,000). For air transport, freight is restricted to 20% even if actual is higher.",
    reference: "Customs Valuation Rules 2007, Rule 10(2); ICAI Customs Chapter 3"
  },

  // ================= CASE SCENARIO 1 (INTEGRATED CASE STUDY) =================
  {
    id: "CASE-001",
    subjectId: "IBS",
    chapter: "Multidisciplinary Case Studies: FR + DT + Law",
    source: "BOOKLET",
    examSession: "ICAI New Scheme 2024-26 Edition",
    type: "case_scenario",
    title: "Case Scenario: M/s Stellar Infra Ltd. - Corporate Acquisition & Reconstruction",
    scenarioText: `M/s Stellar Infra Ltd. ('SIL') is a listed Indian infrastructure conglomerate with an annual turnover exceeding ₹ 2,500 Crores. On 1st October 2024, SIL entered into a composite scheme of arrangement to acquire 100% equity shares of Orbit Pipelines Ltd. ('OPL') from its erstwhile promoters.

Key aspects of the transaction and financial data are as follows:
1. Purchase Consideration: SIL issued 2 Crores equity shares of face value ₹ 10 each (fair market value ₹ 150 per share) and paid cash of ₹ 100 Crores.
2. In addition, SIL agreed to pay contingent consideration of ₹ 50 Crores on 31st March 2026 if OPL achieves EBITDA of ₹ 80 Crores in FY 2025-26. At the acquisition date (1st October 2024), SIL estimated the fair value of this contingent liability to be ₹ 30 Crores (discount rate 10%). By 31st March 2025, due to unprecedented pipeline tariff revisions, the estimated fair value of the contingent liability rose to ₹ 42 Crores.
3. Book value of OPL's net identifiable assets on 1st October 2024 was ₹ 220 Crores. Fair value of OPL's identifiable assets and liabilities was assessed at ₹ 310 Crores (including unrecorded customer contracts valued at ₹ 40 Crores).
4. OPL had unabsorbed business loss of ₹ 45 Crores and unabsorbed depreciation of ₹ 35 Crores under the Income-tax Act, 1961. OPL satisfies all conditions of Section 72A of the Income-tax Act.
5. In FY 2024-25, SIL also purchased capital machinery worth ₹ 1.2 Crores from an overseas vendor without deducting TDS under Section 195, claiming the vendor has no PE in India, although the vendor provided technical installation supervision on-site in India for 45 days.`,
    subQuestions: [
      {
        subId: "CASE-001-Q1",
        question: "Under Ind AS 103 (Business Combinations), what is the total Purchase Consideration at the acquisition date (1st October 2024), and what Goodwill arises on this acquisition?",
        options: [
          { id: "A", text: "Consideration = ₹ 400 Cr; Goodwill = ₹ 90 Cr" },
          { id: "B", text: "Consideration = ₹ 430 Cr; Goodwill = ₹ 120 Cr" },
          { id: "C", text: "Consideration = ₹ 450 Cr; Goodwill = ₹ 140 Cr" },
          { id: "D", text: "Consideration = ₹ 480 Cr; Goodwill = ₹ 170 Cr" }
        ],
        correctAnswer: "B",
        explanation: "Purchase consideration = Equity Shares (2 Cr × ₹ 150 = ₹ 300 Cr) + Cash (₹ 100 Cr) + Fair Value of Contingent Consideration (₹ 30 Cr) = ₹ 430 Crores. Fair value of net identifiable assets = ₹ 310 Crores. Goodwill = Purchase Consideration (₹ 430 Cr) - Net Assets (₹ 310 Cr) = ₹ 120 Crores.",
        marks: 2
      },
      {
        subId: "CASE-001-Q2",
        question: "How should the change in fair value of the contingent consideration from ₹ 30 Crores to ₹ 42 Crores on 31st March 2025 be accounted for under Ind AS 103 / Ind AS 109?",
        options: [
          { id: "A", text: "Adjust against Goodwill as it occurred within 12 months of acquisition." },
          { id: "B", text: "Recognize the ₹ 12 Crores increase in Statement of Profit and Loss as an expense." },
          { id: "C", text: "Recognize the ₹ 12 Crores in Other Comprehensive Income (OCI) without recycling." },
          { id: "D", text: "Defer the ₹ 12 Crores and adjust upon final settlement in March 2026." }
        ],
        correctAnswer: "B",
        explanation: "Under Ind AS 103, paragraph 58, contingent consideration classified as a financial liability is measured at fair value at each reporting date, and changes in fair value are recognized in Profit or Loss (Ind AS 109). It cannot be adjusted against goodwill because the change results from post-acquisition events (tariff revision) and is not a measurement period correction of facts existing at the acquisition date.",
        marks: 2
      },
      {
        subId: "CASE-001-Q3",
        question: "Under Section 72A of the Income-tax Act, 1961, can SIL set off OPL's unabsorbed business loss and unabsorbed depreciation upon amalgamation?",
        options: [
          { id: "A", text: "No, Section 72A benefits apply only to manufacturing companies and not infrastructure companies." },
          { id: "B", text: "Yes, SIL can carry forward and set off both unabsorbed loss and unabsorbed depreciation for a fresh period of 8 years from the year of amalgamation." },
          { id: "C", text: "Only unabsorbed depreciation can be set off; unabsorbed business loss lapses immediately upon change of shareholding." },
          { id: "D", text: "Yes, but both loss and depreciation can be set off only against future income of OPL's pipeline division, not SIL's overall profits." }
        ],
        correctAnswer: "B",
        explanation: "Under Section 72A, in an amalgamation of a company owning an industrial undertaking (which includes infrastructure facilities), the accumulated loss and unabsorbed depreciation of the amalgamating company become that of the amalgamated company. The accumulated loss can be carried forward for a fresh period of 8 years.",
        marks: 2
      }
    ]
  },

  // ================= CASE SCENARIO 2 =================
  {
    id: "CASE-002",
    subjectId: "IDT",
    chapter: "GST: Supply under GST (Sec 7, Schedule I, II, III)",
    source: "MTP",
    examSession: "Nov 2024",
    type: "case_scenario",
    title: "Case Scenario: Apex Global Logistics - Cross-Border Transactions & GST Taxability",
    scenarioText: `Apex Global Logistics ('AGL') is a multi-modal freight logistics provider headquartered in Chennai, Tamil Nadu, registered under GST. During Q3 of FY 2024-25, AGL handled the following transactions:

1. Transaction 1: High Sea Sales - AGL purchased consignments of solar inverters from a German supplier while goods were on the high seas and transferred title documents to an Indian buyer in Ahmedabad (Gujarat) before clearance for home consumption.
2. Transaction 2: Out-and-Out Supplies (Merchant Trading) - AGL procured medical equipment from Singapore and sold directly to a hospital in Colombo (Sri Lanka) without the goods ever entering India.
3. Transaction 3: Warehoused Goods Sale - Imported copper cathodes stored in a Customs Bonded Warehouse in Mumbai were sold to an Indian manufacturer before filing Ex-Bond Bill of Entry.
4. Transaction 4: AGL provided ocean freight service to an Indian exporter for transportation of goods by vessel from Chennai port to Jebel Ali, UAE.`,
    subQuestions: [
      {
        subId: "CASE-002-Q1",
        question: "Under Schedule III of the CGST Act, 2017, which of the transactions carried out by AGL are treated as NEITHER a supply of goods NOR a supply of services?",
        options: [
          { id: "A", text: "Transactions 1 and 2 only" },
          { id: "B", text: "Transactions 1, 2, and 3" },
          { id: "C", text: "Transactions 2 and 3 only" },
          { id: "D", text: "All transactions 1, 2, 3, and 4" }
        ],
        correctAnswer: "B",
        explanation: "Under Schedule III of the CGST Act, 2017: Para 7 covers supply of goods from a non-taxable territory to another non-taxable territory without entering India (Transaction 2); Para 8(a) covers supply of warehoused goods before clearance for home consumption (Transaction 3); Para 8(b) covers high sea sales (Transaction 1). All three are treated as neither a supply of goods nor services.",
        marks: 2
      },
      {
        subId: "CASE-002-Q2",
        question: "Regarding Transaction 4 (ocean freight for export of goods by vessel outside India), what is the GST liability as per current GST provisions?",
        options: [
          { id: "A", text: "Exempt from GST under Notification No. 12/2017-CT(R) indefinitely" },
          { id: "B", text: "Taxable under forward charge @ 5% as the temporary exemption for transportation of goods by vessel/air from India to outside India has expired" },
          { id: "C", text: "Zero-rated export of service even if the recipient is an Indian entity" },
          { id: "D", text: "Subject to RCM payable by the UAE consignee" }
        ],
        correctAnswer: "B",
        explanation: "The exemption granted for transportation of goods by vessel or aircraft from customs station of clearance in India to a place outside India (Entry 19B of Notification 12/2017) expired on 30th September 2022 and was not extended. Hence, transportation of goods by vessel to outside India provided to an Indian exporter is taxable @ 5% under forward charge.",
        marks: 2
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEFAULT_MCQS;
}
