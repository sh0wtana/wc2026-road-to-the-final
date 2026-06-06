<script>
  import { undo, redo, canUndo, canRedo } from '../store.svelte.js'
  let { onReset } = $props()
</script>

<header class="flex items-center justify-between px-6 py-3 bg-surface border-b-2 border-amber-400">
  <div class="flex items-center gap-3">
    <h1 class="text-lg font-bold tracking-wide text-slate-100">🏆 FIFA World Cup 2026 Road to the Final</h1>
    <div class="flex items-center gap-1">
      <button
        onclick={undo}
        disabled={!canUndo()}
        class="w-7 h-7 flex items-center justify-center rounded text-slate-100 transition-colors
          {canUndo() ? 'hover:bg-surface-raised cursor-pointer' : 'opacity-25 cursor-default'}"
        title="Undo"
      >↩</button>
      <button
        onclick={redo}
        disabled={!canRedo()}
        class="w-7 h-7 flex items-center justify-center rounded text-slate-100 transition-colors
          {canRedo() ? 'hover:bg-surface-raised cursor-pointer' : 'opacity-25 cursor-default'}"
        title="Redo"
      >↪</button>
    </div>
  </div>
  <button
    onclick={onReset}
    class="px-4 py-1.5 text-sm bg-red-700 hover:bg-red-600 rounded font-medium transition-colors"
  >
    Reset
  </button>
</header>
