<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { addPost } from '$lib/stores/feed'; // Import the addPost function
  import { writable } from 'svelte/store';
  import { Plus } from 'phosphor-svelte';

  let newPostContent = writable("");  
  const dispatch = createEventDispatcher();

  let showModal = writable(false);

  // Function to add a new post
  function addNewPost() {
    const content = $newPostContent;
    if (content.trim() !== "") {
      const newPost = {
        id: Math.floor(Math.random() * 1000),  // Generate a unique ID
        timestamp: new Date(),
        content: content,
        imageUrl: "https://picsum.photos/seed/3/400/300",  // Example image URL
        votes: 0,
        comments: 0,
        shares: 0,
        xpReward: 10,  // Example XP
        author: "user",  // Change as per your requirement
      };

      // Use the addPost function to add the new post
      addPost(newPost);  // Directly calling the addPost function here

      $newPostContent = "";  // Reset content field
      $showModal = false;    // Close the modal
    } else {
      alert("Please enter some content for your post.");
    }
  }
</script>

<header class="sticky top-0 bg-white z-10 border-b border-gray-200">
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center p-4 gap-4">
      <!-- Search bar and other elements -->
      <div class="flex-1 relative">
        <input
          type="text"
          placeholder="Search..."
          class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
        />
      </div>
      <!-- Add post button -->
      <button 
        class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg"
        aria-label="Create new post"
        on:click={() => $showModal = true}
      >
        <Plus size={24} weight="bold" />
      </button>
    </div>
  </div>
</header>

<!-- Modal for post creation -->
{#if $showModal}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-4 rounded-lg w-1/3">
      <h2 class="text-xl font-semibold mb-4">Create a New Post</h2>
      <textarea
        bind:value={$newPostContent}
        rows="4"
        class="w-full p-2 border rounded-lg mb-4"
        placeholder="What's on your mind?"
      ></textarea>
      <div class="flex justify-between">
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded-lg"
          on:click={() => $showModal = false}
        >
          Cancel
        </button>
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded-lg"
          on:click={addNewPost}
        >
          Post
        </button>
      </div>
    </div>
  </div>
{/if}
