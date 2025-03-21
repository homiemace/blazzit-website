<script lang="ts">
  import { slide } from 'svelte/transition';

  // Use $props() to declare and access props
  let { id, isExpanded = $bindable(false), content } = $props<{
    id: number;
    isExpanded?: boolean;
    content: string;
  }>();
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