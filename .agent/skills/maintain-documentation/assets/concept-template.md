---
type: Feature Guide
title: "{{reader_facing_title}}"
description: "{{one_sentence_summary}}"
doc_version: 1
tags: ["{{topic}}"]
where: ["{{verified_component_label}}"]
sources:
    - resource: "{{relative_path_to_inspected_implementation}}"
      title: "{{implementation_source_title}}"
    - resource: "{{relative_path_to_inspected_test_or_configuration}}"
      title: "{{supporting_source_title}}"
generated:
    by: process:copilot-maintain-documentation
    at: "{{actual_edit_time_iso8601_with_offset}}"
status: draft
---

<!-- markdownlint-configure-file {"MD025": {"front_matter_title": ""}} -->

# {{reader_facing_title}}

Document version: 1 | Updated: {{actual_edit_time_iso8601_with_offset}}

Latest change: {{Summarize the initial documentation or first tracked revision accurately.}}

{{Explain the capability and why it matters in one short paragraph.}}

Applies to: {{Angular client, Admin API, Content API, Database, Aspire AppHost, or a verified combination, with a brief responsibility statement.}}

[User Guide](#user-guide) | [Technical Details](#technical-details)

## User Guide

### Purpose and Availability

{{Describe the audience, prerequisites, and when the capability is available.}}

### Use Cases

{{Explain a concrete goal, the user's actions, and the observable result. Use
numbered steps when the reader must perform an ordered task.}}

### Variations and Recovery

{{Describe verified configuration-dependent alternatives, limitations, and
recovery from relevant empty, offline, or error states. Omit inapplicable cases.}}

## Technical Details

### Ownership and Flow

{{Explain the relevant data/control flow and component responsibilities. Link
the exact implementation paths and name the symbols that control behavior.}}

### Configuration and Contracts

{{Document verified defaults, accepted values, integration contracts, and
fallbacks. Include a small working example only when useful.}}

### Compatibility and Constraints

{{Explain meaningful compatibility requirements, migration considerations, and
operational constraints. Do not invent changes from previous versions.}}

### Validation and Known Gaps

{{Link relevant regression tests and distinguish checks actually run from source
inspection. State specific runtime or evidence gaps without implying human review.}}
