# Implementation patterns

Adapt these patterns to exact generated signatures and established neighboring code.

## Entity model

Initialize required properties, hydrate through a named factory, and explicitly hydrate nested values.

```typescript
export class Entity extends ModelBase implements EntityView {
  name: string;
  children?: Child[];

  constructor() {
    super();
    this.name = "";
    this.children = [];
  }

  static fromInterface(view: EntityView): Entity {
    const model = new Entity();
    model.mapFromInterface(view);
    model.children = Child.fromInterfaceArray(view.children ?? []);
    return model;
  }

  static fromInterfaceArray(views: EntityView[]): Entity[] {
    return views.map(view => this.fromInterface(view));
  }
}
```

Use explicit mapping or a fresh `toParameters`/request mapper for dates, enums, nested aggregates, and application-only references. Never send UI-only files, option items, labels, computed properties, or circular references by accident.

## Paginated DTO model

```typescript
export class EntityDtoModel extends ModelBase {
  pageInfo: PaginationInfo;
  results: Entity[];

  constructor(pageInfo: PaginationInfo, results: Entity[]) {
    super();
    this.pageInfo = pageInfo;
    this.results = results;
  }
}
```

Do not discard pagination metadata or expose `EntityView[]` when the application expects models.

## Entity HTTP service

```typescript
@Injectable({
  providedIn: "root"
})
export class EntityService {
  private readonly client = inject(EntityClient);

  async getById(id: number): Promise<Entity> {
    const response = await lastValueFrom(this.client.entityGetById(id));
    return Entity.fromInterface(response);
  }

  async search(parameters: SearchEntityParameters): Promise<EntityDtoModel> {
    const response = await this.searchWithParameters(parameters);
    return this.createModelFromDto(response);
  }

  async save(entity: Entity): Promise<Entity> {
    const response = await lastValueFrom(this.client.entitySave(entity.toParameters()));
    return Entity.fromInterface(response);
  }

  async activateBulk(entityIds: number[]): Promise<void> {
    return await lastValueFrom(this.client.entitySetAsActiveBulk(entityIds));
  }

  private async searchWithParameters(
    parameters: SearchEntityParameters
  ): Promise<EntityViewPaginatedResultDto> {
    return await lastValueFrom(this.client.entitySearch(parameters));
  }

  private createModelFromDto(response: EntityViewPaginatedResultDto): EntityDtoModel {
    return new EntityDtoModel(response.pageInfo, Entity.fromInterfaceArray(response.results ?? []));
  }
}
```

Use a private client-call method when it separates transport invocation from mapping or is consistent with the neighboring service. Direct `lastValueFrom` in a short public method is also valid in this repository.

## Brand and partner scope

Extend `DmsBrandAwareService` only when the operation is brand scoped. Apply `withDmsBrand` before the generated call and do not mutate an already-emitted caller object unless the existing helper contract explicitly does so.

Partner methods such as `getFromPartner`, `searchFromPartner`, `saveFromPartner`, and `deleteFromPartner` are separate operations. Do not alias them to unscoped endpoints or hide their authorization semantics.

## Blob and multipart transport

First verify whether the generated client already supports the operation. If its response conversion is wrong for binary content, or a raw `FormData` boundary is required, use the established extended-client and blob-content mixin patterns.

- Keep custom transport code under `services/http/clients/`.
- Extend the generated concrete client; do not copy the complete generated class.
- Register the extended client through Angular DI.
- Keep `FormData` construction in the transport-facing service or extended client.
- Append JSON and files using exact server field names.
- Do not manually set a multipart `Content-Type`; the browser supplies the boundary.
- Convert downloaded blobs to text or domain values in the service only when required by the endpoint contract.

## Existing repository examples

- Simple CRUD and pagination: `services/http/collection/collection.service.ts`
- Brand/partner scope and special actions: `services/http/user/user.service.ts`
- Custom blob behavior: `services/http/clients/user-extended.client.ts`
- Multipart and JSON responses: `services/http/sku-list/sku-list.service.ts`
- Nested aggregate hydration: `models/classes/collection/Collection.model.ts`
- Paginated wrapper: `models/classes/dtos/CollectionDtoModel.ts`
