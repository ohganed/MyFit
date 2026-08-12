# MyFit Health Cockpit Architecture

## Product direction

MyFit evolves along two compatible paths:

1. **MyFit Core** — keep improving the existing fast, no-scroll strength-training logger.
2. **Health Cockpit** — expand toward whole-life health context: movement, body metrics, sleep, food, recovery, and insights.

The existing MyFit Core remains useful on its own. The Health Cockpit must reuse shared data rather than replace or bloat the Core workout loop.

## Core principle

MyFit should help the user answer three questions:

1. **What is my current state?**
2. **What changed over time?**
3. **What is a sensible next action today?**

It is not designed to diagnose disease or prescribe treatment.

## Data domains

### Movement
- Strength training
- Walking
- Running
- Cycling
- Mobility
- Stretching
- Cardio
- Balance
- Yoga
- Recovery movement

### Body
- Weight
- Waist
- Blood pressure: systolic / diastolic
- Resting heart rate
- Future compatible metrics

### Sleep
- Bedtime
- Wake time
- Sleep duration
- Optional subjective sleep quality

### Food
- Meal time
- Meal description
- Optional meal size / notes
- Optional structured Nutrition data

Nutrition is deliberately optional so meal logging stays lightweight. Supported nutrition fields may include:
- Energy (kcal)
- Protein
- Fat
- Carbohydrate
- Fiber
- Sugar
- Sodium
- Potassium
- Calcium
- Iron
- Magnesium
- Vitamin D

Every nutrition record preserves provenance when known: `manual`, `database`, `barcode`, `photo-estimate`, `import`, or `healthkit`. Estimated nutrition should remain distinguishable from measured or database-backed values.

### Recovery
- Energy level
- Soreness
- Pain / discomfort location and severity
- General notes

## Two data shapes

### 1. Metric samples

Use for numeric observations.

```json
{
  "id": "uuid",
  "metric": "weight",
  "value": 81.7,
  "unit": "kg",
  "measuredAt": "2026-08-12T07:30:00+09:00",
  "source": "manual",
  "metadata": {}
}
```

Examples: Weight, Blood Pressure values, Steps, Walking Distance, Resting HR.

Implemented through `window.MyFitHealth`.

### 2. Timeline events

Use for activities and events that happen at a time or across a time interval.

```json
{
  "id": "uuid",
  "type": "meal",
  "domain": "food",
  "startAt": "2026-08-12T19:10:00+09:00",
  "endAt": null,
  "source": "manual",
  "payload": {
    "description": "rice, grilled fish, vegetables",
    "nutrition": {
      "source": "database",
      "confidence": null,
      "servingDescription": "1 meal",
      "foodItems": [],
      "nutrients": {
        "energyKcal": { "value": 620, "unit": "kcal" },
        "proteinG": { "value": 32, "unit": "g" },
        "fiberG": { "value": 8, "unit": "g" },
        "sodiumMg": { "value": 1450, "unit": "mg" }
      }
    }
  },
  "metadata": {}
}
```

Examples: Meal, Sleep, Movement session, Recovery check.

Implemented through `window.MyFitCockpit`.

## Provider boundary

UI and product modules must not directly depend on localStorage, HealthKit, or another device API.

```text
MyFit Core / Health Cockpit UI
            |
            v
     Shared Data APIs
     |             |
MyFitHealth   MyFitCockpit
     |             |
     +------ Provider boundary ------+
                    |
          Local PWA providers now
                    |
          HealthKit/native later
```

The PWA can therefore remain the current implementation while preserving a migration path to Swift/HealthKit.

## Source field

Every record should identify its source when known, for example:

- `manual`
- `myfit-core`
- `myfit-move`
- `import`
- `healthkit`
- `device`

Nutrition has its own provenance because the meal itself can be manually logged while its nutrition may come from another source such as a database, barcode, or photo estimate.

## HealthKit migration rule

A future native implementation should replace data providers, not rewrite product logic.

For example:

```text
LocalHealthProvider -> HealthKitHealthProvider
LocalEventProvider  -> NativeEventProvider
```

The public MyFit APIs should remain stable wherever practical.

## Insight layer

Insights are derived data, not raw data. They should never overwrite source records.

Examples:

- 7-day Weight average
- 30-day Blood Pressure trend
- Average meal time
- Sleep-duration trend
- Movement on short-sleep days
- Steps on training vs non-training days
- Recovery patterns
- Protein intake vs Strength sessions
- Sodium intake vs Blood Pressure trends
- Meal timing vs Sleep trends

Recommendations should use cautious language and should not make medical diagnoses.

## Initial implementation phases

### Phase 1 — Foundation
- Keep MyFit Core intact
- Metric provider abstraction
- Timeline event abstraction
- Manual entry first
- Unified timestamps and source metadata
- Optional nutrition schema attached to Meal events

### Phase 2 — Cockpit UI
- Today dashboard
- Body Check
- Sleep entry
- Meal entry
- Optional Nutrition Detail
- Recovery check
- Daily timeline

### Phase 3 — Trends
- 7-day and 30-day summaries
- Cross-domain comparisons
- Simple user-readable observations

### Phase 4 — Guided movement
- Use current state and available time to suggest Movement
- Hands-free timer / voice flow
- Reuse MyFit Core workout data where appropriate

### Phase 5 — Native bridge
- Swift shell when justified
- HealthKit providers
- Import Steps, Walking Distance, heart metrics, sleep, and other user-authorized data

## Non-negotiable architectural rule

**MyFit Core stays independently usable.**

Health Cockpit features may consume Core data, but must not make the fast Core workout loop slower or more complicated.
