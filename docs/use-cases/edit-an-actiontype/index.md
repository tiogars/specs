# Edit an actionType

## Goal

Update an existing action type details and acceptance criteria

## Related Data Domains

- [Action Type](../../data-domains/action-type/): A reusable action category with description and acceptance criteria set

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Edit](../../action-types/edit/): Updates existing entities while preserving valid references.

## Suggested Acceptance Criteria

- The target entity can be updated with validated input.
- Existing references continue to resolve to the updated entity.
- Updated values are persisted and visible after reload.
