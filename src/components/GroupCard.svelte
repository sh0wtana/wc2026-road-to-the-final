<script>
  import { dndzone } from 'svelte-dnd-action'

  let { group, teams, onReorder } = $props()

  const BADGES = ['①', '②', '③', '④']

  function handleSort(e) {
    onReorder(e.detail.items)
  }
</script>

<div class="bg-gray-800 rounded-lg p-3 min-w-[140px]">
  <div class="text-xs font-bold text-gray-400 text-center mb-2 tracking-widest">GROUP {group}</div>
  <div
    use:dndzone={{ items: teams, flipDurationMs: 150 }}
    onfinalize={handleSort}
    onconsider={handleSort}
    class="flex flex-col gap-1"
  >
    {#each teams as team, i (team.id)}
      <div class="flex items-center gap-1.5 bg-gray-700 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing select-none text-sm">
        <span class="text-gray-500 text-xs">⠿</span>
        <span>{team.flag}</span>
        <span class="font-medium">{team.id}</span>
        <span class="ml-auto text-xs text-gray-400">{BADGES[i]}</span>
      </div>
    {/each}
  </div>
</div>
