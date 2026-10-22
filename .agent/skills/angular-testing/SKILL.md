---
name: angular-testing
description: "Write, fix, extend, or review Jasmine and Karma tests for the Angular client, including services, components, Miracle UI contracts, pipes, directives, guards, routing, interceptors, forms, signals, observables, timers, generated NSwag client wrappers, multipart clients, and browser APIs."
---

# Test the Angular client

Use this skill for work involving `src/client/**/*.spec.ts`, Angular test coverage, failing client tests, or test-quality review. The client uses Angular 20.3, Jasmine 5, Karma, and zone.js.

Read this file fully, then only the references relevant to the unit under test.

| Test subject                                                  | Reference                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| Service, generated-client wrapper, HTTP, state                | [services.md](references/services.md)                         |
| Component or parent-child interaction                         | [components.md](references/components.md)                     |
| Miracle UI grid, modal, select, typeahead, form, notification | [miracle-ui-contracts.md](references/miracle-ui-contracts.md) |
| Pipe or directive                                             | [pipes-directives.md](references/pipes-directives.md)         |
| Guard, resolver, route, or navigation                         | [routing-guards.md](references/routing-guards.md)             |
| HTTP interceptor                                              | [interceptors.md](references/interceptors.md)                 |
| Reactive form, validator, dynamic form, or CVA                | [forms.md](references/forms.md)                               |
| Timer, polling, observable, promise, signal, or effect        | [async.md](references/async.md)                               |
| Test commands, CI execution, and coverage                     | [ci-coverage.md](references/ci-coverage.md)                   |
| Before completing test work                                   | [review-checklist.md](references/review-checklist.md)         |

Consult [repository examples](examples/README.md) for established patterns and documented migration cautions. Examples are starting points, not exemptions from this skill.

## Project test boundary

- Unit tests are the default: exercise one DMS-owned unit and fake external boundaries.
- Integration-style tests may compose several DMS units, the Angular router, the HTTP pipeline, or real Miracle UI public contracts.
- End-to-end tests are outside this skill. No client E2E runner is currently configured.
- Generated code under `src/client/src/app/services/http/clients/api-proxies-angular.ts` is inspected as a contract but is never edited or directly coverage-targeted.
- Handwritten services around generated clients, extended clients, model hydration, request mapping, brand or partner scope, interceptors, and multipart/blob behavior are DMS-owned and must be tested.

## Core principles

1. Test behavior through public methods, rendered DOM, outputs, form values, navigation results, HTTP requests, and dependency boundaries.
2. Fake network, storage, browser APIs, time, generated clients, and unrelated feature services. Keep simple DMS logic real.
3. Use Arrange-Act-Assert and one behavior per test. Several precise expectations may describe one behavior.
4. Name tests as behavior specifications. Prefer `it("returns an empty result when...")` over `it("should work")`.
5. Cover applicable success, empty, error, invalid, boundary, cancellation, and cleanup states.
6. Make tests deterministic. Control time, dates, locale, random values, browser APIs, and asynchronous completion.
7. Use typed fixtures and transport contracts. Do not add `as any` merely to make incomplete mock data compile.

## Standard setup

Standalone components belong in `imports`, not `declarations`. Use `TestBed` when Angular injection, templates, routing, or HTTP are part of the test. Instantiate pure services, models, pipes, validators, and utilities directly.

Create dependency spies with `jasmine.createSpyObj<T>()`. For dependencies exposing signals, prefer a small fake containing real writable signals so reactivity behaves normally.

Use `fixture.componentRef.setInput()` for component inputs, including signal inputs. Set required inputs before the first change-detection pass.

## DMS-specific priorities

When scope is not otherwise specified, prioritize:

1. Pure domain and transformation logic in models, services, utilities, and pipes.
2. Guards and interceptors because they protect access and affect the entire application.
3. Handwritten wrappers around generated clients, especially request mapping, hydration, brand/partner scope, and error propagation.
4. Multipart, blob, media, storage, and browser API boundaries.
5. Validators, metadata-driven forms, and custom controls.
6. Presentational components.
7. Container components and critical multi-component workflows.

## Workflow

1. Read the unit, its public contract, dependencies, call sites, and nearby tests.
2. Identify the meaningful states and failure modes. Include DMS-specific scope, loading, and mapping behavior where applicable.
3. Read the relevant references and one approved example.
4. Write behavior tests. Do not retain a generated `should create` test as the only assertion.
5. Run the narrowest supported command. Note that Karma's `--include` selects entry points but this workspace can still compile other specs through `tsconfig.spec.json`; unrelated compile errors may therefore block a focused run.
6. If the production implementation is defective, fix it only when the task includes implementation work. Never distort the test to preserve incorrect behavior.
7. Complete the review checklist and report the exact command and result.

## Anti-patterns

- Recomputing expected values with the same algorithm as production code.
- Asserting only that a spy was called without checking arguments or visible outcome.
- Mocking the unit's own helpers or simple DMS-owned collaborators.
- Calling private component members or reaching into private signal state.
- Directly invoking an output and then asserting that the same output emitted.
- Replacing the entire component template when template wiring is the behavior under test.
- Testing Miracle UI implementation details, internal CSS, or undocumented DOM.
- Broad truthy assertions when an exact value is known.
- Real network, real timer waits, current-date dependence, or shared mutable fixtures.
- `fit`, `fdescribe`, `xit`, `xdescribe`, commented-out suites, or commented-out expectations.
- Treating a caught failure that returns `undefined` as a valid empty result.

## DOM and accessibility

Prefer selectors in this order:

1. Accessible text, role, label, or heading.
2. A stable DMS-owned `data-testid` attribute.
3. A semantic application CSS class that is part of the component contract.

Do not select through Miracle UI's undocumented internal DOM. Test keyboard, focus, disabled state, labels, and error communication when they are part of the DMS component's behavior.
