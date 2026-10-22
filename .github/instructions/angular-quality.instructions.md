---
description: "Angular code quality standards and best practices"
applyTo: "**/*.ts"
---

# Angular Code Quality

Standards for code quality, type safety, documentation, and maintainability.

## Type Safety

### Explicit Return Types

Always specify return types for methods:

```typescript
// ✅ Good - explicit return types
async search(filters: FilterTextPaginatedParameters): Promise<RegionDtoModel> {
    return await this.searchWithParameters(filters);
}

protected toggle(): void {
    this.open.set(!this.open());
}

get isActive(): boolean {
    return this.user?.isActive ?? false;
}

private calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Avoid - implicit return types
async search(filters) {
    return await this.searchWithParameters(filters);
}

protected toggle() {
    this.open.set(!this.open());
}
```

### Strict Type Checking

Enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true
  }
}
```

### Null Safety

Use optional chaining and nullish coalescing:

```typescript
// ✅ Good - safe null handling
const userName = user?.profile?.name ?? "Anonymous";
const isActive = user?.isActive ?? false;
const itemCount = cart?.items?.length ?? 0;

// ❌ Avoid - unsafe null handling
const userName = user && user.profile && user.profile.name ? user.profile.name : "Anonymous";
```

### Type Guards

```typescript
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value && "email" in value;
}

function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error("Value is not a User");
  }
}

// Usage
if (isUser(data)) {
  console.log(data.email); // TypeScript knows data is User
}

assertUser(data);
console.log(data.email); // TypeScript knows data is User after assertion
```

## Documentation and Comments

### JSDoc for Public APIs

Use JSDoc comments for service methods with complex logic or public APIs:

````typescript
/**
 * Service responsible for evaluating conditional logic in dynamic forms.
 *
 * This service provides functionality to determine whether form fields should be displayed
 * based on conditional logic rules. It supports various comparison operators and can handle
 * complex data structures including arrays and nested objects.
 *
 * @example
 * ```typescript
 * const shouldShow = conditionalLogicService.shouldShow(field, form);
 * ```
 */
@Injectable({
  providedIn: "root"
})
export class ConditionalLogicService {
  /**
   * Determines whether a field should be shown based on its conditional logic.
   *
   * @param field - The dynamic field containing conditional logic configuration
   * @param form - The Angular form group containing the field values
   * @returns `true` if the field should be shown, `false` otherwise
   *
   * @example
   * ```typescript
   * const field: DynamicField = {
   *   conditional: {
   *     field: 'userType',
   *     operator: 'equals',
   *     value: 'admin',
   *     showWhenTrue: true
   *   }
   * };
   *
   * const shouldShow = this.shouldShow(field, form);
   * ```
   */
  shouldShow(field: DynamicField, form: FormGroup): boolean {
    if (!field.conditional) return true;

    const isConditionMet = this.evaluateCondition(field.conditional, form);
    const showWhenTrue = this.resolveShowWhenTrue(field.conditional);

    return showWhenTrue ? isConditionMet : !isConditionMet;
  }
}
````

### Inline Comments

Add inline comments for complex business logic, but avoid obvious comments:

```typescript
// ✅ Good - explains non-obvious logic
// Update every second for the first minute, then every minute for the first hour
if (seconds < 60) {
  updateInterval = 1000;
} else if (seconds < 3600) {
  updateInterval = 60000;
}

// Calculate compound interest: A = P(1 + r/n)^(nt)
const amount = principal * Math.pow(1 + rate / frequency, frequency * years);

// ❌ Avoid - obvious from code
// Set the user
this.user = user;

// Loop through items
for (const item of items) {
  // Process item
  this.process(item);
}
```

### TODO Comments

Use TODO comments with context:

```typescript
// ✅ Good - includes context and assignee
// TODO(username): Implement pagination after API endpoint is ready

// TODO: Add error handling once error service is created
// Related: JIRA-123

// ❌ Avoid - vague and no context
// TODO: fix this
// TODO: improve performance
```

## Code Organization

### Import Organization

Group and order imports:

1. Angular core imports
2. Third-party libraries
3. Application imports (constants, models, services, pipes)

```typescript
// 1. Angular core
import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Router } from "@angular/router";

// 2. Third-party
import { ButtonComponent, ModalService } from "ngx-paradigm-web-ui";

// 3. Constants
import { REFRESH_INTERVAL_MINUTES } from "app/constants/timer/timer.component.const";

// 4. Models
import { Region } from "models/classes/region/RegionModel";
import { IUserSession } from "models/interfaces/IUserSession";

// 5. Services
import { AuthService } from "services/auth/auth.service";
import { UserService } from "services/user/user.service";

// 6. Pipes
import { TimeAgoPipe } from "pipes/time-ago.pipe";
```

### File Length

- Components: Aim for < 400 lines. Split into smaller components if larger.
- Services: Aim for < 300 lines. Split into multiple services if needed.
- Models: Aim for < 200 lines. Use composition for complex models.

### Method Length

- Keep methods under 50 lines
- Extract complex logic into private helper methods
- Use descriptive method names that explain intent

```typescript
// ✅ Good - short, focused methods
protected async loadData(): Promise<void> {
    this.isLoading.set(true);

    try {
        const data = await this.fetchData();
        this.processData(data);
        this.updateUI();
    } catch (error) {
        this.handleError(error);
    } finally {
        this.isLoading.set(false);
    }
}

private async fetchData(): Promise<Data[]> {
    return await this.dataService.getData(this.filters());
}

private processData(data: Data[]): void {
    const processed = data.map(item => this.transformItem(item));
    this.data.set(processed);
}

// ❌ Avoid - long, complex method
protected async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
        const data = await this.dataService.getData(this.filters());
        const processed = data.map(item => {
            // 30+ lines of transformation logic
            // ...
        });
        this.data.set(processed);
        // More logic...
    } catch (error) {
        // Error handling...
    }
}
```

## Error Handling

### Component Error Handling

```typescript
export class DataComponent {
  protected readonly error: WritableSignal<string | null> = signal(null);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);

  protected async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const data = await this.dataService.getData();
      this.data.set(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      this.error.set(message);
      console.error("Failed to load data:", err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

### Service Error Handling

```typescript
@Injectable({
  providedIn: "root"
})
export class DataService {
  private readonly client = inject(DataClient);

  async getData(): Promise<Data[]> {
    try {
      const response = await lastValueFrom(this.client.getData());
      return Data.fromInterfaceArray(response);
    } catch (error) {
      console.error("Service error:", error);
      throw new Error("Failed to fetch data");
    }
  }
}
```

## Performance Considerations

### Change Detection

Use `OnPush` strategy with signals for better performance:

```typescript
@Component({
  selector: "rdx-dms-example",
  changeDetection: ChangeDetectionStrategy.OnPush
  // ...
})
export class ExampleComponent {
  // Signals automatically trigger change detection
  readonly data: WritableSignal<Data[]> = signal([]);
}
```

### TrackBy Functions

Always use trackBy in ngFor loops:

```typescript
export class ListComponent {
  protected readonly items: WritableSignal<Item[]> = signal([]);

  protected trackById(index: number, item: Item): number {
    return item.id;
  }
}
```

```html
<div *ngFor="let item of items(); trackBy: trackById">{{ item.name }}</div>
```

### Unsubscribe Pattern

While signals handle this automatically, for RxJS subscriptions:

```typescript
export class SubscriptionComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService.data$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      // Handle data
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```
