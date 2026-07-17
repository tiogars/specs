# Add a role to a project

## Goal

Assign a new actor or user type to the project

## Related Data Domains

- [Project](../../data-domains/project/): A collection of roles, use cases, and data domains that define an application specification
- [Role](../../data-domains/role/): An actor or user type that participates in use cases

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Suggested Acceptance Criteria

- The user can create or link the target entity with valid input.
- Duplicate additions are prevented or safely ignored.
- The new relationship appears in both source and related views.
