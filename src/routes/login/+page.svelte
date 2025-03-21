<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { fade } from 'svelte/transition';
	import Eye from 'phosphor-svelte/lib/Eye';
	import EyeClosed from 'phosphor-svelte/lib/EyeClosed';

	let email = $state<string>('');
	let password = $state<string>('');
	let error = $state<string>('');
	let success = $state<string>('');
	let loading = $state<boolean>(false);
	let showPassword = $state<boolean>(false);

	async function login(event: Event) {
		event.preventDefault();
		error = '';
		success = '';
		loading = true;
		try {
			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (authError) {
				error = authError.message;
				return;
			}
			success = 'Login successful!';
		} catch {
			error = 'An unexpected error occurred.';
		} finally {
			loading = false;
		}
	}

	async function signInWithGoogle() {
		try {
			const { error: authError } = await supabase.auth.signInWithOAuth({
				provider: 'google'
			});
			if (authError) {
				error = authError.message;
			}
		} catch {
			error = 'An unexpected error occurred during Google login.';
		}
	}

	async function signInWithApple() {
		try {
			const { error: authError } = await supabase.auth.signInWithOAuth({
				provider: 'apple'
			});
			if (authError) {
				error = authError.message;
			}
		} catch {
			error = 'An unexpected error occurred during Apple login.';
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50"
>
	<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
		<div class="text-center">
			<h2 class="text-3xl font-extrabold text-gray-900">Welcome back!</h2>
			<p class="mt-2 text-sm text-gray-600">Log in to continue your journey.</p>
		</div>
		<form class="mt-8 space-y-6" onsubmit={login}>
			<div class="space-y-4">
				<!-- Email Field -->
				<div>
					<label for="email" class="sr-only">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						class="neomorphic-input w-full rounded-lg px-4 py-2 transition-all focus:outline-none"
						placeholder="Email address"
						bind:value={email}
					/>
				</div>
				<!-- Password Field -->
				<div class="relative">
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						required
						class="neomorphic-input w-full rounded-lg px-4 py-2 pr-10 transition-all focus:outline-none"
						placeholder="Password"
						bind:value={password}
					/>
					<button
						type="button"
						class="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeClosed class="h-5 w-5" />
						{:else}
							<Eye class="h-5 w-5" />
						{/if}
					</button>
				</div>
			</div>
			{#if error}
				<div transition:fade class="mt-2 animate-pulse text-sm text-red-500">{error}</div>
			{/if}
			{#if success}
				<div transition:fade class="mt-2 animate-bounce text-sm text-green-500">{success}</div>
			{/if}
			<div>
				<button
					type="submit"
					class="neomorphic-button flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-all duration-300 hover:bg-blue-600 focus:outline-none"
					disabled={loading}
				>
					{loading ? 'Logging in...' : 'Log in'}
				</button>
			</div>
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-2 text-gray-500">Or continue with</span>
				</div>
			</div>
			<div class="flex space-x-4">
				<button
					type="button"
					onclick={signInWithGoogle}
					class="neomorphic-button flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 transition-all duration-300 hover:bg-gray-50 focus:outline-none"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 256 262"
						xmlns="http://www.w3.org/2000/svg"
						preserveAspectRatio="xMidYMid"
					>
						<path
							d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
							fill="#4285F4"
						/>
						<path
							d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
							fill="#34A853"
						/>
						<path
							d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
							fill="#FBBC05"
						/>
						<path
							d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
							fill="#EB4335"
						/>
					</svg>
					<span class="ml-2">Google</span>
				</button>
				<button
					type="button"
					onclick={signInWithApple}
					class="neomorphic-button flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 transition-all duration-300 hover:bg-gray-50 focus:outline-none"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 814 1000"
						xmlns="http://www.w3.org/2000/svg"
						xml:space="preserve"
					>
						<path
							fill="#000"
							d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
						/>
					</svg>
					<span class="ml-2">Apple</span>
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.neomorphic-input {
		background: #ffffff;
		border: none;
		border-radius: 12px;
		box-shadow:
			8px 8px 16px #d1d1d1,
			-8px -8px 16px #ffffff;
		transition: all 0.3s ease;
	}

	.neomorphic-input:focus {
		box-shadow:
			inset 8px 8px 16px #d1d1d1,
			inset -8px -8px 16px #ffffff;
		transform: translateY(2px);
		outline: none;
	}

	.neomorphic-button {
		background: #ffffff;
		border: none;
		border-radius: 12px;
		box-shadow:
			8px 8px 16px #d1d1d1,
			-8px -8px 16px #ffffff;
		transition: all 0.3s ease;
	}

	.neomorphic-button:hover {
		background: #f9fafb;
		box-shadow:
			4px 4px 8px #d1d1d1,
			-4px -4px 8px #ffffff;
	}

	.neomorphic-button:active {
		background: #f3f4f6;
		box-shadow:
			inset 8px 8px 16px #d1d1d1,
			inset -8px -8px 16px #ffffff;
		transform: translateY(2px);
	}

	.neomorphic-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
