<script>
  let { title, teams, onPick, onClose } = $props()
</script>

<div
  class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
  onclick={onClose}
  role="dialog"
  aria-modal="true"
>
  <div
    class="bg-surface border border-border-subtle rounded-xl p-5 min-w-[230px] shadow-2xl"
    onclick={(e) => e.stopPropagation()}
  >
    <p class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
      {title}
    </p>
    <div class="flex flex-col gap-2">
      {#each teams as team (team.id)}
        <button
          onclick={() => onPick(team)}
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-raised hover:bg-amber-400 hover:text-pitch transition-colors text-left"
        >
          <span class="text-xl">{team.flag}</span>
          <span class="font-semibold">{team.name}</span>
          <span class="ml-auto text-xs opacity-60 font-normal"
            >Group {team.group}</span
          >
        </button>
      {/each}
    </div>
  </div>
</div>
