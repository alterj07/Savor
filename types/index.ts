export type AllergenType =
  | 'peanuts'
  | 'tree_nuts'
  | 'dairy'
  | 'eggs'
  | 'shellfish'
  | 'fish'
  | 'wheat'
  | 'soy'
  | 'sesame';

export type DietaryFlag =
  | 'vegan'
  | 'vegetarian'
  | 'halal'
  | 'kosher'
  | 'lactose_intolerant'
  | 'gluten_free';

export interface UserProfile {
  id: string;
  allergens: AllergenType[];
  dietary_flags: DietaryFlag[];
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export type RiskStatus = 'red' | 'orange' | 'green' | 'asterisk';

export interface MenuItemResult {
  item: string;
  description?: string;
  status: RiskStatus;
  confidence: number;
  reasoning: string;
  inference_used: boolean;
}

export interface ScanResult {
  id: string;
  restaurant_name?: string;
  scanned_at: string;
  items: MenuItemResult[];
}