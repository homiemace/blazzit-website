<script lang="ts">
    import { onMount } from 'svelte';
    import Header from '$lib/components/header.svelte';
    import BottomNav from '$lib/components/bottom-nav.svelte'
    import FeedItem from '$lib/components/feed-item.svelte';
    import PollSection from '$lib/components/poll-section.svelte';
    import { feedItems } from '$lib/stores';
    import type { FeedItem as FeedItemType } from '$lib/types';
  
    let isLoading = false;

onMount(() => {
  loadMoreItems();
});

function handleScroll(event: Event) {
  const target = event.target as Document;
  const scrollHeight = target.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset;
  const clientHeight = window.innerHeight;
  
  if (!isLoading && scrollHeight - scrollTop <= clientHeight + 1000) {
    loadMoreItems();
  }
}

async function loadMoreItems() {
  isLoading = true;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newItems: FeedItemType[] = Array.from({ length: 3 }, (_, i) => ({
    id: $feedItems.length + i + 1,
    timestamp: new Date(Date.now() - Math.random() * 86400000)
  }));
  
  $feedItems = [...$feedItems, ...newItems];
  isLoading = false;
}
</script>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-gray-100 pb-16">
<Header />

<main class="max-w-xl mx-auto">
  <div class="space-y-4">
    {#each $feedItems as item (item.id)}
      <FeedItem {item} />
    {/each}
    
    {#if isLoading}
      <div class="text-center p-4">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    {/if}
  </div>
  
  <div class="mt-4">
    <PollSection />
  </div>
</main>

<BottomNav />
</div>