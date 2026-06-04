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
        {#each [matchTeams('l-sf')] as { home, away }}
          <BracketMatch
            matchId="l-sf"
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf('l-sf')}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        {/each}
      </div>

      <!-- FINAL + BRONZE -->
      <div class="flex flex-col items-center justify-center gap-6 px-4" style="min-height:420px">
        <div class="text-center">
          <div class="text-xs text-yellow-400 font-bold tracking-widest mb-2">🏆 FINAL</div>
          {#each [matchTeams('final')] as { home, away }}
            <BracketMatch
              matchId="final"
              homeTeam={home}
              awayTeam={away}
              winnerTeam={winnerOf('final')}
              onPickWinner={pickWinner}
              onPickThirdPlace={pickThirdPlace}
            />
          {/each}
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-400 font-bold tracking-widest mb-2">BRONZE</div>
          {#each [bronzeTeams()] as b}
            <BracketMatch
              matchId="bronze"
              homeTeam={b.home}
              awayTeam={b.away}
              winnerTeam={winnerOf('bronze')}
              onPickWinner={pickWinner}
              onPickThirdPlace={pickThirdPlace}
            />
          {/each}
        </div>
      </div>

      <!-- SF right -->
      <div class="flex flex-col justify-center border-l border-gray-700 pl-2" style="min-height:420px">
        {#each [matchTeams('r-sf')] as { home, away }}
          <BracketMatch
            matchId="r-sf"
            homeTeam={home}
            awayTeam={away}
            winnerTeam={winnerOf('r-sf')}
            onPickWinner={pickWinner}
            onPickThirdPlace={pickThirdPlace}
          />
        {/each}
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
