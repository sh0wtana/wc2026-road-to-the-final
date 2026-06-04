<script>
  import GroupCard from './GroupCard.svelte'
  import { state } from '../store.svelte.js'

  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
</script>

<section class="px-4 py-4 border-b border-gray-800">
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
    {#each GROUPS as g}
      <GroupCard
        group={g}
        teams={state.groups[g]}
        onReorder={(items) => { state.groups[g] = items }}
      />
    {/each}
  </div>
</section>
