---
description: "Angular pipes: custom transformations and data formatting"
applyTo: "**/*.pipe.ts"
---

# Angular Pipes

Patterns for creating custom pipes and data transformations.

## Basic Pipe Structure

Implement `PipeTransform` interface and include proper lifecycle management:

```typescript
@Pipe({
  name: "timeAgo",
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: number | null = null;
  private cachedResult = "";

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  transform(value: string | Date | null | undefined, live = false): string {
    if (!value) {
      this.clearTimer();
      return "";
    }
    return this.getTimeAgo(value);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private getTimeAgo(value: string | Date): string {
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  private clearTimer(): void {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}
```

## Pure Pipes

Use `pure: true` (default) for pipes that transform data without side effects:

```typescript
@Pipe({
  name: "fileSize"
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}
```

## Impure Pipes

Use `pure: false` for pipes that depend on mutable data or external state:

```typescript
@Pipe({
  name: "userString",
  pure: false
})
export class UserStringPipe implements PipeTransform {
  private readonly userService = inject(UserService);

  transform(userId: number): string {
    const user = this.userService.getUserById(userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  }
}
```

## Template Usage

```html
<!-- Pure pipe -->
<div>{{ fileSize | fileSize }}</div>
<div>{{ fileSize | fileSize:0 }}</div>

<!-- Impure pipe with live updates -->
<div>{{ timestamp | timeAgo:true }}</div>

<!-- Chaining pipes -->
<div>{{ createdDate | date:'short' | uppercase }}</div>
```
