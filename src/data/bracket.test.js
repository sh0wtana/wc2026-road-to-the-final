import { describe, it, expect } from 'vitest'
import {
  R32_MATCHES,
  R16_FEED,
  QF_FEED,
  SF_FEED,
  FINAL_FEED,
  THIRD_PLACE_SLOTS,
} from './bracket.js'

const VALID_GROUPS = new Set('ABCDEFGHIJKL'.split(''))
const R32_IDS = new Set(R32_MATCHES.map((m) => m.id))
const R16_IDS = new Set(Object.keys(R16_FEED))
const QF_IDS = new Set(Object.keys(QF_FEED))
const SF_IDS = new Set(Object.keys(SF_FEED))

describe('R32_MATCHES', () => {
  it('has exactly 16 matches', () => {
    expect(R32_MATCHES).toHaveLength(16)
  })

  it('all match IDs are unique', () => {
    expect(R32_IDS.size).toBe(16)
  })

  it('home slots are 1st or 2nd place from a valid group', () => {
    for (const m of R32_MATCHES) {
      expect(['1', '2']).toContain(m.home[0])
      expect(VALID_GROUPS.has(m.home[1])).toBe(true)
    }
  })

  it('away slots are 2nd-place or third-place slots', () => {
    for (const m of R32_MATCHES) {
      const isSecond =
        m.away.length === 2 && m.away[0] === '2' && VALID_GROUPS.has(m.away[1])
      const isThird =
        m.away.startsWith('3') &&
        [...m.away.slice(1)].every((g) => VALID_GROUPS.has(g))
      expect(isSecond || isThird, `away="${m.away}" in ${m.id}`).toBe(true)
    }
  })
})

describe('THIRD_PLACE_SLOTS', () => {
  it('has exactly 8 slots', () => {
    expect(THIRD_PLACE_SLOTS).toHaveLength(8)
  })

  it('matches the away slots in R32_MATCHES exactly', () => {
    const thirdAways = R32_MATCHES.map((m) => m.away)
      .filter((a) => a.startsWith('3'))
      .sort()
    expect([...THIRD_PLACE_SLOTS].sort()).toEqual(thirdAways)
  })

  it('each slot references only valid groups', () => {
    for (const slot of THIRD_PLACE_SLOTS) {
      for (const g of slot.slice(1)) {
        expect(VALID_GROUPS.has(g), `"${g}" in slot ${slot}`).toBe(true)
      }
    }
  })

  it('each slot covers at least 4 groups', () => {
    for (const slot of THIRD_PLACE_SLOTS) {
      expect(slot.length - 1, slot).toBeGreaterThanOrEqual(4)
    }
  })
})

describe('feed completeness', () => {
  it('every R32 match feeds into exactly one R16 match', () => {
    const r16Feeders = Object.values(R16_FEED).flat()
    for (const id of R32_IDS) {
      expect(
        r16Feeders.filter((f) => f === id),
        `${id} in R16_FEED`
      ).toHaveLength(1)
    }
  })

  it('every R16 match feeds into exactly one QF match', () => {
    const qfFeeders = Object.values(QF_FEED).flat()
    for (const id of R16_IDS) {
      expect(
        qfFeeders.filter((f) => f === id),
        `${id} in QF_FEED`
      ).toHaveLength(1)
    }
  })

  it('every QF match feeds into exactly one SF match', () => {
    const sfFeeders = Object.values(SF_FEED).flat()
    for (const id of QF_IDS) {
      expect(
        sfFeeders.filter((f) => f === id),
        `${id} in SF_FEED`
      ).toHaveLength(1)
    }
  })

  it('both SF matches feed the Final', () => {
    expect(FINAL_FEED.sort()).toEqual([...SF_IDS].sort())
  })

  it('R16_FEED references only R32 match IDs', () => {
    for (const id of Object.values(R16_FEED).flat()) {
      expect(R32_IDS.has(id), id).toBe(true)
    }
  })

  it('QF_FEED references only R16 match IDs', () => {
    for (const id of Object.values(QF_FEED).flat()) {
      expect(R16_IDS.has(id), id).toBe(true)
    }
  })

  it('SF_FEED references only QF match IDs', () => {
    for (const id of Object.values(SF_FEED).flat()) {
      expect(QF_IDS.has(id), id).toBe(true)
    }
  })
})
