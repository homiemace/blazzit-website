<script lang="ts">
  import { fade } from 'svelte/transition';
  import { formatDistanceToNow } from 'date-fns';
  import type { FeedItem } from '$lib/types';
  import VoteButtons from './vote-buttons.svelte';
  import PostActions from './post-actions.svelte';
  import PostContent from './post-content.svelte';
  import { feedStore, comment } from '$lib/stores/feed'; // Removed vote

  // Use $props() to declare and access props
  let { onVote } = $props<{
    onVote: (id: number, increment: number) => void; // Only onVote is passed as a prop
  }>();

  // Use $state for reactive state
  let isExpanded = $state(false);
  let newComment = $state(''); // State for the new comment input

  // Function to handle adding a comment
  function handleAddComment(item: FeedItem): void {
    if (newComment.trim() === '') return; // Don't add empty comments
    comment(item.id, newComment); // Use the store action
    newComment = ''; // Clear the input
  }
</script>

{#each $feedStore as item}
  <article in:fade={{ duration: 300 }} class="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
    <div class="flex items-center space-x-3 p-4">
      <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
        {item.id}
      </div>
      <div>
        <p class="font-medium text-gray-800">{item.author}</p>
        <p class="text-xs text-gray-500">
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>

    <!-- Use bind:isExpanded with the bindable prop -->
    <PostContent 
      id={item.id} 
      content={item.content} 
      bind:isExpanded 
    />

    <!-- Comment Input -->
    <div class="px-4 py-3 border-t border-gray-100">
      <textarea
        bind:value={newComment}
        placeholder="Write a comment..."
        class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
      <button
        onclick={() => handleAddComment(item)}
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add Comment
      </button>
    </div>

    <!-- Comments List -->
    <div class="px-4 py-3 border-t border-gray-100">
      {#each item.comments as comment}
        <div class="mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {comment.author.charAt(0)}
            </div>
            <div>
              <p class="font-medium text-gray-800">{comment.author}</p>
              <p class="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
          <p class="mt-2 text-gray-700">{comment.content}</p>
        </div>
      {/each}
    </div>

    <div class="flex justify-between items-center px-4 py-3 border-t border-gray-100">
      <VoteButtons 
        votes={item.votes} 
        onVote={(increment: number) => onVote(item.id, increment)}
      />
      <PostActions 
        onshare={() => console.log('Shared!')} 
        oncomment={() => console.log('Comment button clicked')} 
      />
    </div>
  </article>
{/each}
