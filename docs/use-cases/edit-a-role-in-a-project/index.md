# Edit a role in a project

## Goal

Rename or update the description of an existing role

## Related Data Domains

- [Project](../../data-domains/project/): A collection of roles, use cases, and data domains that define an application specification
- [Role](../../data-domains/role/): An actor or user type that participates in use cases

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Edit](../../action-types/edit/): Updates existing entities while preserving valid references.

## Suggested Acceptance Criteria

- The target entity can be updated with validated input.
- Existing references continue to resolve to the updated entity.
- Updated values are persisted and visible after reload.
