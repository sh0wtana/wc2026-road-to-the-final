<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import Bracket from './components/Bracket.svelte'
  import { resetState } from './store.svelte.js'

  const DESIGN_WIDTH = 1360

  let scale = $state(Math.min(1, window.innerWidth / DESIGN_WIDTH))
  let offset = $state(
    Math.round(Math.max(0, window.innerWidth - DESIGN_WIDTH) / 2)
  )
  let scaledHeight = $derived(window.innerHeight / scale)

  $effect(() => {
    function onResize() {
      scale = Math.min(1, window.innerWidth / DESIGN_WIDTH)
      offset = Math.round(Math.max(0, window.innerWidth - DESIGN_WIDTH) / 2)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })
</script>

<div class="bg-pitch" style="width:100vw;height:100vh;overflow:hidden">
  <div
    class="flex flex-col bg-gradient-to-br from-pitch to-pitch-end text-slate-100"
    style="width:{DESIGN_WIDTH}px;height:{scaledHeight}px;transform:translateX({offset}px) scale({scale});transform-origin:top left"
  >
    <Header onReset={resetState} />
    <GroupSection />
    <Bracket />
  </div>
</div>
