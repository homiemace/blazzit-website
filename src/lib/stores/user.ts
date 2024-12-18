import { writable } from 'svelte/store';

const initialUser = {
  username: 'JohnDoe',
  avatar: 'https://i.pravatar.cc/150?img=3',
  experience: 0,
  level: 1,
  achievements: 0
};

function createUserStore() {
  const { subscribe, update } = writable(initialUser);

  return {
    subscribe,
    addExperience: (xp: number) => {
      update(u => {
        const newXP = u.experience + xp;
        const newLevel = Math.floor(newXP / 100) + 1;
        return {
          ...u,
          experience: newXP,
          level: newLevel
        };
      });
    },
    addAchievement: () => {
      update(u => ({ ...u, achievements: u.achievements + 1 }));
    }
  };
}

export const user = createUserStore();