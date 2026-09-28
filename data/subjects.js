/**
 * ICAI Subjects, Sources, and Categories Metadata
 * Covers CA Final New Scheme subjects and all ICAI official material sources
 */

const ICAI_METADATA = {
  groups: {
    G1: { id: "G1", name: "Group 1", papers: "Papers 1, 2 & 3", subjects: ["FR", "AFM", "AUDIT"] },
    G2: { id: "G2", name: "Group 2", papers: "Papers 4, 5 & 6", subjects: ["DT", "IDT", "IBS"] },
    BOTH: { id: "BOTH", name: "Both Groups", papers: "All 6 Papers", subjects: ["FR", "AFM", "AUDIT", "DT", "IDT", "IBS"] }
  },
  subjects: [
    {
      id: "FR",
      name: "Financial Reporting (FR)",
      paper: "Paper 1",
      group: "G1",
      groupName: "Group 1",
      code: "FR",
      color: "#2563eb",
      icon: "fa-calculator",
      chapters: [
        "Ind AS 115: Revenue from Contracts with Customers",
        "Ind AS 116: Leases",
        "Ind AS 109 & 32: Financial Instruments",
        "Ind AS 103: Business Combinations",
        "Ind AS 110 & 28: Consolidated Financial Statements",
        "Ind AS 12: Income Taxes",
        "Ind AS 19: Employee Benefits",
        "Ind AS 36: Impairment of Assets",
        "Ind AS 33: Earnings Per Share",
        "Ind AS 102: Share-based Payment",
        "Ind AS 2: Inventories & Ind AS 16: PPE",
        "Ind AS 37: Provisions, Contingent Liabilities & Assets",
        "Ind AS 101: First-time Adoption of Ind AS",
        "Accounting and Reporting of Financial Instruments for NBFCs",
        "Professional and Ethical Duty of an Accountant"
      ]
    },
    {
      id: "AFM",
      name: "Advanced Financial Management (AFM)",
      paper: "Paper 2",
      group: "G1",
      groupName: "Group 1",
      code: "AFM",
      color: "#059669",
      icon: "fa-chart-line",
      chapters: [
        "Financial Policy and Corporate Strategy",
        "Risk Management",
        "Advanced Capital Budgeting Decisions",
        "Security Analysis",
        "Security Valuation (Equity, Debt, Hybrid)",
        "Portfolio Management",
        "Securitization",
        "Mutual Funds",
        "Derivatives Analysis and Valuation",
        "Foreign Exchange Exposure and Risk Management",
        "International Financial Management",
        "Interest Rate Risk Management",
        "Business Valuation",
        "Mergers, Acquisitions and Corporate Restructuring",
        "Startup Finance"
      ]
    },
    {
      id: "AUDIT",
      name: "Adv. Auditing, Assurance & Professional Ethics",
      paper: "Paper 3",
      group: "G1",
      groupName: "Group 1",
      code: "AUDIT",
      color: "#7c3aed",
      icon: "fa-shield-halved",
      chapters: [
        "Quality Control (SQC 1 & SA 220)",
        "General Auditing Principles & Auditor Responsibilities (SA 200-299)",
        "Audit Planning, Strategy and Execution (SA 300-499)",
        "Materiality, Risk Assessment and Internal Control (SA 315, 320, 330)",
        "Audit Evidence (SA 500-599)",
        "Completion and Review (SA 560, 570, 580)",
        "Reporting (SA 700, 701, 705, 706)",
        "Specialized Areas (Banks, NBFCs, Insurance)",
        "Audit of Public Sector Undertakings (PSUs)",
        "Internal Audit, Due Diligence, Investigation & Forensic Accounting",
        "Emerging Areas: Sustainable Development ESG Assurance",
        "Digital Auditing & Assurance (Automated Environment)",
        "Professional Ethics & Code of Conduct (Chartered Accountants Act, 1949)"
      ]
    },
    {
      id: "DT",
      name: "Direct Tax Laws & International Taxation",
      paper: "Paper 4",
      group: "G2",
      groupName: "Group 2",
      code: "DT",
      color: "#d97706",
      icon: "fa-scale-balanced",
      chapters: [
        "Basic Concepts, Basis of Charge & Residential Status",
        "Profits and Gains of Business or Profession (PGBP)",
        "Capital Gains & Income from Other Sources",
        "Taxation of Companies (including MAT u/s 115JB & Concessional regimes)",
        "Taxation of Charitable & Religious Trusts, Electoral Trusts",
        "Assessment of Various Entities (LLP, AOP/BOI, Securitisation Trusts, Business Trusts)",
        "Tax Deduction and Collection at Source (TDS/TCS)",
        "Income Tax Authorities, Assessment Procedure & Reassessment",
        "Appeals, Revision, Dispute Resolution & Rectification",
        "Penalties, Offences and Prosecution",
        "Transfer Pricing & Other Anti-Avoidance Measures (GAAR)",
        "Non-Resident Taxation, DTAA, Equalisation Levy & SEP",
        "Model Tax Conventions, BEPS Actions & MLI",
        "Black Money Act & Tax Treaties"
      ]
    },
    {
      id: "IDT",
      name: "Indirect Tax Laws (GST & Customs)",
      paper: "Paper 5",
      group: "G2",
      groupName: "Group 2",
      code: "IDT",
      color: "#dc2626",
      icon: "fa-receipt",
      chapters: [
        "GST: Supply under GST (Sec 7, Schedule I, II, III)",
        "GST: Charge of GST & Reverse Charge Mechanism (RCM)",
        "GST: Place of Supply of Goods & Services (IGST Sec 10-13)",
        "GST: Exemptions from GST",
        "GST: Time and Value of Supply (Sec 12, 13, 15)",
        "GST: Input Tax Credit (ITC - Sec 16, 17, 18 & Rules 36, 37, 42, 43)",
        "GST: Registration & Tax Invoice, Credit/Debit Notes, E-Way Bill",
        "GST: Accounts, Records, Returns & Payment of Tax",
        "GST: Refunds (Sec 54 & Inverted Duty Structure)",
        "GST: Assessment, Audit, Inspection, Search, Seizure & Arrest",
        "GST: Demand and Recovery, Advance Ruling, Appeals and Revision",
        "Customs: Levy, Exemptions, Classification & Valuation",
        "Customs: Importation, Exportation & Warehousing",
        "Customs: Duty Drawback, Baggage & Postal Goods",
        "Foreign Trade Policy (FTP): Schemes, RoDTEP & Advance Authorization"
      ]
    },
    {
      id: "IBS",
      name: "Integrated Business Solutions (IBS)",
      paper: "Paper 6",
      group: "G2",
      groupName: "Group 2",
      code: "IBS",
      color: "#0891b2",
      icon: "fa-puzzle-piece",
      chapters: [
        "Multidisciplinary Case Studies: FR + AFM",
        "Multidisciplinary Case Studies: FR + DT + Law",
        "Multidisciplinary Case Studies: GST + Customs + AFM",
        "Multidisciplinary Case Studies: Corporate Governance & Audit",
        "Strategic Financial Decisions & Capital Structure",
        "International Taxation & Cross-Border Supply Restructuring"
      ]
    }
  ],

  sources: [
    { id: "SM", name: "ICAI Study Material", label: "Study Material", badgeColor: "#3b82f6" },
    { id: "BOOKLET", name: "ICAI MCQ & Case Scenario Booklet", label: "MCQ Booklet", badgeColor: "#8b5cf6" },
    { id: "RTP", name: "Revision Test Paper (RTP)", label: "RTP", badgeColor: "#10b981" },
    { id: "MTP", name: "Mock Test Paper (MTP)", label: "MTP", badgeColor: "#f59e0b" },
    { id: "PYQ", name: "Past Year Question (PYQ)", label: "Past Exam (PYQ)", badgeColor: "#ef4444" },
    { id: "CUSTOM", name: "Self-Study & Mentorship Bank", label: "Practice", badgeColor: "#6b7280" }
  ],

  examSessions: [
    "Nov 2026",
    "May 2026",
    "Nov 2025",
    "May 2025",
    "Nov 2024",
    "May 2024",
    "Nov 2023",
    "May 2023",
    "Nov 2022",
    "May 2022",
    "ICAI New Scheme 2024-26 Edition",
    "General / All Editions"
  ],

  difficultyLevels: [
    { id: "Easy", name: "Easy / Direct", color: "#10b981" },
    { id: "Medium", name: "Medium / Conceptual", color: "#f59e0b" },
    { id: "Hard", name: "Hard / Practical & Tricky", color: "#ef4444" }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ICAI_METADATA;
}
