/**
 * Descriptive / Practical Writing Questions Database
 * Covers Study Material, RTP, MTP, and PYQ (with explicit Exam Session/Year)
 */

const DEFAULT_WRITING_QUESTIONS = [
  // ================= FINANCIAL REPORTING (FR) =================
  {
    id: "FR-WQ-001",
    subjectId: "FR",
    chapter: "Ind AS 115: Revenue from Contracts with Customers",
    source: "RTP",
    examSession: "Nov 2024",
    marks: 8,
    title: "Practical Question on Variable Consideration & Significant Financing Component",
    question: `Zenith Infrastructure Ltd. enters into a contract with Metro Rail Corporation on 1st April 2023 to construct an elevated viaduct for a fixed consideration of ₹ 120 Crores. In addition, the contract stipulates that if the project is completed within 20 months (i.e., on or before 30th November 2024), Zenith Ltd. will receive a performance bonus of ₹ 15 Crores.

Contract facts and estimates:
1. At inception, based on historical construction execution, Zenith Ltd. estimates an 85% probability that the project will be completed within 20 months and concludes it is highly probable that a significant reversal of cumulative revenue will not occur.
2. Zenith Ltd. measures progress toward completion using the input method based on costs incurred relative to total estimated costs.
3. Total expected construction costs at inception were ₹ 90 Crores.
4. As of 31st March 2024, cumulative costs incurred amounted to ₹ 54 Crores.
5. On 30th June 2024, an unforeseen geological fault caused a 3-month halt. Zenith Ltd. reassessed the project timeline and concluded that it is no longer probable that the project will be completed within 20 months. Total estimated costs were revised to ₹ 96 Crores, and cumulative costs incurred up to 30th June 2024 were ₹ 60 Crores.

Required:
(i) Compute the transaction price and revenue to be recognized for the financial year ended 31st March 2024.
(ii) Determine the cumulative catch-up adjustment required for the quarter ended 30th June 2024 in accordance with Ind AS 115.`,
    solution: `**Suggested Answer / Working Notes:**

**(i) For the year ended 31st March 2024:**

1. **Determination of Transaction Price:**
   Under Ind AS 115, paragraph 56, an entity includes variable consideration (bonus) in the transaction price only to the extent that it is highly probable that a significant reversal in the cumulative revenue recognized will not occur.
   Since Zenith Ltd. assesses an 85% probability of achieving the milestone and satisfies the constraint threshold:
   - Fixed Consideration = ₹ 120 Crores
   - Incentive Bonus = ₹ 15 Crores
   - **Total Transaction Price at 31st March 2024 = ₹ 135 Crores.**

2. **Measuring Progress (Input Method):**
   - Percentage of Completion = (Cumulative Costs Incurred / Total Estimated Costs) × 100
   - Progress = (₹ 54 Crores / ₹ 90 Crores) = **60%**

3. **Revenue to be recognized for FY 2023-24:**
   - Revenue Recognized = 60% of ₹ 135 Crores = **₹ 81.00 Crores.**

---

**(ii) For the quarter ended 30th June 2024:**

1. **Revision of Transaction Price:**
   Due to the geological disruption, it is no longer probable that the bonus will be earned. In accordance with Ind AS 115.56, the variable consideration must be excluded from the transaction price.
   - Revised Transaction Price = **₹ 120 Crores** (bonus of ₹ 15 Cr excluded).

2. **Revised Progress of Completion as on 30th June 2024:**
   - Revised Total Estimated Costs = ₹ 96 Crores
   - Cumulative Costs Incurred up to 30th June 2024 = ₹ 60 Crores
   - Revised Progress = (₹ 60 Cr / ₹ 96 Cr) = **62.50%**

3. **Cumulative Revenue allowable up to 30th June 2024:**
   - Allowable Cumulative Revenue = 62.50% × ₹ 120 Crores = **₹ 75.00 Crores.**

4. **Accounting Adjustment in Q1 (Quarter ended 30th June 2024):**
   - Cumulative Revenue recognized up to 31st March 2024 = ₹ 81.00 Crores
   - Revised Cumulative Revenue required = ₹ 75.00 Crores
   - **Revenue Reversal / Negative Revenue in Q1 = ₹ 81.00 Cr - ₹ 75.00 Cr = ₹ 6.00 Crores (Debit to Revenue).**

*Conclusion:* In accordance with Ind AS 115 paragraph 59, the reduction of ₹ 6 Crores is recognized as a cumulative catch-up adjustment against revenue in the period of estimate revision.`,
    reference: "Ind AS 115, Paras 56-59; ICAI RTP Nov 2024"
  },

  {
    id: "FR-WQ-002",
    subjectId: "FR",
    chapter: "Ind AS 116: Leases",
    source: "PYQ",
    examSession: "May 2024",
    marks: 10,
    title: "Comprehensive Lease Accounting: Lessee Books with Initial Direct Costs and Restoration Provision",
    question: `On 1st April 2023, Delta Ltd. entered into an agreement to lease an industrial manufacturing plant for a term of 5 years. Annual lease payments of ₹ 25,00,000 are payable at the end of each year.

Additional facts:
1. Delta Ltd. incurred initial direct costs of ₹ 3,50,000 in negotiating and executing the lease agreement.
2. The lease agreement mandates that Delta Ltd. dismantle the installed heavy equipment and restore the site to its original condition at the end of Year 5. Delta Ltd. estimates that the present value of the restoration obligation at 1st April 2023 is ₹ 6,00,000 (discount rate 10%).
3. The interest rate implicit in the lease is 9% per annum.
4. Cumulative Present Value factors at 9%:
   - Year 1: 0.9174
   - Year 2: 0.8417
   - Year 3: 0.7722
   - Year 4: 0.7084
   - Year 5: 0.6499
   - Total PV of Annuity for 5 years @ 9% = 3.8896
5. Delta Ltd. depreciates the Right-of-Use (ROU) asset on a straight-line basis over 5 years.

Required:
(i) Compute the initial value of Lease Liability and Right-of-Use (ROU) Asset on 1st April 2023.
(ii) Prepare the Lease Liability amortization schedule for all 5 years.
(iii) Compute the amounts to be charged to the Statement of Profit and Loss for Year 1 (FY 2023-24).`,
    solution: `**Suggested Answer / Working Notes:**

**(i) Initial Measurement on 1st April 2023:**

1. **Initial Lease Liability:**
   - Annual payment = ₹ 25,00,000
   - PVAF (5 years, 9%) = 3.8896
   - Initial Lease Liability = ₹ 25,00,000 × 3.8896 = **₹ 97,24,000**

2. **Initial Right-of-Use (ROU) Asset:**
   Under Ind AS 116, paragraph 24:
   ROU Asset = Initial Lease Liability + Initial Direct Costs + PV of Restoration Obligation (Ind AS 37)
   - Initial Lease Liability: ₹ 97,24,000
   - Initial Direct Costs: ₹ 3,50,000
   - Dismantling / Restoration Provision: ₹ 6,00,000
   - **Total Carrying Amount of ROU Asset = ₹ 1,06,74,000**

---

**(ii) Lease Liability Amortization Schedule (in ₹):**

| Year | Opening Balance | Finance Cost @ 9% | Lease Payment | Closing Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Year 1** | 97,24,000 | 8,75,160 | 25,00,000 | 80,99,160 |
| **Year 2** | 80,99,160 | 7,28,924 | 25,00,000 | 63,28,084 |
| **Year 3** | 63,28,084 | 5,69,528 | 25,00,000 | 43,97,612 |
| **Year 4** | 43,97,612 | 3,95,785 | 25,00,000 | 22,93,397 |
| **Year 5** | 22,93,397 | 2,06,603* | 25,00,000 | 0 |
*(Adjusted for rounding)*

---

**(iii) Amounts Charged to Statement of Profit and Loss for Year 1 (FY 2023-24):**

1. **Depreciation on ROU Asset:**
   - Straight-line depreciation = ₹ 1,06,74,000 / 5 years = **₹ 21,34,800**
2. **Finance Cost on Lease Liability:**
   - 9% on ₹ 97,24,000 = **₹ 8,75,160**
3. **Unwinding of Discount on Restoration Provision (Ind AS 37):**
   - 10% on ₹ 6,00,000 = **₹ 60,000**

**Total Charge to Statement of Profit and Loss for Year 1 = ₹ 30,69,960.**`,
    reference: "Ind AS 116, Paras 24-26; Past Exam Paper May 2024"
  },

  // ================= ADVANCED FINANCIAL MANAGEMENT (AFM) =================
  {
    id: "AFM-WQ-001",
    subjectId: "AFM",
    chapter: "Foreign Exchange Exposure and Risk Management",
    source: "MTP",
    examSession: "May 2025",
    marks: 10,
    title: "Practical Hedging Strategy: Forward Contract vs Money Market Hedge",
    question: `An Indian exporting firm, Hind Exports Ltd., has an invoice receivable of USD 4,00,000 due in 6 months.

The financial manager obtains the following market quotes:
- Spot Rate: USD/INR 83.40 / 83.45
- 6-Month Forward Rate: USD/INR 83.95 / 84.05

Annual interest rates (6 months):
- India (INR): Borrowing 8.50% p.a., Deposit 7.00% p.a.
- United States (USD): Borrowing 5.50% p.a., Deposit 4.00% p.a.

Required:
(i) Calculate the rupee inflow if Hind Exports Ltd. covers the exposure using a Forward Contract.
(ii) Show step-by-step how a Money Market Hedge can be constructed and compute the net rupee realization.
(iii) Advise the financial manager on which hedging alternative is more beneficial.`,
    solution: `**Suggested Answer / Working Notes:**

**(i) Alternative 1: Forward Contract Hedge:**
The Indian exporter will sell USD 4,00,000 forward to the bank.
- Applicable 6-month forward rate (Bank buys USD at BID rate) = **USD/INR 83.95**
- **Total Rupee Realization = USD 4,00,000 × 83.95 = ₹ 3,35,80,000.**

---

**(ii) Alternative 2: Money Market Hedge (MMH):**
Since the company has a foreign currency *receivable*, the steps are:
1. **Borrow USD today** such that the borrowed amount plus 6 months interest equals exactly USD 4,00,000.
   - 6-month USD borrowing rate = 5.50% / 2 = 2.75%
   - Amount of USD to borrow today = USD 4,00,000 / (1 + 0.0275) = **USD 3,89,294.40**

2. **Convert borrowed USD into INR at the Spot Rate today:**
   - Spot BID rate = USD/INR 83.40
   - INR Inflow today = USD 3,89,294.40 × 83.40 = **₹ 3,24,67,153**

3. **Invest INR in Indian money market for 6 months at the deposit rate:**
   - 6-month INR deposit rate = 7.00% / 2 = 3.50%
   - Future INR Value in 6 months = ₹ 3,24,67,153 × (1 + 0.035) = **₹ 3,36,03,503**

4. **Settlement in 6 months:**
   - The export receivable of USD 4,00,000 is used directly to repay the USD loan with interest.

---

**(iii) Comparison & Recommendation:**
- Realization via Forward Contract = ₹ 3,35,80,000
- Realization via Money Market Hedge = ₹ 3,36,03,503
- **Net Gain under Money Market Hedge = ₹ 23,503.**

**Advice:** Hind Exports Ltd. should select the **Money Market Hedge** as it delivers an additional ₹ 23,503 over the Forward Contract.`,
    reference: "AFM Chapter 10: Foreign Exchange Exposure; ICAI MTP May 2025"
  },

  // ================= DIRECT TAX LAWS (DT) =================
  {
    id: "DT-WQ-001",
    subjectId: "DT",
    chapter: "Transfer Pricing & Other Anti-Avoidance Measures (GAAR)",
    source: "SM",
    examSession: "ICAI New Scheme 2024-26 Edition",
    marks: 8,
    title: "Secondary Adjustment under Section 92CE & Additional Income Tax",
    question: `M/s Vistara India Ltd. ('VIL') is an Indian subsidiary of Vistara Global Inc., USA. During the previous year 2023-24, VIL sold customized precision microchips to its parent company for ₹ 42 Crores.

During the assessment proceedings, the Transfer Pricing Officer (TPO) applied the Transactional Net Margin Method (TNMM) and computed the Arm's Length Price (ALP) at ₹ 48 Crores. The primary adjustment of ₹ 6 Crores was determined and accepted by VIL in an order dated 31st January 2025.

Facts:
1. The primary adjustment exceeds ₹ 1 Crore and pertains to AY 2024-25.
2. VIL did not repatriate the excess money of ₹ 6 Crores from Vistara Global Inc. into India within the prescribed time limit of 90 days from the date of the assessment order.
3. The marginal cost of funds lending rate of SBI as on 1st April 2024 was 8.50%.
4. VIL chose to pay the additional income-tax under Section 92CE(2A) in lieu of continuous secondary adjustment interest.

Required:
(i) What is the prescribed time limit for repatriation of excess money under Rule 10CB?
(ii) What are the tax consequences if the excess money is not repatriated within the time limit?
(iii) Compute the additional income-tax payable by VIL under Section 92CE(2A).`,
    solution: `**Suggested Answer / Working Notes:**

**(i) Prescribed Time Limit for Repatriation (Rule 10CB):**
Under Rule 10CB of the Income-tax Rules, 1962, where the primary adjustment is determined by an assessment order made by the Assessing Officer / TPO and accepted by the assessee, the excess money shall be repatriated to India within **90 days from the date of the order** (i.e., within 90 days from 31st January 2025).

---

**(ii) Tax Consequences of Non-Repatriation:**
Under Section 92CE(1), where primary adjustment exceeds ₹ 1 Crore and the excess money is not repatriated within the prescribed 90 days:
1. Such excess money is deemed to be an advance made by the Indian company to the Associated Enterprise (AE).
2. Interest on such advance is charged every year at the prescribed rate:
   - For transactions in INR: SBI 1-year MCLR on 1st April + 325 basis points (i.e., 8.50% + 3.25% = **11.75% p.a.**).
   - This interest is added annually to the total income of the Indian company until repatriation.

---

**(iii) Additional Income-Tax under Section 92CE(2A):**
Under Section 92CE(2A), the assessee has the option to pay additional income-tax on the excess money in lieu of continuous annual interest inclusion:
- **Base Tax Rate:** 18%
- **Mandatory Surcharge:** 12% (irrespective of income level)
- **Health and Education Cess:** 4%

**Effective Tax Rate Computation:**
- Tax = 18%
- Surcharge @ 12% on 18% = 2.16%
- Subtotal = 20.16%
- Cess @ 4% on 20.16% = 0.8064%
- **Effective Tax Rate = 20.9664%**

**Computation of Tax Amount on ₹ 6 Crores:**
- Additional Income-Tax = ₹ 6,00,00,000 × 20.9664% = **₹ 1,25,79,840**

*Key Legal Note:* Once this additional income-tax is paid, no further interest under Section 92CE(1) shall be calculated, and no deduction or credit shall be allowed for this tax under any provision of the Act.`,
    reference: "Income-tax Act 1961, Section 92CE; Rule 10CB; ICAI Study Material"
  },

  // ================= INDIRECT TAX LAWS (IDT) =================
  {
    id: "IDT-WQ-001",
    subjectId: "IDT",
    chapter: "GST: Input Tax Credit (ITC - Sec 16, 17, 18 & Rules)",
    source: "RTP",
    examSession: "May 2025",
    marks: 10,
    title: "Computation of Eligible and Ineligible ITC under Section 17(5) and Rule 37",
    question: `M/s Shaurya Manufacturing Ltd., a registered supplier in Pune (Maharashtra), provides the following details of inputs, capital goods, and input services received during the month of October 2024:

| S.No | Description of Inward Supply | GST Amount (₹) |
| :--- | :--- | :--- |
| 1 | Raw materials purchased from vendor (Invoice received, goods received in factory in two lots; first lot received in Oct 2024, second lot received in Nov 2024) | 4,50,000 |
| 2 | Motor vehicles purchased for transportation of factory employees (seating capacity: 25 persons including driver) | 3,20,000 |
| 3 | Outdoor catering services availed for Annual General Meeting (AGM) of shareholders (not statutorily mandatory under any law) | 65,000 |
| 4 | Life and health insurance for factory workers (obligatory for employer under Factories Act, 1948) | 90,000 |
| 5 | Specialized equipment purchased for pollution control in factory | 2,80,000 |
| 6 | Goods stolen from factory raw material store (proper FIR lodged) | 75,000 |
| 7 | Payment for an inward supply of ₹ 2,00,000 (GST ₹ 36,000) received on 10th March 2024 was not paid to the vendor within 180 days from the invoice date | 36,000 |

Compute the net eligible Input Tax Credit (ITC) available to M/s Shaurya Manufacturing Ltd. for the month of October 2024 with detailed statutory reasons for each item.`,
    solution: `**Suggested Answer / Working Notes:**

### Computation of Eligible ITC for October 2024:

| Item | Particulars | Eligible ITC (₹) | Ineligible / Reversed (₹) | Legal Provision & Statutory Reason |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Raw materials received in lots | **0** | 4,50,000 | Under first proviso to Section 16(2), where goods are received in lots/installments, ITC can be availed only upon receipt of the **last lot**. Since the second lot is received in Nov 2024, ITC cannot be claimed in Oct 2024. |
| **2** | Motor vehicles (25 persons) | **3,20,000** | 0 | Under Section 17(5)(a), ITC is blocked only on motor vehicles with seating capacity <= 13 persons. Since seating capacity is 25 persons (> 13), ITC is fully eligible. |
| **3** | Outdoor catering for AGM | **0** | 65,000 | Blocked under Section 17(5)(b)(i) unless used in the same category of outward taxable supply or obligatory under statutory law. |
| **4** | Health insurance for workers | **90,000** | 0 | Under proviso to Section 17(5)(b), ITC on insurance is allowed where it is obligatory for an employer to provide the same to its employees under any law for the time being in force (Factories Act, 1948). |
| **5** | Pollution control equipment | **2,80,000** | 0 | Plant & Machinery used in the course or furtherance of business. Eligible under Section 16(1). |
| **6** | Stolen goods | **0** | 75,000 | Blocked explicitly under Section 17(5)(h) (goods lost, stolen, destroyed, written off or disposed of by way of gift or free samples). |
| **7** | Unpaid supply > 180 days | **-36,000** | 36,000 | Second proviso to Section 16(2) read with Rule 37: If payment to vendor is not made within 180 days from invoice date, an amount equal to ITC availed must be paid along with interest under Section 50. |

---

### Net Available ITC Calculation:
- Motor Vehicles: ₹ 3,20,000
- Health Insurance: ₹ 90,000
- Pollution Control Equipment: ₹ 2,80,000
- **Gross Eligible ITC:** ₹ 6,90,000
- Less: Rule 37 Reversal (Unpaid > 180 days): (₹ 36,000)
- **Net ITC Available to be credited to Electronic Credit Ledger for Oct 2024 = ₹ 6,54,000.**`,
    reference: "CGST Act 2017, Sections 16(2), 17(5); Rule 37; ICAI RTP May 2025"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEFAULT_WRITING_QUESTIONS;
}
