import { DEFAULT_GROUPS } from './data/teams.js'
import { THIRD_PLACE_SLOTS } from './data/bracket.js'

function makeInitialState() {
  return {
    groups: structuredClone(DEFAULT_GROUPS),
    thirdPlaceAssignments: Object.fromEntries(THIRD_PLACE_SLOTS.map(s => [s, null])),
    matchWinners: {
      m1: null, m2: null, m3: null, m4: null,
      m5: null, m6: null, m7: null, m8: null,
      m9: null, m10: null, m11: null, m12: null,
      m13: null, m14: null, m15: null, m16: null,
      'l-r16-m1': null, 'l-r16-m2': null, 'l-r16-m3': null, 'l-r16-m4': null,
      'r-r16-m1': null, 'r-r16-m2': null, 'r-r16-m3': null, 'r-r16-m4': null,
      'l-qf-m1': null, 'l-qf-m2': null, 'r-qf-m1': null, 'r-qf-m2': null,
      'l-sf': null, 'r-sf': null,
      final: null, bronze: null,
    }
  }
}

export const state = $state(makeInitialState())

export function resetState() {
  const fresh = makeInitialState()
  state.groups = fresh.groups
  state.thirdPlaceAssignments = fresh.thirdPlaceAssignments
  state.matchWinners = fresh.matchWinners
}
