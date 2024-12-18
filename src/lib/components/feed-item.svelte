<script lang="ts">
  import { fade } from 'svelte/transition';
  import { formatDistanceToNow } from 'date-fns';
  import { toast } from '@zerodevx/svelte-toast';
  import type { FeedItem } from '../types';
  import VoteButtons from './feed/vote-buttons.svelte';
  import PostActions from './feed/post-actions.svelte';
  import PostContent from './feed/post-content.svelte';

  export let item: FeedItem;  // Expect item to be a FeedItem object

  $: timeAgo = formatDistanceToNow(item.timestamp, { addSuffix: true });
  let isExpanded = false;

  // Function to handle the vote update
  function handleVote(increment: number) {
    item.votes += increment;  // Update the votes directly in the item
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

<article in:fade={{ duration: 300 }} class="bg-white rounded-xl shadow-sm overflow-hidden">
  <div class="flex items-center space-x-3 p-4">
    <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
      {item.id}
    </div>
    <div>
      <p class="font-medium text-gray-800">{item.author}</p>
      <p class="text-xs text-gray-500">{timeAgo}</p>
    </div>
  </div>

  <PostContent 
    id={item.id} 
    content={item.content} 
    bind:isExpanded 
  />

  <div class="flex justify-between items-center px-4 py-3 border-t border-gray-100">
    <!-- Pass votes to VoteButtons component and listen for 'vote' event -->
    <VoteButtons votes={item.votes} on:vote={(event) => handleVote(event.detail)} />
    <PostActions on:share={handleShare} />
  </div>
</article>
