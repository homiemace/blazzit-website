import { writable } from 'svelte/store';
import type { Poll, FeedItem } from './types';

export const polls = writable<Poll[]>([
  { name: 'Bob', votes: 45 },
  { name: 'Ross', votes: 55 }
]);

export const feedItems = writable<FeedItem[]>([]);

export const page = writable<string>('home');

export const trendingTopics = writable([
  'Digital Art',
  'Web Development',
  'Gaming',
  'Technology',
  'Music',
  'Sports',
  'Fashion',
  'Food'
]);