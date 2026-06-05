<script>
  import { dndzone } from 'svelte-dnd-action'

  let { group, teams, onReorder } = $props()

  function handleSort(e) {
    onReorder(e.detail.items)
  }
</script>

<div class="bg-surface border border-border-subtle rounded-lg p-2">
  <div class="text-xs font-bold text-amber-400 text-center mb-2 uppercase tracking-widest">GROUP {group}</div>
  <div
    use:dndzone={{ items: teams, flipDurationMs: 150 }}
    onfinalize={handleSort}
    onconsider={handleSort}
    class="flex flex-col gap-1"
  >
    {#each teams as team, i (team.id)}
      <div class="flex items-center gap-1 bg-surface-raised hover:bg-surface-hover rounded px-1.5 py-1 cursor-grab active:cursor-grabbing select-none text-sm transition-colors">
        <span class="text-xs font-bold w-3 text-center {i < 2 ? 'text-amber-400' : 'text-slate-500'}">{i + 1}</span>
        <span>{team.flag}</span>
        <span class="font-semibold text-slate-100">{team.id}</span>
        <span class="ml-auto text-slate-400 text-xs">⠿</span>
      </div>
    {/each}
  </div>
</div>
