import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PROJECT_ACTION_TYPES,
  DEFAULT_PROJECT_DATA_DOMAINS,
  DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES,
  DEFAULT_PROJECT_NAME,
  DEFAULT_PROJECT_ROLES,
  DEFAULT_PROJECT_USE_CASE_ACTION_TYPES,
  DEFAULT_PROJECT_USE_CASES,
  DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS,
  DEFAULT_PROJECT_USE_CASE_ROLES,
} from './projectRepository'

describe('default project repository fixtures', () => {
  it('keeps seeded metadata aligned across roles, use cases, action types, and data domains', () => {
    expect(DEFAULT_PROJECT_NAME).toBe('specs (default)')

    const useCaseNames = DEFAULT_PROJECT_USE_CASES.map((useCase) => useCase.name)
    const roleNames = DEFAULT_PROJECT_ROLES.map((role) => role.name)
    const dataDomainNames = DEFAULT_PROJECT_DATA_DOMAINS.map((domain) => domain.name)

    for (const useCaseName of Object.keys(DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS)) {
      expect(useCaseNames).toContain(useCaseName)
      expect(DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS[useCaseName]).toBeDefined()
    }

    for (const useCaseName of Object.keys(DEFAULT_PROJECT_USE_CASE_ROLES)) {
      expect(useCaseNames).toContain(useCaseName)
      expect(DEFAULT_PROJECT_USE_CASE_ROLES[useCaseName]).toBeDefined()
    }

    for (const useCaseName of Object.keys(DEFAULT_PROJECT_USE_CASE_ACTION_TYPES)) {
      expect(useCaseNames).toContain(useCaseName)
      expect(DEFAULT_PROJECT_USE_CASE_ACTION_TYPES[useCaseName]).toBeDefined()
    }

    for (const domainName of dataDomainNames) {
      expect(DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES[domainName]).toBeDefined()
    }

    expect(roleNames).toEqual(['End User', 'Developer', 'DevOps Engineer'])
    expect(DEFAULT_PROJECT_USE_CASE_ROLES['Deploy app to GitHub Pages']).toEqual(['DevOps Engineer'])
    expect(DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS['Download documentation as ZIP']).toEqual(['Project'])
    expect(DEFAULT_PROJECT_USE_CASE_ACTION_TYPES['Create an actionType']).toEqual(['Create'])
    expect(DEFAULT_PROJECT_ACTION_TYPES.length).toBeGreaterThan(0)
  })
})