<script lang="ts">
  import ChatDots from 'phosphor-svelte/lib/ChatDots';
  import Share from 'phosphor-svelte/lib/Share';

  let { onshare, oncomment } = $props<{
    onshare: () => void;
    oncomment: () => void;
  }>();
</script>

<div class="flex space-x-4">
  <button 
    class="text-gray-500 hover:text-blue-500 transition-colors"
    onclick={oncomment}
    aria-label="Comment"
  >
    <ChatDots size={20} />
  </button>
  <button 
    class="text-gray-500 hover:text-blue-500 transition-colors"
    onclick={onshare} 
    aria-label="Share"
  >
    <Share size={20} />
  </button>
</div>