<script lang="ts">
  import { Plus } from 'phosphor-svelte';
</script>

<header class="sticky top-0 bg-white z-10 border-b border-gray-200">
  <div class="flex justify-between items-center p-4">
    <h1 class="text-xl font-bold text-gray-800">Feed</h1>
    <button 
      class="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
      aria-label="Create new post"
    >
      <Plus size={24} />
    </button>
  </div>
</header>