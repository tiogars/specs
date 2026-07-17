# Create a data domain then add to a use case

## Goal

Create a new data domain and immediately link it to a use case

## Related Data Domains

- [Data Domain](../../data-domains/data-domain/): A logical grouping of related data with typed attributes
- [Use Case](../../data-domains/use-case/): A specific interaction or workflow performed by one or more roles

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Create](../../action-types/create/): Adds a new entity or record to the project context.
- [Add or Link](../../action-types/add-or-link/): Associates existing entities together without duplicating data.

## Suggested Acceptance Criteria

- A new entity can be created with required fields only.
- The created entity appears immediately in listings and detail views.
- Persisted data remains available after page refresh.
- The user can create or link the target entity with valid input.
- Duplicate additions are prevented or safely ignored.
- The new relationship appears in both source and related views.
