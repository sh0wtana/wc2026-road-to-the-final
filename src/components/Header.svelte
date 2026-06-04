<script>
  let { onReset } = $props()
</script>

<header class="flex items-center justify-between px-6 py-3 bg-surface border-b-2 border-amber-400">
  <h1 class="text-lg font-bold tracking-wide text-slate-100">🏆 FIFA World Cup 2026 Simulator</h1>
  <button
    onclick={onReset}
    class="px-4 py-1.5 text-sm bg-red-700 hover:bg-red-600 rounded font-medium transition-colors"
  >
    Reset
  </button>
</header>
