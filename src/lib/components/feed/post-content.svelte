<script lang="ts">
  import { slide } from 'svelte/transition';
  
  export let id: number;
  export let isExpanded = false;
  export let content: string;
</script>

<div class="relative">
  <img 
    src={`https://picsum.photos/seed/${id}/400/300`}
    alt="Post content" 
    class="w-full object-cover max-h-96"
    loading="lazy"
  />
  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
</div>

<div class="p-4">
  <p class="text-gray-800 mb-2">{content}</p>
  
  {#if isExpanded}
    <p class="text-gray-600 text-sm" transition:slide>
      {content}
    </p>
  {/if}
</div>
