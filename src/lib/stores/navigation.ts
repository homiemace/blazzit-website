import { writable } from 'svelte/store';

export type Page = 'home' | 'games' | 'friends' | 'account';

interface NavigationStore {
  currentPage: Page;
}

function createNavigationStore() {
  const { subscribe, set, update } = writable<NavigationStore>({
    currentPage: 'home'
  });

  return {
    subscribe,
    navigateTo: (page: Page) => update(store => ({ ...store, currentPage: page })),
    reset: () => set({ currentPage: 'home' })
  };
}

export const navigation = createNavigationStore();