import { describe, it, expect } from 'vitest'
import { DEFAULT_GROUPS } from './teams.js'

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
const allTeams = ALL_GROUPS.flatMap(g => DEFAULT_GROUPS[g].map(t => ({ ...t, group: g })))

describe('DEFAULT_GROUPS structure', () => {
  it('has exactly 12 groups (A–L)', () => {
    expect(Object.keys(DEFAULT_GROUPS).sort()).toEqual(ALL_GROUPS)
  })

  it('every group has exactly 4 teams', () => {
    for (const g of ALL_GROUPS) {
      expect(DEFAULT_GROUPS[g], `Group ${g}`).toHaveLength(4)
    }
  })

  it('has exactly 48 teams total', () => {
    expect(allTeams).toHaveLength(48)
  })

  it('all team IDs are unique', () => {
    const ids = allTeams.map(t => t.id)
    expect(new Set(ids).size).toBe(48)
  })
})

describe('team fields', () => {
  it.each(allTeams)('$id ($group) has required fields', ({ id, name, flag, rank }) => {
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    expect(typeof name).toBe('string')
    expect(name.length).toBeGreaterThan(0)
    expect(typeof flag).toBe('string')
    expect(flag.length).toBeGreaterThan(0)
    expect(typeof rank).toBe('number')
    expect(rank).toBeGreaterThan(0)
    expect(Number.isInteger(rank)).toBe(true)
  })
})
