# specs (default)

## Overview

- Roles: 3
- Use Cases: 22
- Data Domains: 5

## Roles

- [End User](roles/end-user/): A person who uses the app to create and manage project specifications
- [Developer](roles/developer/): A software developer who builds and maintains the application
- [DevOps Engineer](roles/devops-engineer/): An engineer responsible for deployment, infrastructure, and CI/CD pipelines

## Use Cases

- [Create a project](use-cases/create-a-project/): Create a new project with a name, description, roles, and use cases
- [View saved projects](use-cases/view-saved-projects/): Browse and open previously created projects
- [Add a role to a use case](use-cases/add-a-role-to-a-use-case/): Link an existing role to a use case
- [Add a role to a project](use-cases/add-a-role-to-a-project/): Assign a new actor or user type to the project
- [Edit a role in a project](use-cases/edit-a-role-in-a-project/): Rename or update the description of an existing role
- [Delete a role from a project](use-cases/delete-a-role-from-a-project/): Remove a role that is no longer needed
- [Add a use case to a project](use-cases/add-a-use-case-to-a-project/): Define a new interaction or workflow for the project
- [Edit a use case in a project](use-cases/edit-a-use-case-in-a-project/): Rename or update the description of an existing use case
- [Delete a use case from a project](use-cases/delete-a-use-case-from-a-project/): Remove a use case that is no longer relevant
- [Create a data domain](use-cases/create-a-data-domain/): Define a new logical grouping of related data
- [Edit a data domain](use-cases/edit-a-data-domain/): Rename or update the description of a data domain
- [Delete a data domain](use-cases/delete-a-data-domain/): Remove a data domain and its attributes
- [View a data domain](use-cases/view-a-data-domain/): Inspect the details and attributes of a data domain
- [View saved data domains](use-cases/view-saved-data-domains/): Browse all data domains defined in the project
- [Add a data domain to a use case](use-cases/add-a-data-domain-to-a-use-case/): Link an existing data domain to a use case
- [Create a data domain then add to a use case](use-cases/create-a-data-domain-then-add-to-a-use-case/): Create a new data domain and immediately link it to a use case
- [Add a data domain attribute](use-cases/add-a-data-domain-attribute/): Define a new property for a data domain
- [Edit a data domain attribute](use-cases/edit-a-data-domain-attribute/): Rename or update the description of a data domain attribute
- [Delete a data domain attribute](use-cases/delete-a-data-domain-attribute/): Remove a property from a data domain
- [Download documentation as ZIP](use-cases/download-documentation-as-zip/): Export the full project specification as a ZIP archive of markdown files
- [Use the app offline (PWA)](use-cases/use-the-app-offline-pwa/): Install and use the application without an internet connection
- [Deploy app to GitHub Pages](use-cases/deploy-app-to-github-pages/): Publish the application to GitHub Pages via CI/CD

## Data Domains

- [Project](data-domains/project/): A collection of roles, use cases, and data domains that define an application specification
- [Role](data-domains/role/): An actor or user type that participates in use cases
- [Use Case](data-domains/use-case/): A specific interaction or workflow performed by one or more roles
- [Data Domain](data-domains/data-domain/): A logical grouping of related data with typed attributes
- [Data Domain Attribute](data-domains/data-domain-attribute/): A named property of a data domain with an optional description
