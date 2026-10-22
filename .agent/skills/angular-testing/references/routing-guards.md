# Testing routing, guards, and resolvers

The application enables `withComponentInputBinding()`, so route parameters may be tested as component inputs when that is the route contract.

## Functional guards

Run guards that use `inject()` inside `TestBed.runInInjectionContext()`. Cover every branch:

- allowed access;
- each denied condition and exact `UrlTree`;
- missing user, brand, partner, permission, or route data;
- dependency failure when the dependency is asynchronous;
- state refresh side effects required before evaluation.

For guard factories, test meaningful condition combinations and both allow-on-match and exclude-on-match behavior. For `CanDeactivateFn`, cover `true`, `false`, promised results, and the fallback for a component without a handler when supported by the type.

Do not treat guards as the only security boundary, but test them rigorously because failures expose navigation.

## Resolvers

Build snapshots with explicit params and route data. Verify the service arguments, resolved value, missing identifier behavior, and error/redirect contract.

## Routed components

Choose the smallest useful boundary:

- `setInput()` for component-input binding;
- a controlled `ActivatedRoute` fake for isolated observable route state;
- `RouterTestingHarness` for route configuration, guard ordering, resolver composition, redirects, and nested navigation.

Use a `BehaviorSubject` when a component must react to parameters changing without recreation.

## Route configuration smoke tests

Add focused integration tests for high-value route groups to verify:

- the expected guard chain is wired;
- nested redirects resolve correctly;
- access denial reaches the exact destination;
- `CanDeactivate` prevents navigation;
- route-bound inputs receive the expected values.

Do not duplicate the entire route table in expectations; select access-critical and workflow-critical paths.

## Navigation

For imperative navigation, use a real router with a controlled route table and spy on the public navigation method only when the exact command is the contract. For `routerLink`, assert the rendered public `href`.
