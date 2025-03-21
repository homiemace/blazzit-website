<script lang="ts">
  import Trophy from 'phosphor-svelte/lib/Trophy'; // Recommended for faster compilation
  import Crown from 'phosphor-svelte/lib/Crown'; // Recommended for faster compilation
  import Medal from 'phosphor-svelte/lib/Medal'; // Recommended for faster compilation
  import ArrowsDownUp from 'phosphor-svelte/lib/ArrowsDownUp'; // Recommended for faster compilation
  import { slide } from 'svelte/transition';

  interface LeaderboardUser {
    id: number;
    username: string;
    score: number;
    avatar: string;
  }

  // Use $state for reactive state
  let leaderboardUsers = $state<LeaderboardUser[]>([
    { id: 1, username: "AlphaGamer", score: 1500, avatar: "https://i.pravatar.cc/40?img=1" },
    { id: 2, username: "BetaMaster", score: 1350, avatar: "https://i.pravatar.cc/40?img=2" },
    { id: 3, username: "GammaQueen", score: 1200, avatar: "https://i.pravatar.cc/40?img=3" },
    { id: 4, username: "DeltaKing", score: 1100, avatar: "https://i.pravatar.cc/40?img=4" },
    { id: 5, username: "EpsilonPro", score: 1000, avatar: "https://i.pravatar.cc/40?img=5" },
  ]);

  let expanded = $state(false);
  let sortOrder = $state<'asc' | 'desc'>('desc');

  // Toggle expanded state to show more or fewer users
  function toggleExpand(): void {
    expanded = !expanded;
  }

  // Toggle sorting order between ascending and descending
  function toggleSort(): void {
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    leaderboardUsers = leaderboardUsers.sort((a, b) => 
      sortOrder === 'desc' ? b.score - a.score : a.score - b.score
    );
  }

  // Get the appropriate rank icon based on the user's rank
  function getRankIcon(rank: number): typeof Trophy | typeof Crown | typeof Medal {
    switch (rank) {
      case 1: return Crown;
      case 2: case 3: return Medal;
      default: return Trophy;
    }
  }
</script>

<div class="bg-white rounded-xl p-6 shadow-sm">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold flex items-center">
      <Trophy size={24} weight="fill" class="text-yellow-500 mr-2" />
      Leaderboard
    </h2>
    <button 
      onclick={toggleSort}
      class="text-gray-500 hover:text-gray-700 transition-colors"
      aria-label={sortOrder === 'desc' ? "Sort ascending" : "Sort descending"}
    >
      <ArrowsDownUp size={20} />
    </button>
  </div>

  <ul class="space-y-3">
    {#each leaderboardUsers.slice(0, expanded ? undefined : 3) as user, index (user.id)}
      <!-- Move {@const} inside the {#each} block -->
      {@const Icon = getRankIcon(index + 1)}
      <li transition:slide class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div class="flex items-center space-x-3">
          <span class="font-bold text-gray-600 w-6">{index + 1}.</span>
          <img src={user.avatar} alt={user.username} class="w-8 h-8 rounded-full" />
          <span>{user.username}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="font-medium">{user.score} XP</span>
          <!-- Use the Icon component directly -->
          <Icon size={20} weight="fill" class="text-yellow-500" />
        </div>
      </li>
    {/each}
  </ul>

  {#if leaderboardUsers.length > 3}
    <button 
      onclick={toggleExpand}
      class="mt-4 text-sm text-blue-500 hover:text-blue-700 transition-colors"
      aria-label={expanded ? 'Show fewer users' : 'Show more users'}
    >
      {expanded ? 'Show less' : 'Show more'}
    </button>
  {/if}
</div>