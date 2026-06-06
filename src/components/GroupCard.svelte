<script>
  import { dndzone } from 'svelte-dnd-action'
  import { pushSnapshot } from '../store.svelte.js'

  let { group, teams, onReorder } = $props()
  let _dragging = false

  function handleFinalize(e) {
    _dragging = false
    onReorder(e.detail.items)
  }

  function handleConsider(e) {
    if (!_dragging) {
      _dragging = true
      pushSnapshot()
    }
    onReorder(e.detail.items)
  }
</script>

<div class="bg-surface border border-border-subtle rounded-lg p-2">
  <div class="text-xs font-bold text-amber-400 text-center mb-2 uppercase tracking-widest">GROUP {group}</div>
  <div
    use:dndzone={{ items: teams, flipDurationMs: 150 }}
    onfinalize={handleFinalize}
    onconsider={handleConsider}
    class="flex flex-col gap-1"
  >
    {#each teams as team, i (team.id)}
      <div class="relative group/row flex items-center gap-1 bg-surface-raised hover:bg-surface-hover rounded px-1.5 py-1 cursor-grab active:cursor-grabbing select-none text-sm transition-colors">
        <span class="text-sm w-4 text-center leading-none {i === 3 ? 'text-slate-600 font-bold' : ''}">{['🥇','🥈','🥉','4'][i]}</span>
        <span>{team.flag}</span>
        <span class="font-semibold text-slate-100">{team.id}</span>
        <span class="ml-auto text-slate-400 text-xs">⠿</span>
        <!-- Tooltip -->
        <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50
          opacity-0 group-hover/row:opacity-100 transition-opacity duration-150
          bg-slate-900 border border-slate-600 rounded px-2 py-1 whitespace-nowrap shadow-lg">
          <span class="text-slate-100 font-semibold text-xs">{team.name}</span>
          <span class="text-slate-400 text-xs ml-1.5">FIFA #{team.rank}</span>
        </div>
      </div>
    {/each}
  </div>
</div>
