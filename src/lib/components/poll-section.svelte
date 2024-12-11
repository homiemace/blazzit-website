<script lang="ts">
  import { polls } from '../stores';
  import { slide } from 'svelte/transition';
  
  function handleVote(index: number, increment: number) {
    $polls = $polls.map((poll, i) => {
      if (i === index) {
        return {
          ...poll,
          votes: Math.max(0, Math.min(100, poll.votes + increment))
        };
      }
      return poll;
    });
  }
</script>

<section class="bg-white rounded-xl p-4 shadow-sm">
  <h2 class="font-bold mb-4 text-gray-800 flex items-center">
    <span class="bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">Daily Poll</span>
  </h2>
  <div class="space-y-4">
    {#each $polls as poll, index}
      <div class="space-y-2" in:slide>
        <div class="flex justify-between text-sm">
          <span class="font-medium text-gray-700">{poll.name}</span>
          <span class="text-gray-600">{poll.votes}%</span>
        </div>
        <div class="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            class="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-500 ease-out"
            style="width: {poll.votes}%"
          ></div>
        </div>
        <div class="flex space-x-2">
          <button 
            on:click={() => handleVote(index, 1)}
            class="flex-1 text-sm bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Vote Up
          </button>
          <button 
            on:click={() => handleVote(index, -1)}
            class="flex-1 text-sm border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Vote Down
          </button>
        </div>
      </div>
    {/each}
  </div>
</section>