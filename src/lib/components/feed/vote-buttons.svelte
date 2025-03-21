<script lang="ts">
  import ArrowUp from 'phosphor-svelte/lib/ArrowUp'; // Recommended for faster compilation
  import ArrowDown from 'phosphor-svelte/lib/ArrowDown'; // Recommended for faster compilation

  // Use $props() to declare and access props
  let { votes, onVote } = $props<{
    votes: number;
    onVote: (increment: number) => void;
  }>();

  // Function to handle voting
  function handleVote(increment: number): void {
    // Call the onVote prop with the increment value
    onVote(increment);
  }
</script>

<div class="flex items-center space-x-2">
  <button
    class="text-gray-500 hover:text-green-500 transition-colors"
    onclick={() => handleVote(1)}
    aria-label="Upvote"
  >
    <ArrowUp size={20} />
  </button>
  <span class="font-medium">{votes}</span>
  <button
    class="text-gray-500 hover:text-red-500 transition-colors"
    onclick={() => handleVote(-1)}
    aria-label="Downvote"
  >
    <ArrowDown size={20} />
  </button>
</div>