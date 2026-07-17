# Add a actionType to a use case

## Goal

Link an existing action type to a use case

## Related Data Domains

- [Project](../../data-domains/project/): A collection of roles, use cases, and data domains that define an application specification
- [Use Case](../../data-domains/use-case/): A specific interaction or workflow performed by one or more roles
- [Action Type](../../data-domains/action-type/): A reusable action category with description and acceptance criteria set

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Add or Link](../../action-types/add-or-link/): Associates existing entities together without duplicating data.

## Suggested Acceptance Criteria

- The user can create or link the target entity with valid input.
- Duplicate additions are prevented or safely ignored.
- The new relationship appears in both source and related views.
