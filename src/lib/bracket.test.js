import { describe, it, expect } from 'vitest'
import {
  getTeamForSlot,
  getEligibleThirdPlaceTeams,
  findTeamById,
  getR32Teams,
  getPostR32Teams,
  winnerClearedByThirdChange,
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
    const ids = result.map((t) => t.id)
    expect(ids).not.toContain(DEFAULT_GROUPS.E[2].id)
  })
})

describe('findTeamById', () => {
  it('finds a team across all groups', () => {
    expect(findTeamById('BRA', DEFAULT_GROUPS)).toEqual({
      ...DEFAULT_GROUPS.C[0],
      group: 'C',
    })
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
    const { home, away } = getPostR32Teams(
      'l-r16-m1',
      matchWinners,
      R16_FEED,
      QF_FEED,
      SF_FEED,
      DEFAULT_GROUPS
    )
    expect(home.id).toBe('GER')
    expect(away.id).toBe('FRA')
  })

  it('returns null when a feeder has no winner yet', () => {
    const matchWinners = { m1: 'GER', m2: null }
    const { away } = getPostR32Teams(
      'l-r16-m1',
      matchWinners,
      R16_FEED,
      QF_FEED,
      SF_FEED,
      DEFAULT_GROUPS
    )
    expect(away).toBe(null)
  })

  it('resolves QF match from R16 winners', () => {
    const matchWinners = { 'l-r16-m1': 'GER', 'l-r16-m2': 'ESP' }
    const { home, away } = getPostR32Teams(
      'l-qf-m1',
      matchWinners,
      R16_FEED,
      QF_FEED,
      SF_FEED,
      DEFAULT_GROUPS
    )
    expect(home.id).toBe('GER')
    expect(away.id).toBe('ESP')
  })

  it('resolves SF match from QF winners', () => {
    const matchWinners = {
      m1: 'GER',
      m2: 'FRA',
      m3: 'ESP',
      m4: 'BRA',
      m5: 'ARG',
      m6: 'ENG',
      m7: 'POR',
      m8: 'NED',
      'l-r16-m1': 'GER',
      'l-r16-m2': 'ESP',
      'l-r16-m3': 'ARG',
      'l-r16-m4': 'POR',
      'l-qf-m1': 'GER',
      'l-qf-m2': 'ARG',
    }
    const { home, away } = getPostR32Teams(
      'l-sf',
      matchWinners,
      R16_FEED,
      QF_FEED,
      SF_FEED,
      DEFAULT_GROUPS
    )
    expect(home.id).toBe('GER')
    expect(away.id).toBe('ARG')
  })

  it('returns both null for an unknown matchId', () => {
    const { home, away } = getPostR32Teams(
      'unknown',
      {},
      R16_FEED,
      QF_FEED,
      SF_FEED,
      DEFAULT_GROUPS
    )
    expect(home).toBe(null)
    expect(away).toBe(null)
  })
})

describe('getEligibleThirdPlaceTeams', () => {
  it('returns teams in group order matching the slot key', () => {
    const result = getEligibleThirdPlaceTeams('3ABCDF', DEFAULT_GROUPS)
    const groups = result.map((t) => t.group)
    expect(groups).toEqual(['A', 'B', 'C', 'D', 'F'])
  })

  it('always attaches the group property', () => {
    const result = getEligibleThirdPlaceTeams('3DEIJL', DEFAULT_GROUPS)
    for (const team of result) {
      expect(team).toHaveProperty('group')
      expect('ABCDEFGHIJKL').toContain(team.group)
    }
  })
})

describe('winnerClearedByThirdChange', () => {
  it('clears when the current winner was the old 3rd-place team', () => {
    expect(winnerClearedByThirdChange('ENG', 'ENG')).toBe(true)
  })

  it('preserves winner when home team won (not the old 3rd-place team)', () => {
    expect(winnerClearedByThirdChange('BRA', 'ENG')).toBe(false)
  })

  it('does not clear when no winner is set yet', () => {
    expect(winnerClearedByThirdChange(null, 'ENG')).toBe(false)
  })

  it('does not clear when no prior 3rd-place assignment exists', () => {
    expect(winnerClearedByThirdChange('BRA', null)).toBe(false)
  })

  it('does not clear when neither winner nor old assignment exists', () => {
    expect(winnerClearedByThirdChange(null, null)).toBe(false)
  })
})
