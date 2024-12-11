<script lang="ts">
    import { slide } from 'svelte/transition';
    
    export let id: number;
    export let isExpanded = false;
  </script>
  
  <div class="relative">
    <img 
      src={`https://picsum.photos/seed/${id}/400/300`}
      alt="Post content" 
      class="w-full object-cover max-h-96"
      loading="lazy"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
    </div>
  </div>
  <div class="p-4">
    <p class="text-gray-800 mb-2">This is post number {id}. #trending</p>
    {#if isExpanded}
      <p class="text-gray-600 text-sm" transition:slide>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
    {/if}
    <button 
      class="text-red-500 text-sm font-medium"
      on:click={() => isExpanded = !isExpanded}
    >
      {isExpanded ? 'Show less' : 'Show more'}
    </button>
  </div>