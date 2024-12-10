<script lang="ts">
  import { fade } from 'svelte/transition';
  import { ArrowUp, ArrowDown } from 'phosphor-svelte';
  import { formatDistanceToNow } from 'date-fns';
  import type { FeedItem } from '../types';

  export let item: FeedItem;
  
  $: timeAgo = formatDistanceToNow(item.timestamp, { addSuffix: true });
  
  let votes = 0;
  
  function handleVote(increment: number) {
    votes += increment;
  }
</script>

<article 
  in:fade={{ duration: 300 }} 
  class="bg-white"
>
  <div class="flex items-center space-x-3 p-4">
    <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
    <div>
      <p class="font-medium text-gray-800">User{item.id}</p>
      <p class="text-xs text-gray-500">{timeAgo}</p>
    </div>
  </div>
  
  <div class="mb-4">
    <img 
      src={`https://picsum.photos/seed/${item.id}/400/300`}
      alt="Post content" 
      class="w-full object-cover rounded-xl max-h-96"
      loading="lazy"
    />
    <div class="p-4">
      <p class="text-gray-800">This is post number {item.id}. #trending</p>
    </div>
  </div>
  
  <div class="flex justify-between text-gray-500 px-4 pb-4">
    <button 
      on:click={() => handleVote(1)}
      class="flex items-center space-x-2 hover:text-blue-500 transition-colors"
    >
      <ArrowUp size={20} />
      <span>Upvote {votes > 0 ? `(${votes})` : ''}</span>
    </button>
    <button 
      on:click={() => handleVote(-1)}
      class="flex items-center space-x-2 hover:text-red-500 transition-colors"
    >
      <ArrowDown size={20} />
      <span>Downvote {votes < 0 ? `(${Math.abs(votes)})` : ''}</span>
    </button>
  </div>
</article>