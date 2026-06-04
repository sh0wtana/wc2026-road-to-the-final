<script>
  let { title, teams, onPick, onClose } = $props()
</script>

<div
  class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  onclick={onClose}
  role="dialog"
  aria-modal="true"
>
  <div
    class="bg-gray-800 rounded-xl p-5 min-w-[230px] shadow-2xl border border-gray-700"
    onclick={(e) => e.stopPropagation()}
  >
    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
    <div class="flex flex-col gap-2">
      {#each teams as team (team.id)}
        <button
          onclick={() => onPick(team)}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-700 hover:bg-blue-600 transition-colors text-left"
        >
          <span class="text-xl">{team.flag}</span>
          <span class="font-medium">{team.name}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
