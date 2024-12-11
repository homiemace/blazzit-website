<script lang="ts">
	import { House, GameController, Users, User } from 'phosphor-svelte';
	import { navigation, type Page } from '../stores/navigation';

	const navItems = [
		{ icon: House, label: 'Home', value: 'home' },
		{ icon: GameController, label: 'Games', value: 'games' },
		{ icon: Users, label: 'Friends', value: 'friends' },
		{ icon: User, label: 'Account', value: 'account' }
	] as const;

	function handleNavigation(value: Page) {
		navigation.navigateTo(value);
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
	<div class="mx-auto max-w-4xl px-4 py-2">
		<div class="flex items-center justify-between">
			{#each navItems as item}
				<button
					class="group relative flex flex-col items-center p-2"
					class:text-red-500={$navigation.currentPage === item.value}
					class:text-gray-600={$navigation.currentPage !== item.value}
					on:click={() => handleNavigation(item.value as Page)}
					aria-label={item.label}
				>
					<div class="transform transition-transform group-hover:scale-110">
						<svelte:component
							this={item.icon}
							size={24}
							weight={$navigation.currentPage === item.value ? 'fill' : 'regular'}
						/>
					</div>
					<span class="mt-1 text-xs font-medium">{item.label}</span>
					{#if $navigation.currentPage === item.value}
						<div
							class="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-red-500"
						></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</nav>
