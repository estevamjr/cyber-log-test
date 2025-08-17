/**
 * Transforma o objeto de abates (kills) em um array de ranking ordenado por frags.
 */
export function calculateRanking(kills) {
  if (!kills || Object.keys(kills).length === 0) {
    return [];
  }

  return Object.entries(kills)
    .map(([player, frags]) => ({ player, frags }))
    .sort((a, b) => b.frags - a.frags);
}