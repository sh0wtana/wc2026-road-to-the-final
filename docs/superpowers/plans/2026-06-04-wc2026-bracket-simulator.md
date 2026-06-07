# WC2026 Bracket Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page browser app where users drag-and-drop to rank 12 World Cup groups, then simulate the knockout bracket by manually picking match winners round by round.

**Architecture:** Global reactive state in `store.svelte.js` holds group rankings, 3rd-place slot assignments, and match winners. Pure helper functions in `src/lib/bracket.js` resolve slot keys to teams and feed data between rounds. Svelte 5 components re-render reactively as state changes. No backend, no persistence.

**Tech Stack:** Svelte 5 + Vite, Tailwind CSS v4, svelte-dnd-action, Vitest (logic only), Cloudflare Pages

---

## File Map

| File | Purpose |
|---|---|
| `src/data/teams.js` | 48 hardcoded teams keyed by group A–L |
| `src/data/bracket.js` | R32 match definitions, R16/QF/SF feed maps, 3rd-place slot keys |
| `src/lib/bracket.js` | Pure functions: resolve slot → team, get eligible 3rd-place teams, feed match teams |
| `src/lib/bracket.test.js` | Vitest unit tests for all bracket.js exports |
| `src/store.svelte.js` | Global `$state`: groups, thirdPlaceAssignments, matchWinners + resetState() |
| `src/components/Header.svelte` | Title + Reset button |
| `src/components/GroupCard.svelte` | Draggable 4-team list for one group using svelte-dnd-action |
| `src/components/GroupSection.svelte` | Responsive 2-row × 6-col grid of GroupCards |
| `src/components/TeamPicker.svelte` | Modal to pick a team from a list (used for 3rd-place + winner picks) |
| `src/components/BracketMatch.svelte` | Single match slot: display-only or pickable, opens TeamPicker |
| `src/components/Bracket.svelte` | Full both-sides bracket layout across all rounds |
| `src/App.svelte` | Root: composes Header + GroupSection + Bracket |

---

## Task 1: Scaffold the project

**Files:**
- Create: `wc2026-bracket/` (project root)
- Modify: `vite.config.js`
- Modify: `src/app.css`
- Modify: `src/App.svelte`
- Modify: `src/main.js`

- [ ] **Step 1: Create Svelte + Vite project**

Run inside `/Users/apple/Desktop/`:
```bash
npm create vite@latest wc2026-bracket -- --template svelte
cd wc2026-bracket
npm install
```

- [ ] **Step 2: Install dependencies**

```bash
npm install svelte-dnd-action
npm install -D tailwindcss @tailwindcss/vite vitest
```

- [ ] **Step 3: Replace vite.config.js**

```js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  test: { environment: 'node' }
})
```

- [ ] **Step 4: Replace src/app.css**

```css
@import "tailwindcss";
```

- [ ] **Step 5: Delete default boilerplate**

```bash
rm -f src/lib/Counter.svelte src/assets/svelte.svg public/vite.svg
```

- [ ] **Step 6: Replace src/main.js**

```js
import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'

const app = mount(App, { target: document.getElementById('app') })
export default app
```

- [ ] **Step 7: Replace src/App.svelte**

```svelte
<script>
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <p class="p-4">hello</p>
</div>
```

- [ ] **Step 8: Verify it runs**

```bash
npm run dev
```

Expected: browser opens, shows "hello" on a dark background, no console errors.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Svelte + Vite + Tailwind project"
```

---

## Task 2: Team and bracket data

**Files:**
- Create: `src/data/teams.js`
- Create: `src/data/bracket.js`

- [ ] **Step 1: Create src/data/teams.js**

```js
export const DEFAULT_GROUPS = {
  A: [
    { id: 'MEX', name: 'Mexico',              flag: '🇲🇽' },
    { id: 'RSA', name: 'South Africa',         flag: '🇿🇦' },
    { id: 'KOR', name: 'South Korea',          flag: '🇰🇷' },
    { id: 'CZE', name: 'Czech Republic',       flag: '🇨🇿' },
  ],
  B: [
    { id: 'CAN', name: 'Canada',               flag: '🇨🇦' },
    { id: 'BIH', name: 'Bosnia & Herzegovina', flag: '🇧🇦' },
    { id: 'QAT', name: 'Qatar',                flag: '🇶🇦' },
    { id: 'SUI', name: 'Switzerland',          flag: '🇨🇭' },
  ],
  C: [
    { id: 'BRA', name: 'Brazil',               flag: '🇧🇷' },
    { id: 'MAR', name: 'Morocco',              flag: '🇲🇦' },
    { id: 'HTI', name: 'Haiti',                flag: '🇭🇹' },
    { id: 'SCO', name: 'Scotland',             flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { id: 'USA', name: 'United States',        flag: '🇺🇸' },
    { id: 'PAR', name: 'Paraguay',             flag: '🇵🇾' },
    { id: 'AUS', name: 'Australia',            flag: '🇦🇺' },
    { id: 'TUR', name: 'Turkey',               flag: '🇹🇷' },
  ],
  E: [
    { id: 'GER', name: 'Germany',              flag: '🇩🇪' },
    { id: 'CUW', name: 'Curaçao',              flag: '🇨🇼' },
    { id: 'CIV', name: 'Ivory Coast',          flag: '🇨🇮' },
    { id: 'ECU', name: 'Ecuador',              flag: '🇪🇨' },
  ],
  F: [
    { id: 'NED', name: 'Netherlands',          flag: '🇳🇱' },
    { id: 'JPN', name: 'Japan',                flag: '🇯🇵' },
    { id: 'SWE', name: 'Sweden',               flag: '🇸🇪' },
    { id: 'TUN', name: 'Tunisia',              flag: '🇹🇳' },
  ],
  G: [
    { id: 'BEL', name: 'Belgium',              flag: '🇧🇪' },
    { id: 'EGY', name: 'Egypt',                flag: '🇪🇬' },
    { id: 'IRN', name: 'Iran',                 flag: '🇮🇷' },
    { id: 'NZL', name: 'New Zealand',          flag: '🇳🇿' },
  ],
  H: [
    { id: 'ESP', name: 'Spain',                flag: '🇪🇸' },
    { id: 'CPV', name: 'Cape Verde',           flag: '🇨🇻' },
    { id: 'KSA', name: 'Saudi Arabia',         flag: '🇸🇦' },
    { id: 'URU', name: 'Uruguay',              flag: '🇺🇾' },
  ],
  I: [
    { id: 'FRA', name: 'France',               flag: '🇫🇷' },
    { id: 'SEN', name: 'Senegal',              flag: '🇸🇳' },
    { id: 'IRQ', name: 'Iraq',                 flag: '🇮🇶' },
    { id: 'NOR', name: 'Norway',               flag: '🇳🇴' },
  ],
  J: [
    { id: 'ARG', name: 'Argentina',            flag: '🇦🇷' },
    { id: 'ALG', name: 'Algeria',              flag: '🇩🇿' },
    { id: 'AUT', name: 'Austria',              flag: '🇦🇹' },
    { id: 'JOR', name: 'Jordan',               flag: '🇯🇴' },
  ],
  K: [
    { id: 'POR', name: 'Portugal',             flag: '🇵🇹' },
    { id: 'COD', name: 'DR Congo',             flag: '🇨🇩' },
    { id: 'UZB', name: 'Uzbekistan',           flag: '🇺🇿' },
    { id: 'COL', name: 'Colombia',             flag: '🇨🇴' },
  ],
  L: [
    { id: 'ENG', name: 'England',              flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'CRO', name: 'Croatia',              flag: '🇭🇷' },
    { id: 'GHA', name: 'Ghana',                flag: '🇬🇭' },
    { id: 'PAN', name: 'Panama',               flag: '🇵🇦' },
  ],
}
```

- [ ] **Step 2: Create src/data/bracket.js**

```js
export const R32_MATCHES = [
  { id: 'm1',  home: '1E',  away: '3ABCDF' },
  { id: 'm2',  home: '1I',  away: '3CDFGH' },
  { id: 'm3',  home: '2A',  away: '2B'     },
  { id: 'm4',  home: '1F',  away: '2C'     },
  { id: 'm5',  home: '2K',  away: '2L'     },
  { id: 'm6',  home: '1H',  away: '2J'     },
  { id: 'm7',  home: '1D',  away: '3BEFIJ' },
  { id: 'm8',  home: '1G',  away: '3AEHIJ' },
  { id: 'm9',  home: '1C',  away: '2F'     },
  { id: 'm10', home: '2E',  away: '2I'     },
  { id: 'm11', home: '1A',  away: '3CEFHI' },
  { id: 'm12', home: '1L',  away: '3EHIJK' },
  { id: 'm13', home: '1J',  away: '2H'     },
  { id: 'm14', home: '2D',  away: '2G'     },
  { id: 'm15', home: '1B',  away: '3EFGIJ' },
  { id: 'm16', home: '1K',  away: '3DEIJL' },
]

export const R16_FEED = {
  'l-r16-m1': ['m1',  'm2'],
  'l-r16-m2': ['m3',  'm4'],
  'l-r16-m3': ['m5',  'm6'],
  'l-r16-m4': ['m7',  'm8'],
  'r-r16-m1': ['m9',  'm10'],
  'r-r16-m2': ['m11', 'm12'],
  'r-r16-m3': ['m13', 'm14'],
  'r-r16-m4': ['m15', 'm16'],
}

export const QF_FEED = {
  'l-qf-m1': ['l-r16-m1', 'l-r16-m2'],
  'l-qf-m2': ['l-r16-m3', 'l-r16-m4'],
  'r-qf-m1': ['r-r16-m1', 'r-r16-m2'],
  'r-qf-m2': ['r-r16-m3', 'r-r16-m4'],
}

export const SF_FEED = {
  'l-sf': ['l-qf-m1', 'l-qf-m2'],
  'r-sf': ['r-qf-m1', 'r-qf-m2'],
}

export const FINAL_FEED = ['l-sf', 'r-sf']

export const THIRD_PLACE_SLOTS = [
  '3ABCDF', '3CDFGH', '3BEFIJ', '3AEHIJ',
  '3CEFHI', '3EHIJK', '3EFGIJ', '3DEIJL',
]
```

- [ ] **Step 3: Commit**

```bash
git add src/data/
git commit -m "feat: add hardcoded team and bracket data"
```

---

## Task 3: Bracket logic helpers (TDD)

**Files:**
- Create: `src/lib/bracket.js`
- Create: `src/lib/bracket.test.js`

- [ ] **Step 1: Write failing tests — create src/lib/bracket.test.js**

```js
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
    expect(result[0]).toEqual(DEFAULT_GROUPS.A[2])
    expect(result[4]).toEqual(DEFAULT_GROUPS.F[2])
  })
  it('excludes groups not in the slot key', () => {
    const result = getEligibleThirdPlaceTeams('3ABCDF', DEFAULT_GROUPS)
    const ids = result.map(t => t.id)
    expect(ids).not.toContain(DEFAULT_GROUPS.E[2].id)
  })
})

describe('findTeamById', () => {
  it('finds a team across all groups', () => {
    expect(findTeamById('BRA', DEFAULT_GROUPS)).toEqual(DEFAULT_GROUPS.C[0])
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
    expect(away).toEqual(DEFAULT_GROUPS.A[2])
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
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/lib/bracket.test.js
```

Expected: FAIL — `bracket.js` not found.

- [ ] **Step 3: Implement src/lib/bracket.js**

```js
export function getTeamForSlot(slot, groups) {
  if (slot.startsWith('3')) return null
  const rank = slot[0] === '1' ? 0 : 1
  return groups[slot[1]]?.[rank] ?? null
}

export function getEligibleThirdPlaceTeams(slotKey, groups) {
  return slotKey.slice(1).split('').map(g => groups[g]?.[2]).filter(Boolean)
}

export function findTeamById(id, groups) {
  if (!id) return null
  for (const group of Object.values(groups)) {
    const t = group.find(t => t.id === id)
    if (t) return t
  }
  return null
}

export function getR32Teams(match, groups, thirdPlaceAssignments) {
  const resolve = (slot) => {
    if (!slot.startsWith('3')) return getTeamForSlot(slot, groups)
    const id = thirdPlaceAssignments[slot]
    return id ? findTeamById(id, groups) : null
  }
  return { home: resolve(match.home), away: resolve(match.away) }
}

export function getPostR32Teams(matchId, matchWinners, R16_FEED, QF_FEED, SF_FEED, groups) {
  const feedMap = { ...R16_FEED, ...QF_FEED, ...SF_FEED }
  const [feedA, feedB] = feedMap[matchId] ?? []
  if (!feedA || !feedB) return { home: null, away: null }
  const resolve = (id) => {
    const winnerId = matchWinners[id]
    return winnerId ? findTeamById(winnerId, groups) : null
  }
  return { home: resolve(feedA), away: resolve(feedB) }
}
```

- [ ] **Step 4: Run tests — confirm all pass**

```bash
npx vitest run src/lib/bracket.test.js
```

Expected: 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add bracket logic helpers with tests"
```

---

## Task 4: Global state store

**Files:**
- Create: `src/store.svelte.js`

- [ ] **Step 1: Create src/store.svelte.js**

```js
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
```

- [ ] **Step 2: Verify build succeeds**

```bash
npm run build
```

Expected: build completes, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/store.svelte.js
git commit -m "feat: add global state store"
```

---

## Task 5: Header component

**Files:**
- Create: `src/components/Header.svelte`
- Modify: `src/App.svelte`

- [ ] **Step 1: Create src/components/Header.svelte**

```svelte
<script>
  let { onReset } = $props()
</script>

<header class="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
  <h1 class="text-lg font-bold tracking-wide">🏆 FIFA World Cup 2026 Simulator</h1>
  <button
    onclick={onReset}
    class="px-4 py-1.5 text-sm bg-red-700 hover:bg-red-600 rounded font-medium transition-colors"
  >
    Reset
  </button>
</header>
```

- [ ] **Step 2: Update src/App.svelte**

```svelte
<script>
  import Header from './components/Header.svelte'
  import { resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
</div>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: dark header with "🏆 FIFA World Cup 2026 Simulator" on the left, red "Reset" button on the right.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.svelte src/App.svelte
git commit -m "feat: add Header component"
```

---

## Task 6: GroupCard component

**Files:**
- Create: `src/components/GroupCard.svelte`
- Modify: `src/App.svelte` (smoke test, then revert to clean state)

- [ ] **Step 1: Create src/components/GroupCard.svelte**

```svelte
<script>
  import { dndzone } from 'svelte-dnd-action'

  let { group, teams, onReorder } = $props()

  const BADGES = ['①', '②', '③', '④']

  function handleSort(e) {
    onReorder(e.detail.items)
  }
</script>

<div class="bg-gray-800 rounded-lg p-3 min-w-[140px]">
  <div class="text-xs font-bold text-gray-400 text-center mb-2 tracking-widest">GROUP {group}</div>
  <div
    use:dndzone={{ items: teams, flipDurationMs: 150 }}
    onfinalize={handleSort}
    onconsider={handleSort}
    class="flex flex-col gap-1"
  >
    {#each teams as team, i (team.id)}
      <div class="flex items-center gap-1.5 bg-gray-700 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing select-none text-sm">
        <span class="text-gray-500 text-xs">⠿</span>
        <span>{team.flag}</span>
        <span class="font-medium">{team.id}</span>
        <span class="ml-auto text-xs text-gray-400">{BADGES[i]}</span>
      </div>
    {/each}
  </div>
</div>
```

- [ ] **Step 2: Smoke test in App.svelte**

Replace `src/App.svelte` with:

```svelte
<script>
  import Header from './components/Header.svelte'
  import GroupCard from './components/GroupCard.svelte'
  import { state, resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
  <div class="p-4">
    <GroupCard
      group="A"
      teams={state.groups.A}
      onReorder={(items) => { state.groups.A = items }}
    />
  </div>
</div>
```

```bash
npm run dev
```

Expected: Group A card renders with 4 teams. Drag a team to reorder — badge numbers update reactively. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/GroupCard.svelte src/App.svelte
git commit -m "feat: add GroupCard with drag-and-drop"
```

---

## Task 7: GroupSection component

**Files:**
- Create: `src/components/GroupSection.svelte`
- Modify: `src/App.svelte`

- [ ] **Step 1: Create src/components/GroupSection.svelte**

```svelte
<script>
  import GroupCard from './GroupCard.svelte'
  import { state } from '../store.svelte.js'

  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
</script>

<section class="px-4 py-4 border-b border-gray-800">
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
    {#each GROUPS as g}
      <GroupCard
        group={g}
        teams={state.groups[g]}
        onReorder={(items) => { state.groups[g] = items }}
      />
    {/each}
  </div>
</section>
```

- [ ] **Step 2: Update src/App.svelte**

```svelte
<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import { resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
  <GroupSection />
</div>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: all 12 group cards in a responsive grid (6 per row on desktop, 2 on mobile). Dragging in any card works independently.

- [ ] **Step 4: Commit**

```bash
git add src/components/GroupSection.svelte src/App.svelte
git commit -m "feat: add GroupSection with all 12 groups"
```

---

## Task 8: TeamPicker modal

**Files:**
- Create: `src/components/TeamPicker.svelte`

- [ ] **Step 1: Create src/components/TeamPicker.svelte**

```svelte
<script>
  let { title, teams, onPick, onClose } = $props()
</script>

<div
  class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  onclick={onClose}
  role="dialog"
  aria-modal="true"
>
  <div
    class="bg-gray-800 rounded-xl p-5 min-w-[230px] shadow-2xl border border-gray-700"
    onclick={(e) => e.stopPropagation()}
  >
    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
    <div class="flex flex-col gap-2">
      {#each teams as team (team.id)}
        <button
          onclick={() => onPick(team)}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-700 hover:bg-blue-600 transition-colors text-left"
        >
          <span class="text-xl">{team.flag}</span>
          <span class="font-medium">{team.name}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Smoke test — temporarily add to App.svelte**

Add to the bottom of `src/App.svelte`:

```svelte
<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import TeamPicker from './components/TeamPicker.svelte'
  import { state, resetState } from './store.svelte.js'

  let showPicker = $state(false)
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
  <GroupSection />
  <button onclick={() => showPicker = true} class="m-4 px-4 py-2 bg-blue-600 rounded text-sm">
    Test Picker
  </button>
  {#if showPicker}
    <TeamPicker
      title="Pick winner"
      teams={state.groups.A}
      onPick={(t) => { console.log(t.name); showPicker = false }}
      onClose={() => showPicker = false}
    />
  {/if}
</div>
```

```bash
npm run dev
```

Expected: "Test Picker" button opens modal showing Group A. Clicking a team logs to console and closes modal. Clicking the backdrop closes modal.

- [ ] **Step 3: Revert App.svelte to clean state**

```svelte
<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import { resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
  <GroupSection />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/TeamPicker.svelte src/App.svelte
git commit -m "feat: add TeamPicker modal"
```

---

## Task 9: BracketMatch component

**Files:**
- Create: `src/components/BracketMatch.svelte`

A match box is in one of four states:
- **locked**: one or both teams unknown — grey, not interactive
- **pickable**: both teams known, no winner — blue highlight, opens picker on click
- **third-slot**: empty 3rd-place slot — amber, opens picker showing eligible 3rd-place teams
- **done**: winner picked — green, not interactive

- [ ] **Step 1: Create src/components/BracketMatch.svelte**

```svelte
<script>
  import TeamPicker from './TeamPicker.svelte'
  import { getEligibleThirdPlaceTeams } from '../lib/bracket.js'
  import { state } from '../store.svelte.js'

  let {
    matchId,
    homeTeam = null,
    awayTeam = null,
    winnerTeam = null,
    isThirdSlot = false,
    slotKey = '',
    onPickWinner,
    onPickThirdPlace,
  } = $props()

  let showPicker = $state(false)

  const eligible = $derived(
    isThirdSlot ? getEligibleThirdPlaceTeams(slotKey, state.groups) : []
  )
  const pickTeams = $derived(isThirdSlot ? eligible : [homeTeam, awayTeam].filter(Boolean))

  const isLocked   = $derived(!isThirdSlot && !winnerTeam && (!homeTeam || !awayTeam))
  const isPickable = $derived(!isThirdSlot && !winnerTeam && !!homeTeam && !!awayTeam)
  const isDone     = $derived(!!winnerTeam)

  function handleClick() {
    if (isPickable || (isThirdSlot && !winnerTeam)) showPicker = true
  }

  function handlePick(team) {
    if (isThirdSlot) onPickThirdPlace(slotKey, team.id)
    else onPickWinner(matchId, team.id)
    showPicker = false
  }
</script>

<button
  onclick={handleClick}
  disabled={isLocked || isDone}
  class="
    flex items-center gap-2 px-3 py-2 rounded border text-sm font-medium w-32 text-left
    {isDone      ? 'bg-green-900/50 border-green-700 text-green-300 cursor-default' : ''}
    {isPickable  ? 'bg-gray-700 border-gray-500 hover:bg-blue-700 hover:border-blue-400 cursor-pointer transition-colors' : ''}
    {isLocked    ? 'bg-gray-800/40 border-gray-700 text-gray-600 cursor-default' : ''}
    {isThirdSlot && !winnerTeam ? 'bg-amber-950/50 border-amber-700 text-amber-400 hover:bg-amber-900/60 cursor-pointer transition-colors' : ''}
  "
>
  {#if isDone}
    <span>{winnerTeam.flag}</span>
    <span class="truncate">{winnerTeam.name}</span>
  {:else if isPickable}
    <span class="text-gray-300 text-xs italic">pick winner</span>
  {:else if isThirdSlot && !winnerTeam}
    <span class="text-xs">{slotKey}</span>
  {:else}
    <span class="text-gray-600 text-xs">🔒</span>
  {/if}
</button>

{#if showPicker && pickTeams.length > 0}
  <TeamPicker
    title={isThirdSlot ? `Assign ${slotKey}` : `Pick winner`}
    teams={pickTeams}
    onPick={handlePick}
    onClose={() => showPicker = false}
  />
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BracketMatch.svelte
git commit -m "feat: add BracketMatch component"
```

---

## Task 10: Bracket component

**Files:**
- Create: `src/components/Bracket.svelte`

The layout is horizontal flex: [R32-left] → [R16-left] → [QF-left] → [SF-left] → [FINAL+BRONZE] → [SF-right] → [QF-right] → [R16-right] → [R32-right]. Each column is vertically distributed.

- [ ] **Step 1: Create src/components/Bracket.svelte**

```svelte
<script>
  import BracketMatch from './BracketMatch.svelte'
  import { state } from '../store.svelte.js'
  import { R32_MATCHES, R16_FEED, QF_FEED, SF_FEED } from '../data/bracket.js'
  import { getR32Teams, getPostR32Teams, findTeamById } from '../lib/bracket.js'

  const r32 = $derived(
    Object.fromEntries(
      R32_MATCHES.map(m => [m.id, getR32Teams(m, state.groups, state.thirdPlaceAssignments)])
    )
  )

  function matchTeams(id) {
    return getPostR32Teams(id, state.matchWinners, R16_FEED, QF_FEED, SF_FEED, state.groups)
  }

  function winnerOf(id) {
    return findTeamById(state.matchWinners[id], state.groups)
  }

  function pickWinner(matchId, teamId) {
    state.matchWinners[matchId] = teamId
    clearDownstream(matchId)
  }

  function pickThirdPlace(slotKey, teamId) {
    state.thirdPlaceAssignments[slotKey] = teamId
    Object.keys(state.matchWinners).forEach(k => { state.matchWinners[k] = null })
  }

  function clearDownstream(matchId) {
    const allFeeds = {
      ...R16_FEED, ...QF_FEED, ...SF_FEED,
      final: ['l-sf', 'r-sf'],
      bronze: ['l-sf', 'r-sf'],
    }
    for (const [id, feeders] of Object.entries(allFeeds)) {
      if (feeders.includes(matchId)) {
        state.matchWinners[id] = null
        clearDownstream(id)
      }
    }
  }

  function thirdSlotOf(matchId) {
    const m = R32_MATCHES.find(m => m.id === matchId)
    if (m?.home.startsWith('3')) return { isThird: true, slotKey: m.home, side: 'home' }
    if (m?.away.startsWith('3')) return { isThird: true, slotKey: m.away, side: 'away' }
    return { isThird: false, slotKey: '', side: '' }
  }

  const bronzeTeams = $derived(() => {
    const lw = state.matchWinners['l-sf']
    const rw = state.matchWinners['r-sf']
    const { home: lh, away: la } = matchTeams('l-sf')
    const { home: rh, away: ra } = matchTeams('r-sf')
    const lLoser = lw && lh && la ? (lh.id === lw ? la : lh) : null
    const rLoser = rw && rh && ra ? (rh.id === rw ? ra : rh) : null
    return { home: lLoser, away: rLoser }
  })

  const LEFT_R32  = ['m1','m2','m3','m4','m5','m6','m7','m8']
  const RIGHT_R32 = ['m9','m10','m11','m12','m13','m14','m15','m16']
  const LEFT_R16  = ['l-r16-m1','l-r16-m2','l-r16-m3','l-r16-m4']
  const RIGHT_R16 = ['r-r16-m1','r-r16-m2','r-r16-m3','r-r16-m4']
  const LEFT_QF   = ['l-qf-m1','l-qf-m2']
  const RIGHT_QF  = ['r-qf-m1','r-qf-m2']
</script>

<section class="px-4 py-4">
  <h2 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Bracket</h2>
  <div class="overflow-x-auto pb-6">
    <div class="flex gap-3 items-start min-w-max">

      <!-- R32 left -->
      <div class="flex flex-col gap-2">
        {#each [0,2,4,6] as i}
          <div class="flex flex-col gap-1 border-r border-gray-700 pr-2 mb-4">
            {#each [LEFT_R32[i], LEFT_R32[i+1]] as mid}
              {@const ts = thirdSlotOf(mid)}
              <div class="flex flex-col gap-0.5 mb-1">
                <!-- Home team display -->
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 w-32 truncate">
                  {#if ts.isThird && ts.side === 'home'}
                    <span class="text-amber-500">{ts.slotKey}</span>
                  {:else}
                    {#if r32[mid]?.home}
                      <span>{r32[mid].home.flag}</span>
                      <span>{r32[mid].home.id}</span>
                    {:else}
                      <span class="text-gray-600">—</span>
                    {/if}
                  {/if}
                </div>
                <!-- Away team display -->
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 w-32 truncate">
                  {#if ts.isThird && ts.side === 'away'}
                    {#if state.thirdPlaceAssignments[ts.slotKey]}
                      {@const t = findTeamById(state.thirdPlaceAssignments[ts.slotKey], state.groups)}
                      <span>{t?.flag}</span><span>{t?.id}</span>
                    {:else}
                      <span class="text-amber-500">{ts.slotKey}</span>
                    {/if}
                  {:else}
                    {#if r32[mid]?.away}
                      <span>{r32[mid].away.flag}</span>
                      <span>{r32[mid].away.id}</span>
                    {:else}
                      <span class="text-gray-600">—</span>
                    {/if}
                  {/if}
                </div>
                <!-- R32 winner pick -->
                {#if ts.isThird && !state.thirdPlaceAssignments[ts.slotKey]}
                  <BracketMatch
                    matchId={mid}
                    isThirdSlot={true}
                    slotKey={ts.slotKey}
                    winnerTeam={null}
                    onPickWinner={pickWinner}
                    onPickThirdPlace={pickThirdPlace}
                  />
                {:else}
                  <BracketMatch
                    matchId={mid}
                    homeTeam={r32[mid]?.home}
                    awayTeam={r32[mid]?.away}
                    winnerTeam={winnerOf(mid)}
                    onPickWinner={pickWinner}
                    onPickThirdPlace={pickThirdPlace}
                  />
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <!-- R16 left -->
      <div class="flex flex-col justify-around gap-16 border-r border-gray-700 pr-2">
        {#each LEFT_R16 as mid}
          {@const { home, away } = matchTeams(mid)}
          <BracketMatch
            matchId={mid}
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf(mid)}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        {/each}
      </div>

      <!-- QF left -->
      <div class="flex flex-col justify-around gap-32 border-r border-gray-700 pr-2">
        {#each LEFT_QF as mid}
          {@const { home, away } = matchTeams(mid)}
          <BracketMatch
            matchId={mid}
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf(mid)}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        {/each}
      </div>

      <!-- SF left -->
      <div class="flex flex-col justify-center border-r border-gray-700 pr-2" style="min-height:420px">
        {@const { home, away } = matchTeams('l-sf')}
        <BracketMatch
          matchId="l-sf"
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf('l-sf')}
          onPickWinner={pickWinner}
          onPickThirdPlace={pickThirdPlace}
        />
      </div>

      <!-- FINAL + BRONZE -->
      <div class="flex flex-col items-center justify-center gap-6 px-4" style="min-height:420px">
        <div class="text-center">
          <div class="text-xs text-yellow-400 font-bold tracking-widest mb-2">🏆 FINAL</div>
          {@const { home, away } = matchTeams('final')}
          <BracketMatch
            matchId="final"
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf('final')}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-400 font-bold tracking-widest mb-2">BRONZE</div>
          {@const b = bronzeTeams()}
          <BracketMatch
            matchId="bronze"
            homeTeam={b.home}
            awayTeam={b.away}
            winnerTeam={winnerOf('bronze')}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        </div>
      </div>

      <!-- SF right -->
      <div class="flex flex-col justify-center border-l border-gray-700 pl-2" style="min-height:420px">
        {@const { home, away } = matchTeams('r-sf')}
        <BracketMatch
          matchId="r-sf"
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf('r-sf')}
          onPickWinner={pickWinner}
          onPickThirdPlace={pickThirdPlace}
        />
      </div>

      <!-- QF right -->
      <div class="flex flex-col justify-around gap-32 border-l border-gray-700 pl-2">
        {#each RIGHT_QF as mid}
          {@const { home, away } = matchTeams(mid)}
          <BracketMatch
            matchId={mid}
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf(mid)}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        {/each}
      </div>

      <!-- R16 right -->
      <div class="flex flex-col justify-around gap-16 border-l border-gray-700 pl-2">
        {#each RIGHT_R16 as mid}
          {@const { home, away } = matchTeams(mid)}
          <BracketMatch
            matchId={mid}
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf(mid)}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        {/each}
      </div>

      <!-- R32 right -->
      <div class="flex flex-col gap-2">
        {#each [0,2,4,6] as i}
          <div class="flex flex-col gap-1 border-l border-gray-700 pl-2 mb-4">
            {#each [RIGHT_R32[i], RIGHT_R32[i+1]] as mid}
              {@const ts = thirdSlotOf(mid)}
              <div class="flex flex-col gap-0.5 mb-1">
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 w-32 truncate">
                  {#if ts.isThird && ts.side === 'home'}
                    <span class="text-amber-500">{ts.slotKey}</span>
                  {:else}
                    {#if r32[mid]?.home}
                      <span>{r32[mid].home.flag}</span><span>{r32[mid].home.id}</span>
                    {:else}
                      <span class="text-gray-600">—</span>
                    {/if}
                  {/if}
                </div>
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 w-32 truncate">
                  {#if ts.isThird && ts.side === 'away'}
                    {#if state.thirdPlaceAssignments[ts.slotKey]}
                      {@const t = findTeamById(state.thirdPlaceAssignments[ts.slotKey], state.groups)}
                      <span>{t?.flag}</span><span>{t?.id}</span>
                    {:else}
                      <span class="text-amber-500">{ts.slotKey}</span>
                    {/if}
                  {:else}
                    {#if r32[mid]?.away}
                      <span>{r32[mid].away.flag}</span><span>{r32[mid].away.id}</span>
                    {:else}
                      <span class="text-gray-600">—</span>
                    {/if}
                  {/if}
                </div>
                {#if ts.isThird && !state.thirdPlaceAssignments[ts.slotKey]}
                  <BracketMatch
                    matchId={mid}
                    isThirdSlot={true}
                    slotKey={ts.slotKey}
                    winnerTeam={null}
                    onPickWinner={pickWinner}
                    onPickThirdPlace={pickThirdPlace}
                  />
                {:else}
                  <BracketMatch
                    matchId={mid}
                    homeTeam={r32[mid]?.home}
                    awayTeam={r32[mid]?.away}
                    winnerTeam={winnerOf(mid)}
                    onPickWinner={pickWinner}
                    onPickThirdPlace={pickThirdPlace}
                  />
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Bracket.svelte
git commit -m "feat: add Bracket component"
```

---

## Task 11: Wire App.svelte and end-to-end test

**Files:**
- Modify: `src/App.svelte`

- [ ] **Step 1: Update src/App.svelte**

```svelte
<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import Bracket from './components/Bracket.svelte'
  import { resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
  <GroupSection />
  <Bracket />
</div>
```

- [ ] **Step 2: Run the app**

```bash
npm run dev
```

- [ ] **Step 3: Manual end-to-end test**

Run through this checklist in the browser:

1. Drag teams in Group A → confirm bracket R32 slots for `1A`/`2A` update immediately
2. Click an amber `3ABCDF` slot → confirm eligible modal appears → pick a team → confirm slot fills
3. Once both teams are known for an R16 slot, click it → pick winner → confirm winner appears in R16
4. Continue through QF → SF → Final
5. Confirm Bronze match shows the two SF losers
6. Click Reset → confirm everything clears back to default order

- [ ] **Step 4: Run unit tests**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.svelte
git commit -m "feat: wire full app together"
```

---

## Task 12: Deploy to Cloudflare Pages

- [ ] **Step 1: Create GitHub repository**

```bash
gh repo create wc2026-bracket --public --source=. --remote=origin --push
```

- [ ] **Step 2: Verify push**

```bash
gh repo view --web
```

Expected: repository opens in browser with all source files visible.

- [ ] **Step 3: Connect to Cloudflare Pages**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Pages
2. Connect to Git → select `wc2026-bracket`
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click Save and Deploy — wait for first deploy to complete

- [ ] **Step 4: Verify live URL**

Cloudflare provides a URL like `wc2026-bracket.pages.dev`. Open it and repeat the end-to-end test from Task 11 Step 3.

- [ ] **Step 5: Done**

Every `git push` to `main` triggers an automatic redeploy.

---

## Self-Review Notes

- All 48 teams from design spec present in `teams.js` ✓
- All 16 R32 match slot keys match the official FIFA bracket ✓
- All 8 third-place slot keys (3ABCDF etc.) match spec exactly ✓
- R16 feed map covers all 8 R16 matches (4 left + 4 right) ✓
- QF and SF feeds complete ✓
- Bronze match derives from SF losers (computed, not stored separately) ✓
- `findTeamById(null)` returns null safely ✓
- Downstream invalidation: changing group order or 3rd-place pick clears affected match winners ✓
- Reset clears groups, thirdPlaceAssignments, and all matchWinners ✓
- `getPostR32Teams` for `final` uses `FINAL_FEED = ['l-sf', 'r-sf']` via the merged `feedMap` ✓
