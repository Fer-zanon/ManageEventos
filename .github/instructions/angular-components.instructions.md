---
description: "Angular component patterns and reactive state management"
applyTo: "**/*.component.ts"
---

# Angular Components and Reactive State

Component-specific patterns, signals, reactive state management, and lifecycle patterns.

## Signals and Reactive State

### Signal Types and Usage

```typescript
export class ExampleComponent {
  // ModelSignal for two-way binding with parent components
  readonly capabilities: ModelSignal<Capability[]> = model.required();

  // InputSignal for component inputs
  readonly userId: InputSignal<number> = input.required();
  readonly userName: InputSignal<string> = input<string>("Anonymous");

  // WritableSignal for component internal state
  readonly open: WritableSignal<boolean>;

  // Signal (read-only) for computed or derived state
  readonly capabilitiesIterator: Signal<Capability[]>;

  // OutputEmitterRef for events
  readonly capabilitiesChange: OutputEmitterRef<Capability[]> = output();

  constructor() {
    // Initialize signals in constructor
    this.open = signal(false);

    // Use computed() for derived state
    this.capabilitiesIterator = computed(() =>
      this.capabilities() ? Object.values(this.capabilities()) : []
    );
  }
}
```

### Input Signal Patterns

**For required inputs:** Specify type on property declaration only, NOT on `input.required()`

```typescript
// ✅ Correct - required input
readonly productInfoVersion: InputSignal<ProductInfoVersion> = input.required();

// ❌ Wrong - redundant type specification
readonly productInfoVersion: InputSignal<ProductInfoVersion> = input.required<ProductInfoVersion>();

// ❌ Wrong - missing type on property declaration
readonly productInfoVersion = input.required<ProductInfoVersion>();
```

**For optional inputs:** Specify type on both property and input call

```typescript
// ✅ Correct - optional input with default
readonly userName: InputSignal<string> = input<string>('Anonymous');
readonly maxItems: InputSignal<number> = input<number>(10);
```

### Signal Backing Fields Pattern

When exposing signals via getters, use underscore prefix for the private backing field:

```typescript
export class RefreshService {
  private _refreshTrigger: WritableSignal<RefreshApplicationMessage | null>;
  private _isRefreshing: WritableSignal<boolean>;

  constructor() {
    this._refreshTrigger = signal(null);
    this._isRefreshing = signal(false);
  }

  get refreshTrigger(): Signal<RefreshApplicationMessage | null> {
    return this._refreshTrigger.asReadonly();
  }

  get isRefreshing(): Signal<boolean> {
    return this._isRefreshing.asReadonly();
  }
}
```

## Constructor Initialization Order

Inside the constructor, initialize entities in this specific order:

1. **First**: Plain properties and writable signals
2. **Second**: Computed signals
3. **Third**: Effects

```typescript
constructor() {
    // 1. Initialize plain properties and writable signals
    this.open = signal(false);
    this.selectedItems = signal([]);
    this._refreshTrigger = signal(null);
    this._isRefreshing = signal(false);

    // 2. Initialize computed signals
    this.capabilitiesIterator = computed(() =>
        this.capabilities() ? Object.values(this.capabilities()) : []
    );
    this.isFormValid = computed(() =>
        this.selectedItems().length > 0 && this.open()
    );

    // 3. Initialize effects
    effect(() => {
        if (this._refreshTrigger()) {
            this.resetTimer();
        }
    });

    effect(() => {
        console.log('Selected items changed:', this.selectedItems());
    });
}
```

## Lifecycle Hooks

Implement lifecycle hooks in standard order:

```typescript
export class ExampleComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnInit(): void {
    // Component initialization
    this.loadData();
  }

  ngAfterViewInit(): void {
    // After view is initialized
    this.initializeChart();
  }

  ngOnDestroy(): void {
    // Cleanup
    this.stopTimer();
    this.unsubscribe();
  }
}
```

## Template Method Accessibility

Methods called from templates use `protected` keyword. Internal helper methods use `private`.

```typescript
export class ExampleComponent {
  // Called from template - use protected
  protected handleClick(): void {
    this.processData();
  }

  protected onSubmit(): void {
    this.validateAndSave();
  }

  // Internal helper - use private
  private processData(): void {
    // Implementation
  }

  private validateAndSave(): void {
    // Implementation
  }
}
```

```html
<!-- template.html -->
<button (click)="handleClick()">Click Me</button>
<form (ngSubmit)="onSubmit()">
  <!-- Form content -->
</form>
```

## Component Communication

### Parent to Child (Input)

```typescript
export class ChildComponent {
  readonly data: InputSignal<string[]> = input.required();
  readonly maxItems: InputSignal<number> = input<number>(10);
}
```

```html
<app-child [data]="items" [maxItems]="5"></app-child>
```

### Child to Parent (Output)

```typescript
export class ChildComponent {
  readonly itemSelected: OutputEmitterRef<string> = output();

  protected selectItem(item: string): void {
    this.itemSelected.emit(item);
  }
}
```

```html
<app-child (itemSelected)="onItemSelected($event)"></app-child>
```

### Two-Way Binding (Model)

```typescript
export class ChildComponent {
  readonly selectedValue: ModelSignal<string> = model.required();

  protected updateValue(newValue: string): void {
    this.selectedValue.set(newValue);
  }
}
```

```html
<app-child [(selectedValue)]="parentValue"></app-child>
```

## Common Component Patterns

### Loading State

```typescript
export class DataComponent implements OnInit {
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly data: WritableSignal<Item[]> = signal([]);
  protected readonly error: WritableSignal<string | null> = signal(null);

  private readonly dataService = inject(DataService);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  protected async loadData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.dataService.fetchData();
      this.data.set(result);
    } catch (err) {
      this.error.set("Failed to load data");
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

### Form State

```typescript
export class FormComponent {
  protected readonly formData: WritableSignal<FormModel> = signal(new FormModel());
  protected readonly isDirty: WritableSignal<boolean> = signal(false);
  protected readonly isValid: Signal<boolean>;

  constructor() {
    this.isValid = computed(() => this.validateForm(this.formData()));
  }

  protected onFieldChange(field: string, value: any): void {
    this.formData.update(data => ({
      ...data,
      [field]: value
    }));
    this.isDirty.set(true);
  }

  private validateForm(data: FormModel): boolean {
    return data.name.length > 0 && data.email.includes("@");
  }
}
```
