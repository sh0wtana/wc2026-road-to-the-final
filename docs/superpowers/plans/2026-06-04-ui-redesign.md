# WC2026 Bracket Simulator — UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat gray color system with a premium sports broadcast aesthetic — deep navy base, gold accents, moderate glow effects — without touching any logic or data files.

**Architecture:** All custom colors are defined once as semantic tokens in `src/app.css` via Tailwind v4's `@theme` directive. Components reference only semantic class names (`bg-surface`, `border-border-subtle`, etc.) plus Tailwind built-ins (`amber-400`, `slate-100`, etc.). No hex values appear in any `.svelte` file.

**Tech Stack:** Svelte 5, Tailwind CSS v4, `@tailwindcss/vite`

---

## File Map

| File | Change |
|---|---|
| `src/app.css` | Add `@theme` block with 6 semantic color tokens |
| `src/App.svelte` | Root div: flat `bg-gray-950` → navy gradient |
| `src/components/Header.svelte` | Gray surface → `bg-surface`, gray border → gold rule |
| `src/components/GroupCard.svelte` | Gray card → `bg-surface` + gold top border + updated row colors |
| `src/components/BracketMatch.svelte` | All state classes updated; add `isFinal` prop for gold glow |
| `src/components/TeamPicker.svelte` | Panel + button colors updated |
| `src/components/Bracket.svelte` | Root section bg, round column labels, divider colors |

---

## Task 1: Add semantic color tokens

**Files:**
- Modify: `src/app.css`

- [ ] **Step 1: Replace src/app.css**

```css
@import "tailwindcss";

@theme {
  --color-pitch:           #050d1a;
  --color-pitch-end:       #0a1628;
  --color-surface:         #0d1f3c;
  --color-surface-raised:  #112447;
  --color-surface-hover:   #1a3560;
  --color-border-subtle:   #1e3a5f;
}
```

- [ ] **Step 2: Verify tokens are available**

```bash
npm run dev
```

Open browser dev tools → inspect any element → confirm `bg-surface` resolves to `#0d1f3c` when applied to a test element. No build errors.

- [ ] **Step 3: Commit**

```bash
git add src/app.css
git commit -m "feat: add semantic navy color tokens via @theme"
```

---

## Task 2: Update App.svelte root background

**Files:**
- Modify: `src/App.svelte`

- [ ] **Step 1: Replace src/App.svelte**

```svelte
<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import Bracket from './components/Bracket.svelte'
  import { resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gradient-to-br from-pitch to-pitch-end text-slate-100">
  <Header onReset={resetState} />
  <GroupSection />
  <Bracket />
</div>
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Expected: page background is a deep navy gradient (near-black with slight blue tone), not flat gray.

- [ ] **Step 3: Commit**

```bash
git add src/App.svelte
git commit -m "feat: apply navy gradient to page background"
```

---

## Task 3: Update Header

**Files:**
- Modify: `src/components/Header.svelte`

- [ ] **Step 1: Replace src/components/Header.svelte**

```svelte
<script>
  let { onReset } = $props()
</script>

<header class="flex items-center justify-between px-6 py-3 bg-surface border-b-2 border-amber-400">
  <h1 class="text-lg font-bold tracking-wide text-slate-100">🏆 FIFA World Cup 2026 Simulator</h1>
  <button
    onclick={onReset}
    class="px-4 py-1.5 text-sm bg-red-700 hover:bg-red-600 rounded font-medium transition-colors"
  >
    Reset
  </button>
</header>
```

- [ ] **Step 2: Verify in browser**

Expected: header has a navy surface background with a gold bottom rule. Title is bright white. Reset button is red.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.svelte
git commit -m "feat: apply navy/gold styling to Header"
```

---

## Task 4: Update GroupCard

**Files:**
- Modify: `src/components/GroupCard.svelte`

- [ ] **Step 1: Replace src/components/GroupCard.svelte**

```svelte
<script>
  import { dndzone } from 'svelte-dnd-action'

  let { group, teams, onReorder } = $props()

  const BADGES = ['①', '②', '③', '④']

  function handleSort(e) {
    onReorder(e.detail.items)
  }
</script>

<div class="bg-surface border border-border-subtle border-t-2 border-t-amber-400 rounded-lg p-3 min-w-[140px]">
  <div class="text-xs font-bold text-amber-400 text-center mb-2 uppercase tracking-widest">GROUP {group}</div>
  <div
    use:dndzone={{ items: teams, flipDurationMs: 150 }}
    onfinalize={handleSort}
    onconsider={handleSort}
    class="flex flex-col gap-1"
  >
    {#each teams as team, i (team.id)}
      <div class="flex items-center gap-1.5 bg-surface-raised hover:bg-surface-hover rounded px-2 py-1.5 cursor-grab active:cursor-grabbing select-none text-sm transition-colors">
        <span class="text-amber-900 text-xs">⠿</span>
        <span>{team.flag}</span>
        <span class="font-semibold text-slate-100">{team.id}</span>
        <span class="ml-auto text-xs {i < 2 ? 'text-amber-400' : 'text-slate-500'}">{BADGES[i]}</span>
      </div>
    {/each}
  </div>
</div>
```

- [ ] **Step 2: Verify in browser**

Expected: each group card has a navy body, a gold top border stripe, gold group label, navy-blue team rows that lighten on hover. Rank badges ① and ② are gold, ③ and ④ are muted.

- [ ] **Step 3: Commit**

```bash
git add src/components/GroupCard.svelte
git commit -m "feat: apply navy/gold styling to GroupCard"
```

---

## Task 5: Update BracketMatch

**Files:**
- Modify: `src/components/BracketMatch.svelte`

Adds an `isFinal` boolean prop. When `isFinal` is true and a winner is picked, the slot gets a gold glow instead of green.

- [ ] **Step 1: Replace src/components/BracketMatch.svelte**

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
    isFinal = false,
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
    {isDone && isFinal  ? 'bg-surface border-amber-400 shadow-[0_0_16px_theme(colors.amber.400/35%)] text-amber-300 cursor-default' : ''}
    {isDone && !isFinal ? 'bg-green-900/40 border-green-700 text-green-300 cursor-default' : ''}
    {isPickable         ? 'bg-surface border-amber-900 hover:border-amber-400 hover:shadow-[0_0_12px_theme(colors.amber.400/20%)] cursor-pointer transition-all' : ''}
    {isLocked           ? 'bg-surface border-border-subtle text-slate-500 cursor-default' : ''}
    {isThirdSlot && !winnerTeam ? 'bg-surface border-amber-900 text-amber-400 hover:border-amber-400 hover:shadow-[0_0_12px_theme(colors.amber.400/20%)] cursor-pointer transition-all' : ''}
  "
>
  {#if isDone}
    <span>{winnerTeam.flag}</span>
    <span class="truncate">{winnerTeam.name}</span>
  {:else if isPickable}
    <span class="text-slate-500 text-xs italic">pick winner</span>
  {:else if isThirdSlot && !winnerTeam}
    <span class="text-xs">{slotKey}</span>
  {:else}
    <span class="text-slate-500 text-xs">🔒</span>
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

- [ ] **Step 2: Verify in browser**

Expected:
- Locked slots: navy bg, subtle border, muted gray text, 🔒
- Pickable slots: navy bg, dim amber border, gold glow on hover
- 3rd-place slots: same as pickable with amber slot key text
- Done regular slots: dark green bg, green border and text
- Done final slot (will verify after Task 6 wires `isFinal`): gold border + glow

- [ ] **Step 3: Commit**

```bash
git add src/components/BracketMatch.svelte
git commit -m "feat: apply navy/gold styling to BracketMatch, add isFinal prop"
```

---

## Task 6: Update TeamPicker

**Files:**
- Modify: `src/components/TeamPicker.svelte`

- [ ] **Step 1: Replace src/components/TeamPicker.svelte**

```svelte
<script>
  let { title, teams, onPick, onClose } = $props()
</script>

<div
  class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
  onclick={onClose}
  role="dialog"
  aria-modal="true"
>
  <div
    class="bg-surface border border-border-subtle rounded-xl p-5 min-w-[230px] shadow-2xl"
    onclick={(e) => e.stopPropagation()}
  >
    <p class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{title}</p>
    <div class="flex flex-col gap-2">
      {#each teams as team (team.id)}
        <button
          onclick={() => onPick(team)}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-raised hover:bg-amber-400 hover:text-pitch transition-colors text-left"
        >
          <span class="text-xl">{team.flag}</span>
          <span class="font-semibold">{team.name}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify in browser**

Trigger any picker modal. Expected: dark navy panel with gold title, navy-blue team rows that turn gold on hover with near-black text. Backdrop is darker (`bg-black/70`).

- [ ] **Step 3: Commit**

```bash
git add src/components/TeamPicker.svelte
git commit -m "feat: apply navy/gold styling to TeamPicker"
```

---

## Task 7: Update Bracket

**Files:**
- Modify: `src/components/Bracket.svelte`

Changes: section background inherits the page gradient (remove any explicit bg), column dividers use `border-border-subtle`, round labels added above each column, Final `BracketMatch` receives `isFinal={true}`.

- [ ] **Step 1: Replace src/components/Bracket.svelte**

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
  <div class="overflow-x-auto pb-6">
    <div class="flex gap-3 items-start min-w-max">

      <!-- R32 left -->
      <div class="flex flex-col gap-2">
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">R32</div>
        {#each [0,2,4,6] as i}
          <div class="flex flex-col gap-1 border-r border-border-subtle pr-2 mb-4">
            {#each [LEFT_R32[i], LEFT_R32[i+1]] as mid}
              {@const ts = thirdSlotOf(mid)}
              <div class="flex flex-col gap-0.5 mb-1">
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 w-32 truncate">
                  {#if ts.isThird && ts.side === 'home'}
                    <span class="text-amber-400/60">{ts.slotKey}</span>
                  {:else}
                    {#if r32[mid]?.home}
                      <span>{r32[mid].home.flag}</span>
                      <span>{r32[mid].home.id}</span>
                    {:else}
                      <span class="text-slate-600">—</span>
                    {/if}
                  {/if}
                </div>
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 w-32 truncate">
                  {#if ts.isThird && ts.side === 'away'}
                    {#if state.thirdPlaceAssignments[ts.slotKey]}
                      {@const t = findTeamById(state.thirdPlaceAssignments[ts.slotKey], state.groups)}
                      <span>{t?.flag}</span><span>{t?.id}</span>
                    {:else}
                      <span class="text-amber-400/60">{ts.slotKey}</span>
                    {/if}
                  {:else}
                    {#if r32[mid]?.away}
                      <span>{r32[mid].away.flag}</span>
                      <span>{r32[mid].away.id}</span>
                    {:else}
                      <span class="text-slate-600">—</span>
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

      <!-- R16 left -->
      <div class="flex flex-col justify-around gap-16 border-r border-border-subtle pr-2">
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">R16</div>
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
      <div class="flex flex-col justify-around gap-32 border-r border-border-subtle pr-2">
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">QF</div>
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
      <div class="flex flex-col justify-center border-r border-border-subtle pr-2" style="min-height:420px">
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">SF</div>
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
          <div class="text-xs text-amber-400 font-bold uppercase tracking-widest mb-2">🏆 Final</div>
          {@const { home, away } = matchTeams('final')}
          <BracketMatch
            matchId="final"
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf('final')}
            isFinal={true}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        </div>
        <div class="text-center">
          <div class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Bronze</div>
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
      <div class="flex flex-col justify-center border-l border-border-subtle pl-2" style="min-height:420px">
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">SF</div>
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
      <div class="flex flex-col justify-around gap-32 border-l border-border-subtle pl-2">
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">QF</div>
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
      <div class="flex flex-col justify-around gap-16 border-l border-border-subtle pl-2">
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">R16</div>
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
        <div class="text-xs uppercase tracking-widest text-amber-400/60 mb-1 text-center">R32</div>
        {#each [0,2,4,6] as i}
          <div class="flex flex-col gap-1 border-l border-border-subtle pl-2 mb-4">
            {#each [RIGHT_R32[i], RIGHT_R32[i+1]] as mid}
              {@const ts = thirdSlotOf(mid)}
              <div class="flex flex-col gap-0.5 mb-1">
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 w-32 truncate">
                  {#if ts.isThird && ts.side === 'home'}
                    <span class="text-amber-400/60">{ts.slotKey}</span>
                  {:else}
                    {#if r32[mid]?.home}
                      <span>{r32[mid].home.flag}</span><span>{r32[mid].home.id}</span>
                    {:else}
                      <span class="text-slate-600">—</span>
                    {/if}
                  {/if}
                </div>
                <div class="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 w-32 truncate">
                  {#if ts.isThird && ts.side === 'away'}
                    {#if state.thirdPlaceAssignments[ts.slotKey]}
                      {@const t = findTeamById(state.thirdPlaceAssignments[ts.slotKey], state.groups)}
                      <span>{t?.flag}</span><span>{t?.id}</span>
                    {:else}
                      <span class="text-amber-400/60">{ts.slotKey}</span>
                    {/if}
                  {:else}
                    {#if r32[mid]?.away}
                      <span>{r32[mid].away.flag}</span><span>{r32[mid].away.id}</span>
                    {:else}
                      <span class="text-slate-600">—</span>
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

- [ ] **Step 2: Verify in browser — full end-to-end visual check**

1. Page loads with navy gradient background
2. Header: navy surface, gold bottom rule
3. Group cards: navy body, gold top stripe, gold group labels, navy-blue rows
4. Drag a team — rows hover with lighter navy
5. Bracket columns: `border-border-subtle` dividers, round labels (R32 / R16 / QF / SF) in dim gold above each column
6. Final label in full gold
7. Pick a group ranking — R32 bracket slots update
8. Click a pickable slot — amber border glow visible on hover
9. Pick a winner — green done state
10. Advance to Final — pick champion — gold glow done state on Final slot

- [ ] **Step 3: Commit**

```bash
git add src/components/Bracket.svelte
git commit -m "feat: apply navy/gold styling to Bracket, add round labels, wire isFinal"
```

---

## Self-Review

- `@theme` tokens defined in Task 1, used in Tasks 2–7 ✓
- No hex values in any `.svelte` file ✓
- `isFinal` prop added to `BracketMatch` in Task 5, wired in `Bracket` Task 7 ✓
- All 7 files from the file map covered ✓
- Round labels (R32/R16/QF/SF) added in Task 7 ✓
- `hover:text-pitch` on TeamPicker buttons uses the `pitch` semantic token ✓
- Gold glow uses `theme()` function — valid in Tailwind v4 arbitrary values ✓
- No logic changes in any task ✓
