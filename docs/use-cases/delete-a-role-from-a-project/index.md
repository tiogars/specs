# Delete a role from a project

## Goal

Remove a role that is no longer needed

## Related Data Domains

- [Project](../../data-domains/project/): A collection of roles, use cases, and data domains that define an application specification
- [Role](../../data-domains/role/): An actor or user type that participates in use cases

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Suggested Acceptance Criteria

- A confirmation step prevents accidental deletion.
- The deleted entity is removed from listings and related references.
- No orphaned links or stale associations remain after deletion.
