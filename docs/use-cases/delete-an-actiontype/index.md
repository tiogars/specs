# Delete an actionType

## Goal

Remove an action type that is no longer needed

## Related Data Domains

- [Action Type](../../data-domains/action-type/): A reusable action category with description and acceptance criteria set

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Delete](../../action-types/delete/): Removes an existing entity or relationship with safeguards.

## Suggested Acceptance Criteria

- A confirmation step prevents accidental deletion.
- The deleted entity is removed from listings and related references.
- No orphaned links or stale associations remain after deletion.
