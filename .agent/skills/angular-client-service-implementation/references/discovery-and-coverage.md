# Discovery and method coverage

## Start from generated contracts

Find the entity's `I<Entity>Client` and `<Entity>Client` in `services/http/clients/api-proxies-angular.ts`. Record exact signatures rather than inferring them from existing wrappers.

For each generated method, capture:

| Generated operation | Parameters               | Generated response             | Application result | Mapping or transport rule           | Status      |
| ------------------- | ------------------------ | ------------------------------ | ------------------ | ----------------------------------- | ----------- |
| `entityGetById`     | `id: number`             | `EntityView`                   | `Entity`           | `Entity.fromInterface`              | Implemented |
| `entitySearch`      | `SearchEntityParameters` | `EntityViewPaginatedResultDto` | `EntityDtoModel`   | Preserve page info; hydrate results | Implemented |

Allowed statuses are:

- `Implemented`: exposed through the handwritten entity service.
- `Direct-use`: deliberately owned by another named application boundary; identify the file and reason.
- `Excluded`: not part of the requested API surface; state the business or technical reason.
- `Blocked`: generated contract, provider, or business behavior is insufficient; do not invent an implementation.

Completeness means there are no unclassified methods and no unexplained exclusions.

## Classify operation shapes

- Single read: hydrate a generated view into one model.
- Collection read: hydrate every generated view into a model array.
- Paginated search: combine `pageInfo` with a hydrated typed result array.
- Save or update: map the model to a fresh request, call the client, and hydrate the response.
- State mutation: activate, deactivate, archive, restore, approve, reject, publish, or similar intent operation.
- Bulk mutation: preserve identifier order and generated payload shape; do not silently skip identifiers.
- Scoped variant: keep brand, partner, tenant, or role semantics distinct from the unscoped operation.
- File transport: inspect generated `FileParameter`, `Blob`, content disposition, multipart, or string response behavior.
- Special payload: parse JSON or text only when the endpoint contract requires it; validate the parsed shape with a type guard or typed adapter.

## Inspect local ownership

Before creating files, find:

1. The closest service with the same operation shapes.
2. Existing entity and nested model classes.
3. Existing `{Entity}DtoModel` and search/filter models.
4. `DmsBrandAwareService` usage when search parameters are brand scoped.
5. Extended generated clients and their application provider registrations.
6. Components and services currently calling the generated client directly.
7. Focused model/service specs and their client mocks.

Do not create a second model or service when one boundary already owns hydration or invocation. Extend the owner and migrate direct callers when that is in scope.

## Drift reconciliation

When completing an existing service, compare the generated interface against public service methods again after implementation. Treat newly generated operations as contract drift. Add wrappers and tests, or document an intentional status before declaring the service complete.
