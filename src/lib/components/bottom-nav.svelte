<script lang="ts">
	import House from 'phosphor-svelte/lib/House';
	import GameController from 'phosphor-svelte/lib/GameController';
	import Users from 'phosphor-svelte/lib/Users';
	import User from 'phosphor-svelte/lib/User';
	import { writable } from 'svelte/store';
  
	const navItems = [
	  { icon: House, value: 'home' },
	  { icon: GameController, value: 'games' },
	  { icon: Users, value: 'friends' },
	  { icon: User, value: 'account' }
	] as const;
  
	type Page = (typeof navItems)[number]['value'];
  
	const currentPage = writable<Page>('home');
  
	function handleNavigation(value: Page): void {
	  currentPage.set(value);
	}
  </script>
  
  <nav class="fixed bottom-0 left-1/2 w-full max-w-5xl -translate-x-1/2 transform">
	<div class="bg-gray-100 p-3">
	  <div class="flex items-center justify-around">
		{#each navItems as item}
		  {@const Icon = item.icon}
		  <button
			class="group relative flex items-center justify-center rounded-xl p-4 transition-all duration-200 ease-in-out"
			class:active={$currentPage === item.value}
			onclick={() => handleNavigation(item.value)}
			aria-label={item.value}
		  >
			<div class="transform transition-transform group-hover:scale-110">
			  <Icon size={28} weight={$currentPage === item.value ? 'fill' : 'regular'} />
			</div>
		  </button>
		{/each}
	  </div>
	</div>
  </nav>
  
  <style lang="postcss">
	button {
	  color: #718096;
	  padding: 0.75rem;
	}
  
	button:hover {
	  color: #4a5568;
	}
  
	button.active {
	  color: #e53e3e;
	  box-shadow:
		inset 4px 4px 12px #c5c5c5,
		inset -4px -4px 12px #ffffff;
	}
  
	@media (min-width: 1024px) {
	  button {
		padding: 1rem;
	  }
	}
  </style>