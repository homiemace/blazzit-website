<script lang="ts">
  import { fade } from 'svelte/transition';
  import { formatDistanceToNow } from 'date-fns';
  import { toast } from '@zerodevx/svelte-toast';
  import type { FeedItem } from '../types';
  import VoteButtons from './feed/vote-buttons.svelte';
  import PostActions from './feed/post-actions.svelte';
  import PostContent from './feed/post-content.svelte';

  // Use $props() to declare and access props
  let { item } = $props<{ item: FeedItem }>();

  // Use $derived for reactive computations
  let timeAgo = $derived(formatDistanceToNow(item.timestamp, { addSuffix: true }));

  // Use $state for reactive state
  let isExpanded = $state(false);

  // Function to handle the vote update
  function handleVote(increment: number): void {
    item.votes += increment;  // Update the votes directly in the item
    toast.push(increment > 0 ? 'Upvoted!' : 'Downvoted!', {
      theme: {
        '--toastBackground': '#4F46E5',
        '--toastColor': 'white',
      }
    });
  }

  // Function to handle sharing
  function handleShare(): void {
    toast.push('Link copied to clipboard!', {
      theme: {
        '--toastBackground': '#4F46E5',
        '--toastColor': 'white',
      }
    });
  }

  // Function to handle commenting
  function handleComment(): void {
    // Add your comment handling logic here
    console.log('Comment button clicked');
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

  <!-- Use bind:isExpanded with the bindable prop -->
  <PostContent 
    id={item.id} 
    content={item.content} 
    bind:isExpanded 
  />

  <div class="flex justify-between items-center px-4 py-3 border-t border-gray-100">
    <!-- Pass votes to VoteButtons component and listen for 'vote' event -->
    <VoteButtons 
      votes={item.votes} 
      onVote={(increment: number) => handleVote(increment)} 
    />
    <PostActions 
      onshare={handleShare} 
      oncomment={handleComment} 
    />
  </div>
</article>