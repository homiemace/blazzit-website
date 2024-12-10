<script lang="ts">
    import { House, MagnifyingGlass, Users, LockSimple } from 'phosphor-svelte';
    
    const navItems = [
      { icon: House, label: 'Home' },
      { icon: MagnifyingGlass, label: 'Search' },
      { icon: Users, label: 'Friends' },
      { icon: LockSimple, label: 'Account' }
    ];
  </script>
  
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
    <div class="max-w-4xl mx-auto flex justify-between items-center">
      {#each navItems as item}
        <button 
          class="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors"
          aria-label={item.label}
        >
          <svelte:component this={item.icon} size={24} />
          <span class="text-xs mt-1">{item.label}</span>
        </button>
      {/each}
    </div>
  </nav>