<script lang="ts">
  import { user } from '$lib/stores/user';
  import Ranking from 'phosphor-svelte/lib/Ranking';
  import Trophy from 'phosphor-svelte/lib/Trophy';

  interface User {
    avatar?: string;
    username: string;
    experience: number;
    achievements: number;
  }

  let userData = $state<User>({
    username: '',
    experience: 0,
    achievements: 0
  });

  $effect(() => {
    userData = $user;
  });

  let level = $derived(Math.floor(userData.experience / 100) + 1);
  let nextLevelXP = $derived(level * 100);
  let progress = $derived(userData.experience > 0 ? 
    (userData.experience % 100) / 100 : 
    0
  );
</script>

{#if !userData.username}
  <div class="animate-pulse bg-gray-100 rounded-xl p-6">
    <div class="space-y-4">
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
{:else}
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex items-center space-x-4">
      <img 
        src={userData.avatar || '/default-avatar.png'} 
        alt="User avatar" 
        class="w-16 h-16 rounded-full object-cover"
        on:error={(e) => e.target.src = '/default-avatar.png'}
      />
      <div>
        <h2 class="text-xl font-bold">{userData.username}</h2>
        <p class="text-gray-600">Level {level}</p>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">
          XP: {userData.experience}/{nextLevelXP}
        </span>
        <span class="text-sm font-medium text-gray-700">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
          style="width: {progress * 100}%;"
        ></div>
      </div>
    </div>
    <div class="mt-4 flex justify-between">
      <div class="flex items-center space-x-2">
        <Ranking size={20} weight="fill" class="text-yellow-500" />
        <span class="font-medium">{level}</span>
      </div>
      <div class="flex items-center space-x-2">
        <Trophy size={20} weight="fill" class="text-yellow-500" />
        <span class="font-medium">{userData.achievements}</span>
      </div>
    </div>
  </div>
{/if}