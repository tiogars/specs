# Add a data domain attribute

## Goal

Define a new property for a data domain

## Related Data Domains

- [Data Domain](../../data-domains/data-domain/): A logical grouping of related data with typed attributes
- [Data Domain Attribute](../../data-domains/data-domain-attribute/): A named property of a data domain with an optional description

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Add or Link](../../action-types/add-or-link/): Associates existing entities together without duplicating data.

## Suggested Acceptance Criteria

- The user can create or link the target entity with valid input.
- Duplicate additions are prevented or safely ignored.
- The new relationship appears in both source and related views.
