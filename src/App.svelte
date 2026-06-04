<script>
  import Header from './components/Header.svelte'
  import GroupSection from './components/GroupSection.svelte'
  import Bracket from './components/Bracket.svelte'
  import { resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
  <GroupSection />
  <Bracket />
</div>
