<script lang="ts">
    import { user } from '$lib/stores/user';
    import { Ranking, Trophy } from 'phosphor-svelte';
  
    $: level = Math.floor($user.experience / 100) + 1;
    $: nextLevelXP = level * 100;
    $: progress = ($user.experience % 100) / 100;
  </script>
  
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex items-center space-x-4">
      <img src={$user.avatar} alt="User avatar" class="w-16 h-16 rounded-full" />
      <div>
        <h2 class="text-xl font-bold">{$user.username}</h2>
        <p class="text-gray-600">Level {level}</p>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">XP: {$user.experience}/{nextLevelXP}</span>
        <span class="text-sm font-medium text-gray-700">{Math.round(progress * 100)}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" style="width: {progress * 100}%"></div>
      </div>
    </div>
    <div class="mt-4 flex justify-between">
      <div class="flex items-center space-x-2">
        <Ranking size={20} weight="fill" class="text-yellow-500" />
        <span class="font-medium">{$user.level}</span>
      </div>
      <div class="flex items-center space-x-2">
        <Trophy size={20} weight="fill" class="text-yellow-500" />
        <span class="font-medium">{$user.achievements}</span>
      </div>
    </div>
  </div>
  
  