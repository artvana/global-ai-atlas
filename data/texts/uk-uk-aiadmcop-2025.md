---
id: uk-uk-aiadmcop-2025
source_url: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/automated-decision-making-adm-and-profiling-for-organisations-under-the-uk-gdpr/
fetched_date: 2026-05-04
---

================================================================================
AUTOMATED DECISION-MAKING, INCLUDING PROFILING
ICO Detailed Guidance (UK GDPR)
Latest updates - 31 March 2026
================================================================================

We are consulting on the Data (Use and Access) Act updates to this guidance.
The previous version of this ADM guidance is available as a PDF. We will withdraw this when we've finalised the updated guidance after the consultation.

These chapters sit alongside our brief guidance and provide more detailed guidance for organisations on ADM, including profiling.

If you haven't yet read the brief guidance, read that first. It introduces this topic and sets out the key points you need to know.

When we use the term 'ADM' in this guidance, we specifically refer to automated decision-making as defined in article 22A of the UK GDPR. This is where a decision:
- is "based solely on automated processing", including profiling (ie there is no meaningful human involvement in the decision); and
- has a "legal or similarly significant effect" on a person (which the UK GDPR refers to as a 'significant decision').

We also use the term 'the ADM provisions' to describe articles 22A-22D of the UK GDPR.

Read this detailed guidance if you have questions not answered in the brief guidance, or if you need more information to help you apply the rules towards ADM in practice.

This guidance will inform the statutory code of practice on artificial intelligence (AI) and ADM that we will develop.

About this guidance
-------------------
Why have you produced this guidance?
The purpose of this guidance is to help organisations understand and meet your obligations when you carry out ADM. It explains the relevant provisions of the UK GDPR and provides advice on good practice. Read it to understand the law, our interpretation, and recommendations for compliance.

This guidance is not an exhaustive manual. It focuses on the ADM provisions. While it addresses the key considerations, you remain responsible for ensuring you comply with any other provisions that apply to your processing, as well as any other applicable laws and regulations.

Who is this guidance for?
This guidance is aimed at you if you are planning to carry out ADM. This includes deploying in-house-developed ADM tools or solutions offered by external vendors.

This guidance is aimed at data protection officers, compliance professionals, and technical leads with oversight of your organisation's use or procurement of ADM systems.

The DPA 2018 contains similar provisions in part 3 (law enforcement processing) and part 4 (intelligence services processing). This guidance is specifically about the ADM provisions in the UK GDPR. If part 3 or part 4 apply to your processing, read our guide to law enforcement processing or our guide to intelligence services processing.

Contents
--------
1. What is ADM?
   - What is automated decision-making about people?
   - What is profiling?
   - What is AI and how does it relate to ADM and profiling?
   - What are the benefits of ADM?
   - What are the risks?

2. What does the UK GDPR say about ADM?
   - When do the ADM provisions apply?
   - What is a decision?
   - What is a 'significant decision'?
   - What is a 'solely' automated decision?
   - Can we carry out ADM?

3. How do we carry out ADM lawfully?
   - What does it mean for our ADM to be lawful?
   - When can we rely on consent?
   - When can we rely on contract?
   - When can we rely on public task?
   - When can we rely on legitimate interests?
   - What about the other lawful bases?

4. When can we use special category data in our ADM?
   - What is special category data?
   - What are the special category data conditions for ADM?
   - When can we rely on the 'explicit consent' condition for ADM?
   - When can we rely on the 'contract' condition for ADM?
   - When can we rely on the 'required or authorised by law' condition for ADM?

5. What are the ADM safeguards?
   - What are the safeguards in the ADM provisions?
   - What 'information about decisions' do we have to provide?
   - How do we enable people to make representations?
   - What is 'human intervention'?
   - How do we enable people to contest decisions?
   - What do we do if someone exercises their rights under the ADM provisions?

6. What rights do people have?
   - What do we need to tell people and when?
   - What do we need to tell people under the right to be informed?
   - What do we need to tell people under the right of access?
   - What do we need to tell people under the ADM safeguards?
   - How should the information be delivered?

7. What else do we need to consider?
   - Do we have to do a data protection impact assessment (DPIA)?
   - Do we need to make any other changes to our systems?


================================================================================
CHAPTER 1: WHAT IS ADM?
Latest updates - 31 March 2026
================================================================================

What is automated decision-making about people?
------------------------------------------------
Automated decision-making (ADM) is where you use personal information to make a significant decision about someone using solely automated processing, including profiling.

ADM systems can range in sophistication. They do not need to involve complex algorithms, artificial intelligence (AI), or other types of advanced processing to potentially come into the scope of ADM.

The UK GDPR sets out specific requirements that apply to ADM. To understand if the ADM provisions apply to your processing, you should ask yourself whether:
- you are using a system that is making a decision (or decisions) about a person;
- the decision is a significant decision (meaning the decision has legal or similarly significant effects); and
- the decision is solely automated (meaning there is no meaningful human involvement).

If the answer to all the above is 'yes', you must:
- ensure your processing complies with the ADM provisions; and
- put the required safeguards in place.

To determine whether the ADM provisions apply, you should consider these three aspects in tandem so you don't mistakenly think the ADM provisions do not apply when they actually do. This is because if you misidentify what the actual decision is or what the significant effect was, it is easier to make a mistake about whether there was meaningful human involvement at the right point.

Relevant provisions in the UK GDPR - see articles 22A to 22D, articles 13 to 15, and recital 71

What is profiling?
------------------
ADM often involves profiling. The ADM provisions in the UK GDPR specifically refer to profiling because it can be part of, or all of, the automated processing that you use to base decisions on. This means that if you carry out ADM, you must consider the extent to which this involves profiling.

Profiling is where you analyse, evaluate or predict aspects of someone's personality, behaviour, characteristics, interests, or habits.

The UK GDPR says profiling is:
"any form of automated processing of personal data consisting of the use of personal data to evaluate certain personal aspects relating to a natural person, in particular to analyse or predict aspects concerning that natural person's performance at work, economic situation, health, personal preferences, interests, reliability, behaviour, location or movements."

You might obtain personal information directly from people, or from a variety of different internal and external sources, such as:
- people's searches on your app or website;
- people's online and offline buying habits; and
- people's physical location or movements (eg from their mobile devices, if your app collects this information).

You might analyse this information to divide people into different groups, segments or categories. This analysis often identifies correlations between different behaviours and characteristics to create profiles about people that can relate to specific affinity groups. This profiling activity can create new personal information as a result of the analysis.

You might use profiling to:
- analyse people's preferences;
- make predictions about their behaviour;
- make decisions about them.

Profiling can use algorithmic systems that find correlations between different features or attributes. An algorithm is a sequence of instructions or set of rules designed to complete a task or solve a problem. It's possible to use profiling algorithms to make a wide range of predictions. For example, whether someone is likely to buy an item based on their past behaviour, or to control access to a service. Profiling algorithms increasingly involve AI systems, and in particular machine learning.

Examples of profiling include (but are not limited to):
- analysing personal information, in particular on a large scale (eg through algorithmic systems, AI or machine-learning);
- identifying associations to build links between different behaviours and attributes;
- creating profiles that you apply to people; or
- predicting people's behaviour based on their assigned profiles.

Example:
A hospital uses an algorithmic system to rapidly assess incoming patients. The system analyses information such as symptoms, medical history, and demographic indicators to classify people into different urgency categories. Based on this risk level prediction, the system triages patients.
The risk-level prediction is profiling, and using that profiling to triage patients (without meaningful human involvement) makes it ADM.

Example:
An insurer uses an algorithmic system to analyse the social media posts of car drivers. The system extracts features such as words, phrases, and sentiment to infer driving behaviour, classifying people as 'safe' or 'unsafe'. It converts this classification into a risk score and bases the premium on that score at the quote and renewal.
The risk score is profiling, and basing the premium on that score (without meaningful human involvement) is ADM.

Less obvious forms of profiling involve drawing inferences from apparently unrelated aspects of people's behaviour.

What is AI and how does it relate to ADM and profiling?
-------------------------------------------------------
AI is a term that relates to a variety of machine learning (ML) techniques that learn from patterns in past data to perform a variety of tasks (eg predictions, data generation, classifications). A range of processing activities are involved in ML training to build models or their deployment (eg collecting data, training a model, creating data).

Some ADM may involve ML. For example, producing a credit score may involve the use of ML techniques, such as decision-trees.

AI systems can play a wide variety of roles, from decision-support to triaging to classifying or retrieving information. This means they can be involved at different stages of your decision-making process and to different degrees. If you use AI, you must identify whether the ADM provisions apply.

However, not all AI-related processing necessarily constitutes ADM. For example, using a generative AI application to summarise a meeting is unlikely to lead to a legal, or similarly significant effect, in most cases, so this isn't in scope of the ADM provisions.

You can also use AI and ML for profiling because they can analyse large amounts of data and predict people's behaviour or interests. Content recommendations used widely on social media platforms tend to be built on AI or ML systems.

What are the benefits of ADM?
-----------------------------
ADM can be very useful for both organisations and people in many sectors, including healthcare, education, financial services and marketing. It can lead to quicker decisions, particularly when you need to analyse a large volume of information.

It can also lead to more consistent or standardised decisions by ensuring that they are made based on criteria that you can audit and improve. This reduces the variability that may be exercised by human decision-makers.

One of the key benefits of ADM for organisations is that it can help scale the business. Start-ups or small-to-medium-sized enterprises looking to expand their reach can more easily manage larger operations by using automation, as it reduces the barriers to entry. This can lead to better and more competitive offerings for people.

You can also use ADM to provide more personalised, tailored services that people engage with better.

You can use it to improve internal operations as well, such as risk management and compliance programmes. In a financial services context, it could mean automatically flagging and reporting transactions or data to relevant authorities, where required.

The UK GDPR recognises the potential for innovation by enabling you to carry out ADM in a wide range of circumstances, provided you implement safeguards. This allows you to adopt automated processes with greater confidence and efficiency, and encourages responsible innovation. For example, you can scale automation faster to deliver more timely, accurate and personalised outcomes for people.

What are the risks?
-------------------
While ADM can offer substantial benefits, it also presents a range of risks. These can be both process and outcome related. We set some of these out here, although this is not exhaustive. You should consider these and any other relevant risks when thinking about whether your use of ADM is fair and lawful. Where your use of ADM is likely to result in a high risk to people, you must carry out a data protection impact assessment (DPIA). You must include details in your DPIA of the mitigations you intend to put in place to manage these risks.

Lack of understanding or awareness of the processing
The technical processes involved in your ADM can be complex, especially if you use advanced techniques like ML. This can make it challenging for people to understand how you make decisions that affect them. It can also be challenging for you to explain or justify those decisions.

Profiling is often invisible to people and, where ADM is based on profiling, they may not expect you to use their personal information in this way. They might not understand how it works or how it can affect them.

Discrimination or unfair outcomes
One key risk to mitigate is the potential for bias and discrimination. Algorithmic systems may reflect historical inequalities or societal biases, depending on the training data. Using them to carry out ADM may replicate or even amplify these biases. This can result in unfair outcomes for people.

ADM also carries risks of over-generalisation and stereotyping when you base your decisions on profiling, involving things like broad classifications or historical data. This is because individual people may be unfairly grouped or judged based on characteristics that do not accurately reflect their particular circumstances.

There's no guarantee that what may be representative of a large part of the population is automatically going to be the same at the individual level. And the ADM provisions relate to the decisions you take about individual people.

This means that when you assess things like risks of bias or discrimination, you should take a more people-focused approach that considers their circumstances.

There are also risks about the statistical accuracy and reliability of automated outputs. Errors in automated processes, such as out-of-date data, can scale quickly, affecting large numbers of people. Due to the predictive nature of profiling, there will always be a margin of error. Therefore, you should weigh up the risks of using the results.

Vulnerability to ADM
People who are already in situations where they are at risk may face heightened risks in the context of ADM. People in financially precarious situations, those with certain disabilities, or children, may be less able to understand or challenge decisions and be more susceptible to harm if outcomes are inaccurate or biased.

The UK GDPR specifically highlights that children deserve additional protection, particularly when their personal information is used for marketing or creating online profiles. The UK GDPR says:
"Children merit specific protection with regard to their personal data, as they may be less aware of the risks, consequences and safeguards concerned and their rights in relation to the processing of personal data. Such specific protection should, in particular, apply to the use of personal data of children for the purposes of marketing or creating personality or user profiles…."

If you wish to carry out ADM using children's personal information, with the intention of influencing their choices or behaviour, you must:
- consider what impact those choices or behaviours may have upon the child; and
- decide whether this amounts to a significant effect.

A processing activity can have a significant effect on children and not adults. For example, behavioural advertising might raise particular concerns where children are involved. This is because they are more susceptible to influence and may not fully understand the commercial motives behind such use of their information. You should also consider related risks, such as the potential for behavioural profiling to create excessive nudging or addictive patterns, which can negatively impact mental health and overall well-being.

Considering the fact that children merit specific protection is also one of our secondary duties. We will be taking children's interests further into account as part of developing our code of practice on AI and ADM and our broader strategic priorities.

Relevant provisions in the UK GDPR - see articles 4(4), 22A and recitals 38 and 71


================================================================================
CHAPTER 2: WHAT DOES THE UK GDPR SAY ABOUT ADM?
Latest updates - 31 March 2026
================================================================================

When do the ADM provisions apply?
---------------------------------
Many of your business practices may involve automated processing to help make or support decisions. But this doesn't mean the ADM provisions apply to all of these practices or the decisions based on them.

They only apply when three factors are present:
- you are using a system that is making a decision (or decisions) about a person;
- the decision is a significant decision (meaning the decision has legal or similarly significant effects); and
- the decision is solely automated (meaning there is no meaningful human involvement).

What is a decision?
-------------------
The UK GDPR doesn't define the term 'decision'. In the context of ADM, we consider the term to have a broad meaning. It refers to a conclusion or outcome, reached after consideration or analysis, where that conclusion may:
- impact or influence actions taken; or
- engage a person's rights.

Not everything an automated system produces counts as a decision. Decisions need to involve some kind of evaluation or analysis of personal information, not just applying a rule that a human has already set. In some situations, a human can set a simple rule that is applied automatically, but the system is not actually making its own separate decision.

For example, a business may decide in advance which payment cards it accepts. The automated system then simply applies that rule by accepting or rejecting cards. In this case, the decision was made by a human, not the system.

Example:
A lettings platform uses an automated system to assess whether someone is eligible to let high-value properties. The system analyses the person's previous letting history, ratings from previous landlords, payment behaviour, and behavioural signals. Based on this analysis, it automatically decides whether to allow or prevent the lease.
In this case, the outcome depends on an evaluation of personal information, and the system is making a judgement about the person (eg that they present a higher or lower risk). This is a decision.

What is a 'significant decision'?
---------------------------------
The UK GDPR says that:
"a decision is a significant decision, in relation to a data subject, if—
(i) it produces a legal effect for the data subject, or
(ii) it has a similarly significant effect for the data subject."

A decision that has a legal effect is one that affects a person's legal status or their legal rights, for example:
- approving or refusing access to a public service, benefit or licence (eg housing support, a visa, a permit);
- determining tax liabilities due; and
- enforcement actions, such as issuing a penalty, fine, or charge.

Example:
A social security processing activity automatically evaluates whether someone is entitled to a benefit and how much to pay them based on profiling. This is a decision 'based solely on automated processing', without meaningful human involvement for the purposes of the ADM provisions.
As well as having a legal effect, the amount of benefit they receive could affect a person's livelihood or ability to buy or rent a home, so this decision also has a 'similarly significant effect'.

A decision that has a similarly significant effect is one that has an equivalent impact on someone's circumstances, behaviour, opportunities, or choices.

In extreme cases, significant decisions might exclude or discriminate against people. Also, decisions that might have little impact generally could have a significant effect for people in situations where they are at risk, such as children. Context is key in understanding a decision's significance.

Other similarly significant effects include:
- automatic refusal of an online credit application; or
- e-recruiting practices without meaningful human involvement.

By contrast, the following example is less likely to have a significant effect on someone:

Example:
A video-on-demand service uses an automated system to recommend new content to a person based on their previous viewing habits. The choice of content it recommends is a decision based solely on automated processing because it has no meaningful human involvement. It relies entirely on profiling and algorithmic analysis.
While the decision may influence what the person chooses to watch next, this is typically not to the same level as something that impacts their legal rights or has a similarly significant effect on their behaviour, circumstances, opportunities or choices.

Example:
An automated decision results in a freeze on someone's bank account based on potential fraudulent activity.
This can be a significant decision because it impacts that person's financial circumstances, and may have knock-on effects elsewhere.

There can be contextual differences that determine whether a decision has a significant effect. When processing at scale, it is possible that similar decisions have a significant impact on some people and not on others. Unless you are confident that you can accurately separate out the people who will experience legal or similarly significant effects from those who will not, you should apply the safeguards to all the decisions you make.

If you are unsure whether a decision has a similarly significant effect on someone, you should consider the extent to which it impacts their:
- financial circumstances (including creditworthiness, bank account access, and evaluation, provision or denial of insurance or benefits);
- employment opportunities and circumstances (eg recruitment, promotion);
- health (eg access to or allocation of medical interventions);
- access to education and relevant opportunities (eg awarding grades, personalised learning);
- access to housing;
- access to essential public and private services;
- reputation (eg automated scoring systems that influence trust ratings or professional standing);
- behaviour (eg nudging teenagers to adopt unhealthy eating habits via recommendations that are based on profiling that determines they are more susceptible); or
- choices (eg dynamic pricing or discriminatory offers).

A decision that affects any of these may have a significant effect on someone. The ADM provisions apply where this is the case, and the decision is based solely on automated processing.

Example:
An online game is targeted at children. To generate revenue, the game makes extensive use of strategies to extend user engagement. These include a system that profiles children while they play the game. The system intends to target them with personalised in-game advantages, incentivising them to stay engaged and continue to play.
This use of children's information is meant to automatically extend their playing time, rather than allow them to make an active choice about whether they want to spend their time this way.
By exploiting behavioural patterns to encourage extended gameplay, the game's systems significantly influence children's behaviour. For example, creating a feeling of missing out or of being disadvantaged by playing less.
This manipulation of choices and behaviour is likely to qualify as a significant effect.

Relevant provisions in the UK GDPR - see article 22A(1)(b) and recital 71

What is a 'solely' automated decision?
--------------------------------------
The UK GDPR says that:
"a decision is based solely on automated processing if there is no meaningful human involvement in the taking of the decision"

So, 'solely' automated is about decision-making processes that are automated and don't reflect real human control over the end result.

Example:
A factory worker's pay is determined by an algorithmic system that makes predictions about their productivity. The system analyses data about the worker's performance and automatically sets the rate of pay for each shift based on these evaluations. There is no meaningful human involvement in reviewing or adjusting the outcome.
This is an example of solely automated decision-making. Since this can also have significant effects on the worker, it is ADM.

Many decisions that you commonly think of as automated actually involve humans at some point in the process. However, for human involvement to be "meaningful" in the context of the UK GDPR, you must ensure it is active and not just a token gesture.

For there to be meaningful human involvement, a human should:
- assess and review the decision at an appropriate point to ensure actual impact on the outcome;
- have the ability to influence the outcome;
- have discretion and authority to alter the decision;
- be suitably trained and qualified to understand the system's logic, outputs, limitations, and risks; and
- take into account the relevant data and factors on which the decision was based.

The human involved in the decisions should apply these non-exhaustive criteria every time they make a decision about a person. Using ad hoc spot-checking isn't sufficient because some automated decisions won't receive a check and therefore don't have meaningful human involvement.

You should keep a record of how the human was involved in the decision.

Another important factor in evaluating whether you're carrying out ADM is the timing of the human involvement. You must ensure that the involvement comes before you apply the decision to a person and at a time you can still change any recommendation that would otherwise be based on solely automated processing, including profiling. This is so that a human can exercise real influence over the decision by using their discretion and authority to change it where appropriate.

A human merely designing or building an automated system does not count as meaningful human involvement. This is because the design stage happens long before any real-world decisions are made about people, so it cannot directly influence or alter a specific outcome.

Where a human only inputs the data for the system to process and the system then carries out the decision-making, the processing is still in the scope of the ADM provisions if there is a significant effect.

When assessing whether your decision-making includes meaningful human involvement, you must also consider how much it relies on profiling. This is because profiling is often complex, making it difficult for human reviewers to fully explain or challenge the outcome. It's therefore important to critically assess any profiling you use, especially when it involves children's personal information.

Example:
An organisation issues a warning to an employee about late attendance at work. They do so based on their automated clocking-in system flagging that the employee has been late on a defined number of occasions.
However, although the warning is issued on the basis of the data collected by the employer's automated system, the decision to issue it is taken by the employer's HR manager following a review of that data.
This is an example of a decision that has meaningful human involvement.

Example:
A retail bank uses customer profiling to deliver personalised credit card offers. The profiling system analyses spending habits and past repayment history.
Based on this profile, the system automatically decides whether to offer a customer a higher credit limit. The decision is made in real time using an algorithm that weighs risk and marketing potential. No human reviews the individual case unless the customer challenges the outcome.
Because the decision is based entirely on profiling and executed automatically, it lacks meaningful human involvement.

Relevant provisions in the UK GDPR - see article 22A(1), 22A(2), and recital 71

Can we carry out ADM?
---------------------
Yes, subject to some restrictions. The UK GDPR contains two restrictions that prohibit you from carrying out ADM in certain circumstances.

The first restriction is about ADM based entirely or partly on special category data.

You can only do this where one of the following conditions applies:
- You base the decision entirely on the person's explicit consent.
- The decision is necessary for a contract between the person and an organisation, and there is a substantial public interest (SPI) condition.
- The decision is required or authorised by law, and there is an SPI condition.

(For more information, see When can we use special category data in our automated decision-making?.)

The second restriction is about the recognised legitimate interest lawful basis. Recognised legitimate interest and legitimate interests are two separate lawful bases. A recognised legitimate interest is a pre-approved purpose for using personal information that is in the public interest. Unlike legitimate interests, you don't have to assess the impact on people's rights, interests and freedoms.

However, the UK GDPR says you can't use this as your lawful basis if you want to carry out ADM. (See 'How do we carry out ADM lawfully?'.)

Relevant provisions in the UK GDPR - see article 22B


================================================================================
CHAPTER 3: HOW DO WE CARRY OUT ADM LAWFULLY?
Latest updates - 31 March 2026
================================================================================

What does it mean for our ADM to be lawful?
-------------------------------------------
The first principle of the UK GDPR is about using personal information lawfully, fairly and transparently. You must identify a lawful basis for your use of personal information in the context of ADM, including when it uses profiling. This is the case whether or not you intend to carry out ADM.

Article 6 of the UK GDPR sets out seven lawful bases. No one basis is better or more important than the others. The appropriate one depends on why you want to use personal information and your relationship with the people involved.

There's only one lawful basis that you can't use for ADM. The UK GDPR says that you can't base these decisions entirely or partly on the recognised legitimate interest lawful basis. (For more information, see Can we carry out ADM?.)

Why is it important to get this right?
Take care to use the lawful basis that's most appropriate for the circumstances of your processing and the relationship you have with people.

The lawful basis you decide on impacts the rights they have. For example, the right to object applies when you use the public task or legitimate interests lawful basis, so you must take this into account if you choose to rely on these when you carry out ADM. People also have the absolute right to object to you using their information for direct marketing purposes (including profiling for these purposes), whatever lawful basis applies.

And people's right to data portability only applies where the lawful basis is consent or contract.

You must:
- assess and document your lawful basis as part of your accountability obligations;
- tell people about your lawful basis in your privacy information; and
- Inform people about the specific requirements about ADM, like the significance and envisaged consequences it may have on them. (See What rights do people have?.)

You should also include relevant details in your DPIA. Remember, you must carry out a DPIA where your processing activities are likely to result in a high risk to people's rights and freedoms. (For more information about DPIAs for ADM, see Do we have to do a data protection impact assessment (DPIA)?.)

Whichever lawful basis you use, you must implement the safeguards for any ADM. (See What are the safeguards in the ADM provisions?.)

The UK GDPR also allows you to base ADM entirely or partly on special category data. But if you do, you must identify:
- a lawful basis in article 6;
- a relevant condition for processing in article 9; and
- a special category data condition for significant decisions in article 22B.

(See When can we use special category data in our ADM?.)

If your use of ADM involves reusing personal information for a new purpose, you must ensure that your new purpose is compatible with the original purpose you collected the information for. The UK GDPR sets out rules to help you decide whether your new purpose is compatible with your original purpose. It also lists several circumstances where reuse for a new purpose is treated as compatible with the original purpose. But if your reuse doesn't meet these conditions, you must carry out a compatibility assessment.

Either way, you must identify a lawful basis for your new purpose. This is important because it links to the fairness, lawfulness and transparency principle.

In some cases your original lawful basis might be sufficient, but in other cases a different one may be more appropriate. Where your new purpose is compatible, you are likely to be able to rely on legitimate interests as the lawful basis for the new processing, provided your use of the personal information is necessary for that purpose.

When is ADM 'necessary'?
Many of the lawful bases available depend on your use of personal information being 'necessary'. This does not mean that ADM has to be absolutely essential. But it does mean that you must ensure it is a targeted and proportionate way of achieving a specific purpose. The processing won't be 'necessary' if you can reasonably do this by some other less intrusive means, or by processing less personal information.

It's also not enough to argue that using ADM is 'necessary' because you choose to operate your business in a particular way. The question is whether this is objectively necessary for your stated purpose.

Similarly, ADM may allow for:
- greater consistency in your decision-making process (eg by mitigating the risks of bias or discrimination resulting from human error); or
- efficiency improvements (eg through delivering significant decisions more quickly).

While these are some of the key benefits, they're not enough on their own to make this kind of processing 'necessary'.

What lawful bases are likely to apply?
In practice, the lawful bases that are most likely to be relevant for using personal information when you carry out ADM are:
- consent;
- contract;
- public task; and
- legitimate interests.

You could use our lawful basis interactive guidance tool to help you work this out.

When can we rely on consent?
----------------------------
In the context of this guidance, consent is about giving people genuine choice and control over whether and how you use their personal information to undertake ADM. It may be appropriate where you have a direct relationship with them. If you can't offer this genuine choice to people, consent isn't appropriate.

Therefore, consent may not be available as a lawful basis in these cases:
- You still process the personal information on a different lawful basis if someone refuses or withdraws consent. In so, seeking consent is misleading and inherently unfair. It presents people with a false choice and the illusion of control.
- You require someone to agree to processing as a condition of service. If you believe the processing is necessary for the service, the contract lawful basis is likely to be more appropriate. If the processing isn't actually necessary for the service, consent is invalid as it isn't freely given.
- You're in a position of power over someone (eg you're a public authority or an employer using employee information). That person may feel they have no choice but to agree, meaning their consent isn't freely given either.

You must ensure that consent is informed and specific. For consent to be valid, you must be able to show that people understand exactly what they are consenting to. You must give people enough information about what you want to do and what potential impacts it may have on them. This ensures that any consent they give represents their informed choice and agreement.

You should remember profiling can often be invisible to people. For example, if it involves personal information that you obtain from somewhere other than directly from the person themselves. This sort of invisible processing may mean that it is challenging for you to show that you have valid consent because it isn't informed or specific in these cases.

People also have the right to withdraw their consent at any time. You must make it as easy for them to withdraw consent as it was to give it.

If you're in a position of power, you should avoid relying on consent. For example, if you're a public authority or an employer. This is because it is challenging for you to demonstrate that people can freely give their consent or they have a genuine choice.

If you still process the information on a different lawful basis even if consent is refused or withdrawn, seeking consent from a person is misleading and inherently unfair. It presents the person with a false choice and only the illusion of control.

You must identify an appropriate lawful basis and, if consent is difficult, another lawful basis may actually be more appropriate. In these cases, you should consider the alternatives.

When can we rely on contract?
-----------------------------
The contract lawful basis applies where your use of personal information is objectively necessary to:
- deliver a contractual service to the person the decision is made about; or
- take steps at the person's request prior to entering into a contract.

'Necessary' means that you must ensure your use of a person's information is a targeted and proportionate step that's integral to perform your contract with that particular person. If you can reasonably do what people want by using less information or using it in a less intrusive way, your use of personal information isn't 'necessary' for the contract.

You must consider a different lawful basis (eg legitimate interests) in the following situations where the contract lawful basis does not apply:
- You need to process a person's details, but the contract is with someone else.
- You reuse personal information for your own business purposes, even if your standard contractual terms permit this or it is part of your funding model.
- You take pre-contractual steps on your own initiative, to meet other obligations, or at a third party's request.

Example:
A healthcare provider offers remote consultations. As part of the process to enter into a contract for this service, an automated system assesses a person's health data to establish what issues they may have and what treatments may be appropriate.
The provider assesses that this automated triage is objectively necessary for the purposes of the contract with the person, so the contract lawful basis can apply.
As this is also based entirely or partly on special category data, the provider must also consider both an article 9 condition as well as the restrictions on using this data in article 22B.

Example:
An organisation is recruiting for a vacant position. The early stages of this process involve shortlisting, testing and selecting candidates for interview. As they expect a high volume of applications, the organisation wants to use ADM to automate these stages.
Initially, they think the contract lawful basis is appropriate for these pre-contractual stages. This is because at the end of the process, they intend to offer the successful candidate an employment contract. However, these stages don't involve making a job offer to anyone and necessarily use the personal information of all the applicants. The contract lawful basis is about the specific person that's party to the contract. The organisation doesn't yet know who they will have an employment contract with. But they do know that they won't be entering into a contract with the majority of the applicants.
Consent is also challenging due to the clear imbalance of power. Instead, the organisation considers the legitimate interests lawful basis for these stages of the process.

The contract lawful basis in article 6 is different to the contract condition about special category data in article 22B, so you must consider these separately. But there may be links between them. For example, if your article 6 lawful basis is contract, it is likely that your article 22B condition for ADM using special category data is contract. (See 'When can we rely on the contract condition for ADM?'.)

When can we rely on public task?
--------------------------------
This lawful basis can apply if you are either:
- carrying out a specific task in the public interest which is laid down by law; or
- exercising official authority laid down by law (eg a public body's tasks, functions, duties or powers).

But you must ensure your use of personal information in ADM is necessary for these purposes. If you can reasonably perform your tasks or exercise your powers in a less intrusive way, this lawful basis doesn't apply.

The public task lawful basis might be appropriate for the ADM that public authorities carry out, depending on the circumstances.

Example:
A public authority wants to use personal information for ADM. It recognises that its ability to rely on certain lawful bases is limited. For example, the UK GDPR says that:
- consent isn't valid where there is a clear imbalance of power; and
- legitimate interests can't apply to a public authority performing its tasks.
Instead, as the processing relates to its tasks, functions or powers, the public authority relies on the public task lawful basis. As part of this, it:
- identifies the relevant task, function or power (including its basis in common law or statute); and
- assesses that there is no other reasonable or less intrusive means to achieve this purpose other than by using ADM.
The public authority goes on to include the relevant transparency requirements and safeguards.

When can we rely on legitimate interests?
-----------------------------------------
Legitimate interests is the most flexible lawful basis. It's not focused on a particular purpose, so it gives you more scope to potentially rely on it in many different circumstances.

But it also places more responsibility on you to justify what you want to do and any impact this may have on people's rights and interests. If the impact is disproportionate, legitimate interests may not be suitable.

ADM inherently has an impact on people, but this doesn't rule out using legitimate interests as a lawful basis.

There are three elements to legitimate interests. We call this the three-part test. You must:
- identify a legitimate interest (the purpose test);
- show that the processing is necessary to achieve it (the necessity test); and
- balance it against the person's interests, rights and freedoms (the balancing test).

A wide range of interests can be legitimate, which is one reason why this basis is so flexible. The interests can be your own or those of third parties. They can be commercial or societal interests. But the key is that, before you start processing, you must assess the impact of your processing on people and show that there is a compelling benefit to it.

Identifying a legitimate interest doesn't mean that this lawful basis automatically applies. This is only the first step of the three-part test. You must still demonstrate that the processing is necessary. And when you get to the balancing test, you should consider things like:
- the level of detail involved in any profiling you carry out;
- the comprehensiveness of any profiles you create;
- the impact on people, particularly any significant decisions you make about them;
- the future use or combination of the personal information; and
- the measures you put in place to mitigate risks and ensure fairness, non-discrimination and accuracy.

The outcome of your balancing test may also depend on how you intend to carry out the ADM. For example, it may be more challenging to justify using legitimate interests for intrusive or invisible profiling and tracking practices (eg marketing or advertising purposes involving tracking people across multiple online services, devices or locations).

Example:
An organisation in the financial services sector uses ADM for the purposes of preventing or detecting fraud.
This involves ADM using personal information from a variety of sources, including credit reference agencies, bank accounts, online marketplaces and social media.
The organisation can't use the recognised legitimate interest lawful basis for this. Although preventing and detecting fraud is part of the pre-approved recognised legitimate interest purposes, the UK GDPR doesn't allow ADM to be made entirely or partly on this lawful basis.
The UK GDPR does say that preventing fraud may be a legitimate interest. For example, it's in the interests of the organisation, its customers and the public in general to ensure fraud is prevented and detected.
This means the legitimate interests lawful basis is more likely to apply. The organisation then addresses the three-part test.

To complete the three-part test, you should carry out a legitimate interests assessment (LIA). An LIA is a light-touch risk assessment based on your specific context and circumstances. Using it will help you ensure your processing is lawful. Documenting your LIA will also help you demonstrate compliance with your accountability obligations. You could use our LIA template to do this.

Example:
An organisation is recruiting for a vacant position. The early stages of this process involve shortlisting, testing and selecting candidates for interview. As they expect a high volume of applications, the organisation wants to use ADM to automate these stages.
After establishing that legitimate interests is the most appropriate lawful basis for these early stages, the organisation carries out an LIA.
They consider that using personal information as part of a recruitment process is a legitimate purpose.
They assess whether ADM is necessary to achieve this purpose. They expect that a high volume of applications will take significant time and resource to look at manually. They decide ADM can be a reasonable way of carrying out the early stages, such as shortlisting and selecting for interview. It might not only speed this up, but also help to ensure a consistent approach to all the applicants, giving benefits to both them and the organisation.
They consider the balancing test. They look at the impact the use of ADM may have on the applicants, the risks it may pose to their rights, and the mitigations they can put in place. In particular, they consider how they ensure recruitment tools manage risks of bias.
As part of this, they take into account, for example:
- the nature of the personal information they want to use;
- the applicants' reasonable expectations;
- the likely impact of the processing; and
- what safeguards they can put in place to mitigate negative impacts.
This includes how they will:
- tell people about the use of ADM in these stages of the recruitment process;
- tell any eventual applicant about the solely automated significant decisions they take about them;
- provide this information in ways that enable applicants to understand how these decisions are made and how they can exercise their rights (in particular, those they have under the article 22C safeguards);
- train their staff to help people do this; and
- implement appropriate technical and organisational measures to ensure their ADM is fair.
As the LIA identifies potential high risks to people's rights and freedoms, the organisation builds on and adapts it into its DPIA.

What about the other lawful bases?
----------------------------------
Other lawful bases may be available, but only in specific circumstances. These are legal obligation and vital interests.

Remember, the UK GDPR doesn't allow you to use the recognised legitimate interest lawful basis for ADM.

Legal obligation
This lawful basis is likely to apply where you are obliged to process personal information to comply with the law. For example, there may be situations where you have a legal obligation to carry out profiling, such as to prevent money laundering.

But it only applies where your use of personal information for ADM is:
- a reasonable and proportionate way of achieving compliance with the obligation; and
- limited to what's required to do so.

There doesn't have to be a specific provision in another law that requires you to carry out ADM. But you must:
- ensure your overall purpose is to comply with a sufficiently clear legal obligation with a basis in either statute or common law; and
- demonstrate that ADM is a reasonable and proportionate way of complying.

You should identify the obligation in question. For example, by referring to a specific legal provision (if there is one), or an appropriate source of guidance that sets it out clearly.

Vital interests
Vital interests only covers interests that are essential for someone's life. Therefore, this lawful basis is very limited in its scope and generally only applies to matters of life and death.

Recognised legitimate interest
The UK GDPR says you can't use recognised legitimate interest as your lawful basis if you want to undertake ADM about a person. This includes processing that is entirely or partially carried out using recognised legitimate interest.

Relevant provisions in UK GDPR - see articles 6, 9, 22A, 22B and 22C


================================================================================
CHAPTER 4: WHEN CAN WE USE SPECIAL CATEGORY DATA IN OUR ADM?
Latest updates - 31 March 2026
================================================================================

What is special category data?
------------------------------
The UK GDPR singles out some types of personal information as likely to be more sensitive, and gives them extra protection. These are listed in article 9 as:
- personal data revealing racial or ethnic origin;
- personal data revealing political opinions;
- personal data revealing religious or philosophical beliefs;
- personal data revealing trade union membership;
- genetic data;
- biometric data (where used for unique identification purposes);
- data concerning health;
- data concerning a person's sex life; and
- data concerning a person's sexual orientation.

Special category data merits specific protection because using this information may create significant risks to people's fundamental rights and freedoms.

If you have inferred details, either correctly or incorrectly, about someone which fall into one of the above categories, this information may count as special category data. Whether inferred data counts as special category data depends on whether you intend to:
- make an inference linked to one of the special categories of data; or
- treat someone differently on the basis of inferred information linked to one of the special categories of data.

If this is the case, you are processing special category data regardless of how confident you are that the inference is correct.

(For further information, see our detailed guidance on special category data under What about inferences?.)

ADM systems may aim to make predictions based on patterns within a population. In this sense, they may appear to only concern groups. However, if your system involves making inferences about a group by creating affinity groups and linking these to a specific person, data protection law applies at multiple stages of the processing. More specifically:
- the development stage, involving processing of people's personal information to train a model or build a system; and
- the deployment stage, where you apply the results of the model or the system to people that were not necessarily part of the training dataset, on the basis of its predictive features.

What are the special category data conditions for ADM?
------------------------------------------------------
The ADM provisions allow you to base significant decisions entirely or partly on solely automated processing of special category data, but only in certain circumstances. Otherwise, using special category data is prohibited.

Importantly, this means you must comply with what the ADM provisions say, even if you use a small amount of special category data, including what is inferred. You must carefully assess whether you are processing any special category data.

You can only carry out ADM using special category data if you can rely on one of the following special category data conditions:
- explicit consent;
- contract; or
- required or authorised by law.

For the last two conditions, you must also identify a substantial public interest condition out of the 23 available. (For more information, see our detailed guidance on special category data under What are the substantial public interest conditions?.)

The special category data conditions are not the same as the lawful bases for processing under article 6. They are specifically about enabling ADM involving special category data.

But there may be links between them. For example, if your article 6 lawful basis is contract, it is likely that your article 22B condition for ADM using special category data is contract. However, under article 22B, you must also identify a substantial public interest condition.

When you identify your lawful basis, you should think about why you want to use the personal information. You should also consider which lawful basis best fits the circumstances, rather than selecting one because there is an article 22B condition you want to rely on.

When you carry out ADM using special category data, you must also identify a relevant condition under article 9. Where your article 22B condition is that the decision is necessary for a contract or required or authorised by law, you must also ensure that the substantial public interest condition in article 9(2)(g) applies. This is therefore likely to be your article 9 condition for basing significant decisions entirely or partly on special category data, and you must identify an appropriate condition in schedule 1, part 2 of the DPA.

However, you must ensure that the explicit consent is specific and informed. If you intend to rely on explicit consent under article 9, you must give people granular and specific information about how your processing involves ADM. This includes at least meaningful information about the logic involved and the envisaged consequences. If you don't do this, you are unlikely to comply with the explicit consent condition under article 22B (or the article 9 requirements for explicit consent about that processing specifically).

When can we rely on the 'explicit consent' condition for ADM?
-------------------------------------------------------------
You can use special category data to undertake ADM if the person the decision is about gives their explicit consent for you to do so. Explicit consent means that the person expressly confirms their consent. For example, by a written statement, filling in an electronic form or sending an email.

Explicit consent is one of the conditions you can use to process special category data under article 9 of the UK GDPR. Because explicit consent likely requires more specific affirmation of agreement, meeting this standard generally also satisfies the requirements for using consent as a lawful basis for processing under article 6.

To meet the UK GDPR standard for consent under article 6, you must ensure it is:
- freely given;
- specific;
- informed;
- unambiguous;
- demonstrated through a clear affirmative action; and
- capable of being withdrawn at any time.

In addition, when relying on explicit consent under article 9, you must ensure that the person clearly and expressly confirms their agreement. This is likely to involve:
- specifying the type of special category data (eg health, biometric); and
- presenting this consent separately from any other consents you are seeking; and
- obtaining a clear statement of consent (whether oral or written).

When can we rely on the 'contract' condition for ADM?
-----------------------------------------------------
"the decision is—
(i) necessary for entering into, or performing, a contract between the data subject and a controller…"

You can rely on the contract condition to carry out ADM using special category data, but only when the decision is genuinely necessary for the performance of a contract with the person.

This doesn't mean the decision has to be absolutely essential for the contract. But you must ensure it is a targeted and proportionate way of meeting your contractual obligations, and that there are no other reasonable or less intrusive ways to achieve this outcome.

You should ask yourself:
- Would the contract be difficult or impossible to deliver without this ADM, or without this special category data?
- Is there a less privacy-impactful alternative that would still allow us to fulfil the claim?

The law recognises modern service chains. ADM may potentially be carried out by a different controller than the one who is party to the contract with the person.

This is often relevant in outsourced decision-making, where the decision is still undertaken for the purposes of the contractual arrangement. When relying on contract for ADM based on special category data, you must also identify a substantial public interest condition out of the 23 available.

When can we rely on the 'required or authorised by law' condition for ADM?
--------------------------------------------------------------------------
For something to be required or authorised by law, it isn't necessary for there to be a piece of legislation that explicitly allows or requires ADM for a particular purpose.

If you have a statutory or common law power to do something, and ADM is the most reasonable and proportionate way to achieve your purpose, you may be able to justify this type of processing as 'authorised' by law.

However, you should document and be able to show that it's reasonable for you to do so in all the circumstances.

Example:
In the financial services sector, an organisation may have a legal requirement to detect and prevent crime.
To comply with this requirement, it might use ADM for the purposes of detecting fraud. It identifies cases of potential fraud by comparing data from credit reference agencies, bank accounts, the Land Registry, the DVLA, credit card sales, online marketplaces and social media.
In order to use any special category data in its ADM processing, the organisation must show that:
- this is reasonable and proportionate to achieve its purpose;
- the processing is necessary for reasons of substantial public interest; and
- the processing meets one of the substantial public interest conditions set out in the DPA schedule 1, part 2 (likely to be that it is necessary for the purposes of the prevention or detection of an unlawful act).
Generally, the organisation does not process special category data as part of its fraud detection. However, due to the scale of processing, it has identified that there are instances where it is processing data concerning people's health or revealing trade union membership. Therefore, it needs to identify an article 22B condition for this processing.

Relevant provisions in the UK GDPR - see articles 7, 9(2)(a) and (g), and 22B


================================================================================
CHAPTER 5: WHAT ARE THE ADM SAFEGUARDS?
Latest updates - 31 March 2026
================================================================================

What are the safeguards in the ADM provisions?
----------------------------------------------
Article 22C of the UK GDPR says that for ADM, you must:
"…ensure that safeguards for the data subject's rights, freedoms and legitimate interests are in place which comply with paragraph 2 and any regulations under Article 22D(3)"

"The safeguards must consist of or include measures which—
(a) provide the data subject with information about decisions described in paragraph 1 taken in relation to the data subject;
(b) enable the data subject to make representations about such decisions;
(c) enable the data subject to obtain human intervention on the part of the controller in relation to such decisions;
(d) enable the data subject to contest such decisions."

These safeguards work to ensure that your ADM processes are fair, lawful and transparent. This also enables people to have the necessary context to decide whether they want to request human intervention or challenge the decision. You must apply the safeguards consistently rather than on an ad hoc discretionary basis.

What 'information about decisions' do we have to provide?
---------------------------------------------------------
You must provide the person with information about all ADM you carry out about them.

This means you must explain all ADM to give people an understanding of how you reached the decision. This is decision-specific information about the actual outcome, rather than simply repeating information you provide in your privacy notice about how the system arrives at its decisions and its potential consequences.

This safeguard is distinct from the right to be informed. Its main objective is to empower the person who has been affected by the ADM to meaningfully understand the decision and the specific aspects of their case that influenced it. This understanding is fundamental to them making an informed decision about whether they want to exercise their other rights under the safeguards, such as contesting the decision or obtaining human intervention.

What 'information about decisions' looks like – its format, detail and scope - depends on the context. This context may include the:
- nature of the decisions you make;
- circumstances in which you make them;
- systems you use to do so; and
- specific person affected by them.

For example, for ADM about a loan, a person might need details about what data was processed, what timeframe it covered, what the system decided, what risk factors the system identified. Only then would they be in a position to challenge the decision.

If the information you provide is incomplete or unclear, people may feel they need to exercise those rights unnecessarily, which can create additional work for you. Clear, transparent explanations help people make informed choices and reduce avoidable burdens on your organisation.

You must ensure your information:
- is clear and accessible;
- helps people understand the decision you made;
- explains how you reached it; and
- tells them what its actual impact is.

You should include in your information aspects such as:
- which factors contributed to the decision;
- whether profiling was involved;
- whether data from a third-party controller influenced the decision.

If someone is unhappy with the ADM you've carried out about them, they have the right to make representations about that decision, obtain human intervention, or contest that decision. You must explain how they can do this. You should do this at the point you provide the decision.

You should include an explanation of how and why you reached the decision about the specific person, and the impact on them. You must understand the underlying rules that apply to your ADM or factors that have influenced it, so you are able to explain these to people.

You must provide a concise explanation for the rationale behind the decision about the specific person. You should also be able to verify the ADM results to assist with this.

You should use a system that is able to deliver an audit trail showing the key decision points that formed the basis for the decision or the factors that were considered at those decision points. If your system considered any alternatives, you should understand why these were not preferred. These details help you demonstrate accountability and allow people to understand and, if necessary, challenge the decision.

How do we enable people to make representations?
------------------------------------------------
Under the ADM provisions, you must enable people to make representations about the decisions you made about them. This means you must give them the opportunity to put forward their point of view about the decision you made. This includes giving them the chance to produce any additional information you may have missed.

You must make it clear to people that they have this right.

You should focus on helping people make representations about decisions easily and quickly. If you provide the right information upfront, it increases the chances that any representations they make will be relevant and targeted. This ultimately helps you operate the other safeguards more efficiently.

How you do this depends on your particular context, including:
- who you are and the nature of your organisation;
- what you do, including the types of services or functions you provide;
- your relationship with the person you are carrying out ADM on;
- the types of decisions involved and their complexity;
- the impact of those decisions on the person;
- what extent people will be able to effectively reverse or mitigate the impacts of your decisions within a certain timeframe; and
- the characteristics and needs of the people you make such decisions about.

What is 'human intervention'?
-----------------------------
The right to obtain human intervention is a key safeguard in the ADM provisions. It means you enable people to have their decision looked at by a human. You must ensure this involves a review of the decision, with the possibility that you could change it.

You should not confuse the concept of 'human intervention' with that of 'human involvement'. These differ in the following ways:
- Human intervention refers to the safeguard that applies after you make a solely automated significant decision about a person. It applies only when what you're doing is in the scope of the ADM provisions. Human intervention means people can ask for a human to review the decision on a case-by-case basis.
- Human involvement refers to the role humans have during the decision-making process. It is one of the key factors in deciding whether the ADM provisions apply in the first place. If a decision includes meaningful human involvement, it is not solely automated. This is the case even if the decision has significant effects on someone.

Like human involvement, human intervention cannot be tokenistic. Human reviewers should:
- assess and review any reconsideration of the decision before it is applied;
- have the ability to influence the outcome;
- have discretion and authority to alter the decision;
- be suitably trained and qualified to understand the system's outputs, limitations, and risks; and
- take into account the relevant data and factors that the decision was based on.

You should keep a record of how the human reviewed the decision.

To ensure your human intervention process is effective, you should:
- arrange for someone suitably qualified to carry out the review;
- provide the human reviewer with access to all relevant data and original facts that your ADM system used to reach the decision;
- require the reviewer to consider both the relevant data the system used, as well as any additional information or evidence the person affected provides to support their challenge; and
- put in place appropriate training so that your human reviewers understand things like the capabilities and limitations of your ADM systems, relevant technological developments and risks (including bias and discrimination).

You should also monitor and analyse the outcomes of the human reviews following requests for a human intervention. If human reviewers are regularly changing decisions when people challenge them, it may indicate issues with the performance of your ADM systems that you may need to resolve.

Spot checking an ADM process doesn't meet the requirements of this safeguard. This is because the right to obtain human intervention is something that a person actively exercises after you've provided them with information about the decision. Spot checking isn't something that the person instigates themselves.

How do we enable people to contest decisions?
---------------------------------------------
The provisions also say people have the right to contest the ADM you carry out.

To ensure you facilitate people's rights appropriately, you must put measures in place for people to challenge or appeal the ADM you carry out. This doesn't have to be complicated for you to establish or operate.

You must make it clear to people that they have the right to contest your decision and what process they can follow to exercise this right.

What do we do if someone exercises their rights under the ADM provisions?
-------------------------------------------------------------------------
The ability to make representations, obtain human intervention, and contest decisions, all form part of how people can exercise their data protection rights. In practice, people may essentially exercise all three of these at the same time whenever they challenge a decision.

In all cases, you must act on the person's request without undue delay and at the latest within one month of receipt.

You can extend the time to respond by a further two months if the request is complex or if the person makes a number of requests to you. You must:
- let the person know you are applying an extension without undue delay (and at the latest within one month of receiving their request); and
- explain why the extension is necessary.

You should take these timeframes into account when designing any policy or process for people to contest your decisions.

Relevant provisions in the UK GDPR - see articles 12, 12A, and 22C


================================================================================
CHAPTER 6: WHAT RIGHTS DO PEOPLE HAVE?
Latest updates - 31 March 2026
================================================================================

What do we need to tell people and when?
----------------------------------------
You must provide people with information about your ADM activities at three key points in time:
- When you first collect people's information (to comply with transparency provisions and the right to be informed).
- When people ask you for their information (to comply with the right of access (a subject access request)).
- When you engage in ADM (to comply with ADM safeguards).

What do we need to tell people under the right to be informed?
--------------------------------------------------------------
In general, people have the right to be informed about when you collect and use their personal information. This includes your purposes for processing their personal information, your retention periods, and who you will share it with. We call this 'privacy information'.

The right applies when you collect that personal information from people directly, or from another source. When you obtain it from people directly, you must provide them with the privacy information at that point in time. When you obtain it from another source, you must provide the privacy information within a reasonable time period, but at the latest within one month.

In terms of ADM, articles 13 and 14 of the UK GDPR give people the right to be informed of:
- the existence of ADM, including profiling;
- meaningful information about the logic involved; and
- meaningful information about the significance and envisaged consequences for the person.

If you plan to use personal information for any new purposes, you must update your privacy information and proactively bring any changes to people's attention.

What do we need to tell people under the right of access?
---------------------------------------------------------
People's right of access covers the same details about ADM that you must provide in your privacy information under the right to be informed. You must set out that ADM is taking place and include meaningful information about the logic involved and envisaged consequences. This right is triggered by a person requesting this information. You should also include information on ADM already undertaken about the person exercising their right of access.

Where possible, you should provide remote access to a secure system that provides people with direct access to the personal information you process about them. This is also a good way for them to verify and check that the information you're using is accurate.

What do we need to tell people under the ADM safeguards?
--------------------------------------------------------
The UK GDPR provides safeguards that you must implement when you carry out ADM. These safeguards include proactively providing certain information to people, as well as enabling people to contest the decisions you make and request human intervention. (For more information, see the next section What are the ADM safeguards?.)

How should we deliver the information?
--------------------------------------
You must consider how to provide this information in a clear and transparent manner. This is the case whether you are providing information about ADM in a privacy notice, in response to a subject access request or proactively to someone to enable them to exercise the rest of the safeguards under article 22C.

You should not use overly-technical or complex explanations of algorithms or how code works. This is because it is likely to make it more difficult for people to understand how you reach decisions about them, and what impact those decisions may have on them.

You must provide the information in clear and plain language. At the same time, when you carry out ADM, you must make sure people understand how these decisions are made, including the factors and data considered, why you use these methods, and their likely impact on them.

You should take steps to assess whether the information may confuse people. They are unlikely to be technical experts, so you must consider how to produce information in ways that are accessible, concise and easy for them to understand. You should take into account the circumstances in which you deal with people, for example:
- the nature of your relationship with them, such as any power imbalance;
- the purposes you want to make automated decisions for; or
- their expectations.

Where you process children's information for ADM, you have additional responsibilities to ensure the transparency information you are required to provide is genuinely age-appropriate. Under our Children's code, you should tailor explanations to the developmental stage of the child audience, using language, formats, and examples that they can realistically understand. This may mean offering simpler versions of explanations, using visual or interactive methods, or avoiding concepts that are too abstract for younger users to grasp. You should assess whether children can meaningfully understand the decision, the factors influencing it, and its consequences, and adjust your communication accordingly. Ensuring comprehensible, age-appropriate information is essential for safeguarding children's rights and supporting their ability to exercise control over their information.

You should focus on descriptions that include:
- the type of information you collect or use in carrying out ADM, including profiling;
- why this information is relevant or how it influences the information;
- how this information is processed; and
- what the likely impact is (ie how it may affect them).

Example:
An online retailer uses ADM to determine whether to offer credit terms for purchases. The categories of personal information it uses for this purpose include any previous purchase history with the same retailer and information held by credit reference agencies. This process produces a credit score for a specific person.
The retailer explains this in the privacy information it provides to people when they sign up to the service and the retailer first starts collecting personal information.
It includes a high-level summary that clearly and simply says it will analyse information about past behaviour, account transaction history, and perform a soft credit check to decide whether or not it will offer them credit (or the terms of the credit). It also includes a link to more detailed information for those that need it.

As people continue to use the service and make purchases, the retailer uses just-in-time notifications to inform them in context, about how it will use specific purchase information to calculate credit terms. You should deliver privacy information in the same way as when you first collect personal information. For example, if you collect personal information in an online form, you should deliver the privacy information on the same page or have a prominent link to it.

You could also create a dedicated and easy-to-find space in your app or site for people to:
- find out how you use their personal information;
- access the information you hold on them (including details of any profiles and the data input into them); and
- manage what happens with it.

Relevant provisions in the UK GDPR - see articles 13, 14 and 15


================================================================================
CHAPTER 7: WHAT ELSE DO WE NEED TO CONSIDER?
Latest updates - 31 March 2026
================================================================================

Do we have to do a data protection impact assessment (DPIA)?
------------------------------------------------------------
A DPIA is a tool that helps you assess the risks your processing poses to people's rights and freedoms, and identify ways to address those risks.

The UK GDPR says you must do a DPIA if your processing involves:
"a systematic and extensive evaluation of personal aspects relating to natural persons which is based on automated processing, including profiling, and on which decisions are based that produce legal effects concerning the natural person or similarly significantly affect the natural person"

This means you must do a DPIA if you carry out systematic and extensive ADM or other significant decisions based on profiling.

You should do a DPIA for any ADM as this is very likely to be a type of processing that can result in high risk. Even though ADM is not "systematic and extensive" by default, it is highly likely that a lot of organisations use it in this way because of the efficiencies they expect from the scale of the processing. So, you must carry out a DPIA to identify what the risks of your context are and put in place appropriate measures to mitigate them. You must include processes that ensure people receive clear, specific information about the processing and the rights available to them.

A DPIA can help you decide whether or not the ADM provisions are likely to apply to your intended processing in the first place.

They are a good way to meet your accountability obligations by showing how you have:
- considered the risks involved in any profiling or ADM; and
- put procedures in place to mitigate those risks and comply with the UK GDPR requirements.

Relevant provisions in the UK GDPR - see article 35

Do we need to make any other changes to our systems?
----------------------------------------------------
You should have mechanisms in place to diagnose any quality issues or errors and a process to document how you intend to resolve them.

You should ensure that these mechanisms also allow you to check your systems are working as intended and highlight any inaccuracies or bias.

Recital 71 says you should:
- use appropriate mathematical or statistical procedures for profiling; and
- implement technical and organisational measures appropriate to ensure, in particular, that factors which result in inaccuracies in personal information are corrected and the risk of errors is minimised.

To achieve this, think about how you can:
- introduce quality checks on the results from your systems by manually reviewing a sample of automated decisions, to identify any bias or discriminatory effects or both;
- take corrective action, such as adjusting thresholds, re-training or updating the model, or adding additional human oversight steps;
- delete any special category data that your system may receive or infer before profiling if you do not require it;
- identify appropriate retention policies for the information you use and keep these under review;
- implement suitable security measures such as access controls and encryption; and
- audit your machine-learning systems to check for decision-making rationale and consistency.

It is important to note that monitoring aspects of a system's performance, such as its statistical accuracy, is not human intervention. This is because there is not a significant decision made about a specific person.


================================================================================
END OF DOCUMENT
================================================================================
