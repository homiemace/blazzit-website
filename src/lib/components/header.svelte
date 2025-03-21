<script lang="ts">
	import { addPost } from '$lib/stores/feed'; // Import the addPost function
	import Plus from 'phosphor-svelte/lib/Plus'; // Recommended for faster compilation
  
	// Reactive state using Svelte 5's $state
	let newPostContent = $state('');
	let showModal = $state(false);
  
	// Function to add a new post
	function addNewPost(): void {
	  const content = newPostContent;
	  if (content.trim() !== '') {
		const newPost = {
		  id: Math.floor(Math.random() * 1000), // Generate a unique ID
		  timestamp: new Date(),
		  content: content,
		  imageUrl: 'https://picsum.photos/seed/3/400/300', // Example image URL
		  votes: 0,
		  comments: [], // Comments should be an array, not a number
		  shares: 0,
		  xpReward: 10, // Example XP
		  author: 'user' // Change as per your requirement
		};
  
		// Use the addPost function to add the new post
		addPost(newPost); // Directly calling the addPost function here
  
		newPostContent = ''; // Reset content field
		showModal = false; // Close the modal
	  } else {
		alert('Please enter some content for your post.');
	  }
	}
  </script>
  
  <header class="sticky top-0 z-10 border-b border-gray-200 bg-white">
	<div class="mx-auto max-w-4xl">
	  <div class="flex items-center gap-4 p-4">
		<!-- Search bar and other elements -->
		<div class="relative flex-1">
		  <input
			type="text"
			placeholder="Search..."
			class="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-200 ease-in-out"
		  />
		</div>
		<!-- Add post button -->
		<button
		  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg transition-opacity hover:opacity-90"
		  aria-label="Create new post"
		  onclick={() => (showModal = true)}
		>
		  <Plus size={24} weight="bold" />
		</button>
	  </div>
	</div>
  </header>
  
  <!-- Modal for post creation -->
  {#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
	  <div class="w-1/3 rounded-lg bg-white p-4">
		<h2 class="mb-4 text-xl font-semibold">Create a New Post</h2>
		<textarea
		  bind:value={newPostContent}
		  rows="4"
		  class="mb-4 w-full rounded-lg border p-2"
		  placeholder="What's on your mind?"
		></textarea>
		<div class="flex justify-between">
		  <button
			class="rounded-lg bg-gray-500 px-4 py-2 text-white"
			onclick={() => (showModal = false)}
		  >
			Cancel
		  </button>
		  <button class="rounded-lg bg-blue-500 px-4 py-2 text-white" onclick={addNewPost}>
			Post
		  </button>
		</div>
	  </div>
	</div>
  {/if}
  
  <style lang="postcss">
	input:focus {
	  box-shadow:
		inset 4px 4px 12px #c5c5c5,
		inset -4px -4px 12px #ffffff;
	}
  
	input::placeholder {
	  transition: color 0.3s ease-in-out;
	}
  
	input:focus::placeholder {
	  color: transparent;
	}
  </style>