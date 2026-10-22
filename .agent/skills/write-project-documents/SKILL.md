---
name: write-project-documents
description: Create or revise DMS Markdown project documents in a technical voice. Use for PRDs, research plans, prototype plans, architecture notes, technical proposals, roadmaps, task descriptions, and similar repository documentation where clear human prose, numbered headings, restrained lists, diagrams, and Markdown quality matter.
---

# Write Project Documents

## Understand the document

Read the target document and the nearby PRD, README, diagrams, or related plans before writing. Preserve established terminology, document structure, heading numbering, and user edits unless the request explicitly changes them.

Assume the audience is a small group of senior technical people unless told otherwise. Write for architects and developers who understand normal software terminology. Explain project-specific concepts and important tradeoffs, but do not teach basic engineering or add client-facing ceremony.

## Write in the repository voice

Use direct, human, technical prose. Prefer paragraphs that connect the reason, the work, and the expected result. Keep the tone close to the user's prompt and the PRD rather than sounding like a generated project-management template.

Prefer paragraphs over bullets and tables. Use bullets only for genuine enumerations, short checklists, or acceptance criteria. Make every bullet a readable statement, not a label followed by a fragment. Use a table only when exact comparison or repeated field mapping is clearer than prose.

Avoid over-enumeration and over-exemplification. A sentence should not become a catalog merely to show that a category is broad. Name the higher-level category or keep one or two representative examples when the omitted items do not change the meaning. For example, write `source material such as books or videos` instead of listing every text, image, audio, and video format. Keep a complete inventory only when every item is a requirement, decision boundary, comparison field, or verification target. Present a long required inventory as bullets, a checklist, or a table instead of hiding it in a sentence.

Avoid the classic GPT pattern of "This is not A and B, it is C and D." Just explain C and D in a single paragraph. Avoid the classic GPT pattern of "The following is a list of X" or "The following is a list of Y." Just write the list without the preamble.

Write headings that state one idea directly. Never use contrastive heading formulas such as "X is Y, not Z," "X, not Y," or "X and Y are A, not B." Put an important boundary or misconception in the paragraph beneath a clear affirmative heading.

Avoid repetitive scaffolding such as `Build:`, `Tasks:`, `Output:`, and `Done when:` for every task. Describe a task in one to three natural paragraphs. State what needs to be understood or implemented, why it matters when useful, and what concrete result closes the task.

Do not over-explain. Avoid generic introductions, inflated summaries, rhetorical contrasts, unnecessary disclaimers, and formal governance language. Do not introduce decision gates, hypotheses, stakeholder approvals, legal wording, staffing models, capacity assumptions, or precise schedules unless the user or source document asks for them.

Use ASCII punctuation in prose. Do not use em dashes, smart quotes, ligatures, emoji, decorative Unicode, or horizontal rules. Use ordinary commas, periods, colons, parentheses, and hyphens.

## Use DMS terminology

When writing DMS plans, reviews, architecture notes, and status records, follow
the terminology in the [solution architecture](../../../docs/knowledge/system/solution-architecture.md),
[API stack](../../../docs/knowledge/system/api-tech-stack.md), and
[client stack](../../../docs/knowledge/system/client-tech-stack.md). Prefer the terms
below when they express the intended meaning. Do not mechanically replace a word
when it has a different established technical meaning.

| Avoid or qualify                  | Prefer                       | Use it this way |
| --------------------------------- | ---------------------------- | --------------- |
| generic `API` when the boundary matters | `Admin API` or `Content API` | Name the API that owns the workflow or consumer. |
| generic `client` when the UI boundary matters | `Angular client` | Use this term for the web application under `src/client`. |
| abstract `governance` or `approval` language | the concrete decision and owner | State who decides, what evidence they review, and what happens next. |
| `route` when it means an HTTP endpoint | `endpoint` or `HTTP route` | Keep `route` when discussing actual routing; avoid using it for an abstract workflow choice. |

Pair an abstract governance description with a concrete DMS delivery scenario when
the decision boundary matters. Name the responsible role, the evidence reviewed,
and the resulting action without introducing owners or approvals that the source
documents do not establish.

## Structure the document

Number headings as `# 1. Main Heading`, `## 1.1. Secondary Heading`, and `### 1.1.1. Task Heading` when creating or normalizing a substantial document. Preserve an existing heading scheme when the user has already chosen one.

Add a compact concepts table near the top when the document introduces project-specific names that readers need to distinguish. Do not add a ceremonial concepts table when every term is already obvious or defined in a linked PRD.

Use code samples, Mermaid diagrams, Gantt charts, or compact examples when they materially improve understanding. Keep diagrams consistent with the prose and the architecture requested by the user. When a Gantt uses Mermaid's `crit` flag or milestones, add a short legend explaining their colors and symbols.

For plans, keep stable task identifiers such as `R-02` or `P-07`. Describe dependencies visually only when they help the team understand parallel work or sequencing. Do not invent estimates, owners, or dates unless requested. Clearly separate prototype work from later MVP work without turning the distinction into process-heavy language.

## Revise existing documents carefully

Inspect the current file and repository status before editing. Treat existing changes as user-owned. Modify the requested sections and update related diagrams, references, task descriptions, and tables when the same concept appears elsewhere. Do not fix only the visible sentence if that leaves the document internally inconsistent.

When the user corrects an architectural assumption, apply the correction to both the diagram and the relevant prose. Prefer the user's stated system boundaries over common framework defaults.

## Separate project documents from product documentation

For DMS product and system documentation, follow the repository's
[documentation instructions](../../../.github/instructions/docs-instructions.md) and
[OKF documentation plan](../../../docs/open-knowledge-format-documentation-plan.md).
Place current knowledge concepts under `docs/knowledge/`, use OKF v0.2 frontmatter,
and link each concept from the relevant `index.md`. Keep project plans, proposals,
research notes, and release plans in their established locations unless the task
explicitly requests migration.

Do not create a competing project document for an existing canonical guide. Update
links and retire an old explanatory file only when the documentation plan and task
scope establish that migration.

## Use natural task prose

Avoid this pattern:

```markdown
Build:

- Add authentication.
- Add persistence.

Done when:

- Login works.
```

Prefer this pattern:

```markdown
### 2.3. Add authentication

The Admin API owns the authenticated management workflow, while the Angular client
calls its login and logout endpoints and renders the resulting application state.

The task is complete when two users can authenticate independently and neither user can read or control the other's conversations.
```
