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

// Plain (non-reactive) arrays — avoids any Svelte reactivity firing during dnd events
const _past = []
const _future = []

// Small reactive object only for driving the UI button states
const _ui = $state({ canUndo: false, canRedo: false })

export function canUndo() { return _ui.canUndo }
export function canRedo() { return _ui.canRedo }

function snapshot() {
  return $state.snapshot({
    groups: state.groups,
    thirdPlaceAssignments: state.thirdPlaceAssignments,
    matchWinners: state.matchWinners,
  })
}

function applySnapshot(snap) {
  state.groups = structuredClone(snap.groups)
  state.thirdPlaceAssignments = structuredClone(snap.thirdPlaceAssignments)
  state.matchWinners = structuredClone(snap.matchWinners)
}

export function pushSnapshot() {
  _past.push(snapshot())
  _future.length = 0
  _ui.canUndo = true
  _ui.canRedo = false
}

export function undo() {
  if (!_past.length) return
  _future.unshift(snapshot())
  applySnapshot(_past.pop())
  _ui.canUndo = _past.length > 0
  _ui.canRedo = true
}

export function redo() {
  if (!_future.length) return
  _past.push(snapshot())
  applySnapshot(_future.shift())
  _ui.canUndo = true
  _ui.canRedo = _future.length > 0
}

export function resetState() {
  const fresh = makeInitialState()
  state.groups = fresh.groups
  state.thirdPlaceAssignments = fresh.thirdPlaceAssignments
  state.matchWinners = fresh.matchWinners
  _past.length = 0
  _future.length = 0
  _ui.canUndo = false
  _ui.canRedo = false
}
