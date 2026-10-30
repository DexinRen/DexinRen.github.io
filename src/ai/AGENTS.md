# AGENTS.md

## Context Refresh

Long sessions push early instructions out of the context window. To keep these rules active:

- End every response with this exact line:

  ```text
  I should read AGENTS.md next and treat it as my first priority.
  ```

- When your previous response ended with that line, re-read AGENTS.md before acting on the next request.
- If the conversation was summarized, compacted, or truncated, re-read AGENTS.md and the relevant `doc/design/` and `src/protocol/` files before continuing.

---

## Project Design Principle

- Every module minds its own business: one clear responsibility per module and per function.
- Keep coupling low. Modules communicate through explicit inputs and outputs, not shared mutable state.
- Shared logic belongs in helper modules; reuse them instead of duplicating code.
- Avoid circular dependencies and deep call chains between modules.
- Write the program in a functional style (see **Functional Style** below).
- Implement only the designed pipeline. Do not add redundant logic, speculative functionality, or unnecessary abstraction.

---

## Design Authority

Design authority is:

```text
doc/design/*.md
        ↓
src/protocol/*.h
        ↓
implementation
```

### High-Level Design

`doc/design/` contains the high-level project architecture.

AI agents must read relevant design files before modifying affected code.

Files under `doc/design/` are immutable to AI agents.

AI agents must never edit, rewrite, rename, move, or delete these files.

Only the user may modify `doc/design/`.

If implementation conflicts with `doc/design/`, stop and report the conflict. The user must update the design manually before implementation continues.

---

## Protocol Files

Important modules must have matching `.h` files under:

```text
src/protocol/
```

Protocols define:

- purpose;
- responsibilities;
- input contract;
- output contract;
- important functions;
- return structures;
- workflow.

Protocols contain design, not implementation.

Implementation must follow its protocol.

Do not edit an existing protocol without explicit user permission.

If a requested implementation conflicts with its protocol:

1. Stop before editing implementation.
2. Explain the conflict.
3. Identify the required protocol change.
4. Request explicit permission.
5. Update the protocol after approval.
6. Update implementation to match it.

Do not silently redesign a module through implementation.

---

## Protocol Design Checks

Before implementing or editing a protocol-controlled module, check:

- consistency with `doc/design/`;
- single responsibility;
- low coupling between modules;
- low function complexity;
- pure functions where possible, with side effects isolated;
- direct workflow;
- reuse of existing helpers;
- absence of redundant logic;
- absence of unnecessary abstraction.

If the protocol conflicts with the high-level design, do not implement it.

---

## Protocol Format

```text
FILE: example.h

PURPOSE:
    Short description.

INPUT CONTRACT:
    Required inputs (arguments, config fields, or files).

OUTPUT CONTRACT:
    Produced output.

FUNCTIONS:

1. function_name(param_a: type, param_b: type) -> dict

   Purpose:
       Short direct description.

   Returns:
       {
           "value1": returned value1,
           "value2": returned value2
       }

WORKFLOW:

Function used:
- a: first responsibility.
- b: second responsibility.
- c: final responsibility.

Workflow:

input -> func a -> func b -> func c -> return
```

The protocol should make the program understandable without reading its implementation.

---

## Functional Style

Prefer functional programming:

- Write small, pure functions: the same inputs always give the same outputs, with no hidden side effects.
- Do not mutate function arguments or global state. Return new values instead.
- Pass everything a function needs as explicit parameters; avoid hidden globals and implicit context.
- Build behaviour by composing small functions into a clear pipeline.
- Keep side effects (file I/O, network, logging, randomness, device state) at the edges of the program, separate from the core computation.
- Make randomness explicit and reproducible: pass seeds or generators as parameters.
- Prefer immutable data (tuples, frozen dataclasses, new dicts) for values passed between functions.
- Use classes only when a framework requires them (for example, a model module) or for plain data containers. Do not use classes to hold mutable state that functions could pass explicitly.
- Favour clarity over cleverness: no deeply nested lambdas, long comprehension chains, or point-free tricks in core logic.

---

## Python Style

- Follow the Google Python Style Guide.
- Avoid deep nesting.
- Prefer small helper functions.
- Keep data flow explicit.
- Prefer clarity over compactness.
- Use clear, descriptive, and understandable variable and function names.
- Avoid magic numbers; use named constants or config values.
- Add comments where they improve understanding of intent, structure, or non-obvious logic.
- Avoid clever one-liners in core logic.
- Avoid unnecessary dependencies.

---

## Function Documentation

Every non-trivial function must include:

- Purpose;
- Parameters;
- Return Dict;
- Usage;
- TODO.

```python
"""
Purpose:
    Short description.
Parameters:
    name (type): constraints and usage.
Return Dict:
    value (type | None): returned value.
Usage:
    Who calls this function and why.
TODO:
    1) First step.
    2) Second step.
    3) Return result.
"""
```

Documentation must remain consistent with the implementation.

---

## Function Structure

Use numbered structural comments inside non-trivial functions.

```python
# 1. Input validation

# 2. Data preparation

# 3. Removing outliers

# 4. Return result
```

Comments should describe structural steps, not obvious syntax.

The code structure should remain easy to compare against the protocol workflow.

---

## Return Policy

To prevent changes in function outputs from repeatedly requiring function-signature and caller refactoring, non-trivial project functions must return a dictionary.

Each returned value must be stored under a specific, descriptive output name.

```python
return {
    "processed_data": processed_data,
    "metadata": metadata,
}
```

Callers must access returned values by their explicit keys rather than positional ordering.

When a function gains or removes an output, update the returned dictionary and affected consumers without redesigning the function interface unnecessarily.

---

## Error Handling

Use **fail-fast** behavior.

- Validate required inputs explicitly.
- When invalid data, violated assumptions, missing fields, incompatible formats, or broken contracts are detected, terminate the affected execution clearly and immediately.
- Do not continue execution after detecting a condition that makes the result unreliable.
- Do not hide errors with broad `try` / `except`.
- Do not silently substitute defaults.
- Do not guess missing data.
- Do not use fallback behavior merely to keep the program running.
- Expose bugs and invalid states loudly and clearly so they can be fixed rather than concealed.

---

## Code Generation Rules

Before modifying a protocol-controlled module:

1. Read relevant `doc/design/`.
2. Read its `.h` protocol.
3. Read the existing implementation.
4. Inspect relevant helpers.
5. Confirm the requested change fits the approved design.

When modifying code:

- follow the high-level design;
- follow the protocol;
- keep functions pure and side effects at the edges;
- keep coupling between modules low;
- do not duplicate existing logic;
- reuse appropriate helpers;
- keep documentation and structural comments synchronized with code.

If the requested behavior does not fit the approved design, stop and surface the conflict instead of improvising a new design.

---

## Code Review Priorities

Review in this order:

1. Conflict with `doc/design/`.
2. Protocol / implementation mismatch.
3. Prompt / approved-design conflict.
4. Unnecessary coupling or hidden shared state.
5. Redundant logic.
6. Correctness bugs.
7. Unsafe assumptions.
8. Silent failures.
9. Ambiguous data flow or hidden side effects.
10. Missing validation.
11. Comment / implementation mismatch.
12. Style issues.

---

## Definition of Done

A protocol-controlled change is done when:

- relevant high-level design was reviewed;
- the protocol was reviewed;
- implementation follows both;
- required protocol changes were explicitly approved;
- no unresolved design conflict remains;
- no unnecessary coupling, hidden state, or redundant logic was introduced;
- function documentation and structural comments match the implementation;
- required validation exists.
