# Testing asynchronous behavior, time, and signals

This client runs tests with `zone.js` and `zone.js/testing`. Use `fakeAsync`, `tick`, `flush`, and `flushMicrotasks` for zone-controlled timers. Use plain `async`/`await` for straightforward promises.

## Choose the smallest mechanism

- `of()`, `throwError()`, and `Subject.next()` are synchronous; do not add async utilities.
- Use `expectAsync` for promise resolution and rejection.
- Use `fakeAsync` and `tick()` for timers, debounce, delay, and polling.
- Use `fixture.detectChanges()` after component signal or input changes.
- Use `TestBed.tick()` for service effects when no fixture drives change detection.

Never wait with a real `setTimeout`.

## Dates and locale

Freeze time with `jasmine.clock().mockDate()` or inject a clock. Always uninstall the clock. For schedules, cover applicable:

- UTC and local conversion;
- date-only boundaries;
- daylight-saving transitions;
- recurrence start/end boundaries;
- adjacent versus overlapping intervals.

## Polling and cancellation

Verify:

- the first load and each polling interval;
- polling stops on destruction or disposal;
- no timers remain after the test;
- a second input or search supersedes stale work;
- an older response cannot overwrite a newer result;
- cancellation does not display an error unless the application contract says it should.

Use `Subject`s or controlled promises to complete requests in deliberate order.

## Signals and effects

Signals and computed values update synchronously. Effects run during Angular scheduling; flush them with `TestBed.tick()` or fixture change detection. Assert public state or side effects, not internal dependency tracking.

For `toSignal`, emit through the source observable, drive Angular stabilization, and then assert.

## Observable sequences

Collect meaningful emissions and unsubscribe from long-lived streams. Use `firstValueFrom`, `take(1)`, or explicit teardown as appropriate.

RxJS `TestScheduler` is optional for complex stream logic. Use it only when it makes timing behavior clearer than `fakeAsync`, and keep marble expectations understandable to the team.
