<script lang="ts">
    import { fade } from 'svelte/transition';
    import { ArrowUp } from 'phosphor-svelte';
  
    export let show: boolean;
  
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  </script>
  
  {#if show}
    <button
      on:click={scrollToTop}
      in:fade={{ duration: 300 }}
      out:fade={{ duration: 300 }}
      class="fixed bottom-20 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
    >
      <ArrowUp size={24} />
      <span class="sr-only">Scroll to top</span>
    </button>
  {/if}