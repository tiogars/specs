import { describe, expect, it } from 'vitest'
import { parseLines } from './parseLines'

describe('parseLines', () => {
  it('trims each line and removes empty entries', () => {
    expect(parseLines('  first value  \n\n second value \n\tthird value\t')).toEqual([
      'first value',
      'second value',
      'third value',
    ])
  })

  it('handles Windows line endings and preserves inner spacing', () => {
    expect(parseLines('  alpha  \r\n beta   gamma \r\n\r\n delta ')).toEqual(['alpha', 'beta   gamma', 'delta'])
  })
})