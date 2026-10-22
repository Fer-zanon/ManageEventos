# Testing components

Components are tested through what users see and what the component communicates through outputs, form state, navigation, and service boundaries.

## Setup and inputs

Import standalone components through `TestBed`. Set every required input with `fixture.componentRef.setInput()` before the first `detectChanges()`.

For a presentational component, cover meaningful input variations, rendered values, disabled state, and user action to output. Subscribe to outputs and collect emitted values so duplicate emissions are detectable.

For a container component, cover applicable loading, success, empty, and error states. A caught service failure returning `undefined` is an error state, not an empty collection.

## User interaction

Prefer native interaction:

- call `click()` on buttons;
- set an input value and dispatch `input` and, when meaningful, `blur`;
- dispatch `change` for native selects;
- dispatch keyboard events for keyboard behavior;
- run change detection or wait for stability before reading the DOM.

Calling a public orchestration method directly is acceptable for service coordination that has no template contract. Do not call private handlers to bypass the template.

## Parent-child contracts

Use a small host component when testing input/output wiring, `model()` two-way binding, content projection, or a ControlValueAccessor.

Keep real simple DMS-owned children when their collaboration is the behavior. Replace an unrelated expensive child with a typed stub that preserves only the public inputs, outputs, and selector involved in the test.

## Shallow rendering

`overrideComponent` is appropriate when a heavy child or external control is unrelated to the behavior under test. Do not replace the template when validating:

- event binding;
- rendered grid or form configuration;
- validation feedback;
- modal actions;
- accessibility;
- parent-child wiring.

If a replacement is used, state the boundary through the test setup and preserve the public contract being exercised.

## Data-driven and async components

Use subjects or controllable promises to hold loading state and then release success, empty, or error results. Cover stale-response suppression, repeated inputs, teardown, and double-action prevention when the component performs searches, polling, or saves.

## Accessibility

Test DMS-owned accessibility behavior where relevant:

- semantic roles and labels;
- keyboard activation and escape/dismiss behavior;
- focus placement or restoration;
- disabled versus read-only behavior;
- error text associated through the public contract;
- meaningful empty and loading text.

Do not assert on CSS-only presentation unless the class or attribute conveys application behavior.
