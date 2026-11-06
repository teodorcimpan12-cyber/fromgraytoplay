---
name: council
description: Put one idea, plan or decision on trial — a courtroom of parallel subagents (Prosecutor, Defense, Investor, Target User, Jury member, then a Judge) attacks it from every side, so its weak points surface before a jury, mentor or investor finds them. Use whenever the user types /council, says "consiliul", "pune-o la judecată", "atacă din toate unghiurile", "procuror, acuzat, judecător, investitor", or before committing to a plan, a pitch, a business model or a feature list that matters. Pairs with /arena: arena generates the best candidate, council stress-tests it. Costs about 6 normal replies.
---

# Council

Arena finds the best answer among many. Council does the opposite job: it takes **one** answer and tries to break it. Use it after an arena, before a pitch, or on any decision the team is about to commit to.

## 0. Frame the case (you, no subagents)

- **The case:** the idea/plan/decision in one paragraph, plus the full text if there is one.
- **The context pack:** only facts with sources (the project's rule: no invented numbers). Paste them once so each role does not rediscover them. Mark clearly what is fact, what is hypothesis, what is unknown.
- **The question for the verdict**, e.g. "Should we build this in the next 10 hours?" or "Will the jury believe this business model?"

Tell the user in one line: 6 agents, about 6 normal replies.

## 1. The hearing (5 roles in parallel, one message)

Spawn all five at once (`subagent_type: general-purpose`). Each gets the case, the context pack and its role:

| Role | Instruction |
|---|---|
| **Procuror** (Prosecutor) | Build the strongest case that this fails. Find the 5 most serious flaws: wrong assumptions, missing evidence, risks, invented or unsourced numbers, things that will not be ready in time. Rank them by damage. |
| **Apărarea** (Defense) | Build the strongest honest case for it. Steelman it, name what is already proven, and propose the smallest change that answers each obvious attack. No hype, no invented facts. |
| **Investitorul** (Investor) | Would you put money or your name on it? Who pays, why now, what is the moat versus existing alternatives, what metric would change your mind? Say the one question you would ask in the room. |
| **Utilizatorul** (Target user) | You are the real end user (for F2G: a 15-year-old from a neighbourhood with only a phone, impatient, mobile data). Walk through it step by step; where do you quit, get confused, or not care? |
| **Juratul** (Jury member) | You score this at the competition (for Astra Hack: The Product Chapter — they reward teams that tested with real people). Score 1–10 on problem, validation, solution, business, pitch; name what would move each score up by 2. |

Every role returns at most ~300 words and ends with one line `TOP POINT:` — its single most important claim.

## 2. Cross-examination (optional, medium cases and above)

Give the Prosecutor the Defense's answer and the Defense the Prosecutor's, in one parallel message. Each may rebut in ≤150 words. Skip for small cases.

## 3. The verdict (Judge, one agent)

Spawn the **Judecătorul** (Judge) with everything above. Instructions: be impartial; weigh evidence, not eloquence; reject any claim without a source. Return:

1. **Verdict:** Approve / Approve with conditions / Reject.
2. **Charges upheld:** the attacks that stand, ranked, each with the fix.
3. **Charges dismissed:** and why.
4. **Conditions:** the concrete, testable changes required (who, what, by when).
5. **The one sentence** the team should be able to say to an investor or jury after the fixes.

## 4. Report to the user

```
## ⚖️ Verdict: <Approve / with conditions / Reject>
<the conditions, as a short checklist>

**Ce a susținut acuzarea** (upheld): …
**Ce a apărat apărarea** (dismissed charges): …
**Întrebarea investitorului:** …
**Unde renunță utilizatorul:** …
**Scor jurat:** problemă X · validare X · soluție X · business X · pitch X
```

Answer in the user's language. Keep it short; the user wants the verdict and the fixes, not the transcript.

## Things that go wrong

- **Strawman prosecution.** If the Prosecutor only finds cosmetic issues, the case was framed too vaguely; add the full text and rerun that role.
- **Polite judge.** The Judge must uphold at least the charges with evidence; "everything is fine" without addressing each upheld point is a failed verdict.
- **Invented facts.** Any role may cite only the context pack or clearly-labelled general knowledge. The Judge throws out unsourced numbers.
- **Trivial cases.** A one-line question does not need a courtroom; answer directly.
