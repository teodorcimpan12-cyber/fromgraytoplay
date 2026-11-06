---
name: arena
description: Run a tournament for one answer — several parallel subagents attack the same task with deliberately different strategies, blind judges critique and eliminate the weak entries round by round, the survivors revise, and the strongest answer (plus the best ideas grafted from the losers) is returned. Use whenever the user types /arena, says "arena this", "make them compete", "give me the best of N", "I'm not happy with this answer, try harder", or asks for the strongest possible version of a high-stakes piece of work (a pitch, launch email, petition text, letter to the council, key decision, tricky architecture choice). Costs many times a normal reply, so it is for tasks that matter, not for quick questions.
---

# Arena

Many independent attempts at the same task, then adversarial judging, beat one attempt re-prompted many times. The value comes from two things, and the skill is built to protect both:

1. **Diversity.** Ten agents given the same prompt write ten near-identical answers. Each contestant is therefore handed a *different strategy* (a different angle, audience, structure or method), so the field actually covers the space of good answers.
2. **Blind, rubric-based judging.** Judges see anonymized entries and a rubric agreed up front, so they score the work, not the author or the order.

## 0. Frame the task (you, no subagents)

- Restate the task in one paragraph, with every constraint the user gave (length, language, tone, audience, facts that must be used, facts that must not be invented). If the user invoked /arena on an answer you already gave, the task is that same request, and your previous answer becomes contestant **#0** (it competes; it does not get a head start).
- Write a **rubric** of 4–6 criteria with weights summing to 100, specific to this task (for a pitch: clarity of the ask, evidence, memorability, fit to the jury...). Include "correctness / no invented facts" whenever facts matter; it is the criterion most often lost in creative competition.
- If the task depends on files, data or a repository, gather the essential context once and paste it into the brief, so contestants don't each spend tokens rediscovering it.

## 1. Size the arena and say what it costs

| Size | Contestants | Rounds | When |
|---|---|---|---|
| small (default) | 6 | 1 critique + 1 revision | most tasks |
| medium | 10 | 2 critique + revision | important text, decisions |
| large | 16 | 3 | only if the user asks |

The user can say `/arena 12` etc. Above 16, explain that diversity, not headcount, is what improves results (past ~15 distinct strategies the entries start to repeat), and that 100 agents would cost roughly 100 normal replies; run more only if they confirm after hearing that.

Before spawning, tell the user in one line: size, number of agents that will run in total, and that it costs about that many normal replies.

## 2. Assign strategies

Pick N strategies that genuinely differ *for this task*. Draw from axes like these and mix them:

- **Angle:** data-first · story-first · problem→solution · contrarian · first-principles · analogy-led · objection-handling first
- **Audience lens:** the skeptic · the expert · the busy decision-maker · the person directly affected
- **Form:** shortest possible · structured/numbered · narrative · Q&A · one-big-idea
- **Method (for analytic/technical tasks):** brute-force enumeration · work backwards from the goal · simplest thing that works · steelman the alternative then decide · find precedents

Write each as one sentence of instructions. No two contestants share the same angle *and* form.

## 3. Round 1 — contestants (parallel)

Spawn all contestants **in a single message** (one Agent call each, `subagent_type: general-purpose`) so they run in parallel. Each prompt contains: the framed task, the rubric, the context pack, its own strategy sentence, and:

> Commit fully to your assigned strategy — the point is to explore a different route than the others. Return only your final answer, then one line starting `RATIONALE:` explaining the key choice you made.

Do not show contestants each other's work in round 1.

## 4. Critique and elimination

Strip author identity, shuffle, label entries A, B, C... Spawn **3 judges** in one message (2 for small arenas), each with the rubric, all entries, and a different temperament: *strict fact-checker*, *target-audience reader*, *editor who cares about craft*. Each judge returns, per entry: a score per criterion, total, the single biggest weakness, and the single best idea worth stealing.

Average the totals. Keep the top half (minimum 2 survivors). An entry with an invented fact flagged by the fact-checker is eliminated regardless of score, unless the fact is trivially fixable.

## 5. Revision rounds

Give each survivor (fresh agent, same strategy sentence): its own entry, the judges' critiques of it, and the list of "best ideas worth stealing" from **all** entries including eliminated ones. Ask it to produce a stronger version that fixes the weaknesses and may absorb stolen ideas without abandoning its strategy. Then judge again (step 4). Repeat for the number of rounds in the size table, halving the field each time, until 2–3 finalists remain.

## 6. Final

Judges rank the finalists. Then you (not a subagent) take the winner and make a last pass: graft in any clearly superior element from a runner-up if it fits, and check every factual claim against the context pack. Don't merge into mush — the winner's voice and structure stay.

## 7. Report to the user

```
## 🏆 Arena result
<the final answer>

---
**How it was won** (N contestants, R rounds, ~A agent runs)
- Winner: strategy "<strategy>" — score X/100
- Runner-up: "<strategy>" — what it did better: ...
- Grafted from others: ...
- Eliminated early: <strategies> — why, in a few words
```

Keep the report short; the user came for the answer. Answer in the user's language.

## Things that go wrong

- **Homogeneous field.** If round-1 entries look alike, your strategies were too similar; note it in the report rather than pretending the competition was rich.
- **Judges rewarding length.** Remind judges in their prompt that length is not a criterion unless the rubric says so.
- **Facts drifting.** Creative contestants embellish. The fact-checker judge and your final check exist for this; never let an invented number, date or quote into the final answer.
- **Using it for trivial tasks.** If the task is a quick lookup or a one-liner, say so and answer directly instead of running the arena.
