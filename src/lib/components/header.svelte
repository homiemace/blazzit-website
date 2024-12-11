<script lang="ts">
  import { MagnifyingGlass, Plus } from 'phosphor-svelte';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  let searchQuery = '';
  
  function handleSearch() {
    dispatch('search', searchQuery);
  }
</script>

<header class="sticky top-0 bg-white z-10 border-b border-gray-200">
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center p-4 gap-4">
      <div class="flex-1 relative">
        <input
          type="text"
          placeholder="Search..."
          bind:value={searchQuery}
          on:input={handleSearch}
          class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
        />
        <MagnifyingGlass 
          size={20} 
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
      </div>
      <button 
        class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg"
        aria-label="Create new post"
      >
        <Plus size={24} weight="bold" />
      </button>
    </div>
  </div>
</header>