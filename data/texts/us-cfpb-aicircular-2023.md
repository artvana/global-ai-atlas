---
id: us-cfpb-aicircular-2023
title: "CFPB Circular 2023-03: Adverse Action Notification Requirements and the Equal Credit Opportunity Act in the Context of Artificial Intelligence"
short_name: "CFPB Circular on AI in Credit Decisions"
jurisdiction: CFPB
enacted_date: 2023-09-19
status: in_force
official_url: https://www.consumerfinance.gov/compliance/supervisory-guidance/circulars/circular-2023-03/
fetched_date: 2026-04-29
---

# CFPB Circular 2023-03: Adverse Action Notification Requirements and the Equal Credit Opportunity Act in the Context of Artificial Intelligence

*Consumer Financial Protection Bureau*
*Circular 2023-03*
*Issued: September 19, 2023*

---

## Overview

The Consumer Financial Protection Bureau (CFPB or Bureau) is issuing this Circular to provide guidance on the adverse action notification requirements of the Equal Credit Opportunity Act (ECOA) and its implementing regulation, Regulation B, as applied to credit decisions made using artificial intelligence (AI) and complex algorithmic models.

This Circular clarifies that creditors must provide applicants with specific and accurate reasons for adverse actions—including credit denials and unfavorable changes to credit terms—even when those decisions are made or influenced by complex AI models. The use of complex machine learning models does not exempt creditors from these requirements. Providing vague or generic reasons, or reasons that do not accurately reflect the actual basis for an adverse credit decision, violates ECOA and Regulation B.

This Circular is addressed to persons subject to the CFPB's supervisory and enforcement authority, including banks, credit unions, and nonbank financial companies that offer consumer credit products.

---

## I. Background: The Equal Credit Opportunity Act and Adverse Action Requirements

### A. Statutory Framework

The Equal Credit Opportunity Act (15 U.S.C. § 1691 et seq.) prohibits discrimination against credit applicants on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has the capacity to contract), the fact that all or part of the applicant's income derives from any public assistance program, or the fact that the applicant has in good faith exercised any right under the Consumer Credit Protection Act.

ECOA's implementing regulation, Regulation B (12 C.F.R. Part 1002), establishes specific procedural requirements applicable to credit decisions, including requirements related to adverse action notifications.

### B. Adverse Action Notification Requirements

Under ECOA and Regulation B:

1. **Definition of Adverse Action**: An adverse action includes a denial or revocation of credit, a change in the terms of an existing credit arrangement, or a refusal to grant credit in substantially the amount or on substantially the terms requested (12 C.F.R. § 1002.2(c)).

2. **Notification Requirement**: A creditor must notify an applicant of an adverse action within 30 days of receiving a completed application (for credit granted on a case-by-case basis) or within 30 days of taking adverse action on an existing account.

3. **Statement of Reasons**: The adverse action notice must contain a statement of specific reasons for the action taken, or a disclosure of the applicant's right to receive such a statement (12 C.F.R. § 1002.9(a)(2)).

4. **Specificity of Reasons**: The reasons provided must be specific. The regulation explicitly provides that "checklist" reasons — such as "credit application incomplete" or "insufficient credit references" — are acceptable only where they accurately describe the principal reasons for the adverse action. Reasons that are vague or do not reflect the actual basis for the decision do not satisfy the requirements.

5. **Model Form**: Appendix C to Regulation B provides model notices that creditors may use to comply with the adverse action notification requirements. The model forms include a list of reasons that may be used where accurate.

### C. The FCRA Adverse Action Framework

In addition to ECOA requirements, the Fair Credit Reporting Act (FCRA) also imposes adverse action notification requirements when an adverse action is based in whole or in part on a consumer report (15 U.S.C. § 1681m). Users of consumer reports who take adverse action must provide the consumer with a notice that includes:

- The name, address, and telephone number of the consumer reporting agency that furnished the report;
- A statement that the consumer reporting agency did not make the adverse decision;
- The consumer's right to obtain a free copy of the consumer report; and
- The consumer's right to dispute the accuracy or completeness of any information in the consumer report.

Both the ECOA/Regulation B and FCRA adverse action requirements apply concurrently where a consumer report was used in an AI-assisted credit decision.

---

## II. AI and Machine Learning in Credit Decisions: Overview

### A. Prevalence of AI in Credit Decisioning

Creditors increasingly use AI and machine learning (ML) models in credit underwriting and pricing decisions. These models may:

- Generate credit risk scores that are used as inputs to manual underwriting decisions;
- Fully automate credit decisions without human review;
- Generate risk scores using many more variables (potentially hundreds or thousands) than traditional statistical models;
- Use complex, non-linear modeling techniques — such as gradient boosted trees, neural networks, or deep learning models — whose decision logic is not readily interpretable.

AI-powered credit models may also:
- Use alternative data sources such as rent payment history, utility payments, deposit account transaction data, or data derived from digital footprints;
- Generate credit decisions in real time;
- Continuously update based on new data (dynamic or online learning models).

### B. The "Black Box" Problem

Traditional credit scoring models (such as FICO scores based on logistic regression) are relatively transparent: the contribution of each input variable to the score can be calculated using straightforward mathematical relationships. The reasons for a credit denial can be identified by examining which input variables most negatively affected the score.

Complex AI models, including deep learning models and gradient boosted ensemble models, may not have a similarly transparent structure. The relationship between inputs and outputs may be complex, non-linear, and interactive — meaning that the effect of any given input variable depends on the values of other variables. This creates challenges for identifying the "reasons" for an adverse action.

Some creditors have responded to this challenge by:
- Providing generic, imprecise reasons that do not accurately reflect the model's actual decision logic;
- Using a single "proxy" model to generate reasons that the primary AI model does not actually use;
- Applying model explainability techniques (such as SHAP values or LIME) to approximate the contribution of individual factors to AI decisions.

### C. The Bureau's Position

The Bureau has determined that the technical complexity of an AI or machine learning model does not alter or reduce a creditor's obligations under ECOA and Regulation B. All creditors using AI systems to make adverse credit decisions must comply with the full requirements of the adverse action notification framework, including providing specific and accurate reasons.

The Bureau acknowledges that some creditors may face technical challenges in extracting specific, accurate reasons from complex AI models. However, the Bureau has determined that these technical challenges do not constitute a legal defense to ECOA and Regulation B violations. If a creditor cannot generate specific, accurate reasons for an adverse action from its AI model, the creditor faces a compliance risk that must be addressed at the model design and deployment stage.

---

## III. Legal Analysis: What ECOA Requires

### A. The "Specific Reasons" Requirement

Regulation B § 1002.9(b)(2) provides that a statement of reasons for adverse action must be "specific" and must indicate "the principal reason(s) for the adverse action." The Official Interpretations to Regulation B (12 C.F.R. Part 1002, Supp. I) provide that:

> "The statement of reasons for adverse action required by § 1002.9(a)(2) must be specific and indicate the principal reason(s) for the adverse action. Statements that the applicant failed to achieve a qualifying score on the creditor's credit scoring system are insufficient."

The requirement to provide specific reasons serves two distinct regulatory purposes:

1. **Notice to Applicants**: Enabling consumers who have been denied credit to understand why they were denied, so they can take corrective action (e.g., paying down debt, correcting errors in a credit report) or seek credit elsewhere.

2. **Anti-Discrimination Enforcement**: Enabling applicants, regulators, and courts to identify whether the reasons for a credit denial are pretextual or reflect unlawful discrimination. If creditors can provide only vague or generic reasons for adverse actions, it becomes much harder to detect patterns of discriminatory lending.

### B. What Constitutes a "Specific Reason"

A reason is specific if it accurately identifies a factor that actually contributed to the adverse credit decision. For example:

- "Serious delinquency" — specific, identifies late payment history as a contributing factor
- "Level of delinquency on accounts" — specific
- "Too many accounts recently opened" — specific
- "Your credit score was too low" — **not specific** (fails to identify what caused the low score)
- "Does not meet our credit standards" — **not specific** (fails to identify any particular factor)
- "Complex algorithm" — **not specific**

Under complex AI models, creditors must use model explainability techniques or other methods to identify the factors that most significantly contributed to the adverse action for each individual applicant. A statement citing the most important factors — as determined by a validated explainability technique applied to the actual AI model used for the decision — may satisfy the specificity requirement.

### C. The Accuracy Requirement

Reasons provided must not only be specific but must also be **accurate** — they must reflect factors that actually contributed to the adverse decision for the particular applicant.

The Bureau has identified two common AI-related compliance failures related to accuracy:

**1. Proxy Model Problem**
Some creditors use a separate, simpler model to generate adverse action reasons, rather than extracting reasons from the primary AI model used for the decision. This practice violates the accuracy requirement if the proxy model's output does not accurately reflect the actual reasons the primary model took adverse action. The reasons must reflect the basis for the actual adverse decision, not a hypothetical or approximate reason generated by a different model.

**2. Generic Reasons Problem**
Some creditors use standard lists of adverse action reasons that are not tailored to the individual applicant's situation. For example, if an AI model denies credit primarily because of the applicant's low payment history, but the adverse action notice cites "income level" (which was not a significant factor), this is an inaccurate reason that violates Regulation B.

### D. Number of Reasons Required

Regulation B requires disclosure of the **principal reasons** for adverse action — generally interpreted as the most significant factors contributing to the decision. The model forms in Appendix C list space for up to four reasons. Creditors should identify and provide the top factors that drove the adverse action for each individual, ranked by their relative contribution.

---

## IV. Model Explainability Techniques and Compliance

### A. Explainable AI (XAI) Methods

The Bureau acknowledges that various model explainability techniques have been developed that can be used to identify the contribution of individual input variables to complex AI model outputs. These techniques include:

- **SHAP (SHapley Additive exPlanations)**: A game-theoretic approach that assigns each feature a contribution value for a particular prediction, based on the average marginal contribution of the feature across all possible feature combinations.
- **LIME (Local Interpretable Model-agnostic Explanations)**: A technique that approximates the behavior of a complex model in the neighborhood of a specific prediction using a simpler, interpretable model.
- **Partial Dependence Plots and Individual Conditional Expectation**: Visualization tools that show the marginal effect of one or two features on the predicted outcome.
- **Feature importance scores**: Aggregated measures of how much each feature contributes to model predictions across the training dataset.

### B. Compliance Considerations for Explainability Techniques

The use of model explainability techniques may assist creditors in generating specific, accurate reasons for AI-driven adverse actions. However, creditors should be aware of the following compliance considerations:

1. **Validation of explainability methods**: Creditors that use SHAP, LIME, or other explainability techniques to generate adverse action reasons should validate that the technique accurately captures the actual factors driving the AI model's decisions. Not all explainability methods are equally accurate or appropriate for all model types.

2. **Local vs. global explanations**: Adverse action reasons must be specific to the individual applicant (local explanations), not global averages across all model predictions. A SHAP value for a specific applicant's prediction reflects that individual's adverse action reasons; global feature importance scores do not.

3. **Mapping to plain-language reasons**: Creditors must translate technical explainability outputs (e.g., "Variable X has a SHAP value of -0.23") into plain-language reasons that are meaningful to applicants (e.g., "High debt-to-income ratio"). The plain-language reason must accurately reflect the technical output.

4. **Documentation**: Creditors should document the explainability methodology they use, the validation of that methodology, and the process for mapping technical outputs to adverse action reasons.

### C. Limitations of Current Explainability Techniques

The Bureau acknowledges that no model explainability technique is perfect. Some techniques provide approximations rather than exact explanations; others may be computationally expensive or difficult to validate. Creditors should be aware of these limitations when designing AI compliance programs.

The Bureau's position is that the compliance obligation exists regardless of the technical difficulty: if a creditor cannot generate specific, accurate adverse action reasons from its AI model using available explainability techniques, it must either:
- Modify or retrain the AI model to support explainability; or
- Implement a more transparent model architecture; or
- Supplement the AI model with a human review process that can generate specific, accurate reasons.

---

## V. Frequently Asked Questions

**Q1: Does a creditor violate Regulation B if it uses an AI model that cannot generate specific, accurate reasons for adverse actions?**

A: Yes. If a creditor uses an AI model to make adverse credit decisions and the model cannot provide specific, accurate reasons for those decisions, the creditor is at risk of violating ECOA and Regulation B. The technical characteristics of the AI model do not excuse non-compliance with the statute and regulation. The CFPB expects creditors to address explainability requirements at the model design stage, before deploying AI in adverse credit decisions.

**Q2: Are there "safe harbor" reasons that satisfy the specificity requirement for AI-driven adverse actions?**

A: There are no AI-specific safe harbors. The model forms in Appendix C to Regulation B provide examples of reasons that are considered specific for traditional credit models. Creditors using AI models should map their AI model's key decision factors to specific reasons that accurately reflect those factors. Where a standard reason from Appendix C accurately reflects a significant factor in the AI model's decision, it may be used. Where the AI model uses factors not represented in the standard reasons, creditors should develop additional specific reasons.

**Q3: Can a creditor satisfy the adverse action requirements by disclosing a credit score and the reasons for that score, rather than the reasons for the underlying adverse action?**

A: If a credit score is the primary determinant of the adverse action, disclosing the reasons for the score may satisfy the adverse action reason requirement — provided those reasons are specific and accurate. However, if the AI model uses multiple scores or factors in addition to a credit score, and those other factors contributed to the adverse action, the score reasons alone may be insufficient.

**Q4: Does this Circular apply to AI used in adverse actions on existing credit accounts?**

A: Yes. ECOA and Regulation B apply to adverse actions on existing accounts (e.g., credit line reductions, account closures, rate increases). If an AI model is used to make such decisions, the creditor must comply with the full adverse action notification requirements.

**Q5: Does the CFPB's position on adverse action reasons apply to AI used in pricing decisions?**

A: Risk-based pricing obligations under the FCRA (15 U.S.C. § 1681m(h)) require notice to consumers who receive materially less favorable pricing than other consumers, based in whole or in part on a consumer report. Creditors using AI models for pricing should separately assess whether their pricing decisions trigger FCRA risk-based pricing notice requirements.

**Q6: How does this Circular interact with fair lending obligations?**

A: This Circular addresses procedural compliance with ECOA's adverse action notification requirements. Separately, ECOA's substantive anti-discrimination requirements prohibit creditors from discriminating on the basis of protected characteristics. Creditors using AI in credit decisions must assess their AI models for potential disparate impact or disparate treatment on protected bases, in addition to complying with adverse action notification requirements. The CFPB, in coordination with other federal regulators, will use both Regulation B adverse action requirements and ECOA's substantive anti-discrimination provisions in examining and enforcing against AI-related fair lending violations.

---

## VI. Supervisory and Enforcement Expectations

### A. Examination Expectations

Examiners will assess whether creditors using AI in adverse credit decisions:

- Have identified and documented the key factors that drive AI model adverse decisions for individual applicants;
- Provide adverse action notices with specific, accurate reasons that reflect those key factors;
- Have validated the explainability methodology used to generate adverse action reasons;
- Have processes for monitoring adverse action reason accuracy on an ongoing basis;
- Apply the same adverse action compliance requirements to AI models as to traditional credit scoring models.

### B. Enforcement Posture

The CFPB will prioritize enforcement against creditors whose use of AI in adverse credit decisions results in:

- Violation of ECOA adverse action notification requirements through the use of vague, generic, or inaccurate reasons;
- Systemic failures to provide adverse action reasons at all for AI-driven decisions;
- Use of AI that produces disparate impact on protected classes in credit decisions, compounded by inadequate adverse action notices that prevent consumers from identifying or challenging discriminatory decisions.

### C. Relation to Prior CFPB Guidance

This Circular supplements CFPB Circular 2022-03, which addressed adverse action notification requirements in the context of credit decisions using complex algorithms and alternative data. Circular 2022-03 clarified that ECOA and Regulation B apply to all adverse credit decisions regardless of the technology used. This Circular provides additional guidance specifically addressing compliance challenges posed by AI and machine learning models, including the use of model explainability techniques.

---

## VII. Conclusion

The CFPB's position is that the adverse action notification requirements of ECOA and Regulation B fully apply to adverse credit decisions made using AI and machine learning models. There is no AI exception to the requirement to provide specific, accurate reasons for credit denials and other adverse actions.

The Bureau encourages creditors to:
- Design AI credit models with explainability in mind from the outset;
- Implement and validate model explainability techniques appropriate to their AI model architecture;
- Map technical explainability outputs to plain-language adverse action reasons that are specific and accurate;
- Monitor adverse action reason accuracy on an ongoing basis as a component of AI model governance;
- Engage with CFPB supervisory staff on AI compliance questions through available supervisory channels.

---

*For questions about this Circular, contact the CFPB's Office of Regulations at regulationscomments@cfpb.gov.*

*This Circular is intended to be a statement of the CFPB's views on the application of ECOA, Regulation B, and the FCRA to AI-assisted adverse credit decisions. It does not have the force and effect of law and is not binding on supervised entities or the general public. The guidance in this Circular reflects the CFPB's current legal interpretation and may be revised in the future.*
