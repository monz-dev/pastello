export const INGREDIENT_TYPE = {
  PAN: 'pan',
  RELLENO: 'relleno',
  COBERTURA: 'cobertura',
} as const;

export type IngredientType = (typeof INGREDIENT_TYPE)[keyof typeof INGREDIENT_TYPE];