<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import Bracket from './components/Bracket.svelte'
  import { resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gradient-to-br from-pitch to-pitch-end text-slate-100">
  <Header onReset={resetState} />
  <GroupSection />
  <Bracket />
</div>
