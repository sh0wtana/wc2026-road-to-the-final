<script>
  import TeamPicker from './TeamPicker.svelte'
  import { getEligibleThirdPlaceTeams } from '../lib/bracket.js'
  import { state as appState } from '../store.svelte.js'

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
    isThirdSlot ? getEligibleThirdPlaceTeams(slotKey, appState.groups) : []
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
