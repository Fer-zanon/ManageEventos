---
name: maintain-documentation
description: "Use after implementing, fixing, refactoring, or changing DMS code, dependencies, configuration, or product content with Copilot to keep documentation updated automatically. Also use when asked to create, fix, edit, update, refresh, or expand documentation, document new functionality, write feature explanations, or maintain use cases and existing guides. Follow Open Knowledge Format conventions, identify DMS component ownership, and provide user guidance and technical details grounded in source evidence. Do not edit files for explanation-only chats or read-only reviews."
user-invocable: true
disable-model-invocation: false
---

# Maintain Documentation

Keep documentation aligned with the implemented product, without a separate
documentation prompt during development. For manual requests, work on the named
feature, document, use case, or explicitly requested commit range.

Follow the completion requirement in
[copilot-instructions.md](../../../.github/copilot-instructions.md). Read
[solution architecture](../../../docs/knowledge/system/solution-architecture.md),
[API stack](../../../docs/knowledge/system/api-tech-stack.md), and
[client stack](../../../docs/knowledge/system/client-tech-stack.md) for terminology
and all path-based instructions applicable to the documents being changed.

## Scope and Safety

- Run after implementation and focused validation, before changelog maintenance
  and the final response. Routine decisions and updates need no approval loop.
- A code change always warrants an impact assessment, not necessarily a document
  edit. Formatting-only, tests-only, and Copilot-customization-only changes normally
  need no product documentation. Explain a no-op briefly.
- Read-only analysis, reviews, planning, and explanation-only chats must not mutate
  files. Explicit requests to write explanations into documentation are editing
  tasks. Respect user restrictions on paths, scope, and generated output.
- Capture the initial worktree state when starting an implementation task. Consider
  task-owned staged, unstaged, and untracked changes; do not document unrelated
  existing work. If loaded only at completion, reconstruct scope from the session
  and diff. Never assume all changes on a developer's branch belong to this task.
- Do not commit, push, switch branches, publish documents, edit Jira, or change
  application behavior as a side effect. Do not require Jira or network access for
  routine documentation. Keep credentials, personal data, and sensitive logs out.
- Never place keys, secrets, tokens, passwords, connection strings, certificates,
  or values that resemble exposed credentials in documentation, scripts, examples,
  fixtures, or templates. This applies even to dummy, expired, empty-value-derived,
  or otherwise unusable examples because repository security scanners can flag
  them. Use descriptive placeholders such as `<configured E2E authentication key>`
  and calculate protocol-only values at runtime when an example must demonstrate
  their use.
- Never invent behavior, configuration defaults, UI labels, screenshots, test
  results, ticket associations, release status, or human approval. Distinguish
  implemented behavior from planned work and source inspection from runtime checks.
- Continue independently with verified facts. Omit an unverified claim or identify
  a narrow limitation; report blockers rather than repeatedly asking questions.
  Ask only when an explicit manual request has no safely inferable target or when
  an essential decision requires authorization beyond the agreed scope.
- This skill guides an active Copilot session. It is not a file watcher, hook, CI
  gate, or guarantee that every Copilot client loads repository instructions.

## 1. Establish Documentation Impact

1. Inspect the actual task diff and the controlling implementation, its call sites,
   configuration, and nearby tests. For manual catch-up, use the requested scope;
   if none is given, use the named document or feature and current implementation,
   not a repository-wide audit. Do not assume a merge base or release range.
2. Identify changed user outcomes, use cases, prerequisites, navigation, fallbacks,
   errors, configuration, integration contracts, operational steps, and meaningful
   internal design. Tests reveal intended cases but are not proof they passed.
3. Search for existing documentation by feature name, symbol, configuration key,
   source path, and links from nearby READMEs. Follow direct cross-references to
   affected guides; stop when the task's behavior and consumers are covered.
4. Keep a small in-session impact list: changed behavior, supporting source,
   affected document, and update/create/no-op decision. Every relevant change must
   have a disposition; this list is not a new committed report.

## 2. Resolve Where the Work Lives

Use these repository component labels in metadata and a short visible scope sentence:

| Implementation path                                           | Component      |
| ------------------------------------------------------------- | -------------- |
| `src/client/**` (Angular web application)                     | `Angular client` |
| `src/api/Microsoft.DemoManagementSystem.WebApi/**`            | `Admin API`     |
| `src/api/Microsoft.DemoManagementSystem.Content.WebApi/**`    | `Content API`   |
| `src/database/**`                                             | `Database`      |
| `src/api/Microsoft.DemoManagementSystem.AppHost/**`           | `Aspire AppHost` |

For a feature spanning multiple components, use all applicable labels in a single
document and explain each component's responsibility in Technical Details. For
shared content, scripts, pipelines, and dependencies, trace the actual consuming
component; the changed file's location alone may not determine ownership. If
neither mapping is supported, report the unmapped scope and preserve existing valid
metadata instead of guessing.

Include exact repository source paths and relevant symbols in Technical Details,
with working links calculated relative to the document's actual nested location.
Do not expose local Windows paths or use brittle line numbers as the only source
reference. Include a Jira key only when established by task evidence; a ticket is
not required for a useful feature document.

## 3. Choose the Canonical Document

- Update an existing canonical document in place. Preserve its stable path,
  user-authored content, existing metadata, and valid cross-references. Do not
  create a competing explanation because the old one is not yet in OKF format.
- When no suitable document exists, create one focused concept per file in the
  narrowest applicable category below, using the
  [concept template](./assets/concept-template.md). Use descriptive lowercase
  hyphenated names, not ticket numbers, release dates, or implementation class
  names as concept identities. Avoid per-class documentation.

    | Category                  | Use for                                                           |
    | ------------------------- | ----------------------------------------------------------------- |
    | `system`                  | System architecture and runtime structure.                        |
    | `access`                  | Authentication, authorization, and user access.                   |
    | `content`                 | Content authoring and content data behavior.                      |
    | `delivery`                | Content delivery and device-facing behavior.                     |
    | `imports`                 | Import and integration workflows.                                |
    | `operations`              | Local development and operational guidance.                       |

    Create a category directory only when it contains a real document; never create
    empty category scaffolding or template-derived placeholder feature pages.

- Maintain discovery from the new guide to the documentation root. Every populated
  category has an `index.md`; each parent index links every populated direct child
  category; and each direct child guide is listed exactly once in its immediate
  category index with a linked title and one-sentence description. The
  `docs/knowledge/index.md` root links populated top-level categories, while the
  repository root `README.md` links those root categories. Do not flatten nested
  guides into the root index or duplicate a guide across sibling or ancestor indexes.
- Index files have no YAML frontmatter. The sole exception is
  `docs/knowledge/index.md`, which may contain only the optional
  `okf_version: "0.2"` frontmatter needed for the bundle root.
- Adopt OKF metadata incrementally on documents meaningfully updated in this task.
  Preserve unknown keys and existing identifiers such as `doc_id` and `jira_key`.
  Do not convert every linked file, rewrite history, or migrate the repository.
- Existing end-user guides remain non-technical. Follow their dedicated
  instructions, including screenshot requirements when applicable. Existing
  technical references retain their audience. Link a complementary document when
  needed instead of forcing two audiences into a specialized guide or duplicating
  it in the knowledge directory. New combined feature documents use both sections.
- Use `docs/historical/` for completed analyses, estimates, proposals, incidents,
  and their evidence. Preserve historical claims, identifiers, and intent; clearly
  label these records as context rather than current guidance. Historical records
  do not receive automatic OKF metadata or document revisions.
- Use `docs/deprecated/` for superseded guidance retained for traceability. Give
  each deprecated document a prominent reason and a working link to its current
  replacement, and maintain `docs/deprecated/index.md`. Use `status: deprecated`
  only for a current OKF document intentionally retained as a deprecated concept;
  archival location alone does not require converting legacy metadata.
- Leave unverified documents in place until evidence establishes their disposition.
  Do not mass-move analysis, RFC, process, or other document families. Approved
  decisions, release notes, and generated/compiled docs are not current-behavior
  guides; do not rewrite them automatically. Update authoritative source docs and
  use their documented compiler only when required. Respect existing frontmatter
  consumers and validate compatibility before adding metadata to compiler inputs.
- Preserve incoming links when removing functionality, moving a document, or
  renaming a concept. Repair relative links for the final nested location. For
  deprecated content, verify navigation to the current replacement from both the
  document and the deprecated index. Delete or move documents only when the task
  authorizes that scope.

## 4. Apply the Open Knowledge Format Profile

The [Google Cloud article](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
introduces OKF v0.1. Its linked project now points to the
[canonical OKF specification](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md),
which specifies v0.2. Use the v0.2 core conventions below; no SDK or external
service is required. Do not silently track future specification changes.

Every new concept is UTF-8 Markdown with parseable YAML frontmatter. OKF itself
requires only a non-empty `type`; this repository profile additionally requires
`title`, `description`, `tags`, `where`, `sources`, `generated`, and `doc_version` on new combined
feature documents. These additional requirements are local policy, not universal
OKF requirements. The two audience sections are also local policy.

- `type`: A descriptive kind, such as `Feature Guide`, `Configuration Guide`, or
  `Integration Guide`; preserve an existing accurate type.
- `title` and `description`: A reader-facing title and one-sentence summary.
- `tags`: A short YAML list of useful topic labels.
- `where`: A repository extension containing a list of verified component labels.
- `sources`: List the implementation, configuration, and test artifacts actually
  inspected, with `resource` paths relative to the document and useful `title`
  values. Use stable `id` values if attributing claims with matching Markdown
  footnotes. Sources are evidence, not a list of every changed file.
- `generated`: Use `by: process:copilot-maintain-documentation` and `at` with the
  actual meaningful edit time in ISO 8601 including `Z` or an explicit UTC offset.
  Obtain the time from the environment; do not fabricate it. v0.2 uses
  `generated.at` instead of the article's legacy `timestamp`. Preserve existing
  legacy metadata unless its consumer compatibility is understood.
- `resource` is optional: include it only for a known canonical asset, not an
  invented URL. `verified` is optional: never claim human review or carry old
  verification forward as approval of rewritten content. Record actual check
  limits in Technical Details; resolve stale verification metadata explicitly.
- Use `status: draft` for new, unreviewed documents and incomplete rewrites;
  use `status: deprecated` only for a current OKF document intentionally retained
  as a deprecated concept. Do not add that status merely because a legacy file is
  under `docs/deprecated/`, and do not promote status because a timestamp is recent.
  Clearly scope limitations in partially checked legacy documents instead of
  implying the whole document was revalidated.
- Use standard relative Markdown links so GitHub and VS Code navigation work.
  Calculate source and cross-document paths from each document's final nested
  location. Code/configuration references outside the knowledge directory remain
  repository dependencies; do not claim the directory alone is a self-contained
  export.
- Reserve `index.md` for directory listings and `log.md` for dated history, never
  feature concepts. Index files have no frontmatter except optional
  `okf_version: "0.2"` at `docs/knowledge/index.md`. Do not add a parallel history
  log by default: Git and the existing changelog already capture changes.

### Document Revisions

Use `doc_version` as a positive YAML integer representing this document's revision,
independent of the application release and `okf_version`. New concept documents
start at `1`. An existing unversioned document starts at `1` on its next meaningful
update; this marks the first tracked revision, not its original creation. Do not
invent earlier revisions or migrate untouched documents just to add versioning.

- Increment by one for a meaningful content update: changed behavior, instructions,
  use cases, contracts, examples, factual corrections, or substantive explanations.
  Formatting, spelling-only corrections, link repairs without changed meaning,
  index maintenance, and unchanged regeneration do not increment the version or
  refresh the meaningful-edit timestamp.
- Capture the document's starting revision and content before editing. Finalize
  one increment per document per logical task, not per patch, validation repair,
  or delegated agent. The coordinator owns the final revision. A second invocation
  with no additional meaningful content change must leave revision metadata intact;
  an existing code diff alone is not grounds for another increment.
- On creation or increment, synchronize `generated.at` with the actual edit time
  and show a compact reader-facing line near the title:
  `Document version: 2 | Updated: <same ISO 8601 time as generated.at>`.
  Follow it with `Latest change: <one sentence explaining the meaningful update>`.
  Replace that summary on the next revision; use Git for complete history rather
  than accumulating a second changelog in every guide.
- Keep the visible version and timestamp identical to their metadata values.
  Describe the first revision as initial documentation or the first tracked
  revision of an existing guide, whichever is true. Mention the new document
  version in the task's final response when documentation was meaningfully updated.
- Preserve existing version conventions and metadata consumers. If a document
  already has another revision scheme, follow its applicable rules instead of
  resetting it or creating competing counters. If its baseline is malformed or
  conflicting, report the versioning gap without guessing; independently verified
  content corrections can still proceed. Do not treat product or OKF versions as
  document revision baselines.
- Apply this policy to maintained concept/guide documents, not reserved indexes,
  logs, generated artifacts, historical records, or Copilot skill/template files.
  Respect audience-specific layouts when placing the short revision notice.

## 5. Write for Both Audiences

Write in English with natural, specific, substantial prose. Explain why behavior
matters and how it works, without padding, marketing claims, generic introductions,
or an inventory of edited files. Expand unfamiliar terms once. Use paragraphs for
explanations, numbered steps for actions, and tables for real comparisons.

Begin a combined document with its purpose, component scope, and jump links to:

1. **User Guide**: Explain who uses the feature, prerequisites, the normal task,
   and the observable result. Include concrete use cases that state the user's
   goal, action, and expected outcome. Cover configuration-dependent variations,
   empty/offline/error states, and recovery only when supported by evidence.
   Keep code symbols and implementation internals out of this section.
2. **Technical Details**: Explain ownership and the relevant execution/data flow,
   key source files and symbols, configuration defaults, contracts, dependencies,
   fallbacks, compatibility, and constraints. Include small accurate examples when
   useful. Identify regression coverage, checks actually run, and verification
   gaps; do not imply source inspection proves a successful runtime experience.

Document current behavior, not a chronological patch narrative. For a fix, explain
the corrected outcome; mention previous behavior only when needed for migration
or troubleshooting. For internal work with no customer-visible change, say so
briefly and focus the detail on the actual operator/developer audience.

Use only relevant subsections from the template, replace all placeholders, and
avoid empty headings. For screenshots, use real captures and follow applicable
guide rules; never substitute mockups for observed application behavior.

## 6. Validate and Finish

1. Reconcile the impact list: each changed behavior has an updated document or a
   justified no-op/blocker. Recheck defaults, conditions, and examples against the
   controlling code, including differences between client and wrapper behavior.
2. Parse changed YAML with an available structured parser; check required fields,
   component labels, actual source targets, timestamp format, and preservation of
   existing metadata. Run existing scoped Markdown/link/compiler checks where
   applicable without installing dependencies solely for routine documentation.
   If tooling is unavailable, inspect manually and disclose the unrun checks.
3. Check local links, fragments, and source references from every changed file's
   actual nested location. Verify every populated knowledge category has an index,
   parent indexes link direct child categories, each direct child guide appears
   exactly once in its immediate index, `docs/knowledge/index.md` links populated
   root categories, and the repository root `README.md` links those root categories.
   Confirm index frontmatter follows the root-only exception. For deprecated material, verify the
   prominent reason and replacement link in the document plus replacement
   navigation from `docs/deprecated/index.md`. Confirm no placeholders, secrets,
   unsupported claims, stale instructions, or unnecessary duplicate content remain.
   Review both audience sections for clarity.
4. Inspect the focused diff, including new files. Preserve unrelated edits and
   historical documents. An unchanged second invocation must produce no edits,
   duplicate concepts/index entries, or timestamp-only churn.
   Check document revisions against the captured baseline: initialize at `1` or
   increment once for meaningful updates only. Verify that the visible version,
   timestamp, and latest-change summary match the metadata and actual content diff.
5. Run [maintain-changelog](../maintain-changelog/SKILL.md) for the overall task;
   let that skill decide release relevance and ticket requirements. Do not call
   this skill again solely because its documentation changes need a changelog.
6. In the final response, link changed docs or give the no-op reason and report
   any factual, screenshot, compilation, or verification gaps. Do not claim full
   coverage when a blocker prevented it.

Use these decision checks when changing this workflow:

| Scenario                                            | Expected action                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Behavior changes with an existing guide             | Update that guide and directly affected references.                                                                       |
| New feature without a suitable guide                | Create one combined concept in the narrowest populated category and update the full index chain.                          |
| Cross-component integration                         | One concept with both component labels and clear responsibilities.                                                        |
| Pure internal refactor                              | Update technical docs only if their explanation became inaccurate.                                                        |
| Formatting/tests/customization only                 | Assess; normally no product documentation edit.                                                                           |
| Manual request to fix an old use case               | Check current code; update only the requested scope.                                                                      |
| Explanation-only question or read-only review       | Answer without editing files.                                                                                             |
| Unrelated dirty worktree edits                      | Leave them untouched and outside the documented task.                                                                     |
| Missing runtime access or uncertain behavior        | Document verified facts and report specific gaps.                                                                         |
| Same task run twice without new evidence            | No duplicate text, files, index entries, or metadata churn.                                                               |
| New or newly versioned guide                        | Start `doc_version: 1`; describe creation or first tracked revision accurately.                                           |
| Meaningful update to document revision 3            | Set revision 4 once; synchronize the visible notice and change summary.                                                   |
| Spelling/formatting-only document update            | Preserve revision, meaningful-edit timestamp, and latest-change summary.                                                  |
| Existing incompatible or ambiguous revision scheme  | Preserve its rules; report conflicts instead of resetting the version.                                                    |
| Completed analysis, estimate, proposal, or incident | Archive only when authorized; preserve claims and IDs, label it historical context, and do not revise it automatically.   |
| Superseded guidance retained for traceability       | Place in `docs/deprecated/`, state the reason prominently, link the current replacement, and update the deprecated index. |
| Document disposition is unverified                  | Leave it in place until evidence establishes its state; do not mass-move its document family.                             |
