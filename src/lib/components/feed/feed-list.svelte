<script lang="ts">
  import { feedStore, vote } from '$lib/stores/feed';  // Import vote function
  import { user } from '$lib/stores/user';
  import VoteButtons from '$lib/components/feed/vote-buttons.svelte';  // Correctly import VoteButtons
  import PostContent from '$lib/components/feed/post-content.svelte';  // Ensure correct import
  import PostActions from '$lib/components/feed/post-actions.svelte';
  import { formatDistanceToNow } from 'date-fns';
  import { Trophy } from 'phosphor-svelte';

  let expandedPost: number | null = null;

  function handleVote(postId: number, increment: number) {
    // Call the 'vote' function from the store to update the votes
    vote(postId, increment);
  }

  function toggleExpand(id: number) {
    expandedPost = expandedPost === id ? null : id;
  }

  function handleComment(id: number) {
    feedStore.update(posts =>
      posts.map(post =>
        post.id === id ? { ...post, comments: post.comments + 1 } : post
      )
    );
    user.addExperience(2); // Add 2 XP for commenting
  }

  function handleShare(id: number) {
    feedStore.update(posts =>
      posts.map(post =>
        post.id === id ? { ...post, shares: post.shares + 1 } : post
      )
    );
    user.addExperience(5); // Add 5 XP for sharing
  }
</script>

<div class="space-y-4">
  {#each $feedStore as post (post.id)}
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <img src="https://i.pravatar.cc/40?u={post.id}" alt="User avatar" class="w-10 h-10 rounded-full" />
            <div>
              <h3 class="font-semibold">{post.author}</h3>
              <p class="text-xs text-gray-500">{formatDistanceToNow(post.timestamp)} ago</p>
            </div>
          </div>
          <div class="flex items-center space-x-1 text-yellow-500">
            <Trophy size={16} weight="fill" />
            <span class="text-xs font-medium">+{post.xpReward} XP</span>
          </div>
        </div>
        
        <!-- Pass the individual properties to PostContent -->
        <PostContent 
          id={post.id} 
          content={post.content} 
          isExpanded={expandedPost === post.id} 
        />
        
        <button 
          class="text-sm text-gray-500 mt-2 hover:text-gray-700"
          on:click={() => toggleExpand(post.id)}
        >
          {expandedPost === post.id ? 'Show less' : 'Show more'}
        </button>
      </div>
      
      <div class="border-t border-gray-100 px-4 py-2 flex justify-between items-center">
        <!-- Pass only the votes to VoteButtons component -->
        <VoteButtons 
          votes={post.votes} 
          on:vote={(event) => handleVote(post.id, event.detail)} />
        <PostActions 
          on:comment={() => handleComment(post.id)}
          on:share={() => handleShare(post.id)}
        />
      </div>
      
      <div class="bg-gray-50 px-4 py-2 text-sm text-gray-500">
        <span>{post.comments} comments</span>
        <span class="mx-2">•</span>
        <span>{post.shares} shares</span>
      </div>
    </div>
  {/each}
</div>
