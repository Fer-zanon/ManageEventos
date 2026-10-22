---
name: angular-client-service-implementation
description: "Implement or review complete Angular client-side services around generated NSwag API proxies, including method coverage, handwritten models, paginated DTO models, response hydration, request mapping, brand or partner scope, blob and multipart extensions, dependency injection, and focused tests. Use when adding a service under src/client/src/app/services/http, implementing methods exposed by api-proxies-angular.ts, completing missing service methods, or creating the models and DTOs required by a generated client."
---

# Implement Angular client services

Build the handwritten boundary between `api-proxies-angular.ts` and the Angular application. Generated clients and generated transport interfaces are replaceable contracts: inspect them, but never edit them.

Follow the repository Angular instructions for architecture, services, models, quality, and naming. For behavior-rich aggregates, immutable filters, domain validation, or request ownership, also use the `miracle-ui-strong-models` skill.

## Workflow

1. Identify the generated client interface and concrete client for the requested entity. Read every method signature, parameter type, response type, route behavior, and generated `@Injectable` metadata.
2. Inspect the nearest completed service, model, paginated DTO model, extended client, provider registration, and focused tests. Prefer an entity with the same endpoint shape over one with a similar name.
3. Build a method coverage inventory before editing. Follow [discovery-and-coverage.md](references/discovery-and-coverage.md). Every generated method must be represented as implemented, intentionally direct-use, or excluded with a concrete reason.
4. Define the handwritten types needed by the application: entity model, nested models, request/filter model when behavior or normalization is required, and paginated DTO model. Generated interfaces remain transport contracts.
5. Implement one handwritten service for the entity under `services/http/<entity>/`. It owns generated calls, `Observable` to `Promise` conversion, response hydration, request conversion, and pagination combination.
6. Handle special contracts explicitly: brand-aware parameters, partner-scoped variants, bulk actions, archive or workflow actions, text or JSON payloads, downloads, uploads, multipart requests, and custom extended clients.
7. Add focused model and service tests, then reconcile the implementation against the method inventory. Follow [testing-checklist.md](references/testing-checklist.md).
8. Run focused tests, lint for touched files when available, and the client build. Do not claim complete implementation while an inventory row is unresolved.

## Required boundaries

- Never edit `services/http/clients/api-proxies-angular.ts` or other generated output.
- Never inject a generated TypeScript interface. Inject a registered concrete client or a real `InjectionToken`.
- Services return `Promise<T>` and use `lastValueFrom`; do not expose generated `Observable` values.
- Components do not call generated clients directly when an entity service owns that API.
- Models do not inject Angular dependencies, call HTTP, navigate, or display messages.
- Map nested objects and arrays into their model classes. A shallow top-level assignment is not sufficient for aggregates.
- Preserve generated requiredness and optionality. Do not invent fields, identifiers, defaults, endpoint names, or permissions.
- Use fresh request objects or existing `toParameters` methods when application-only properties must not cross the wire.
- Keep transport errors compatible with the existing interceptor/error pipeline. Do not swallow failures or return false success values.

## Implementation rules

Use [implementation-patterns.md](references/implementation-patterns.md) for concrete service, model, DTO, brand-aware, and custom-client patterns.

- Name public methods by application intent while preserving the generated operation's behavior.
- Use explicit return types for every method.
- Keep injected dependencies `private readonly` and named after their class in camel case, except established local `client` naming in entity HTTP services.
- Convert single views with `Entity.fromInterface` and arrays with `Entity.fromInterfaceArray`.
- Return a typed `{Entity}DtoModel` for paginated entity searches and default absent result arrays with `?? []`.
- Return `void` only when the generated operation has no meaningful response body.
- Retain generated DTOs only when they are already the appropriate application boundary and no behavior or nested hydration is required.
- Add an extended client only when the generated transport cannot correctly represent blob, multipart, streaming, or response parsing behavior. Register it without modifying generated code.

## Completion contract

A service implementation is complete only when:

- Every generated method in scope has a resolved coverage status.
- Every model-returning operation hydrates the correct model, including nested aggregates.
- Every paginated operation preserves `pageInfo` and returns typed results.
- Every mutation sends a transport-safe request without UI-only state.
- Brand, partner, bulk, lifecycle, file, and special action methods are covered when present.
- Concrete client DI resolves at runtime.
- Focused success, mapping, parameter, empty-result, and special-transport tests pass.
- Client lint and build report no new errors.

When reporting completion, include the covered generated operations, created or changed handwritten types, validation commands, and any intentional exclusions.
