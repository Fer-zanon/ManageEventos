# Angular test examples

## Recommended patterns

| Entity type             | Repository example                                                                                                                 | Why it is useful                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Pure stateful service   | `src/client/src/app/services/signage/playlist-playback.service.spec.ts`                                                            | Direct instantiation, signal state transitions, and explicit disposal.                   |
| Raw HTTP service        | `src/client/src/app/services/security/session.service.spec.ts`                                                                     | `provideHttpClientTesting`, exact requests, promise coordination, and HTTP verification. |
| Class-based interceptor | `src/client/src/app/interceptors/api-credentials.interceptor.spec.ts`                                                              | Real DI interceptor pipeline and exact credential/header behavior.                       |
| Form metadata           | `src/client/src/app/components/pages/contributor/components/signage/channel-list/create-channel-modal/create-channel.form.spec.ts` | Direct conditional-form behavior without unnecessary component setup.                    |

## Migration references

These files illustrate useful setup mechanics but do not meet the complete standard:

| Area                     | Repository example                                                                                               | Use only                                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Generated-client wrapper | `src/client/src/app/services/http/signage/signage-channel.service.spec.ts`                                       | Typed generated-client spies and application-model hydration. Replace `as any` fixtures and add rejection, scope, and full operation coverage. |
| Signal-input component   | `src/client/src/app/components/pages/admin-settings/pages/tickets/table-tickets/table-tickets.component.spec.ts` | `setInput` and `overrideComponent` mechanics. Do not copy skipped tests, private-member calls, or self-fulfilling output assertions.           |

No existing guard test, rendered DMS component test, or complete Miracle UI contract test currently qualifies as a recommended example. Add those rows only after representative tests have been implemented and reviewed.
