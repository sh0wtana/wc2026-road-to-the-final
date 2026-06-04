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
