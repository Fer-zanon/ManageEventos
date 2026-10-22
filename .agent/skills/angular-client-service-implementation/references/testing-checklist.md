# Testing and completion checklist

## Model tests

- Required constructor defaults are stable.
- `fromInterface` maps every application-used scalar field.
- Nested objects and arrays are instances of their handwritten model classes.
- Optional arrays and paginated results handle `undefined` without throwing.
- Request mapping excludes UI-only state and does not mutate the model.
- Date, enum, identifier, and null policies match the generated contract.

## Service tests

Use `TestBed` with a typed Jasmine spy for the concrete generated or extended client.

- The concrete client is injectable through the same token used at runtime.
- Each generated operation classified as implemented invokes the exact client method once.
- Parameters and request bodies match the generated signature exactly.
- Single responses are hydrated into the expected model class.
- Searches preserve `pageInfo`, hydrate all results, and map missing results to `[]`.
- Void and state-changing operations await completion and propagate failures.
- Brand-aware calls apply the current brand exactly once.
- Partner-scoped operations call partner endpoints, not unscoped variants.
- Bulk operations preserve the requested identifier payload.
- Blob, JSON, text, download, upload, and multipart behavior is tested where present.
- Invalid special payloads fail explicitly rather than returning partial data.

Avoid `as any` in new tests. Prefer generated interface fixtures, `Partial<T>` builders with a checked final adapter, or narrowly typed test factories.

## Validation order

Run the narrowest available checks first from `src/client`:

1. Focused service/model specs with the repository-supported Angular test filter.
2. `npm run lint` or an equivalent lint invocation scoped to touched files.
3. `npm run build`.
4. `npm run build-prod` when the change affects providers, configuration, or production-only behavior.

Re-run the generated-method inventory after tests. Build success does not prove method completeness.

## Final report

Report:

- Generated client and operations covered.
- Models, request/filter types, DTO models, services, and extended clients changed.
- Direct-use or excluded methods with ownership and reasons.
- Tests and validation commands run, including failures unrelated to the change.
