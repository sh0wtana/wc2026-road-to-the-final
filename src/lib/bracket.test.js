import { describe, it, expect } from 'vitest'
import {
  getTeamForSlot,
  getEligibleThirdPlaceTeams,
  findTeamById,
  getR32Teams,
  getPostR32Teams,
} from './bracket.js'
import { DEFAULT_GROUPS } from '../data/teams.js'
import { R16_FEED, QF_FEED, SF_FEED } from '../data/bracket.js'

describe('getTeamForSlot', () => {
  it('returns 1st-place team for "1A"', () => {
    expect(getTeamForSlot('1A', DEFAULT_GROUPS)).toEqual(DEFAULT_GROUPS.A[0])
  })
  it('returns 2nd-place team for "2B"', () => {
    expect(getTeamForSlot('2B', DEFAULT_GROUPS)).toEqual(DEFAULT_GROUPS.B[1])
  })
  it('returns null for 3rd-place slot keys', () => {
    expect(getTeamForSlot('3ABCDF', DEFAULT_GROUPS)).toBe(null)
  })
})

describe('getEligibleThirdPlaceTeams', () => {
  it('returns 3rd-place teams from eligible groups', () => {
    const result = getEligibleThirdPlaceTeams('3ABCDF', DEFAULT_GROUPS)
    expect(result).toHaveLength(5)
    expect(result[0]).toEqual({ ...DEFAULT_GROUPS.A[2], group: 'A' })
    expect(result[4]).toEqual({ ...DEFAULT_GROUPS.F[2], group: 'F' })
  })
  it('excludes groups not in the slot key', () => {
    const result = getEligibleThirdPlaceTeams('3ABCDF', DEFAULT_GROUPS)
    const ids = result.map(t => t.id)
    expect(ids).not.toContain(DEFAULT_GROUPS.E[2].id)
  })
})

describe('findTeamById', () => {
  it('finds a team across all groups', () => {
    expect(findTeamById('BRA', DEFAULT_GROUPS)).toEqual({ ...DEFAULT_GROUPS.C[0], group: 'C' })
  })
  it('returns null for unknown id', () => {
    expect(findTeamById('ZZZ', DEFAULT_GROUPS)).toBe(null)
  })
  it('returns null for null input', () => {
    expect(findTeamById(null, DEFAULT_GROUPS)).toBe(null)
  })
})

describe('getR32Teams', () => {
  it('resolves 1st/2nd-place slots', () => {
    const { home, away } = getR32Teams(
      { id: 'm3', home: '2A', away: '2B' },
      DEFAULT_GROUPS,
      {}
    )
    expect(home).toEqual(DEFAULT_GROUPS.A[1])
    expect(away).toEqual(DEFAULT_GROUPS.B[1])
  })
  it('resolves an assigned 3rd-place slot', () => {
    const { away } = getR32Teams(
      { id: 'm1', home: '1E', away: '3ABCDF' },
      DEFAULT_GROUPS,
      { '3ABCDF': 'KOR' }
    )
    expect(away).toEqual({ ...DEFAULT_GROUPS.A[2], group: 'A' })
  })
  it('returns null for unassigned 3rd-place slot', () => {
    const { away } = getR32Teams(
      { id: 'm1', home: '1E', away: '3ABCDF' },
      DEFAULT_GROUPS,
      { '3ABCDF': null }
    )
    expect(away).toBe(null)
  })
})

describe('getPostR32Teams', () => {
  it('returns two R32 winners for an R16 match', () => {
    const matchWinners = { m1: 'GER', m2: 'FRA' }
    const { home, away } = getPostR32Teams('l-r16-m1', matchWinners, R16_FEED, QF_FEED, SF_FEED, DEFAULT_GROUPS)
    expect(home.id).toBe('GER')
    expect(away.id).toBe('FRA')
  })
  it('returns null when a feeder has no winner yet', () => {
    const matchWinners = { m1: 'GER', m2: null }
    const { away } = getPostR32Teams('l-r16-m1', matchWinners, R16_FEED, QF_FEED, SF_FEED, DEFAULT_GROUPS)
    expect(away).toBe(null)
  })
})
