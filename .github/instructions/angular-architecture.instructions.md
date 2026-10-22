---
description: "Angular architectural patterns and code organization"
applyTo: "**/*.ts"
---

# Angular Architecture and Code Organization

Core architectural patterns, structural organization, and naming conventions for Angular TypeScript code.

## Class Structure and Member Order

### Components, Services, and Pipes

Organize class members in this specific order, with blank lines between groups:

1. **Public readonly signals and properties** (Signal, ModelSignal, WritableSignal, OutputEmitterRef, InputSignal)
   - **Input signals**: Always specify the TypeScript type on the property declaration. For required inputs, do NOT specify the type on `input.required()` to avoid redundancy.
2. **Public writable properties**
3. **Private backing fields for signals** (prefixed with `_` if exposed via getters)
4. **Private properties**
5. **Private readonly injected dependencies** (using `inject()`)
   - **Dependency declaration pattern**: Use `private readonly`, declare after other class properties.
   - **Injected dependencies naming convention**: The property name should always be the same as the imported service, but using camelCase. If the service is UserService, the property name have to be userService.
6. **Constructor** (if needed)
   - **Entities initialization order**: Inside the constructor, all plain properties and writable signals should be created first. Then, all computed signal, and finally, all declared effects that may exist.
7. **Lifecycle hooks** (ngOnInit, ngOnChanges, ngOnDestroy, etc.)
8. **Public getters/setters**
9. **Public methods**
10. **Protected methods** (template-accessible methods)
11. **Private methods**

### Example Structure

```typescript
export class ExampleComponent implements OnInit, OnDestroy {
  // 1. Public readonly signals and properties
  readonly capabilitiesIterator: Signal<Capability[]>;
  readonly isFormValid: Signal<boolean>;

  readonly capabilities: ModelSignal<Capability[]> = model.required();
  readonly themes: ModelSignal<Themes> = model.required();

  // Input signals - required: type on property declaration only
  readonly productInfoVersion: InputSignal<ProductInfoVersion> = input.required();
  // ❌ Wrong: readonly productInfoVersion = input.required<ProductInfoVersion>();
  // ❌ Wrong: readonly productInfoVersion: InputSignal<ProductInfoVersion> = input.required<ProductInfoVersion>();

  //Only define the property here, do not initialize it here.
  readonly open: WritableSignal<boolean>;
  readonly selectedItems: WritableSignal<string[]>;

  readonly capabilitiesChange: OutputEmitterRef<Capability[]> = output();

  // 2. Public writable properties
  title = "DMS 2.0";
  user?: UserSession;

  // 3. Private backing fields for signals (with _ prefix)
  private _refreshTrigger: WritableSignal<RefreshApplicationMessage | null>;
  private _isRefreshing: WritableSignal<boolean>;

  // 4. Private properties
  private timeout?: number;
  private intervalId?: ReturnType<typeof setInterval>;

  // 5. Private readonly injected dependencies
  // Property names match the imported service in camelCase
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService); // ✓ UserService → userService
  private readonly productInfoService = inject(ProductInfoService); // ✓ ProductInfoService → productInfoService

  // 6. Constructor
  constructor() {
    // First: Initialize plain properties and writable signals
    this.open = signal(false);
    this.selectedItems = signal([]);
    this._refreshTrigger = signal(null);
    this._isRefreshing = signal(false);

    // Second: Initialize computed signals
    this.capabilitiesIterator = computed(() =>
      this.capabilities() ? Object.values(this.capabilities()) : []
    );
    this.isFormValid = computed(() => this.selectedItems().length > 0 && this.open());

    // Third: Initialize effects
    effect(() => {
      if (this._refreshTrigger()) {
        this.resetTimer();
      }
    });
  }

  // 7. Lifecycle hooks
  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // 8. Public getters/setters
  get refreshTrigger(): Signal<RefreshApplicationMessage | null> {
    return this._refreshTrigger.asReadonly();
  }

  // 9. Public methods (no explicit 'public' keyword)
  triggerRefresh(options: RefreshApplicationMessage): void {
    this._isRefreshing.set(true);
  }

  // 10. Protected methods (template-accessible)
  protected toggle(): void {
    this.open.set(!this.open());
  }

  // 11. Private methods
  private startTimer(): void {
    this.intervalId = setInterval(() => {}, 1000);
  }

  private resetTimer(): void {
    this.stopTimer();
    this.startTimer();
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
```

## Naming Conventions

### Files

- **Components**: `kebab-case.component.ts` (e.g., `user-menu.component.ts`)
- **Services**: `kebab-case.service.ts` (e.g., `auth.service.ts`)
- **Pipes**: `kebab-case.pipe.ts` (e.g., `time-ago.pipe.ts`)
- **Guards**: `kebab-case.guard.ts` (e.g., `login.guard.ts`)
- **Models/Classes**: `kebab-case.model.ts` (preferred). `PascalCase.ts` or `PascalCase.model.ts` only for legacy/exception cases.
- **Interfaces**: `IPascalCase.ts` (e.g., `IUserSession.ts`, `IDynamicFormFields.ts`) - this repo convention overrides the Angular Style Guide
- **Enums**: `PascalCase.ts` (e.g., `MediaLibraryFileTypes.ts`)
- **Constants**: `kebab-case.const.ts` (e.g., `timer.component.const.ts`)

### Classes and Interfaces

- **Classes**: PascalCase without prefix (e.g., `Region`, `ProductInfo`, `UserService`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IUserSession`, `IConditionalLogic`) - this repo convention overrides the Angular Style Guide
- **Enums**: PascalCase (e.g., `MediaLibraryFileTypes`)
- **Type aliases**: PascalCase (e.g., `FieldType`)

### Variables and Properties

- **Private fields**: camelCase without prefix (e.g., `timeout`, `intervalId`)
- **Private signal backing fields**: camelCase with `_` prefix (e.g., `_refreshTrigger`, `_isRefreshing`)
- **Public properties**: camelCase (e.g., `title`, `user`)
- **Readonly properties**: camelCase with `readonly` keyword (e.g., `readonly capabilitiesIterator`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ONE_MINUTE_MS`, `REFRESH_INTERVAL_MINUTES`)

### Methods

- **Public methods**: camelCase, no explicit `public` keyword (e.g., `triggerRefresh()`)
- **Protected methods**: camelCase with `protected` keyword (e.g., `protected toggle()`)
- **Private methods**: camelCase with `private` keyword (e.g., `private startTimer()`)

## Dependency Injection

Use the `inject()` function instead of constructor-based injection.

```typescript
// Good
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
}

// Avoid
export class UserService {
  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {}
}
```

### Dependency Naming Convention

Property names must match the imported service in camelCase:

```typescript
// Good
private readonly userService = inject(UserService);
private readonly productInfoService = inject(ProductInfoService);
private readonly authService = inject(AuthService);

// Wrong - inconsistent naming
private readonly userSvc = inject(UserService);
private readonly productService = inject(ProductInfoService);
```

## Component Metadata

### Standalone Components

All components are standalone. Omit `standalone: true` because standalone is the default in current Angular versions.

```typescript
@Component({
  selector: "rdx-dms-example",
  imports: [ButtonComponent, CommonModule],
  templateUrl: "./example.component.html",
  styleUrl: "./example.component.scss"
})
export class ExampleComponent {}
```

### Service Configuration

Services use `providedIn: 'root'`:

```typescript
@Injectable({
  providedIn: "root"
})
export class ExampleService {}
```
