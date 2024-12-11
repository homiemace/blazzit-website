<script lang="ts">
    import { ChatDots, Share } from 'phosphor-svelte';
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  </script>
  
  <div class="flex space-x-4">
    <button 
      class="text-gray-500 hover:text-red-500 transition-colors"
      on:click={() => dispatch('comment')}
    >
      <ChatDots size={20} />
    </button>
    <button 
      class="text-gray-500 hover:text-red-500 transition-colors"
      on:click={() => dispatch('share')}
    >
      <Share size={20} />
    </button>
  </div>