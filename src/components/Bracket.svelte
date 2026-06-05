<script>
  import BracketMatch from './BracketMatch.svelte'
  import TeamPicker from './TeamPicker.svelte'
  import { state as appState } from '../store.svelte.js'
  import { R32_MATCHES, R16_FEED, QF_FEED, SF_FEED, FINAL_FEED } from '../data/bracket.js'
  import { getR32Teams, getPostR32Teams, findTeamById, getEligibleThirdPlaceTeams } from '../lib/bracket.js'

  let activeThirdSlot = $state(null)

  const r32 = $derived(
    Object.fromEntries(
      R32_MATCHES.map(m => [m.id, getR32Teams(m, appState.groups, appState.thirdPlaceAssignments)])
    )
  )

  function r32Match(mid) {
    return R32_MATCHES.find(m => m.id === mid)
  }

  function matchTeams(id) {
    return getPostR32Teams(
      id,
      appState.matchWinners,
      R16_FEED,
      QF_FEED,
      { ...SF_FEED, final: FINAL_FEED },
      appState.groups
    )
  }

  function winnerOf(id) {
    return findTeamById(appState.matchWinners[id], appState.groups)
  }

  function pickWinner(matchId, teamId) {
    appState.matchWinners[matchId] = teamId
    clearDownstream(matchId)
  }

  function pickThirdPlace(slotKey, teamId) {
    appState.thirdPlaceAssignments[slotKey] = teamId
    // Clear any R32 winner that depended on this slot
    R32_MATCHES.forEach(m => {
      if (m.away === slotKey) {
        appState.matchWinners[m.id] = null
        clearDownstream(m.id)
      }
    })
    activeThirdSlot = null
  }

  function clearDownstream(matchId) {
    const allFeeds = {
      ...R16_FEED, ...QF_FEED, ...SF_FEED,
      final: ['l-sf', 'r-sf'],
      bronze: ['l-sf', 'r-sf'],
    }
    for (const [id, feeders] of Object.entries(allFeeds)) {
      if (feeders.includes(matchId)) {
        appState.matchWinners[id] = null
        clearDownstream(id)
      }
    }
  }

  function thirdSlotOf(matchId) {
    const m = R32_MATCHES.find(m => m.id === matchId)
    if (m?.away.startsWith('3')) return { isThird: true, slotKey: m.away }
    return { isThird: false, slotKey: '' }
  }

  const bronzeTeams = $derived.by(() => {
    const lw = appState.matchWinners['l-sf']
    const rw = appState.matchWinners['r-sf']
    const { home: lh, away: la } = matchTeams('l-sf')
    const { home: rh, away: ra } = matchTeams('r-sf')
    const lLoser = lw && lh && la ? (lh.id === lw ? la : lh) : null
    const rLoser = rw && rh && ra ? (rh.id === rw ? ra : rh) : null
    return { home: lLoser, away: rLoser }
  })

  const LEFT_R32  = ['m1','m2','m3','m4','m5','m6','m7','m8']
  const RIGHT_R32 = ['m9','m10','m11','m12','m13','m14','m15','m16']
  const LEFT_R16  = ['l-r16-m1', 'l-r16-m2', 'l-r16-m3', 'l-r16-m4']
  const RIGHT_R16 = ['r-r16-m1', 'r-r16-m2', 'r-r16-m3', 'r-r16-m4']
  const LEFT_QF   = ['l-qf-m1', 'l-qf-m2']
  const RIGHT_QF  = ['r-qf-m1', 'r-qf-m2']

  // Read state fresh at click time — avoids stale @const closure values
  function r32Away(mid) {
    const ts = thirdSlotOf(mid)
    return ts.isThird
      ? findTeamById(appState.thirdPlaceAssignments[ts.slotKey], appState.groups)
      : r32[mid]?.away ?? null
  }

  function handlePickR32(mid, isHome) {
    const home = r32[mid]?.home
    const away = r32Away(mid)
    if (!home || !away) return
    pickWinner(mid, isHome ? home.id : away.id)
  }

  function r32RowClass(team, winner, canPick) {
    if (!team) return 'text-slate-600 cursor-default'
    if (winner) return winner.id === team.id
      ? 'text-amber-300 font-medium cursor-default'
      : 'text-slate-500 hover:text-amber-300 hover:bg-surface-hover cursor-pointer transition-colors'
    if (canPick) return 'text-slate-300 hover:text-amber-300 hover:bg-surface-hover cursor-pointer transition-colors'
    return 'text-slate-300 cursor-default'
  }
</script>

<section class="px-4 py-6 overflow-x-auto">

  <!-- Round headers -->
  <div class="flex min-w-max mb-3 text-[10px] uppercase tracking-widest text-amber-400/50 font-semibold select-none">
    <div class="w-48 text-center">R32</div>
    <div class="w-40 text-center">R16</div>
    <div class="w-40 text-center">QF</div>
    <div class="w-40 text-center">SF</div>
    <div class="w-44 text-center">Final</div>
    <div class="w-40 text-center">SF</div>
    <div class="w-40 text-center">QF</div>
    <div class="w-40 text-center">R16</div>
    <div class="w-48 text-center">R32</div>
  </div>

  <div class="flex min-w-max items-stretch" style="height: 720px">

    <!-- LEFT R32: 8 interactive match slots -->
    <div class="flex flex-col justify-around w-48 pr-3 border-r border-border-subtle">
      {#each LEFT_R32 as mid}
        {@const ts = thirdSlotOf(mid)}
        {@const m = r32Match(mid)}
        {@const homeTeam = r32[mid]?.home}
        {@const awayTeam = r32Away(mid)}
        {@const winner = winnerOf(mid)}
        {@const canPick = !!homeTeam && !!awayTeam}

        <div class="rounded border overflow-hidden text-xs {winner ? 'border-surface-raised' : canPick ? 'border-border-subtle' : 'border-surface-raised'}">
          <button
            onclick={() => handlePickR32(mid, true)}
            class="flex items-center gap-1.5 px-2 py-1.5 border-b border-surface-raised w-full text-left {r32RowClass(homeTeam, winner, canPick)}"
          >
            <span class="text-[9px] text-slate-600 shrink-0 w-8">{m?.home}</span>
            {#if homeTeam}<span>{homeTeam.flag}</span><span class="truncate">{homeTeam.name}</span>
            {:else}<span>—</span>{/if}
          </button>
          {#if ts.isThird && !appState.thirdPlaceAssignments[ts.slotKey]}
            <button
              onclick={() => { activeThirdSlot = ts.slotKey }}
              class="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-amber-600 hover:text-amber-300 cursor-pointer transition-colors text-left w-full"
            >▸ pick {ts.slotKey}</button>
          {:else}
            <button
              onclick={() => handlePickR32(mid, false)}
              class="flex items-center gap-1.5 px-2 py-1.5 w-full text-left {r32RowClass(awayTeam, winner, canPick)}"
            >
              <span class="text-[9px] text-slate-600 shrink-0 w-8">{ts.isThird ? '3rd' : m?.away}</span>
              {#if awayTeam}<span>{awayTeam.flag}</span><span class="truncate">{awayTeam.name}</span>
              {:else}<span>—</span>{/if}
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <!-- LEFT R16: 4 matches -->
    <div class="flex flex-col justify-around w-40 px-3 border-r border-border-subtle">
      {#each LEFT_R16 as mid}
        {@const { home, away } = matchTeams(mid)}
        <BracketMatch
          matchId={mid}
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf(mid)}
          onPickWinner={pickWinner}
        />
      {/each}
    </div>

    <!-- LEFT QF: 2 matches -->
    <div class="flex flex-col justify-around w-40 px-3 border-r border-border-subtle">
      {#each LEFT_QF as mid}
        {@const { home, away } = matchTeams(mid)}
        <BracketMatch
          matchId={mid}
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf(mid)}
          onPickWinner={pickWinner}
        />
      {/each}
    </div>

    <!-- LEFT SF -->
    <div class="flex flex-col justify-around w-40 px-3 border-r border-border-subtle">
      {#each [matchTeams('l-sf')] as { home, away }}
        <BracketMatch
          matchId="l-sf"
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf('l-sf')}
          onPickWinner={pickWinner}
        />
      {/each}
    </div>

    <!-- CENTER: Final + Bronze -->
    <div class="relative w-44" style="height: 720px">
      <!-- Champion trophy + box: upper area -->
      {#each [winnerOf('final')] as champion}
        <div class="absolute inset-x-0 top-8 flex flex-col items-center gap-1.5">
          <div class="text-[11px] font-extrabold tracking-[0.3em] uppercase text-amber-400/80">Champion</div>
          <div class="text-6xl leading-none">🏆</div>
          <div class="w-36 h-20 rounded-lg border-2 flex flex-col items-center justify-center
            {champion ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 bg-slate-800/60 border-dashed'}">
            {#if champion}
              <div class="text-3xl">{champion.flag}</div>
              <div class="text-sm font-extrabold text-amber-300 tracking-wider uppercase mt-0.5">{champion.name}</div>
            {/if}
          </div>
          <div class="text-[9px] uppercase tracking-widest font-bold {champion ? 'text-amber-400/70' : 'text-slate-700'}">World Champion</div>
        </div>
      {/each}
      <!-- Final label: positioned just above the centered card -->
      <div class="absolute inset-x-0 flex justify-center" style="top: calc(50% - 50px)">
        <div class="text-[10px] text-amber-400 font-bold uppercase tracking-widest">🏆 Final</div>
      </div>
      <!-- Final card: exactly centered to align with SFs -->
      <div class="absolute inset-x-0 px-3" style="top: 50%; transform: translateY(-50%)">
        <BracketMatch
          matchId="final"
          homeTeam={matchTeams('final').home}
          awayTeam={matchTeams('final').away}
          winnerTeam={winnerOf('final')}
          isFinal={true}
          onPickWinner={pickWinner}
        />
      </div>
      <!-- 3rd Place Match: lower area -->
      <div class="absolute inset-x-0 bottom-52 flex flex-col items-center gap-1.5 px-3">
        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">3rd Place Match</div>
        <BracketMatch
          matchId="bronze"
          homeTeam={bronzeTeams.home}
          awayTeam={bronzeTeams.away}
          winnerTeam={winnerOf('bronze')}
          onPickWinner={pickWinner}
        />
      </div>
    </div>

    <!-- RIGHT SF -->
    <div class="flex flex-col justify-around w-40 px-3 border-l border-border-subtle">
      {#each [matchTeams('r-sf')] as { home, away }}
        <BracketMatch
          matchId="r-sf"
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf('r-sf')}
          onPickWinner={pickWinner}
        />
      {/each}
    </div>

    <!-- RIGHT QF: 2 matches -->
    <div class="flex flex-col justify-around w-40 px-3 border-l border-border-subtle">
      {#each RIGHT_QF as mid}
        {@const { home, away } = matchTeams(mid)}
        <BracketMatch
          matchId={mid}
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf(mid)}
          onPickWinner={pickWinner}
        />
      {/each}
    </div>

    <!-- RIGHT R16: 4 matches -->
    <div class="flex flex-col justify-around w-40 px-3 border-l border-border-subtle">
      {#each RIGHT_R16 as mid}
        {@const { home, away } = matchTeams(mid)}
        <BracketMatch
          matchId={mid}
          homeTeam={home}
          awayTeam={away}
          winnerTeam={winnerOf(mid)}
          onPickWinner={pickWinner}
        />
      {/each}
    </div>

    <!-- RIGHT R32: 8 interactive match slots (mirrored) -->
    <div class="flex flex-col justify-around w-48 pl-3 border-l border-border-subtle">
      {#each RIGHT_R32 as mid}
        {@const ts = thirdSlotOf(mid)}
        {@const m = r32Match(mid)}
        {@const homeTeam = r32[mid]?.home}
        {@const awayTeam = r32Away(mid)}
        {@const winner = winnerOf(mid)}
        {@const canPick = !!homeTeam && !!awayTeam}

        <div class="rounded border overflow-hidden text-xs {winner ? 'border-surface-raised' : canPick ? 'border-border-subtle' : 'border-surface-raised'}">
          <button
            onclick={() => handlePickR32(mid, true)}
            class="flex items-center gap-1.5 px-2 py-1.5 border-b border-surface-raised w-full text-left {r32RowClass(homeTeam, winner, canPick)}"
          >
            {#if homeTeam}<span>{homeTeam.flag}</span><span class="truncate flex-1">{homeTeam.name}</span>
            {:else}<span class="flex-1">—</span>{/if}
            <span class="text-[9px] text-slate-600 shrink-0">{m?.home}</span>
          </button>
          {#if ts.isThird && !appState.thirdPlaceAssignments[ts.slotKey]}
            <button
              onclick={() => { activeThirdSlot = ts.slotKey }}
              class="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-amber-600 hover:text-amber-300 cursor-pointer transition-colors text-left w-full"
            >▸ pick {ts.slotKey}</button>
          {:else}
            <button
              onclick={() => handlePickR32(mid, false)}
              class="flex items-center gap-1.5 px-2 py-1.5 w-full text-left {r32RowClass(awayTeam, winner, canPick)}"
            >
              {#if awayTeam}<span>{awayTeam.flag}</span><span class="truncate flex-1">{awayTeam.name}</span>
              {:else}<span class="flex-1">—</span>{/if}
              <span class="text-[9px] text-slate-600 shrink-0">{ts.isThird ? '3rd' : m?.away}</span>
            </button>
          {/if}
        </div>
      {/each}
    </div>

  </div>
</section>

{#if activeThirdSlot}
  {@const usedIds = new Set(
    Object.entries(appState.thirdPlaceAssignments)
      .filter(([slot]) => slot !== activeThirdSlot)
      .map(([, id]) => id)
      .filter(Boolean)
  )}
  <TeamPicker
    title="Assign {activeThirdSlot}"
    teams={getEligibleThirdPlaceTeams(activeThirdSlot, appState.groups).filter(t => !usedIds.has(t.id))}
    onPick={(team) => pickThirdPlace(activeThirdSlot, team.id)}
    onClose={() => { activeThirdSlot = null }}
  />
{/if}
