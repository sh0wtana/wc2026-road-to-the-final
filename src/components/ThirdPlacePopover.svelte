<script>
  let { anchorRect, title, teams, onPick, onClose = () => {} } = $props()

  const WIDTH = 210
  const ROW_HEIGHT = 44
  const EMPTY_HEIGHT = 56
  const HEADER_HEIGHT = 36
  const GAP = 8

  /** @type {HTMLDivElement | null} */
  let dialogEl = $state(null)
  let winW = $state(window.innerWidth)
  let winH = $state(window.innerHeight)

  $effect(() => {
    dialogEl?.focus()
  })

  $effect(() => {
    function onResize() {
      winW = window.innerWidth
      winH = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const style = $derived.by(() => {
    if (!anchorRect) return ''
    const contentHeight =
      teams.length > 0 ? teams.length * ROW_HEIGHT : EMPTY_HEIGHT
    const estimatedHeight = HEADER_HEIGHT + contentHeight + 16
    const isRightSide = anchorRect.left > winW / 2

    const rawLeft = isRightSide
      ? anchorRect.left - WIDTH - GAP
      : anchorRect.right + GAP
    const left = Math.max(8, Math.min(winW - WIDTH - 8, rawLeft))

    const spaceBelow = winH - anchorRect.top
    const top =
      spaceBelow < estimatedHeight + 16
        ? Math.max(8, anchorRect.bottom - estimatedHeight)
        : anchorRect.top

    return `top:${top}px; left:${left}px; width:${WIDTH}px;`
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
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  class="fixed inset-0 z-40"
  onclick={() => onClose()}
  aria-hidden="true"
></div>

<div
  bind:this={dialogEl}
  {style}
  class="fixed z-50 bg-surface border border-border-subtle rounded-xl p-3 shadow-2xl"
  role="dialog"
  aria-modal="true"
  aria-label={title}
  tabindex="-1"
  onclick={(e) => e.stopPropagation()}
  onkeydown={trapFocus}
>
  <p class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
    {title}
  </p>
  <div class="flex flex-col gap-1.5">
    {#if teams.length === 0}
      <p class="text-xs text-slate-400 text-center py-2 italic">
        No eligible teams available
      </p>
    {:else}
      {#each teams as team (team.id)}
        <button
          onclick={() => onPick(team)}
          class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface-raised hover:bg-amber-400 hover:text-pitch transition-colors text-left w-full"
        >
          <span class="text-lg">{team.flag}</span>
          <span class="font-semibold text-sm truncate">{team.name}</span>
          <span class="ml-auto text-xs text-slate-200 font-bold shrink-0"
            >{team.group}</span
          >
        </button>
      {/each}
    {/if}
  </div>
</div>
