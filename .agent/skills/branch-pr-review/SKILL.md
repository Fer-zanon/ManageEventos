---
name: branch-pr-review
description: "Use when: reviewing the current branch changes against development before a pull request; branch validation; PR review; pullrequestreview; code quality, consistency, architectural decisions, merge resolution, tests, documentation, and generating a Markdown review report when suggestions are found."
user-invocable: true
disable-model-invocation: false
---

# Branch PR Review

Review the checked-out branch against `development` and produce a practical pull request review. The review validates the branch diff, not the whole repository, and it must be grounded in repository rules and source evidence.

Use this skill when the user asks to validate a branch, review pending PR changes, compare against `development`, check code quality, check architecture, verify consistency, or create a pull request review report.

## Scope And Safety

- Treat the current branch as the review target and `development` as the default base branch. If local `development` is unavailable, use `origin/development` and state the fallback.
- Do not switch branches, pull, fetch, commit, push, reset, clean, or rewrite files unless the user explicitly asks. If the base ref may be stale, report that limitation in the review.
- Review only changes in the branch diff from the merge base with `development`. Existing violations outside the diff are context only unless the branch makes them worse.
- Preserve all developer work. The only file this skill may create is the Markdown review report, and only when at least one finding, suggestion, risk, or follow-up exists.
- If there are no findings or suggestions, do not create a report. Reply with a concise pass result, validation commands, and any residual limitations.
- Never include secrets, credentials, personal data, or sensitive log output in the report.

## Required Inputs

If the user does not provide a target branch, use the currently checked-out branch. If the user names a base branch other than `development`, follow the explicit base but still mention that this skill defaults to `development`.

## 1. Establish The Diff

Run a focused Git inspection before reading changed files:

```bash
git status --short
git branch --show-current
git rev-parse --verify development
git rev-parse --verify origin/development
git merge-base HEAD development
git diff --name-status development...HEAD
git diff --stat development...HEAD
```

Use `origin/development` only when local `development` is missing. If both are missing, stop and ask the user to make a development base ref available.

Prefer `git diff <base>...HEAD` for review because it compares the branch changes since the merge base. Use `git diff <base>..HEAD` only when deliberately checking tip-to-tip differences, and say why.

Also check for unresolved merge artifacts:

```bash
rg -n "<<<<<<<|=======|>>>>>>>" --glob '!node_modules/**' --glob '!dist/**' --glob '!bin/**' --glob '!obj/**'
```

## 2. Load The Rules That Apply

Before judging the diff, read the relevant repository rule sources:

- `.github/instructions/pr.instructions.md` for the PR review protocol.
- `.github/instructions/critical-rules.instructions.md` for HIGH severity guardrails.
- `docs/rules/00-severity-model.md` for severity definitions.
- `docs/rules/01-architecture.md`, `docs/rules/04-ddd.md`, `docs/rules/03-patterns.md`, and `docs/rules/02-coding-standards.md` for backend and shared code.
- `docs/rules/database/` when SQL or database project files changed.
- `.github/instructions/frontend.instructions.md` and applicable Angular instructions when `src/client/**` changed.
- `.github/workflows` review instructions when workflow files changed.

Load only rule files relevant to the changed paths, but always include the PR review protocol and severity model for report formatting.

## 3. Inspect Changed Files

Read the diff and the smallest useful surrounding code for each changed area. Prefer direct changed files, owning abstractions, neighboring tests, and call sites over broad repository exploration.

Classify changed files into these review areas:

- Admin API, Content API, provider, data, domain, shared interface, or Aspire AppHost.
- Angular client components, services, models, routing, guards, interceptors, or tests.
- Database schema, view, migration, seed/bootstrap, or data script.
- Tests, build scripts, pipelines, configuration, and documentation.

For generated files, identify the generator or source contract when possible. Do not ask for hand edits to generated output unless the generator source is also handled or the repository convention allows it.

## 4. Review Criteria

Apply these checks in order.

### 4.1. Correctness And Resolution

- The branch solves the intended problem without partial implementations, dead paths, inconsistent feature flags, or unreachable code.
- Merge conflict markers, duplicated blocks, stale rename remnants, and accidental reversions are absent.
- Public contracts, DTOs, generated clients, routes, validators, enum mappings, and model hydration remain consistent across consumers.
- Error handling, authorization, validation, nullability, date/time handling, pagination, sorting, filtering, and idempotency are correct for the changed workflow.
- Deletions are intentional and do not leave orphaned imports, routes, DI registrations, tests, documentation, database objects, or assets.

### 4.2. Architecture

- Enforce documented layer direction and ownership. Controllers stay thin, providers orchestrate, repositories own persistence, data stays persistence-only, and domain remains infrastructure-independent.
- Do not introduce `DbContext`, SQL, repository implementations, framework services, or provider logic into the wrong layer.
- Angular code follows existing application structure, generated API proxy boundaries, service patterns, route/guard conventions, and reactive state practices.
- Database changes preserve database-first source of truth, constraints, naming rules, and view requirements.
- Workflow and pipeline changes preserve security boundaries, permissions, caching behavior, and secret handling.

### 4.3. Code Quality And Consistency

- Naming, async conventions, nullable handling, immutability, dependency injection, exception flow, logging, and serialization match repository rules.
- Code reuses existing helpers, patterns, and domain language instead of creating duplicate abstractions.
- Tests cover changed behavior at the right level and are updated when contracts, validation, routing, or data semantics change.
- Documentation is updated when behavior, API contracts, operational steps, data semantics, or user workflows change.
- Performance, concurrency, resource cleanup, accessibility, localization, and security risks are considered where relevant to the diff.

## 5. Run Focused Validation

Run the cheapest meaningful checks available for the changed areas. Prefer focused commands over broad commands, but run broader validation when the diff crosses shared contracts or generators.

Examples:

```bash
dotnet test <relevant-test-project>
dotnet build <relevant-solution-or-project>
npm run lint -- --project <relevant-project>
npm test -- --watch=false
```

If dependencies, local services, SDKs, or test data are unavailable, record the exact blocker and continue with source review. Do not fabricate passing validation.

## 6. Report Findings

Prioritize findings before summaries. Each finding must include:

- Severity: `BLOCKER`, `HIGH`, `MEDIUM`, or `LOW`.
- Category: `Architecture`, `Correctness`, `Code Quality`, `Consistency`, `Security`, `Tests`, `Documentation`, `Database`, or `Pipeline`.
- Source: a clickable repository path and line when available.
- Evidence: the changed code or behavior that causes the concern.
- Rule: the documented rule ID and quoted rule text when a repository rule applies.
- Impact: why this matters for runtime behavior, maintainability, security, release safety, or review confidence.
- Suggested resolution: the smallest concrete correction.

Use documented rule IDs for rule violations. For a good engineering concern with no documented rule, explicitly write: `No documented rule covers this scenario.`

Distinguish required fixes from suggestions. A branch with any HIGH documented violation must not be recommended for approval.

## 7. Create The Markdown Review Document

Create a report only when the review finds at least one finding, suggestion, risk, or follow-up. Place it under:

```text
docs/pull-request-reviews/
```

Name the file with the current date and sanitized branch name:

```text
docs/pull-request-reviews/YYYY-MM-DD-<branch-name>-review.md
```

Use lowercase branch text, replace `/`, `\\`, spaces, and repeated punctuation with `-`, and keep only letters, numbers, dots, and hyphens.

The document must use this structure:

```markdown
# Pull Request Review: <branch>

Base: development
Compared range: <base-ref>...HEAD
Reviewed at: <ISO 8601 timestamp>

## Summary

<One short paragraph describing the review outcome.>

## Verdict

- Approval recommendation: <Approve | Request changes | Needs follow-up>
- Blocking findings: <count>
- Non-blocking suggestions: <count>
- Validation status: <commands run and result, or blockers>

## Findings

### <Severity> - <Category> - <short title>

Source: <path>
Rule: <rule id and quoted rule text, or No documented rule covers this scenario.>

<Evidence, impact, and suggested resolution.>

## Suggestions

<Non-blocking improvements, or `None`.>

## Validation

<Commands, results, and limitations.>

## Reviewed Files

<Changed files grouped by area.>
```

Keep the report concise and evidence-based. Do not paste entire diffs unless a small snippet is needed to explain a finding.

## 8. Final Response

In the chat response, summarize the verdict, name the base ref used, list validation commands and outcomes, and link the report if one was created. If no report was created, state that no findings or suggestions were found and explain the validation limits.
