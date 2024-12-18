import { writable } from 'svelte/store';
import type { FeedItem } from '$lib/types';

// Define the writable store for FeedItems
export const feedStore = writable<FeedItem[]>([]);

// Add a new post to the store
export const addPost = (post: FeedItem) => {
  feedStore.update(posts => [...posts, post]);
};

// Vote on a post by incrementing or decrementing the 'votes' property
export const vote = (id: number, increment: number) => {
  feedStore.update(posts =>
    posts.map(post =>
      post.id === id ? { ...post, votes: post.votes + increment } : post // Update 'votes' (plural) correctly
    )
  );
};

// Comment on a post by incrementing the 'comments' property
export const comment = (id: number) => {
  feedStore.update(posts =>
    posts.map(post =>
      post.id === id ? { ...post, comments: post.comments + 1 } : post
    )
  );
};

// Share a post by incrementing the 'shares' property
export const share = (id: number) => {
  feedStore.update(posts =>
    posts.map(post =>
      post.id === id ? { ...post, shares: post.shares + 1 } : post
    )
  );
};
