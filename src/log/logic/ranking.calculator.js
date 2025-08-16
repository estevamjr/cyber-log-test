/**
 * Transforma o objeto de abates (kills) em um array de ranking ordenado por frags.
 * Esta é uma função pura, o que significa que para a mesma entrada, ela sempre
 * produzirá a mesma saída, sem efeitos colaterais.
 *
 * @param {object} kills - Um objeto no formato { 'Player1': 10, 'Player2': 5 }.
 * @returns {Array<{player: string, frags: number}>} Um array ordenado, ex: [{player: 'Player1', frags: 10}, ...].
 */
export function calculateRanking(kills) {
  if (!kills || Object.keys(kills).length === 0) {
    return [];
  }

  return Object.entries(kills)
    .map(([player, frags]) => ({ player, frags }))
    .sort((a, b) => b.frags - a.frags);
}