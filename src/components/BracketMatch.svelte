<script>
  let {
    matchId,
    homeTeam = null,
    awayTeam = null,
    winnerTeam = null,
    isFinal = false,
    onPickWinner,
  } = $props()

  const isLocked   = $derived(!homeTeam || !awayTeam)
  const isDone     = $derived(!!winnerTeam)
  const isPickable = $derived(!isLocked)

  function pick(team) {
    if (isPickable && team) onPickWinner(matchId, team.id)
  }

  function rowClass(team) {
    if (!team) return 'text-slate-600 cursor-default bg-surface'
    if (isDone) {
      return winnerTeam.id === team.id
        ? 'text-amber-300 font-medium bg-surface cursor-default'
        : 'text-slate-500 bg-surface hover:bg-surface-hover hover:text-amber-300 cursor-pointer transition-colors'
    }
    if (isPickable) return 'text-slate-300 bg-surface hover:bg-surface-hover hover:text-amber-300 cursor-pointer transition-colors'
    return 'text-slate-600 bg-surface cursor-default'
  }
</script>

<div class="rounded border text-xs w-36 overflow-hidden
  {isFinal && isDone  ? 'border-amber-400 shadow-[0_0_16px_theme(colors.amber.400/35%)]' : ''}
  {isFinal && !isDone ? 'border-amber-900/60' : ''}
  {!isFinal && isDone ? 'border-surface-raised' : ''}
  {!isFinal && isPickable ? 'border-border-subtle' : ''}
  {!isFinal && isLocked   ? 'border-surface-raised' : ''}
">
  <button
    onclick={() => pick(homeTeam)}
    disabled={!isPickable}
    class="flex items-center gap-1.5 px-2 py-1 w-full border-b border-surface-raised {rowClass(homeTeam)}"
  >
    {#if homeTeam}
      <span>{homeTeam.flag}</span><span class="truncate">{homeTeam.name}</span>
    {:else}
      <span>—</span>
    {/if}
  </button>
  <button
    onclick={() => pick(awayTeam)}
    disabled={!isPickable}
    class="flex items-center gap-1.5 px-2 py-1 w-full {rowClass(awayTeam)}"
  >
    {#if awayTeam}
      <span>{awayTeam.flag}</span><span class="truncate">{awayTeam.name}</span>
    {:else}
      <span>—</span>
    {/if}
  </button>
</div>
