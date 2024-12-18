<script lang="ts">
  import { feedStore, addPost } from '$lib/stores/feed'; // Import the addPost function
  import { onMount } from 'svelte';
  
  let newText = '';  // Text input for the post
  let imageFile: File | null = null;  // Store selected image
  let author = 'user';  // Author, could be dynamic based on the logged-in user
  
  // Function to handle adding a new post
  function handleAddPost(): void {
    if (!imageFile) {
      alert('Please upload an image.');
      return;
    }

    const postId = Date.now();  // Generate a unique post ID using timestamp
    const reader = new FileReader();

    reader.onloadend = function () {
      const imageUrl = reader.result as string;

      // Create a new post object
      const newPost = {
        id: postId,
        timestamp: new Date(),
        content: newText,
        imageUrl: imageUrl,
        votes: 0,
        comments: 0,
        shares: 0,
        xpReward: 10,
        author: author,  // Author could be dynamic, based on logged-in user
      };

      // Add the new post to the store using the imported addPost function
      addPost(newPost);
      newText = '';  // Clear the input fields
      imageFile = null;
    };

    reader.readAsDataURL(imageFile);  // Convert the image to base64
  }

  // Function to handle image file input
  function handleImageUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    imageFile = target.files ? target.files[0] : null;
  }
</script>

<div>
  <input type="file" accept="image/*" on:change={handleImageUpload} />
  <input type="text" bind:value={newText} placeholder="Enter text for post" />
  <button on:click={handleAddPost}>Add Post</button>
</div>

<!-- Display posts from the feed store -->
{#each $feedStore as post (post.id)}
  <div class="post">
    <img src={post.imageUrl} alt="Post Image" style="width: 100px; height: 100px;" />
    <p>{post.content}</p>
    <p>Author: {post.author}</p>
    <p>Votes: {post.votes}</p>
    <p>Comments: {post.comments}</p>
    <p>Shares: {post.shares}</p>
  </div>
{/each}
