<script lang="ts">
    import { polls } from '../stores';
    
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
  
  <section class="p-4 border-b border-gray-200 bg-white">
    <h2 class="font-bold mb-4 text-gray-800">Daily Poll</h2>
    <div class="space-y-4">
      {#each $polls as poll, index}
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700">{poll.name}</span>
            <span class="text-gray-600">{poll.votes}%</span>
          </div>
          <div class="bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              class="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style="width: {poll.votes}%"
            ></div>
          </div>
          <div class="flex space-x-2">
            <button 
              on:click={() => handleVote(index, 1)}
              class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
            >
              Vote Up
            </button>
            <button 
              on:click={() => handleVote(index, -1)}
              class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Vote Down
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>