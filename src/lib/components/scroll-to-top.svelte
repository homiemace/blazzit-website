<script lang="ts">
  import { fade } from 'svelte/transition';
  import ArrowUp from 'phosphor-svelte/lib/ArrowUp'; // Recommended for faster compilation

  // Use $props() to declare and access props
  let { show } = $props<{ show: boolean }>();

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

{#if show}
  <button
    onclick={scrollToTop} 
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 300 }}
    class="fixed bottom-20 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg bg-gradient-to-r from-red-500 to-orange-500 transition-opacity hover:opacity-90"
    aria-label="Scroll to top"
  >
    <ArrowUp size={24} />
    <span class="sr-only">Scroll to top</span>
  </button>
{/if}