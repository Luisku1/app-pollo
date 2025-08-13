/**
 * Calcula el monto total según si el producto es por piezas o por peso.
 * @param {number} price - Precio unitario
 * @param {boolean} byPieces - Si el producto se vende por piezas
 * @param {number} weight - Peso en kg
 * @param {number} pieces - Número de piezas
 * @returns {number} - Monto total
 */
export function calculateAmount(price, byPieces, weight, pieces) {
  if (!price || isNaN(price)) return 0;
  const unit = byPieces ? pieces : weight;
  if (!unit || isNaN(unit)) return 0;
  return price * unit;
}