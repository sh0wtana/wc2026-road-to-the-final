<script>
  import GroupCard from './GroupCard.svelte'
  import { state } from '../store.svelte.js'

  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
</script>

<section class="shrink-0 px-4 py-1.5 border-b border-gray-800">
  <div class="grid grid-cols-12 gap-2">
    {#each GROUPS as g}
      <GroupCard
        group={g}
        teams={state.groups[g]}
        onReorder={(items) => { state.groups[g] = items }}
      />
    {/each}
  </div>
</section>
