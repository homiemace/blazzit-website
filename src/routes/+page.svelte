<script lang="ts">
    import { onMount } from 'svelte';
    import { SvelteToast } from '@zerodevx/svelte-toast';
    import Header from '$lib/components/header.svelte';
    import BottomNav from '$lib/components/bottom-nav.svelte';
    import FeedItem from '$lib/components/feed-item.svelte';
    import PollSection from '$lib/components/poll-section.svelte';
    import TrendingTopics from '$lib/components/trending-topics.svelte';
    import { feedItems } from '$lib/stores';
    import { navigation } from '$lib/stores/navigation';
    import type { FeedItem as FeedItemType } from '$lib/types';

    let isLoading = false;

    // Removed `loadMoreItems()` from `onMount` to prevent auto generation on page load.
    onMount(() => {
        console.log('Component mounted');
    });

    // Removed the scroll listener and function that triggered `loadMoreItems`.
    function handleSearch(event: CustomEvent<string>) {
        console.log('Searching for:', event.detail);
    }
</script>

<SvelteToast />
<!-- Removed scroll listener -->
<div class="min-h-screen bg-gray-100 pb-20">
    <Header on:search={handleSearch} />

    <main class="max-w-xl mx-auto p-4 space-y-4">
        {#if $navigation.currentPage === 'home'}
            <div class="space-y-4">
                {#each $feedItems as item (item.id)}
                    <FeedItem {item} />
                {/each}
                
                {#if isLoading}
                    <div class="text-center p-4">
                        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
                    </div>
                {/if}
            </div>
            
            <div class="space-y-4">
                <PollSection />
                <TrendingTopics />
            </div>
        {:else if $navigation.currentPage === 'games'}
            <div class="bg-white rounded-xl p-6 text-center">
                <h2 class="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
                    Games Coming Soon!
                </h2>
                <p class="text-gray-600 mt-2">
                    Stay tuned for exciting mini-games and challenges.
                </p>
            </div>
        {:else}
            <div class="bg-white rounded-xl p-6 text-center">
                <h2 class="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
                    {$navigation.currentPage.charAt(0).toUpperCase() + $navigation.currentPage.slice(1)}
                </h2>
                <p class="text-gray-600 mt-2">
                    This section is coming soon!
                </p>
            </div>
        {/if}
    </main>

    <BottomNav />
</div>
