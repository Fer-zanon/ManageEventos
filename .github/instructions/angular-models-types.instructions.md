---
description: "Angular data models, interfaces, and type definitions"
applyTo: "**/*.ts"
---

# Angular Models and Type Definitions

Patterns for data models, interfaces, enums, type aliases, and constants.

## Model Classes

### Basic Model Structure

```typescript
export class Region extends ModelBase implements RegionView {
  code: string;
  name: string;
  isActive: boolean;
  createdByUserId?: number;
  creationDate: string;
  modifiedByUserId?: number;
  modificationDate?: string;

  constructor() {
    super();
    this.code = "";
    this.name = "";
    this.isActive = false;
    this.creationDate = new Date().toJSON();
  }

  static fromInterface(view: RegionView): Region {
    const model = new Region();
    model.mapFromInterface(view);
    return model;
  }

  static fromInterfaceArray(dtos: RegionView[]): Region[] {
    return dtos.map(x => this.fromInterface(x));
  }
}
```

### Static Factory Methods

Provide static factory methods for creating instances from DTOs/interfaces:

```typescript
export class ProductInfo extends ModelBase implements ProductInfoView {
  name: string;
  description: string;
  features: Feature[];

  constructor() {
    super();
    this.name = "";
    this.description = "";
    this.features = [];
  }

  // Single instance factory
  static fromInterface(view: ProductInfoView): ProductInfo {
    const model = new ProductInfo();
    model.mapFromInterface(view);
    return model;
  }

  // Array factory
  static fromInterfaceArray(dtos: ProductInfoView[]): ProductInfo[] {
    return dtos.map(x => this.fromInterface(x));
  }

  // Custom transformations
  static fromBrandProduct(model: BrandProductView): ProductInfo {
    const product = new ProductInfo();
    product.id = model.productId;
    product.name = model.productName ?? "";
    product.description = model.productDescription ?? "";
    return product;
  }
}
```

### Constructor Initialization

Initialize all required properties in the constructor with sensible defaults:

```typescript
constructor() {
    super();
    this.code = "";
    this.name = "";
    this.isActive = false;
    this.features = [];
    this.creationDate = new Date().toJSON();
    this.modificationDate = null;
}
```

### Model Methods

```typescript
export class User extends ModelBase implements UserView {
  firstName: string;
  lastName: string;
  email: string;

  constructor() {
    super();
    this.firstName = "";
    this.lastName = "";
    this.email = "";
  }

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get initials(): string {
    return `${this.firstName[0] ?? ""}${this.lastName[0] ?? ""}`.toUpperCase();
  }

  // Business logic methods
  isValid(): boolean {
    return this.email.includes("@") && this.firstName.length > 0;
  }

  static fromInterface(view: UserView): User {
    const model = new User();
    model.mapFromInterface(view);
    return model;
  }

  static fromInterfaceArray(dtos: UserView[]): User[] {
    return dtos.map(x => this.fromInterface(x));
  }
}
```

## Interfaces

Use PascalCase with `I` prefix for interfaces:

```typescript
export interface IUserSession {
  userId: number;
  userName: string;
  email: string;
  isSystemAdmin: boolean;
  isRetailer: boolean;
  isOem: boolean;
  permissions: string[];
}

export interface IConditionalLogic {
  field: string;
  operator: "equals" | "notEquals" | "contains" | "notContains";
  value: any;
  valueField?: string;
  property?: string;
  showWhenTrue?: boolean;
}

export interface IConditionalLogicGroup {
  operator: "and" | "or";
  conditions: (IConditionalLogic | IConditionalLogicGroup)[];
  showWhenTrue?: boolean;
}
```

## Enums

Define enums without explicit values unless specific values are required:

```typescript
// Simple enum - no explicit values
export enum MediaLibraryFileTypes {
  all,
  image,
  video,
  document,
  microsite
}

// Enum with specific values
export enum HttpStatusCode {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500
}

// String enum
export enum UserRole {
  Admin = "admin",
  Manager = "manager",
  Contributor = "contributor",
  Viewer = "viewer"
}
```

## Type Aliases and Union Types

Use type aliases for complex or reusable types:

```typescript
// Union types
export type FieldType =
  | "text"
  | "number"
  | "checkbox"
  | "select"
  | "textarea"
  | "date"
  | "email"
  | "password"
  | "array"
  | "group";

export type ConditionalLogicExpression = IConditionalLogic | IConditionalLogicGroup;

// Complex types
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type AsyncResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Function types
export type EventHandler<T> = (event: T) => void;
export type AsyncOperation<T, R> = (input: T) => Promise<R>;
```

## Constants

Define constants in separate `.const.ts` files using UPPER_SNAKE_CASE:

```typescript
// timer.component.const.ts
export const ONE_MINUTE_MS = 60000;
export const REFRESH_INTERVAL_MINUTES = 15;
export const DEFAULT_TIMEOUT_MS = 30000;

// pagination.const.ts
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// validation.const.ts
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_USERNAME_LENGTH = 50;
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

## DTO Models

```typescript
export class RegionDtoModel {
  pageInfo: PageInfo;
  results: Region[];

  constructor(pageInfo: PageInfo, results: Region[]) {
    this.pageInfo = pageInfo;
    this.results = results;
  }
}

export class ProductInfoDtoModel {
  pageInfo: PageInfo;
  results: ProductInfo[];

  constructor(pageInfo: PageInfo, results: ProductInfo[]) {
    this.pageInfo = pageInfo;
    this.results = results;
  }

  get totalCount(): number {
    return this.pageInfo.totalCount ?? 0;
  }

  get hasNextPage(): boolean {
    return this.pageInfo.hasNextPage ?? false;
  }
}
```

## Generic Models

```typescript
export class PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;

  constructor(items: T[], totalCount: number, pageSize: number, currentPage: number) {
    this.items = items;
    this.totalCount = totalCount;
    this.pageSize = pageSize;
    this.currentPage = currentPage;
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }
}
```
