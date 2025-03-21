<script lang="ts">
	// Example data for games, leaderboards, and achievements
	let games = [
		{
			id: 1,
			title: 'Space Invaders',
			description: 'Defend Earth from alien invaders!',
			image: 'https://via.placeholder.com/300x200?text=Space+Invaders',
			link: '/play/space-invaders'
		},
		{
			id: 2,
			title: 'Quiz Quest',
			description: 'Test your knowledge in this trivia challenge.',
			image: 'https://via.placeholder.com/300x200?text=Quiz+Quest',
			link: '/play/quiz-quest'
		},
		{
			id: 3,
			title: 'Pixel Runner',
			description: 'Run, jump, and collect coins in this retro-style game.',
			image: 'https://via.placeholder.com/300x200?text=Pixel+Runner',
			link: '/play/pixel-runner'
		}
	];

	let leaderboard = [
		{ rank: 1, username: 'GamerPro', score: 5000 },
		{ rank: 2, username: 'PixelMaster', score: 4800 },
		{ rank: 3, username: 'QuizKing', score: 4500 }
	];

	let achievements = [
		{ id: 1, title: 'First Win', description: 'Win your first game.', earned: true },
		{ id: 2, title: 'Top 10', description: 'Reach the top 10 leaderboard.', earned: false },
		{ id: 3, title: 'Daily Streak', description: 'Play 7 days in a row.', earned: true }
	];
</script>

<div class="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
	<div class="container mx-auto space-y-8 p-8">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-4xl font-extrabold text-gray-900">🎮 Games Hub</h1>
			<p class="mt-2 text-sm text-gray-600">
				Challenge yourself, earn rewards, and climb the leaderboard!
			</p>
		</div>

		<!-- Game Cards -->
		<section class="space-y-6">
			<h2 class="text-2xl font-bold text-gray-800">Available Games</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each games as game}
					<div
						class="neomorphic-card shadow-neo overflow-hidden rounded-lg transition-all hover:scale-105"
					>
						<img src={game.image} alt={game.title} class="h-48 w-full object-cover" />
						<div class="p-4">
							<h3 class="text-xl font-bold text-gray-900">{game.title}</h3>
							<p class="mt-2 text-sm text-gray-600">{game.description}</p>
							<a
								href={game.link}
								class="mt-4 inline-block rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600"
							>
								Play Now
							</a>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Leaderboard -->
		<section class="space-y-6">
			<h2 class="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
			<div class="neomorphic-card shadow-neo rounded-lg p-6">
				<table class="w-full text-left">
					<thead>
						<tr>
							<th class="text-sm font-bold text-gray-700">Rank</th>
							<th class="text-sm font-bold text-gray-700">Username</th>
							<th class="text-sm font-bold text-gray-700">Score</th>
						</tr>
					</thead>
					<tbody>
						{#each leaderboard as player}
							<tr class="border-t border-gray-200">
								<td class="py-2 text-sm text-gray-600">{player.rank}</td>
								<td class="py-2 text-sm text-gray-800">{player.username}</td>
								<td class="py-2 text-sm text-gray-600">{player.score}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<!-- Achievements -->
		<section class="space-y-6">
			<h2 class="text-2xl font-bold text-gray-800">🎯 Achievements</h2>
			<div class="neomorphic-card shadow-neo rounded-lg p-6">
				<ul class="space-y-4">
					{#each achievements as achievement}
						<li class="flex items-center justify-between">
							<div>
								<h3 class="text-lg font-bold text-gray-900">{achievement.title}</h3>
								<p class="text-sm text-gray-600">{achievement.description}</p>
							</div>
							<span
								class={`rounded-full px-3 py-1 text-xs ${
									achievement.earned ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
								}`}
							>
								{achievement.earned ? 'Earned' : 'Locked'}
							</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	</div>

	<!-- Bottom Navigation Bar -->
	<nav class="shadow-neo fixed bottom-0 left-0 z-50 w-full bg-white">
		<div class="flex items-center justify-around py-2">
			<button
				class="flex flex-col items-center text-gray-600 transition-colors hover:text-blue-500"
				on:click={() => alert('Navigate to Home')}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0l-2-2m2 2V4a1 1 0 011-1h3m-6 0l2 2m-2-2v7a1 1 0 001 1h3m-6 0l2 2m-2-2v-7a1 1 0 00-1-1h-3z"
					/>
				</svg>
				<span class="text-xs">Home</span>
			</button>
			<button
				class="flex flex-col items-center text-gray-600 transition-colors hover:text-blue-500"
				on:click={() => alert('Navigate to Games')}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="text-xs">Games</span>
			</button>
			<button
				class="flex flex-col items-center text-gray-600 transition-colors hover:text-blue-500"
				on:click={() => alert('Navigate to Profile')}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
				<span class="text-xs">Profile</span>
			</button>
		</div>
	</nav>
</div>

<style>
	/* Neomorphic Shadow */
	.shadow-neo {
		box-shadow:
			8px 8px 16px #d1d1d1,
			-8px -8px 16px #ffffff;
	}

	/* Neomorphic Card */
	.neomorphic-card {
		background: #ffffff;
		border-radius: 12px;
		transition: all 0.3s ease;
	}

	.neomorphic-card:hover {
		box-shadow:
			4px 4px 8px #d1d1d1,
			-4px -4px 8px #ffffff;
		transform: translateY(-2px);
	}

	/* Table Styling */
	table {
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.75rem;
	}

	th {
		font-weight: bold;
		color: #4f46e5; /* Neon Blue */
	}

	tr:nth-child(even) {
		background-color: #f9fafb;
	}
</style>
