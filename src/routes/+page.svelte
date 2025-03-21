<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import BottomNav from '$lib/components/bottom-nav.svelte';
	import FeedList from '$lib/components/feed/feed-list.svelte';
	import PollSection from '$lib/components/poll-section.svelte';
	import TrendingTopics from '$lib/components/trending-topics.svelte';
	import ScrollToTop from '$lib/components/scroll-to-top.svelte';
	import UserProfile from '$lib/components/user-profile.svelte';
	import Leaderboard from '$lib/components/leaderboard.svelte';
	import { navigation } from '$lib/stores/navigation';
	import { vote } from '$lib/stores/feed';
  
	// Declare reactive state variables
	let isLoading = $state(false);
	let showScrollTop = $state(false);
	let error = $state<string | null>(null);
  
	// Function to handle scroll events
	function handleScroll(): void {
	  showScrollTop = window.pageYOffset > 300;
	}
  
	// Listen to scroll events on the window
	$effect(() => {
	  window.addEventListener('scroll', handleScroll);
	  return () => window.removeEventListener('scroll', handleScroll);
	});
  
	// Simulate fetching feed items (no longer needed since we use mock data)
	async function fetchFeedItems(): Promise<void> {
	  isLoading = true;
	  error = null;
  
	  try {
		// Simulate a delay to mimic network latency
		await new Promise((resolve) => setTimeout(resolve, 1000));
	  } catch (err) {
		error = err instanceof Error ? err.message : 'An unknown error occurred';
		console.error('Failed to fetch feed items:', err);
	  } finally {
		isLoading = false;
	  }
	}
  
	// Fetch feed items when the component mounts
	$effect(() => {
	  fetchFeedItems();
	});
  </script>
  
  <div class="min-h-screen bg-gray-100 pb-20">
	<Header />
  
	<main class="mx-auto max-w-xl space-y-4 p-4">
	  {#if isLoading}
		<div class="py-4 text-center">Loading...</div>
	  {:else if error}
		<div class="py-4 text-center text-red-500">{error}</div>
	  {:else if $navigation.currentPage === 'home'}
		<div class="space-y-4">
		  <UserProfile />
		  <FeedList onVote={vote} /> <!-- Pass only the onVote function -->
		  <Leaderboard />
		  <PollSection />
		  <TrendingTopics />
		</div>
	  {:else if $navigation.currentPage === 'games'}
		<div class="rounded-xl bg-white p-6">
		  <h2
			class="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent"
		  >
			Games Coming Soon!
		  </h2>
		  <div class="grid grid-cols-2 gap-4">
			<div class="rounded-lg bg-gray-100 p-4 text-center">
			  <h3 class="font-semibold">Trivia Challenge</h3>
			  <p class="text-sm text-gray-600">Test your knowledge!</p>
			</div>
			<div class="rounded-lg bg-gray-100 p-4 text-center">
			  <h3 class="font-semibold">Word Puzzle</h3>
			  <p class="text-sm text-gray-600">Expand your vocabulary!</p>
			</div>
		  </div>
		</div>
	  {:else}
		<div class="rounded-xl bg-white p-6 text-center">
		  <h2
			class="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent"
		  >
			{$navigation.currentPage.charAt(0).toUpperCase() + $navigation.currentPage.slice(1)}
		  </h2>
		  <p class="mt-2 text-gray-600">This section is coming soon!</p>
		</div>
	  {/if}
	</main>
  
	<BottomNav />
	<ScrollToTop show={showScrollTop} />
  </div>