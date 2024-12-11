<script lang="ts">
  import { fade } from 'svelte/transition';
  import { formatDistanceToNow } from 'date-fns';
  import { toast } from '@zerodevx/svelte-toast';
  import type { FeedItem } from '../types';
  import VoteButtons from './feed/vote-buttons.svelte';
  import PostActions from './feed/post-actions.svelte';
  import PostContent from './feed/post-content.svelte';

  export let item: FeedItem;
  
  $: timeAgo = formatDistanceToNow(item.timestamp, { addSuffix: true });
  
  let votes = 0;
  let isExpanded = false;
  
  function handleVote(event: CustomEvent<number>) {
    const increment = event.detail;
    votes += increment;
    toast.push(increment > 0 ? 'Upvoted!' : 'Downvoted!', {
      theme: {
        '--toastBackground': '#4F46E5',
        '--toastColor': 'white',
      }
    });
  }
  
  function handleShare() {
    toast.push('Link copied to clipboard!', {
      theme: {
        '--toastBackground': '#4F46E5',
        '--toastColor': 'white',
      }
    });
  }
</script>

<article 
  in:fade={{ duration: 300 }} 
  class="bg-white rounded-xl shadow-sm overflow-hidden"
>
  <div class="flex items-center space-x-3 p-4">
    <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
      {item.id}
    </div>
    <div>
      <p class="font-medium text-gray-800">User{item.id}</p>
      <p class="text-xs text-gray-500">{timeAgo}</p>
    </div>
  </div>
  
  <PostContent id={item.id} bind:isExpanded />
  
  <div class="flex justify-between items-center px-4 py-3 border-t border-gray-100">
    <VoteButtons {votes} on:vote={handleVote} />
    <PostActions on:share={handleShare} />
  </div>
</article>