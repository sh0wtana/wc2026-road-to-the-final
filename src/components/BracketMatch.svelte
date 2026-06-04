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
