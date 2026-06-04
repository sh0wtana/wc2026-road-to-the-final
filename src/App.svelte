<script>
  import Header from './components/Header.svelte'
  import GroupCard from './components/GroupCard.svelte'
  import { state, resetState } from './store.svelte.js'
</script>

<div class="min-h-screen bg-gray-950 text-white">
  <Header onReset={resetState} />
  <div class="p-4">
    <GroupCard
      group="A"
      teams={state.groups.A}
      onReorder={(items) => { state.groups.A = items }}
    />
  </div>
</div>
