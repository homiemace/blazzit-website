<script lang="ts">
    import { ArrowUp, ArrowDown } from 'phosphor-svelte';
    import { createEventDispatcher } from 'svelte';
  
    export let votes = 0;
    const dispatch = createEventDispatcher();
  
    function handleVote(increment: number) {
      dispatch('vote', increment);
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