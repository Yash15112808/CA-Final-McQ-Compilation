/**
 * Pre-Imported Study Management Data
 * Includes:
 * 1. Pre-imported subject-wise chapters with standard lecture counts
 * 2. Indian Calendar Holidays and Major Festivals
 * 3. ICAI Exam Schedules
 */

const STUDY_CHAPTERS_DATA = {
  FR: [
    { id: "FR-CH-01", name: "Ind AS 1: Presentation of Financial Statements", totalLectures: 4, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-02", name: "Ind AS 2: Inventories", totalLectures: 4, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-03", name: "Ind AS 7: Statement of Cash Flows", totalLectures: 4, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-04", name: "Ind AS 8: Accounting Policies, Changes in Estimates & Errors", totalLectures: 3, defaultWeightage: "3-5 Marks" },
    { id: "FR-CH-05", name: "Ind AS 10: Events after the Reporting Period", totalLectures: 3, defaultWeightage: "3-5 Marks" },
    { id: "FR-CH-06", name: "Ind AS 12: Income Taxes", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "FR-CH-07", name: "Ind AS 16: Property, Plant and Equipment", totalLectures: 6, defaultWeightage: "6-8 Marks" },
    { id: "FR-CH-08", name: "Ind AS 19: Employee Benefits", totalLectures: 6, defaultWeightage: "5-8 Marks" },
    { id: "FR-CH-09", name: "Ind AS 20: Accounting for Government Grants", totalLectures: 3, defaultWeightage: "3-5 Marks" },
    { id: "FR-CH-10", name: "Ind AS 21: Effects of Changes in Foreign Exchange Rates", totalLectures: 5, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-11", name: "Ind AS 23: Borrowing Costs", totalLectures: 3, defaultWeightage: "3-5 Marks" },
    { id: "FR-CH-12", name: "Ind AS 24: Related Party Disclosures", totalLectures: 3, defaultWeightage: "3-5 Marks" },
    { id: "FR-CH-13", name: "Ind AS 27: Separate Financial Statements", totalLectures: 3, defaultWeightage: "3-4 Marks" },
    { id: "FR-CH-14", name: "Ind AS 28: Investments in Associates and Joint Ventures", totalLectures: 4, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-15", name: "Ind AS 33: Earnings Per Share", totalLectures: 5, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-16", name: "Ind AS 34: Interim Financial Reporting", totalLectures: 3, defaultWeightage: "3-4 Marks" },
    { id: "FR-CH-17", name: "Ind AS 36: Impairment of Assets", totalLectures: 5, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-18", name: "Ind AS 37: Provisions, Contingent Liabilities & Contingent Assets", totalLectures: 4, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-19", name: "Ind AS 38: Intangible Assets", totalLectures: 5, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-20", name: "Ind AS 40: Investment Property", totalLectures: 3, defaultWeightage: "3-4 Marks" },
    { id: "FR-CH-21", name: "Ind AS 41: Agriculture", totalLectures: 3, defaultWeightage: "3-4 Marks" },
    { id: "FR-CH-22", name: "Ind AS 101: First-time Adoption of Ind AS", totalLectures: 4, defaultWeightage: "4-5 Marks" },
    { id: "FR-CH-23", name: "Ind AS 102: Share-based Payment", totalLectures: 6, defaultWeightage: "5-8 Marks" },
    { id: "FR-CH-24", name: "Ind AS 103: Business Combinations", totalLectures: 18, defaultWeightage: "14-16 Marks" },
    { id: "FR-CH-25", name: "Ind AS 105: Non-current Assets Held for Sale & Discontinued Ops", totalLectures: 4, defaultWeightage: "4-5 Marks" },
    { id: "FR-CH-26", name: "Ind AS 108: Operating Segments", totalLectures: 4, defaultWeightage: "4-5 Marks" },
    { id: "FR-CH-27", name: "Ind AS 113: Fair Value Measurement", totalLectures: 4, defaultWeightage: "4-5 Marks" },
    { id: "FR-CH-28", name: "Ind AS 115: Revenue from Contracts with Customers", totalLectures: 14, defaultWeightage: "10-15 Marks" },
    { id: "FR-CH-29", name: "Ind AS 116: Leases", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "FR-CH-30", name: "Financial Instruments (Ind AS 32, 109 & 107)", totalLectures: 22, defaultWeightage: "12-16 Marks" },
    { id: "FR-CH-31", name: "Ind AS 110: Consolidated Financial Statements", totalLectures: 16, defaultWeightage: "14-16 Marks" },
    { id: "FR-CH-32", name: "Ind AS 111 & 112: Joint Arrangements & Disclosures", totalLectures: 4, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-33", name: "Accounting and Reporting for NBFCs", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "FR-CH-34", name: "Professional and Ethical Duty of a CA", totalLectures: 4, defaultWeightage: "4-5 Marks" },
    { id: "FR-CH-35", name: "Technology and Accounting (Digital Reporting)", totalLectures: 3, defaultWeightage: "3-4 Marks" }
  ],
  AFM: [
    { id: "AFM-CH-01", name: "Financial Policy and Corporate Strategy", totalLectures: 5, defaultWeightage: "4-6 Marks" },
    { id: "AFM-CH-02", name: "Risk Management", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "AFM-CH-03", name: "Advanced Capital Budgeting Decisions", totalLectures: 12, defaultWeightage: "8-12 Marks" },
    { id: "AFM-CH-04", name: "Security Analysis", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "AFM-CH-05", name: "Security Valuation (Equity, Debt, Hybrid)", totalLectures: 14, defaultWeightage: "10-14 Marks" },
    { id: "AFM-CH-06", name: "Portfolio Management", totalLectures: 16, defaultWeightage: "12-16 Marks" },
    { id: "AFM-CH-07", name: "Securitization", totalLectures: 4, defaultWeightage: "4-5 Marks" },
    { id: "AFM-CH-08", name: "Mutual Funds", totalLectures: 6, defaultWeightage: "6-8 Marks" },
    { id: "AFM-CH-09", name: "Derivatives Analysis and Valuation", totalLectures: 18, defaultWeightage: "12-16 Marks" },
    { id: "AFM-CH-10", name: "Foreign Exchange Exposure and Risk Management", totalLectures: 20, defaultWeightage: "14-18 Marks" },
    { id: "AFM-CH-11", name: "International Financial Management", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "AFM-CH-12", name: "Interest Rate Risk Management", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "AFM-CH-13", name: "Business Valuation", totalLectures: 12, defaultWeightage: "8-12 Marks" },
    { id: "AFM-CH-14", name: "Mergers, Acquisitions and Corporate Restructuring", totalLectures: 14, defaultWeightage: "10-14 Marks" },
    { id: "AFM-CH-15", name: "Startup Finance", totalLectures: 4, defaultWeightage: "4-5 Marks" }
  ],
  AUDIT: [
    { id: "AUD-CH-01", name: "Quality Control (SQC 1 & SA 220)", totalLectures: 6, defaultWeightage: "6-8 Marks" },
    { id: "AUD-CH-02", name: "General Principles & Responsibilities (SA 200-299)", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "AUD-CH-03", name: "Audit Planning, Strategy & Execution (SA 300-499)", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "AUD-CH-04", name: "Audit Evidence (SA 500-599)", totalLectures: 12, defaultWeightage: "10-12 Marks" },
    { id: "AUD-CH-05", name: "Using Work of Others (SA 600-699)", totalLectures: 4, defaultWeightage: "4-6 Marks" },
    { id: "AUD-CH-06", name: "Audit Conclusions & Reporting (SA 700, 701, 705, 706)", totalLectures: 10, defaultWeightage: "8-12 Marks" },
    { id: "AUD-CH-07", name: "Specialized Areas: Banks & Insurance", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "AUD-CH-08", name: "Specialized Areas: NBFCs", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "AUD-CH-09", name: "Audit of Public Sector Undertakings (PSUs)", totalLectures: 4, defaultWeightage: "4-5 Marks" },
    { id: "AUD-CH-10", name: "Internal Audit, Investigation & Forensic Accounting", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "AUD-CH-11", name: "Sustainable Development ESG Assurance", totalLectures: 5, defaultWeightage: "4-6 Marks" },
    { id: "AUD-CH-12", name: "Digital Auditing & Assurance (Automated Environment)", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "AUD-CH-13", name: "Professional Ethics & CA Act, 1949", totalLectures: 16, defaultWeightage: "16-20 Marks" }
  ],
  DT: [
    { id: "DT-CH-01", name: "Basic Concepts & Residential Status", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "DT-CH-02", name: "Profits and Gains of Business or Profession (PGBP)", totalLectures: 22, defaultWeightage: "14-18 Marks" },
    { id: "DT-CH-03", name: "Capital Gains & Other Sources", totalLectures: 14, defaultWeightage: "8-12 Marks" },
    { id: "DT-CH-04", name: "Taxation of Companies (MAT u/s 115JB & Concessions)", totalLectures: 12, defaultWeightage: "10-14 Marks" },
    { id: "DT-CH-05", name: "Taxation of Charitable & Religious Trusts", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "DT-CH-06", name: "Assessment of Various Entities (LLP, AOP, Business Trusts)", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "DT-CH-07", name: "Tax Deduction and Collection at Source (TDS/TCS)", totalLectures: 12, defaultWeightage: "8-10 Marks" },
    { id: "DT-CH-08", name: "Assessment Procedure & Reassessment (Sec 147-151)", totalLectures: 14, defaultWeightage: "10-12 Marks" },
    { id: "DT-CH-09", name: "Appeals, Revision, Dispute Resolution & Rectification", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "DT-CH-10", name: "Penalties, Offences and Prosecution", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "DT-CH-11", name: "Transfer Pricing & GAAR (Sec 92 - 92F, 95-102)", totalLectures: 16, defaultWeightage: "12-16 Marks" },
    { id: "DT-CH-12", name: "Non-Resident Taxation, DTAA & Equalisation Levy", totalLectures: 18, defaultWeightage: "14-18 Marks" },
    { id: "DT-CH-13", name: "Model Tax Conventions, BEPS Actions & MLI", totalLectures: 10, defaultWeightage: "6-8 Marks" },
    { id: "DT-CH-14", name: "Black Money Act & Tax Treaties", totalLectures: 4, defaultWeightage: "4-5 Marks" }
  ],
  IDT: [
    { id: "IDT-CH-01", name: "GST: Supply under GST (Sec 7, Schedule I, II, III)", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "IDT-CH-02", name: "GST: Charge of GST & Reverse Charge (RCM)", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "IDT-CH-03", name: "GST: Place of Supply of Goods & Services (IGST 10-13)", totalLectures: 12, defaultWeightage: "8-12 Marks" },
    { id: "IDT-CH-04", name: "GST: Exemptions from GST", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "IDT-CH-05", name: "GST: Time and Value of Supply (Sec 12, 13, 15)", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "IDT-CH-06", name: "GST: Input Tax Credit (ITC - Sec 16, 17, 18 & Rules)", totalLectures: 18, defaultWeightage: "14-18 Marks" },
    { id: "IDT-CH-07", name: "GST: Registration, Tax Invoice & E-Way Bill", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "IDT-CH-08", name: "GST: Accounts, Records, Returns & Payment of Tax", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "IDT-CH-09", name: "GST: Refunds (Sec 54 & Inverted Duty Structure)", totalLectures: 10, defaultWeightage: "6-8 Marks" },
    { id: "IDT-CH-10", name: "GST: Assessment, Audit, Inspection & Search", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "IDT-CH-11", name: "GST: Demand and Recovery, Appeals and Revision", totalLectures: 10, defaultWeightage: "8-10 Marks" },
    { id: "IDT-CH-12", name: "Customs: Levy, Exemptions, Classification & Valuation", totalLectures: 12, defaultWeightage: "10-12 Marks" },
    { id: "IDT-CH-13", name: "Customs: Importation, Exportation & Warehousing", totalLectures: 8, defaultWeightage: "6-8 Marks" },
    { id: "IDT-CH-14", name: "Customs: Duty Drawback, Baggage & Postal Goods", totalLectures: 6, defaultWeightage: "4-6 Marks" },
    { id: "IDT-CH-15", name: "Foreign Trade Policy (FTP): Advance Auth & RoDTEP", totalLectures: 8, defaultWeightage: "6-8 Marks" }
  ],
  IBS: [
    { id: "IBS-CH-01", name: "Integrated Case Studies: FR + AFM Synergies", totalLectures: 8, defaultWeightage: "25 Marks" },
    { id: "IBS-CH-02", name: "Integrated Case Studies: FR + Direct Tax Restructuring", totalLectures: 8, defaultWeightage: "25 Marks" },
    { id: "IBS-CH-03", name: "Integrated Case Studies: GST + Customs Supply Chain", totalLectures: 6, defaultWeightage: "25 Marks" },
    { id: "IBS-CH-04", name: "Integrated Case Studies: Corporate Governance & Audit", totalLectures: 6, defaultWeightage: "25 Marks" }
  ]
};

const INDIAN_HOLIDAYS_AND_FESTIVALS = [
  // 2026 / 2027 Key Dates
  { date: "2026-01-14", name: "Makar Sankranti / Pongal", type: "festival", desc: "Harvest festival celebrated across India" },
  { date: "2026-01-26", name: "Republic Day", type: "national", desc: "National Holiday - Constitution of India enacted" },
  { date: "2026-02-15", name: "Maha Shivratri", type: "festival", desc: "Great night of Shiva" },
  { date: "2026-03-03", name: "Holi (Festival of Colors)", type: "festival", desc: "Celebration of colors and spring" },
  { date: "2026-03-20", name: "Eid-ul-Fitr", type: "festival", desc: "Islamic holy festival of joy" },
  { date: "2026-03-31", name: "Mahavir Jayanti", type: "festival", desc: "Birth of Lord Mahavira" },
  { date: "2026-04-03", name: "Good Friday", type: "festival", desc: "Christian Holy Day" },
  { date: "2026-04-14", name: "Dr. B.R. Ambedkar Jayanti", type: "gazetted", desc: "Father of Indian Constitution" },
  { date: "2026-05-02", name: "ICAI CA Final May Exam Window Starts", type: "icai", desc: "CA Final May Examination Window Begins" },
  { date: "2026-05-27", name: "Bakrid / Eid al-Adha", type: "festival", desc: "Festival of sacrifice" },
  { date: "2026-07-01", name: "CA Day (ICAI Foundation Day)", type: "icai", desc: "77th Chartered Accountants Day celebrating ICAI!" },
  { date: "2026-08-15", name: "Independence Day", type: "national", desc: "National Holiday - Indian Independence" },
  { date: "2026-08-28", name: "Raksha Bandhan", type: "festival", desc: "Bond of protection and love" },
  { date: "2026-09-04", name: "Janmashtami", type: "festival", desc: "Celebration of birth of Lord Krishna" },
  { date: "2026-09-14", name: "Ganesh Chaturthi", type: "festival", desc: "Lord Ganesha arrival festival" },
  { date: "2026-10-02", name: "Mahatma Gandhi Jayanti", type: "national", desc: "National Holiday - Gandhi Jayanti" },
  { date: "2026-10-20", name: "Dussehra / Vijayadashami", type: "festival", desc: "Victory of good over evil" },
  { date: "2026-11-01", name: "ICAI CA Final Nov Exam Window Starts", type: "icai", desc: "CA Final November Examination Window Begins" },
  { date: "2026-11-08", name: "Diwali (Deepavali)", type: "festival", desc: "Festival of Lights - Auspicious Lakshmi Puja" },
  { date: "2026-11-09", name: "Govardhan Puja / Nutan Varsh", type: "festival", desc: "Gujarati New Year / Annakut" },
  { date: "2026-11-10", name: "Bhai Dooj", type: "festival", desc: "Celebration of sibling bond" },
  { date: "2026-11-24", name: "Guru Nanak Jayanti", type: "festival", desc: "Birth of Guru Nanak Dev Ji" },
  { date: "2026-12-25", name: "Christmas Day", type: "festival", desc: "Celebration of Christmas" },
  // 2027 Key Dates
  { date: "2027-01-14", name: "Makar Sankranti", type: "festival", desc: "Harvest celebration" },
  { date: "2027-01-26", name: "Republic Day", type: "national", desc: "National Holiday" },
  { date: "2027-03-22", name: "Holi", type: "festival", desc: "Festival of Colors" },
  { date: "2027-05-02", name: "ICAI CA Final May Exam Window", type: "icai", desc: "CA Final May Examination Window" },
  { date: "2027-07-01", name: "CA Day", type: "icai", desc: "Chartered Accountants Day" },
  { date: "2027-08-15", name: "Independence Day", type: "national", desc: "National Holiday" },
  { date: "2027-10-29", name: "Diwali", type: "festival", desc: "Festival of Lights" },
  { date: "2027-11-01", name: "ICAI CA Final Nov Exam Window", type: "icai", desc: "CA Final November Examination Window" }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STUDY_CHAPTERS_DATA, INDIAN_HOLIDAYS_AND_FESTIVALS };
}
