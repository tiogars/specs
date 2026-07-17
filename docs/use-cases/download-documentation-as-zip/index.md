# Download documentation as ZIP

## Goal

Export the full project specification as a ZIP archive of markdown files

## Related Data Domains

- [Project](../../data-domains/project/): A collection of roles, use cases, and data domains that define an application specification

## Related Roles

- [End User](../../roles/end-user/): A person who uses the app to create and manage project specifications

## Related Action Types

- [Download Documentation](../../action-types/download-documentation/): Exports project documentation as a ZIP package.

## Suggested Acceptance Criteria

- The generated ZIP downloads successfully from the project detail page.
- The archive includes root index.md and section folders for roles, use cases, and data domains.
- Generated markdown files contain valid relative links across related entities.
