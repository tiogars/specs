# Edit a data domain attribute

## Goal

Rename or update the description of a data domain attribute

## Related Data Domains

- [Data Domain](../../data-domains/data-domain/): A logical grouping of related data with typed attributes
- [Data Domain Attribute](../../data-domains/data-domain-attribute/): A named property of a data domain with an optional description

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Edit](../../action-types/edit/): Updates existing entities while preserving valid references.

## Suggested Acceptance Criteria

- The target entity can be updated with validated input.
- Existing references continue to resolve to the updated entity.
- Updated values are persisted and visible after reload.
