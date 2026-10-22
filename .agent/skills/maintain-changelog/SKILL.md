---
name: maintain-changelog
description: "Use after implementing, fixing, refactoring, or otherwise changing DMS code, dependencies, configuration, or release-relevant documentation with Copilot. Maintain the root CHANGELOG.md, associate changes with Jira tickets when established, prevent duplicate entries, and reconcile release branches only when the repository's release documentation supports it. Also use for explicit changelog and release-version maintenance requests."
user-invocable: true
disable-model-invocation: false
---

# Maintain Changelog

Maintain the root [CHANGELOG.md](../../../CHANGELOG.md) as part of implementation,
without a separate user prompt. Use [release planning](../../../docs/release-plan.md)
and [release instructions](../../../docs/release-instructions.md) as context. Follow
the repository-wide completion requirement in
[copilot-instructions.md](../../../.github/copilot-instructions.md).

## Scope And Safety

- Run after implementation and its focused validation, before the final response.
- Record release-relevant behavior, fixes, capabilities, maintenance, and operational
  changes. Tests supporting one change belong with that change, not in separate entries.
- Skip read-only reviews, analysis, planning, formatting-only work, and changes only
  to Copilot customization. Explicit changelog/release maintenance requests may run
  without an implementation change. Respect explicit user edit restrictions.
- Inspect the task's actual diff, including relevant staged and untracked files.
  Do not document unrelated pre-existing work or changes from another developer.
  For an explicit catch-up request, use the requested commit/branch scope instead.
- Preserve existing edits, released entries, and unrelated formatting. Do not rewrite
  historical entries to enforce this skill's newer conventions.
- Use available read, search, Git, and edit tools. Do not commit, switch branches,
  create branches, fetch, push, or change project/package versions as a side effect.
- The coordinator reconciles delegated work once; do not have several agents edit
  the changelog concurrently.

## 1. Resolve The Ticket And Change

1. Read the current changelog's pending section and the relevant implementation diff.
2. Resolve the Jira key from explicit task/issue context first, then the current
   branch name (`git branch --show-current`), then commits belonging to this task.
   Accept actual project keys such as `MRR-410`, `MVP-1949`, or `MDR-15`; do not
   restrict valid tickets to one project. A key has an uppercase project identifier,
   a hyphen, and a positive issue number.
3. When Jira tools are available, use the resolved issue to clarify scope as needed.
   Jira access is not required if task context already establishes the association.
   Do not search for a vaguely similar issue and assume it owns the change.
4. If sources conflict, multiple tickets cannot be mapped to their changes, or no
   reliable key exists, do not fabricate a key, use a placeholder, and tell the user explicitly.
   Leave affected entries unwritten and report the exact blocker in the final response,
   without an interactive clarification loop. Other independently verified entries may proceed.
5. Derive the functionality/component/service label from the implementation, not
   solely from the ticket title. State only behavior supported by the diff. Never
   claim tests passed or a release shipped without evidence.

## 2. Reconcile The Pending Version

Follow the branch format documented in [git-workflow.md](../../../docs/knowledge/operations/git-workflow.md):
`releases/YYYY/MM-DD`, for example `releases/2026/09-15`.

1. Read version headings matching `## Version <number> - Release <TBD|YYYY-MM-DD>`.
   Normally exactly one `Release TBD` section exists at the top. Multiple pending
   sections, malformed versions, or ambiguous chronology are blockers: do not guess
   which content to move. Report the inconsistency without rewriting history.
2. Inspect locally available refs with
   `git for-each-ref --format='%(refname:short)' refs/heads/releases/ refs/remotes/`.
   Recognize only exact release names, stripping a remote prefix where applicable.
   Validate real calendar dates, deduplicate local/remote copies by date, and sort
   chronologically, not by ref iteration order. Never treat branch commit timestamps
   or today's date as the release date. Do not fetch automatically; stale or missing
   remote refs limit detection and must be mentioned when relevant.
3. Ignore dates already represented by released headings or older than the latest
   recorded release. If no unrecorded newer release exists, keep the current pending
   heading and add entries there. The presence of an old release branch alone must
   never trigger another version increment.
4. Inspect `git show <release-ref>:CHANGELOG.md` and check lineage with
   `git merge-base --is-ancestor <release-ref> HEAD`. A candidate is applicable
   only when its changelog associates that date (or its pending section) with the
   current pending version and its tip is in the current branch's history. All refs
   for the same date must agree on that version. If lineage, versions, or multiple
   unrecorded releases cannot be reconciled unambiguously, leave version headings
   unchanged and report the blocker. Do not infer several historical releases from
   one current pending section.
5. For one verified new release, replace only the current pending heading's `TBD`
   with the branch's ISO date. Preserve its existing entries, then prepend
   `## Version <next version> - Release TBD` above it. Put this task's new entries in
   that new section. Do not move entries already present in the release snapshot.
   If a task entry was already written into the old pending section but is absent
   from the release snapshot, move only that verified task-owned entry to the new
   section. If other existing pending entries differ from the snapshot and their
   release membership is unclear, block rollover rather than date them incorrectly.
6. Increment the rightmost numeric version segment as an integer, retaining the
   other segments: `1.9` becomes `1.10`, `1.10` becomes `1.11`, and `2.3.4` becomes
   `2.3.5`. For a historical single-segment version, `1` becomes `1.1`, consistent
   with this changelog. Never treat a version as a decimal or bump the major number
   without an explicit instruction. A pre-existing next-version heading is a
   conflict to reconcile, not a reason to create a duplicate.
7. If no pending section exists, create the next pending version only when the top
   released section and its matching release ref unambiguously establish the
   baseline. Otherwise report the missing baseline and leave headings untouched.
8. Release branch creation is the rollover signal requested for this repository;
   it is not proof of shipment. Do not claim shipping, create a release, or update
   release status in Jira. On a checked-out `releases/*` branch, do not open the
   next development version or append development notes automatically; report that
   rollover belongs on the development/feature line. Release-branch changelog edits
   require an explicit request and stay within that release's version.

Before changing headings, determine both the destination version and the release
membership of existing entries. If this cannot be established, do not add new
entries to a version that may already have been released; report the blocker.

## 3. Write Concise Entries

Use only `### Added`, `### Changed`, and `### Fixed` for new entries, in that order.
Reuse the applicable subsection; create it only when it has an entry. Do not create
duplicate headings or empty groups. Existing historical groups remain untouched.

| Group   | Use                                                                                     |
| ------- | --------------------------------------------------------------------------------------- |
| Added   | New capabilities, supported integrations, or new operational documentation.             |
| Changed | Intentional behavior changes, refactors, dependency/configuration updates, or removals. |
| Fixed   | Corrected defects or regressions.                                                       |

Use the confirmed repository labels, with exact casing:

| Changed path                                                  | Where          |
| ------------------------------------------------------------- | -------------- |
| `src/client/**` (Angular)                                     | `Angular client` |
| `src/api/Microsoft.DemoManagementSystem.WebApi/**`            | `Admin API`     |
| `src/api/Microsoft.DemoManagementSystem.Content.WebApi/**`    | `Content API`   |
| `src/database/**`                                             | `Database`      |
| `src/api/Microsoft.DemoManagementSystem.AppHost/**`           | `Aspire AppHost` |

For shared content, build, pipeline, or documentation changes, use the consuming
product established by the diff. For a change affecting both products, write one
entry per affected product with its specific impact. If neither label is justified,
report the unmapped scope rather than inventing a product label.

Exact entry shape:

```markdown
- [`Where`][`TICKET-123`][`Functionality / Component / Service`] One or two short sentences explaining what changed and its effect.
```

Examples of format (not evidence of work to append):

```markdown
- [`Angular client`][`MVP-1234`][`Content / Editor`] Updated the editor behavior and kept the documented workflow consistent.
- [`Admin API`][`MVP-1235`][`Content / Publishing`] Updated the publishing workflow and its API contract.
```

- Keep each bullet on one physical line, with one or two short sentences. Explain
  the change and useful outcome; avoid file inventories, implementation narration,
  or copying the entire Jira title. Do not include secrets or sensitive diagnostics.
- Group related edits into one logical entry. Use separate entries only for distinct
  changes or product impacts, not one bullet per modified file.
- Before inserting, compare the destination section's entries by product, ticket,
  affected area, and meaning. Refine an existing task-owned entry when appropriate;
  do not duplicate it on repeated invocations or overwrite unrelated developer text.
- A ticket can have multiple distinct entries. A historical entry for the same
  ticket does not prevent a genuinely new follow-up change in the pending release.

## 4. Validate And Finish

Inspect the focused diff with `git diff -- CHANGELOG.md` (and the staged diff when
relevant). Verify:

- Every release-relevant change in this task has a concise entry or an explicitly
  reported blocker. Every new entry has all three labels and a supported Jira key.
- Entries are in the correct version/group and use the confirmed product mapping.
- Exactly one top-level pending version remains on the development line; any dated
  heading comes from a verified release ref. No unrelated released text changed.
- A second run with the same diff and refs would add no bullets or version headings.
- Formatting matches the surrounding changelog. Run an existing Markdown check if
  available, without installing dependencies solely for this update.

Use these decision checks when maintaining the workflow:

| State                                                        | Expected result                                          |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| Pending 1.9; 1.8 dated 2026-09-15; latest ref 2026/09-15     | Keep 1.9 pending.                                        |
| Pending 1.9; applicable new ref 2026/09-30 snapshots 1.9     | Date 1.9 as 2026-09-30; open 1.10 pending.               |
| Repeat after that rollover with the same refs                | Keep 1.10; add no duplicate entry.                       |
| New ref belongs to another line or ambiguous release history | Leave headings unchanged; report blocker.                |
| No reliable ticket                                           | Do not invent an entry; report missing Jira association. |

Mention the changelog update briefly in the final response, including any skipped
entries or release-detection limitations. This skill guides Copilot during editing
tasks; it is not a background watcher, CI gate, or guarantee that every client will
load instructions. It does not automatically process edits made without Copilot.
