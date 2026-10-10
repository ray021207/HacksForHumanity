# Gentle Parenting Conversation Starters: MVP Spec

Oct 9, 2026 · @Ray1207

## At a glance

A parent answers a short questionnaire once, then describes a situation and gets three to five conversation starters back as cards. There is no chat.

The decisions that shape everything else, and why:

- **Scores, not labels.** Parenting style and personality are scored as continuous dimensions. The app tunes tone from them and never tells a parent "you are authoritarian".
- **The questionnaire is a composite.** The best-known parenting-style instrument was built for parents of children aged 4 to 12, and none of the instruments found covers teens through adult children in one parent-report form. So the MVP combines short validated scales and adapts the wording. Adapting breaks the published reliability numbers, so results are a tuning signal, not a diagnosis.
- **Code scores, the model writes.** Scoring is deterministic code. The model only sees the scores and the situation, which keeps the profile explainable and testable.
- **Cards, not conversation.** This is your requirement, and it also shrinks the safety surface: no multi-turn drift and no companion-style dependency.
- **Evidence base.** "Gentle parenting" itself has had little formal study. The one systematic study found was exploratory (100 parents of children aged 2 to 7). The core ideas (warmth, emotion coaching, firm boundaries, autonomy support) are well supported under authoritative parenting research. Nothing found tests the brand with parents of teens or adults, so the teen and adult content leans on that adjacent research.

## Questionnaire sources

Ten instruments cover the constructs the app needs, but only the TIPI is confirmed free to use as written. Rows marked † come from abstracts in search results, not the full papers, so verify them before building on them.

| Instrument | Measures | Fit for teens through adult children | Licence and access |
| --- | --- | --- | --- |
| [TIPI](https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/) (Gosling et al., 2003) | Big Five, 10 items | Parent's own personality. The author calls it somewhat inferior to longer measures | Author states anyone can use it for any purpose, no permission needed |
| BFI-10 † (Rammstedt et al., 2013) | Big Five, 10 items, about 1 minute | Alternative to the TIPI. One validation found Openness and Agreeableness less reliable | Article is CC BY 4.0. Confirm the item licence separately |
| [PSDQ-Short](https://psypack.com/assessments/parenting-styles-and-dimensions-questionnaire-psdq-short/) (Robinson et al., 2001) | Authoritative (15 items), authoritarian (12), permissive (5) | Built for parents of preschool and school-age children, so weakest for teens and adults. Permissive scale alphas ran .38 to .74 across the samples seen † | Published in a SAGE handbook. I found no reuse licence, so get permission or write original items |
| P-PASS † (Mageau et al., 2015) | Autonomy support vs control, as perceived by the teen | Teen-report only. Useful as the basis for adapted parent-report items | Unknown |
| LAPPS † | Responsiveness, behavioural control, psychological control, autonomy support | A parent version has been adapted into Turkish | Unknown |
| ERPS short form † (Gottman-based) | Emotion coaching, acceptance and rejection of negative emotion. 20 items, alphas .70 to .80 | Tested on 107 parents of typically developing children. Child age not seen. Maps directly onto conversation starters | Unknown |
| SEPA † (McDougall and Scott, 2021) | Parent self-efficacy, four factors | Parents of adolescents aged 12 to 18. Authors call it promising, initial validation only | Unknown |
| PACS † (Barnes and Olson, 1982) | Open communication vs communication problems, 20 items per parent | Parent and adolescent versions. Publisher said in 2010 it is out of print | Publisher is Prepare/Enrich. Permission needed |
| Helicopter and autonomy-supportive parenting measure † (Padilla-Walker and Nelson) | Two factors confirmed in 461 college students | Emerging adults reporting on parents, so not a parent-report form | Unknown |
| ECR-S † (Wei et al., 2007) | Attachment anxiety and avoidance, 12 items | About romantic relationships, not parenting. Phase 2 at most | Unknown |

Three things follow. First, the MVP draws on constructs, not verbatim items: it writes original items for parenting style, autonomy support, emotion coaching and self-efficacy, and uses the TIPI as is. Second, I found no validated parent-report instrument for adult children, so that age band runs on original items and gets validated later. Third, I did not research type-based tools such as MBTI, which are commercial. The Big Five are dimensions, which is what the scoring needs.

## The MVP questionnaire

About 40 items in seven blocks, one block per screen, with every block changing something specific in the cards the parent gets. A question that changes nothing in the output gets cut.

| Block | Items | Built from | What it changes in the output |
| --- | --- | --- | --- |
| 1. Family | Per child: age band (13 to 15, 16 to 17, 18 to 22, 23 and up), living situation, optional nickname | Original | The developmental frame. Teens get autonomy and identity framing. Adult children get adult-to-adult framing with no claim to authority |
| 2. Personality | 10 | TIPI, as published | Tone only, such as how much of a pause-and-steady lead-in comes before a hard line. Tune this from feedback, not assumption |
| 3. Parenting style | About 12, 5-point frequency | Original items on Baumrind's three styles | Which gap each starter coaches: more structure, less pressure, or both |
| 4. Autonomy and control | About 6 | Original items on the P-PASS and self-determination constructs | Questions and choices instead of directives. Adult children get the strongest version |
| 5. Emotion coaching | About 5 | Original items on the ERPS constructs | How much feeling-naming scaffolding each starter carries |
| 6. Confidence and load | 4 | Original items on the MaaPs-SF and SEPA constructs | Whether cards lead with reassurance. Keeps guilt out for self-critical parents |
| 7. Goals | 2 chips | Original | What the talk is for: repair, closeness, setting a limit, or asking for something |

Two findings shaped block 6. In the one gentle-parenting study found, gentle parents who criticised themselves most reported significantly lower parenting efficacy (about 3.96 vs 4.44 on a 6-point scale), and over a third of them voiced uncertainty or burnout. Separately, a study of 256 parent and emerging-adult pairs found parents' overparenting was not tied to their child's autonomy needs, which suggests it may come from the parent's own needs. So the app should never hand a self-critical parent a shaming script, and cards for adult children should name the parent's own worry before the ask.

Question rules:

1. Ask about behaviour ("How often do you..."), never identity.
2. Never ask for a child's diagnoses, health history or real name.
3. Offer "prefer not to say" on every item, and save partial progress.
4. Show results as tendencies in strengths-first language, with one suggested stretch. No type labels.

## User flow

&#91;embedded content: user flow · 9 steps, 1 safety gate, 3 tiers\]

The top row happens once. After that, each situation runs through the gate: green and amber reach the generator, and red goes straight to fixed, clinician-reviewed help with no generated text.

## Architecture

&#91;embedded content: architecture · 3 tiers, 8 components\]

The parent's browser only ever talks to your server. A situation goes to the gate first, then the generator, then the validator, and the cards come back. The generator also reads the saved profile scores from Postgres and a versioned playbook file kept in the code repository.

Choices, and why:

- **Web app first (PWA).** One codebase, no app-store review while you are still changing the questionnaire.
- **Playbook as a file, not a vector database.** It holds a few dozen curated techniques per age band, reviewed by a clinician through ordinary code review. A lookup by technique and age band is deterministic and testable. Retrieval adds failure modes you would then have to measure.
- **Scoring in plain code.** It can be unit-tested with no model call, and a profile can always be explained to the parent.
- **Row-level security in Postgres.** A parent can only ever read their own rows, enforced in the database rather than only in application code.
- **Backend language.** TypeScript if you build the web app in Next.js, or Python (FastAPI) if you would rather keep scoring and the evaluation scripts in one language. Both work, and the architecture does not change.

## The output: starters only, no chat

The model makes one structured call per situation and returns cards. There is no free-text box after the output. The Jed Foundation's open letter says safeguards must not degrade over long sessions, and a one-shot design removes that failure mode by construction. [Jed Foundation](https://jedfoundation.org/open-letter-to-the-ai-and-technology-industry/)

What comes back:

```json
{
  "risk_tier": "green",
  "frame": "One line naming the situation back to the parent",
  "before_you_start": "One line to steady the parent first",
  "starters": [
    {
      "text": "What the parent can actually say",
      "technique": "validation | open_question | autonomy_offer | repair | boundary",
      "why": "One line on why this works",
      "avoid": "The phrase to steer clear of"
    }
  ],
  "setting_tip": "Where and when to say it"
}
```

Rules I propose, all testable in code:

1. Three to five starters per request. Each is tagged with one technique from a closed list, so you can lint the output and measure which techniques parents use.
2. A banned-pattern check runs after generation: commands, threats, guilt, withdrawal of affection, diagnosis. A failed check retries once, then shows a fixed fallback card.
3. Refinement happens through chips ("shorter", "softer", "different angle"), each re-running the same one-shot call with changed parameters. Nothing the parent types after the output reaches the model.
4. A `risk_tier` of `red` means no generated starters at all. See Safety and privacy.
5. The profile scores enter the prompt as numbers and one-line tendencies, never as labels like "authoritarian".

## Safety and privacy

Parents will describe teens in crisis and parents who are losing control, so a safety gate runs before any generation. The one-shot design helps, but it does not replace the gate.

- **Three tiers.** Green is ordinary conflict and gets cards. Amber (self-harm talk, substance use, severe withdrawal, the parent's own rage or burnout) gets cards plus a fixed safety block. Red (stated or implied danger to the child or anyone) gets no generated starters, only fixed content on staying with the person and reaching help.
- **Hand-off targets.** The Jed Foundation names a warm hand-off to 988 or the Crisis Text Line (text HOME to 741741) as the baseline. It also says AI must never encourage young people to hide distress from parents, and must not provide lethal-means content. [Jed Foundation](https://jedfoundation.org/open-letter-to-the-ai-and-technology-industry/)
- **Fixed content is reviewed, not generated.** Have a licensed clinician review the amber and red text before launch. Any resource beyond 988 and the Crisis Text Line needs checking for current numbers first.
- **Measure the gate.** Build a labelled set of situations and report red-tier recall and the false-positive rate. Do not ship until a clinician reviewer signs off on the recall figure.
- **Rhode Island law, enacted June 23, 2026.** Chatbot developers must have protocols for suicidal ideation, self-harm and wishes to harm others, refer users to a crisis provider as soon as it is detected, report activations to the Attorney General yearly, and tell users they are not talking to a human at the start and every three hours. [RI General Assembly](https://www.rilegislature.gov/pressrelease/Lists/PressReleases/DispForm.aspx?ID=376765) Whether a one-shot card generator counts as a chatbot under it is a question for counsel. Building to the standard anyway is cheap: a disclosure line, a crisis referral and an activation log.
- **COPPA.** The amended rule took effect June 23, 2025, with a compliance deadline of April 22, 2026, and adds a written retention policy and security program. [Jones Day](https://www.jonesday.com/en/insights/2025/05/ftc-finalizes-amendments-to-coppa--rule) The rule is about collecting data from children under 13, and your users are parents of teens and adults, so it probably does not apply directly. Confirm with counsel, and treat anything about a minor as sensitive regardless.
- **Data minimisation.** Store age bands, never birthdates or real names. By default, do not store the situation text, only the tier, the technique tags and a thumbs up or down. Let users delete everything in one tap.
- **No engagement hooks.** The Jed letter lists streaks, gamification and personalised notifications as patterns to disable for youth products. This app serves parents, but the content is about young people, so skip them. It also says not to personalise on a young person's emotional disclosures.
- **Disclosure.** Every card screen says the content is AI-generated and is not therapy or medical advice.

I am not a lawyer. The legal items above are what to ask one, not conclusions.

## MVP scope and build order

Six stages, each ending in a measured number so you know it works, not just that it runs. The order puts the riskiest parts first: licences, then scoring, then the safety gate, then generation.

| Stage | Build | Measured number |
| --- | --- | --- |
| 0. Clear the sources | Settle which items are original, which need permission | Share of items with a cleared source. Target 100% |
| 1. Questionnaire and scoring | The seven blocks and a scoring module in plain code, with unit tests | Pilot with about 30 parents: median completion time and Cronbach's alpha per block, the same statistic the papers above report. The instruments cited report roughly .70 and up, a useful rough bar |
| 2. Situation intake and safety gate | Free text plus chips (child age band, setting, goal), then the three-tier classifier | Red-tier recall and false-positive rate on 100 or more labelled situations that a clinician has reviewed |
| 3. Generation and validator | One structured model call, schema check, banned-pattern lint, fallback card | Lint pass rate on first try. Blind rating of 50 scenarios by two raters on a 1 to 5 rubric, with agreement reported |
| 4. Does the profile help? | Same 50 scenarios, profile-conditioned vs generic output | Preference rate for the profile-conditioned version. If it is near 50%, the questionnaire is not earning its length |
| 5. Closed pilot | End-to-end web app with 20 to 30 parents | Completion rate, share who used a starter, thumbs-up rate, safety activations |

In scope: one parent account, up to four children, English, US. Out of scope for the MVP: chat, voice, partner sharing, child accounts, push notifications, subscriptions, and any analytics built on emotional content.

Stage 4 is the one that decides whether the product idea holds. If a generic prompt with only the child's age band produces cards raters prefer just as often, shorten the questionnaire before building anything else.

## Open risks and decisions for you

Five decisions block Stage 0, and one risk needs watching all the way through.

- [ ] **Item source.** Write original items on the validated constructs (my recommendation, since no reuse licence was found for the PSDQ), or contact the publisher for permission.
- [ ] **Age floor.** The research base is thinnest for adult children and strongest for ages 4 to 12. Decide whether the MVP launches for teens only, or covers adult children with a clear "experimental" label.
- [ ] **Clinician reviewer.** Someone licensed has to review the amber and red content. Decide who, before Stage 2.
- [ ] **Claims.** Say the app is based on research on warm, structured, autonomy-supportive parenting. Do not say it delivers proven gentle parenting, because that brand has had one exploratory study, on parents of children aged 2 to 7. [PLOS ONE](https://pmc.ncbi.nlm.nih.gov/articles/PMC11290678/)
- [ ] **Platform.** Web app first (the architecture assumes this), or native mobile.

The ongoing risk is who the research describes. That gentle-parenting sample was 87% White and highly educated, and the paper itself notes that Baumrind's typology has been criticised as Eurocentric. Recruit the Stage 1 and Stage 5 pilots across backgrounds, and check whether the scores and cards land differently for different families.

## Sources

Opened in full (as of October 9, 2026):

- [TIPI, Gosling lab page](https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/): permission statement and scoring
- ["Trying to remain calm": the meaning of gentle parenting, PLOS ONE 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11290678/)
- [PSDQ-Short, PsyPack](https://psypack.com/assessments/parenting-styles-and-dimensions-questionnaire-psdq-short/): item counts, age range, SAGE handbook citation
- [Open Letter to the AI and Technology Industry, Jed Foundation](https://jedfoundation.org/open-letter-to-the-ai-and-technology-industry/)
- [FTC finalizes COPPA amendments, Jones Day](https://www.jonesday.com/en/insights/2025/05/ftc-finalizes-amendments-to-coppa--rule)
- [Rhode Island AI chatbot safety law, General Assembly press release](https://www.rilegislature.gov/pressrelease/Lists/PressReleases/DispForm.aspx?ID=376765)

From search-result abstracts only (marked † in the table, verify before relying on them):

- [BFI-10 article](https://mda.gesis.org/index.php/mda/article/view/2013.013)
- [P-PASS in Spanish late adolescents](https://revistes.ub.edu/index.php/Anuario-psicologia/article/view/33615)
- [LAPPS parent and adolescent versions, Turkish adaptation](https://arsiv.dusunenadamdergisi.org/ing/DergiPdf/DUSUNEN_ADAM_DERGISI_fb1806a00fa64a648a35c3867821d9b6.pdf)
- Emotion-Related Parenting Styles short form (20 items), found as an abstract on a Dutch knowledge-base page
- [SEPA, Self-efficacy for Parenting Adolescents Scale](https://mijn.bsl.nl/the-self-efficacy-for-parenting-adolescents-scale-development-an/19377490)
- [Parent-Adolescent Communication Scale, Buros review](https://marketplace.unl.edu/buros/test-reviews/alphabetical-list/parent-adolescent-communication-scale.html)
- [Helicopter Parenting Behaviors measure, 461 students](https://iro.uiowa.edu/esploro/outputs/journalArticle/Helicopter-Parenting-and-Emerging-Adult-Self-Efficacy/9983993492302771)
- [Autonomy and overparenting, 256 parent and emerging-adult pairs](https://experts.arizona.edu/en/publications/autonomy-and-overparenting-are-parents-of-emerging-adults-being-r/)
- [ECR-S, NovoPsych](https://novopsych.com/assessments/formulation/experience-in-close-relationship-scale-short-form-ecr-s/)
- PSDQ permissive-scale alphas: [Spanish adaptation](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13446840/), [type 1 diabetes sample](https://pmc.ncbi.nlm.nih.gov/articles/PMC3404194/), Turkish adaptation (Onder and Ogelman, 2009)
