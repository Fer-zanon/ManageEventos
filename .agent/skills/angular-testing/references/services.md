# Testing services and client boundaries

Test services through public methods and observable state. The setup depends on the service boundary.

## Pure and stateful services

Instantiate a dependency-free service directly. Cover boundaries, empty collections, duplicates, invalid values, transitions, derived signals, and cleanup. If the service uses `inject()`, create it through `TestBed`.

For signals and computed state, perform a public action and read the public signal. For observable state, collect the meaningful emission sequence rather than checking only the last value. Dispose services that own timers, object URLs, subscriptions, or media resources.

## Services with dependencies

Use typed spies or small stateful fakes for feature-service and browser boundaries. Configure returns in the test that needs them. Assert the returned model or state first, then exact collaborator arguments when the dependency call is part of the contract.

For promise-returning DMS services, use `and.resolveTo()` and `and.rejectWith()`. Generated clients return observables; wrappers commonly convert them with `lastValueFrom`, so use `of()` and `throwError()`.

## Generated NSwag client wrappers

`api-proxies-angular.ts` is generated transport code. Do not edit it, write direct unit tests for its generated implementation, or count it toward handwritten coverage goals.

For a handwritten wrapper:

- inject a typed spy of the concrete generated client;
- verify operation selection and exact parameters;
- verify `fromInterface`, `fromInterfaceArray`, or DTO hydration;
- verify `toParameters` or equivalent request mapping sends no UI-only state;
- verify absent result arrays are handled according to the wrapper contract;
- verify generated errors reject rather than becoming success-shaped values;
- cover every handwritten method added or changed.

Do not require `HttpTestingController` for a wrapper whose HTTP behavior belongs to the generated client. Use HTTP testing for DMS-owned raw `HttpClient` code, interceptors, and extended clients.

## Brand and partner scope

Services extending brand- or partner-aware bases must verify:

- the current brand and partner are added to applicable searches;
- explicit caller parameters are preserved unless the documented contract replaces them;
- a changed active brand or partner is read for each new operation;
- missing scope follows the implementation's explicit behavior;
- unrelated operations are not accidentally scoped.

Use real scope helpers where practical and fake their storage/session boundary. Do not duplicate the production scoping algorithm in expected-value construction.

## Handwritten HTTP and extended clients

Use `provideHttpClient()` before `provideHttpClientTesting()` and call `HttpTestingController.verify()` in `afterEach`.

For each DMS-owned endpoint, cover the applicable contract:

- exact URL, method, query parameters, headers, credentials, and body;
- successful response parsing or mapping;
- server and network errors;
- cancellation or replacement when the client supports it.

For multipart requests, assert the required `FormData` part names, JSON serialization, file identity, and optional-part behavior. For blobs and downloads, assert response type, filename/header handling, object URL cleanup, and error-body normalization.

## Awaiter, loading, and notifications

`AwaiterService` catches failures, notifies, invokes an optional callback, and returns `undefined`. Tests around it or its consumers must distinguish failure from a valid empty result.

Cover the applicable mode:

- spinner calls are balanced in `finally`;
- non-spinner loading calls are balanced;
- grid skeleton calls are balanced;
- error notification receives the normalized message;
- the error callback receives the original error;
- forbidden responses navigate according to the current contract;
- overlapping operations do not produce incorrect visible loading state when concurrency is supported.

Consumers must stop or retain prior state deliberately after `undefined`; they must not render it as a successful empty load.

## Browser and storage services

Fake or spy on `localStorage`, `sessionStorage`, `window`, `document`, `navigator`, `FileReader`, object URLs, and media elements. Verify cleanup as well as output:

- storage keys and serialization;
- missing, malformed, and stale stored values;
- object URL creation and revocation;
- listener registration and removal;
- media preload success, failure, and disposal;
- download filename and cleanup.

Never perform real navigation, downloads, or network calls.
