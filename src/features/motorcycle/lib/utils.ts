/**
 * Build a display name from brand + model.
 * When brand === model (e.g. "Deco"/"Deco"), show just the brand.
 */
export function getModelDisplayName(brand: string, model: string): string {
  if (brand === model) return brand
  return `${brand} ${model}`
}
