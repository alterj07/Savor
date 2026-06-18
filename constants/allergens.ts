import { AllergenType, DietaryFlag } from '../types';

export const ALLERGENS: { id: AllergenType; label: string; emoji: string }[] = [
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { id: 'tree_nuts', label: 'Tree Nuts', emoji: '🌰' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'wheat', label: 'Wheat / Gluten', emoji: '🌾' },
  { id: 'soy', label: 'Soy', emoji: '🫘' },
  { id: 'sesame', label: 'Sesame', emoji: '⚪' },
];

export const DIETARY_FLAGS: { id: DietaryFlag; label: string; emoji: string }[] = [
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'halal', label: 'Halal', emoji: '☪️' },
  { id: 'kosher', label: 'Kosher', emoji: '✡️' },
  { id: 'lactose_intolerant', label: 'Lactose Intolerant', emoji: '🚫🥛' },
  { id: 'gluten_free', label: 'Gluten Free', emoji: '🚫🌾' },
];