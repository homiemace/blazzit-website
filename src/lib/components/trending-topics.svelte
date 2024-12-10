<script lang="ts">
  import { fly } from 'svelte/transition';
  import { trendingTopics } from '../stores';
</script>

<section class="p-4 bg-white">
  <h2 class="font-bold mb-4 text-gray-800">Trending Topics</h2>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {#each $trendingTopics as topic}
      <div 
        in:fly={{ y: 20, duration: 300 }}
        class="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
      >
        #{topic}
      </div>
    {/each}
  </div>
</section>