export interface LevelTier {
  name: string;
  icon: string;
  minXP: number;
  maxXP: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { name: 'Bronze Rookie', icon: '🥉', minXP: 0, maxXP: 499 },
  { name: 'Silver Scholar', icon: '🥈', minXP: 500, maxXP: 999 },
  { name: 'Gold Master', icon: '🥇', minXP: 1000, maxXP: 1999 },
  { name: 'Platinum Legend', icon: '💎', minXP: 2000, maxXP: 4999 },
  { name: 'Diamond Elite', icon: '👑', minXP: 5000, maxXP: Infinity },
];

export function getCurrentTier(xp: number): LevelTier {
  return LEVEL_TIERS.find(t => xp >= t.minXP && xp <= t.maxXP) || LEVEL_TIERS[0];
}

export function getTierIndex(xp: number): number {
  return LEVEL_TIERS.findIndex(t => xp >= t.minXP && xp <= t.maxXP);
}

export function getLevelProgress(xp: number): number {
  const tier = getCurrentTier(xp);
  if (tier.maxXP === Infinity) return 100;
  const range = tier.maxXP - tier.minXP + 1;
  const progress = xp - tier.minXP;
  return Math.min(Math.round((progress / range) * 100), 100);
}

export function getNextTierXP(xp: number): number {
  const tier = getCurrentTier(xp);
  if (tier.maxXP === Infinity) return xp;
  return tier.maxXP + 1;
}
