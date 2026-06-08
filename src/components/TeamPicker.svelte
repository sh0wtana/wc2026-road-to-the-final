<script>
  let { title, teams, onPick, onClose = () => {} } = $props()

  /** @type {HTMLDivElement | null} */
  let dialogEl = $state(null)

  $effect(() => {
    dialogEl?.focus()
  })

  /** @param {KeyboardEvent} e */
  function trapFocus(e) {
    e.stopPropagation()
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key !== 'Tab' || !dialogEl) return
    const focusable = /** @type {HTMLElement[]} */ ([
      ...dialogEl.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
    ])
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
</script>

<!-- backdrop for click-outside -->
<div
  class="fixed inset-0 bg-black/70 z-40"
  onclick={onClose}
  aria-hidden="true"
></div>

<div
  class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
>
  <div
    bind:this={dialogEl}
    class="bg-surface border border-border-subtle rounded-xl p-5 min-w-[230px] shadow-2xl pointer-events-auto"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    onkeydown={trapFocus}
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
