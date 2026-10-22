---
description: "Angular service patterns and data layer conventions"
applyTo: "**/*.service.ts"
---

# Angular Services and Data Layer

Service layer patterns, HTTP communication, async operations, and data transformation.

## Service Layer Pattern

Follow the three-layer pattern for HTTP services:

1. **Public method** - Entry point, returns domain models
2. **Client call method** - Private method that calls the API proxy client
3. **Model transformation** - Private method that converts DTOs to domain models

```typescript
@Injectable({
  providedIn: "root"
})
export class RegionService {
  private readonly client = inject(RegionClient);

  // Layer 1: Public method - returns domain model
  async search(filters: FilterTextPaginatedParameters): Promise<RegionDtoModel> {
    const regionSearchResponse = await this.searchWithParameters(filters);
    return this.createModelFromDto(regionSearchResponse);
  }

  // Layer 2: Client call - interacts with API proxy
  private async searchWithParameters(
    filters: FilterTextPaginatedParameters
  ): Promise<RegionViewPaginatedResultDto> {
    return await lastValueFrom(this.client.regionSearch(filters));
  }

  // Layer 3: Model transformation - converts DTO to domain model
  private createModelFromDto(response: RegionViewPaginatedResultDto): RegionDtoModel {
    return new RegionDtoModel(response.pageInfo, Region.fromInterfaceArray(response.results ?? []));
  }
}
```

## Async Patterns

### Service Methods

Use `async/await` with `Promise<T>` return types for asynchronous operations.

Convert RxJS observables to promises using `lastValueFrom()`. Services must not expose observables.

```typescript
// ✅ Good - async/await pattern
async search(filters: FilterTextPaginatedParameters): Promise<RegionDtoModel> {
    const regionSearchResponse = await this.searchWithParameters(filters);
    return this.createModelFromDto(regionSearchResponse);
}

private async searchWithParameters(
    filters: FilterTextPaginatedParameters
): Promise<RegionViewPaginatedResultDto> {
    return await lastValueFrom(this.client.regionSearch(filters));
}

// ❌ Avoid - returning observables directly
search(filters: FilterTextPaginatedParameters): Observable<RegionDtoModel> {
    return this.client.regionSearch(filters).pipe(
        map(response => this.createModelFromDto(response))
    );
}
```

## Complete Service Example

```typescript
@Injectable({
  providedIn: "root"
})
export class ProductInfoService {
  private readonly client = inject(ProductInfoClient);

  async getById(productInfoId: number): Promise<ProductInfo> {
    const productInfoView = await lastValueFrom(this.client.productInfoGetById(productInfoId));
    return ProductInfo.fromInterface(productInfoView);
  }

  async search(filters: SearchParameters): Promise<ProductInfoDtoModel> {
    const response = await this.searchWithParameters(filters);
    return this.createModelFromDto(response);
  }

  async create(data: CreateProductInfoRequest): Promise<ProductInfo> {
    const productInfoView = await lastValueFrom(this.client.productInfoCreate(data));
    return ProductInfo.fromInterface(productInfoView);
  }

  async update(id: number, data: UpdateProductInfoRequest): Promise<ProductInfo> {
    const productInfoView = await lastValueFrom(this.client.productInfoUpdate(id, data));
    return ProductInfo.fromInterface(productInfoView);
  }

  async archive(productInfoId: number): Promise<void> {
    return await lastValueFrom(this.client.productInfoArchive(productInfoId));
  }

  async unarchive(productInfoId: number): Promise<void> {
    return await lastValueFrom(this.client.productInfoUnarchive(productInfoId));
  }

  async getPreview(
    datasourceBuilderParameters: DatasourceBuilderParameters
  ): Promise<DatasourceModel> {
    return await lastValueFrom(this.client.productInfoGetPreview(datasourceBuilderParameters));
  }

  private async searchWithParameters(
    filters: SearchParameters
  ): Promise<ProductInfoViewPaginatedResultDto> {
    return await lastValueFrom(this.client.productInfoSearch(filters));
  }

  private createModelFromDto(response: ProductInfoViewPaginatedResultDto): ProductInfoDtoModel {
    return new ProductInfoDtoModel(
      response.pageInfo,
      ProductInfo.fromInterfaceArray(response.results ?? [])
    );
  }
}
```

## State Management Services

### Signal-Based State Services

```typescript
@Injectable({
  providedIn: "root"
})
export class RefreshService {
  private _refreshTrigger: WritableSignal<RefreshApplicationMessage | null>;
  private _isRefreshing: WritableSignal<boolean>;

  constructor() {
    this._refreshTrigger = signal(null);
    this._isRefreshing = signal(false);
    this.startAutoRefresh();
  }

  get refreshTrigger(): Signal<RefreshApplicationMessage | null> {
    return this._refreshTrigger.asReadonly();
  }

  get isRefreshing(): Signal<boolean> {
    return this._isRefreshing.asReadonly();
  }

  triggerRefresh(options: RefreshApplicationMessage): void {
    this._isRefreshing.set(true);
    this._refreshTrigger.set(options);

    setTimeout(() => {
      this._isRefreshing.set(false);
      this._refreshTrigger.set(null);
    }, 1000);
  }

  private startAutoRefresh(): void {
    const intervalMs = REFRESH_INTERVAL_MINUTES * ONE_MINUTE_MS;
    setInterval(() => {
      this.triggerRefresh({ showLoader: true, deviceGridRefresh: true });
    }, intervalMs);
  }
}
```

## Authentication Services

```typescript
@Injectable({
  providedIn: "root"
})
export class AuthService {
  private readonly userService = inject(BasicUserService);

  isSystemAdmin(): boolean {
    const user = this.userService.getUser();
    return user?.isSystemAdmin ?? false;
  }

  isRetailer(): boolean {
    const user = this.userService.getUser();
    return user?.isRetailer ?? false;
  }

  isOem(): boolean {
    const user = this.userService.getUser();
    return user?.isOem ?? false;
  }

  hasPermission(permission: string): boolean {
    const user = this.userService.getUser();
    return user?.permissions?.includes(permission) ?? false;
  }
}
```

## Error Handling

```typescript
@Injectable({
  providedIn: "root"
})
export class DataService {
  private readonly client = inject(DataClient);
  private readonly notificationService = inject(NotificationService);

  async getData(id: number): Promise<Data | null> {
    try {
      const response = await lastValueFrom(this.client.getData(id));
      return Data.fromInterface(response);
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  private handleError(error: any): void {
    const message = error?.message ?? "An unexpected error occurred";
    this.notificationService.error(message);
    console.error("Service error:", error);
  }
}
```

## Caching Services

```typescript
@Injectable({
  providedIn: "root"
})
export class CacheService<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutes

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheDuration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
```
