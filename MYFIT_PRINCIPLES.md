# MyFit Product Principles

## MyFit

**Life that fits me.**

MyFit is not a system for grading a person's life. It is a personal life and movement companion that helps a person see their own patterns, notice meaningful changes, and act with less friction.

These principles are the product constitution for future MyFit development. New features should be evaluated against them before being added.

## 1. Less input

Recording should require as little effort as possible.

- Prefer taps, choices, recent items, favorites, and reusable patterns.
- Learn recurring routines so repeated input becomes confirmation.
- Automate data capture when reliable sources become available.
- Do not require completeness for MyFit to remain useful.

## 2. Tap first. Type only when needed.

Text entry is an exception, not the default interaction.

- Use quick choices and bottom sheets for common actions.
- Offer Recent, Usual, Favorite, Same as usual, and Duplicate where appropriate.
- Keep free text available for situations that genuinely need context.

## 3. No judgment

MyFit observes before it evaluates.

- Do not label ordinary behavior as good or bad merely because it differs from a norm.
- Avoid turning the person into a score.
- Avoid unnecessary streak pressure, guilt, punishment, or congratulation.
- Medical or safety-related warnings must remain separate from ordinary pattern observations.

## 4. Notice meaningful change

Not every difference matters.

MyFit should notice when today meaningfully differs from the person's usual pattern, while accounting for normal variation and measurement uncertainty.

Examples:
- Squat repetitions changing from a usual 5 to 10 may be meaningful.
- Ten minutes of estimated sleep-time difference usually is not.
- One changed breakfast item usually is not.
- A substantially different breakfast pattern may be.

A change event describes what changed; it does not decide whether the change was good or bad.

## 5. Use ranges, not fictional precision

A person's usual behavior is normally a range, not a single exact value.

- Learn a personal usual zone or baseline distribution.
- Allow wider tolerance when data is estimated or manually recalled.
- Allow narrower analysis when data comes from reliable measurements or devices.
- Store source and confidence where useful.

## 6. Your baseline first

The primary comparison is the person's own recent pattern.

Population or official reference values may be shown when genuinely useful, especially for nutrition and health-related measurements, but they should not replace personal context.

## 7. Today before Trends

The main screen answers: **What does today look like?**

Today should remain calm and immediately understandable. Deeper analysis belongs in Trends.

Suggested structure:
- Today Summary
- Timeline
- Quick Add
- Meaningful change indicators

## 8. Timeline is the shared language

Movement, meals, sleep, body measurements, recovery, and contextual events should be able to coexist on one chronological timeline.

The timeline should make relationships visible without claiming causation.

## 9. Insight is not advice

Keep observations and recommendations distinct.

Observation example:
> On days when dinner was later than your usual range, recorded sleep was also shorter.

This is not equivalent to:
> Late dinner caused your shorter sleep.

MyFit should explicitly preserve this distinction in future analytics and AI features.

## 10. Habits can change

A deviation that repeats may become a new pattern.

MyFit should support the transition:

**Habit → Difference → Repetition → New Habit**

Do not keep celebrating or flagging a behavior forever after it becomes normal for that person.

## 11. Core stays fast

The existing workout experience remains a first-class product surface.

Adding Today, nutrition, sleep, body data, trends, or future intelligence must not make starting and recording a workout slower or more complicated.

## 12. No-scroll where possible

Critical actions should fit the device and context.

- Workout timer interactions should remain immediately accessible.
- Mobile layouts must not require horizontal scrolling.
- Use responsive one-column layouts on narrow screens.
- Reveal detail progressively instead of placing everything on one screen.

## 13. Quiet by default, expressive when meaningful

Most interactions should be visually calm.

When a genuinely meaningful deviation is detected, MyFit may briefly become more expressive — animation, scale, light, vibration, or a short visual event — and then return automatically to the normal interface.

The purpose is **awareness**, not reward.

## 14. Missing data is not failure

Life is incomplete and so is personal data.

- A missed meal log is not a failed day.
- A week away from MyFit does not break anything.
- Users should be able to resume immediately without repair work or guilt.

## 15. Build for replaceable data sources

The product should remain usable as a PWA today while allowing future native integration.

UI and product logic should consume shared data interfaces rather than depend directly on storage implementation.

Possible providers include:
- Local/manual data
- Imported data
- Food databases and barcode sources
- Device-derived data
- Future HealthKit integration

## Product test

Before adding a feature, ask:

1. Does this reduce friction or create it?
2. Does it help the person understand their own life?
3. Is it observing, or unnecessarily judging?
4. Does it respect normal variation and uncertainty?
5. Can it work without forcing complete data entry?
6. Does it keep Today calm and Core fast?
7. Does it fit the idea: **Life that fits me.**

If a feature fails several of these questions, it should be redesigned, deferred, or rejected.
