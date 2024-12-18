<script lang="ts">
  import Header from '$lib/components/header.svelte';
  import BottomNav from '$lib/components/bottom-nav.svelte';
  import FeedList from '$lib/components/feed/feed-list.svelte';
  import PollSection from '$lib/components/poll-section.svelte';
  import TrendingTopics from '$lib/components/trending-topics.svelte';
  import ScrollToTop from '$lib/components/scroll-to-top.svelte';
  import { navigation } from '$lib/stores/navigation';
  import UserProfile from '$lib/components/user-profile.svelte';
  import Leaderboard from '$lib/components/leaderboard.svelte';

  let showScrollTop = false;

  function handleScroll() {
    showScrollTop = window.pageYOffset > 300;
  }
</script>

<svelte:window on:scroll={handleScroll} />

<div class="min-h-screen bg-gray-100 pb-20">
  <Header />
  
  <main class="max-w-xl mx-auto p-4 space-y-4">
    {#if $navigation.currentPage === 'home'}
      <div class="space-y-4">
        <UserProfile />
        <FeedList />
        <Leaderboard />
        <PollSection />
        <TrendingTopics />
      </div>
    {:else if $navigation.currentPage === 'games'}
      <div class="bg-white rounded-xl p-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-4">
          Games Coming Soon!
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-100 p-4 rounded-lg text-center">
            <h3 class="font-semibold">Trivia Challenge</h3>
            <p class="text-sm text-gray-600">Test your knowledge!</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg text-center">
            <h3 class="font-semibold">Word Puzzle</h3>
            <p class="text-sm text-gray-600">Expand your vocabulary!</p>
          </div>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-xl p-6 text-center">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          {$navigation.currentPage.charAt(0).toUpperCase() + $navigation.currentPage.slice(1)}
        </h2>
        <p class="text-gray-600 mt-2">
          This section is coming soon!
        </p>
      </div>
    {/if}
  </main>
  
  <BottomNav />
  <ScrollToTop show={showScrollTop} />
</div>

