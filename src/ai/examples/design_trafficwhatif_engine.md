# TrafficWhatIf Data Generation Engine

> **Redacted excerpt.** TrafficWhatIf is unpublished and under active development, so the detailed design is withheld. The sections kept below show what a design document in this workflow covers: the goal, the guiding principle, and the rules every component must obey.

## Design Goal

TrafficWhatIf is a simulation-based dataset generation engine designed to explore urban traffic "what-if" scenarios: what would happen to traffic across a city if a particular road-network or transportation-policy intervention were introduced? By simulating traffic under different interventions, TrafficWhatIf enables researchers to generate customized datasets capturing how urban traffic dynamics respond to changes in the road network and transportation policies.

Users may replace the default implementation of major stages with their own.

Therefore, the system follows one central principle:

> **Every component minds its own business.**

Core components are isolated and communicate through **JSON config files** and **generated files/directories** rather than direct calls between components.

Each component uses a config file as its universal input interface:

```text
Config + Input Files
        ↓
Independent Component
        ↓
    Output Files
```

This avoids requiring other components to change when a script's internal API, function signature, or CLI implementation changes.

Core components may use small shared helper libraries for common functionality.

---

## Overall Pipeline

<div class="redacted"><span class="redacted-tag">Detailed design removed</span>The end-to-end pipeline, its stages and the data passed between them are withheld while the project is in development.</div>

---

## Core Components

<div class="redacted"><span class="redacted-tag">Detailed design removed</span>Responsibilities, inputs and outputs of each core component are withheld while the project is in development.</div>

---

## Generation Method

<div class="redacted"><span class="redacted-tag">Detailed design removed</span>How traffic data are generated and turned into the final dataset is withheld while the project is in development.</div>

---

## Component Interface

Every core component receives a JSON config containing standardized path fields:

```json
{
  "input_dir": {},
  "output_dir": ""
}
```

Additional fields are defined independently by each component.

Cross-component compatibility is determined by the **data format written to the output directory**, not by shared Python APIs.

<div class="redacted"><span class="redacted-tag">Detailed design removed</span>The specifications of the individual data interfaces are withheld while the project is in development.</div>
