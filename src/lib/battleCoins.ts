export const BET_TIERS = [
  { id: 'beginner', label: 'Beginner Table', bet: 50, minCoins: 50, emoji: '🟢', borderClass: 'border-emerald-500/40', bgClass: 'from-emerald-500/10 to-emerald-900/5' },
  { id: 'classic', label: 'Classic Table', bet: 200, minCoins: 200, emoji: '🔵', borderClass: 'border-blue-500/40', bgClass: 'from-blue-500/10 to-blue-900/5' },
  { id: 'expert', label: 'Expert Table', bet: 500, minCoins: 500, emoji: '🟣', borderClass: 'border-purple-500/40', bgClass: 'from-purple-500/10 to-purple-900/5' },
  { id: 'master', label: 'Master Table', bet: 1500, minCoins: 1500, emoji: '🔴', borderClass: 'border-red-500/40', bgClass: 'from-red-500/10 to-red-900/5' },
];

export function getRank(coins: number) {
  if (coins >= 7000) return { label: 'Master', emoji: '👑' };
  if (coins >= 3000) return { label: 'Expert', emoji: '🥇' };
  if (coins >= 1000) return { label: 'Scholar', emoji: '🥈' };
  return { label: 'Rookie', emoji: '🥉' };
}

export function formatCoins(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}
