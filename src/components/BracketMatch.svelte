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
    if (isPickable) return 'text-slate-100 bg-surface hover:bg-surface-hover hover:text-amber-300 cursor-pointer transition-colors'
    return 'text-slate-100 bg-surface cursor-default'
  }
</script>

<div class="rounded border text-sm w-full overflow-hidden divide-y divide-slate-700 flex flex-col
  {isFinal && isDone  ? 'border-amber-400 shadow-[0_0_16px_theme(colors.amber.400/35%)]' : ''}
  {isFinal && !isDone ? 'border-slate-500' : ''}
  {!isFinal && isDone ? 'border-slate-500' : ''}
  {!isFinal && isPickable ? 'border-slate-500' : ''}
  {!isFinal && isLocked   ? 'border-slate-600' : ''}
">
  <button
    onclick={() => pick(homeTeam)}
    class="flex-1 flex items-center gap-1.5 px-2 w-full {rowClass(homeTeam)}"
  >
    {#if homeTeam}
      <span>{homeTeam.flag}</span><span class="truncate font-semibold uppercase">{homeTeam.name}</span>
    {:else}
      <span>—</span>
    {/if}
  </button>
  <button
    onclick={() => pick(awayTeam)}
    class="flex-1 flex items-center gap-1.5 px-2 w-full {rowClass(awayTeam)}"
  >
    {#if awayTeam}
      <span>{awayTeam.flag}</span><span class="truncate font-semibold uppercase">{awayTeam.name}</span>
    {:else}
      <span>—</span>
    {/if}
  </button>
</div>
