<script lang="ts">
  import { ArrowUp, ArrowDown } from 'phosphor-svelte';
  import { createEventDispatcher } from 'svelte';

  export let votes = 0;  // Expect a 'votes' prop passed from parent
  const dispatch = createEventDispatcher();

  // Function to handle vote button clicks and dispatch the event
  function handleVote(increment: number) {
    dispatch('vote', increment);  // Dispatch 'vote' event with increment value
  }
</script>

<div class="flex space-x-6">
  <button 
    on:click={() => handleVote(1)}
    class="flex items-center space-x-2 hover:text-red-500 transition-colors"
    class:text-red-500={votes > 0}
  >
    <ArrowUp size={20} weight={votes > 0 ? "fill" : "regular"} />
    <span class="text-sm font-medium">{votes > 0 ? votes : ''}</span>
  </button>
  <button 
    on:click={() => handleVote(-1)}
    class="flex items-center space-x-2 hover:text-red-500 transition-colors"
    class:text-red-500={votes < 0}
  >
    <ArrowDown size={20} weight={votes < 0 ? "fill" : "regular"} />
    <span class="text-sm font-medium">{votes < 0 ? Math.abs(votes) : ''}</span>
  </button>
</div>
