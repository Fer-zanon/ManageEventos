# Angular test review checklist

## Correctness

- [ ] The exact reported command was run, and its result is stated without hiding unrelated compilation blockers.
- [ ] No `fit`, `fdescribe`, `xit`, `xdescribe`, commented-out suites, or commented-out expectations were introduced or retained in changed coverage.
- [ ] Tests use no real HTTP, real timer waits, current date, randomness, navigation, or test-order dependence.
- [ ] `HttpTestingController.verify()` and clock/resource cleanup are present where required.
- [ ] Production code was not distorted solely to make a test pass.

## Value

- [ ] Each test fails when its described behavior breaks.
- [ ] Expected values are explicit rather than recomputed with production logic.
- [ ] Assertions are precise and include boundary arguments where collaborator calls are the contract.
- [ ] Applicable success, empty, error, invalid, boundary, cancellation, and cleanup cases are covered.
- [ ] Loading, empty, and caught-error states remain distinct.

## DMS boundaries

- [ ] Generated NSwag code is not edited or directly coverage-targeted.
- [ ] Handwritten wrappers verify operation, request mapping, model hydration, and error propagation.
- [ ] Brand and partner scope is covered where applicable.
- [ ] Multipart/blob tests verify part names, payloads, response handling, and cleanup.
- [ ] Awaiter consumers do not interpret `undefined` failures as successful empty results.
- [ ] Guards and interceptors cover every meaningful branch and exact redirect/error outcome.

## Components and forms

- [ ] Tests use public methods, DOM, outputs, and form contracts rather than private members.
- [ ] Real Miracle UI usage is limited to DMS integration behavior; no undocumented internal DOM is queried.
- [ ] Stubs preserve the public inputs and outputs under test.
- [ ] User interactions use real DOM events where practical.
- [ ] Form tests cover payload shape, failure retention, and double-submit prevention where applicable.
- [ ] Accessibility behavior is covered when it belongs to the DMS component contract.

## Reporting

Summarize covered behavior, intentional exclusions, production defects or testability problems found, and the exact validation result.
