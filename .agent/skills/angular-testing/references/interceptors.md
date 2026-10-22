# Testing HTTP interceptors

The client currently uses class-based interceptors registered through `HTTP_INTERCEPTORS` and `withInterceptorsFromDi()`. This is the current project architecture, not a migration target for test work.

Test interceptors through `HttpClient` and `HttpTestingController` so the real pipeline executes. Register `provideHttpClient(withInterceptorsFromDi())` before `provideHttpClientTesting()`, add the interceptor provider, and verify outstanding requests in `afterEach`.

## Credentials and antiforgery

Cover:

- safe Admin API requests include credentials but no antiforgery header;
- unsafe POST, PUT, PATCH, and DELETE requests include the current token;
- absent tokens do not produce an empty header;
- external origins receive neither credentials nor the token;
- 401 clears token and cached user state and marks the session logged out;
- 401 redirects to login unless already on an authentication route;
- the original error remains observable by the caller.

Control `window.location` carefully and restore any spy or history change.

## Error normalization

Cover:

- ordinary JSON error objects with `Message`, `message`, or `error`;
- JSON blob error bodies;
- plain-text and malformed-JSON blob bodies;
- empty blob bodies;
- `HttpErrorResponse` fallback messages;
- non-HTTP errors passing through;
- the normalized error retaining the contract needed by consumers.

Do not weaken types merely because normalized errors are object-shaped; test the actual public error contract.

## Composition

Maintain at least one integration test registering both interceptors in the same order as `ClientsModule`. Verify credentials are applied and an error is normalized without being swallowed.

Retries, if introduced, require explicit request counts, permitted status cases, controlled delay, and a final propagated error after exhaustion.
