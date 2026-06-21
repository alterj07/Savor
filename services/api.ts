import { MenuItemResult, UserProfile } from '../types';
import { supabase } from './supabase';


const API_URL = process.env.EXPO_PUBLIC_API_URL;

import * as FileSystem from 'expo-file-system/legacy';

async function imageUriToBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

export async function saveScanToHistory(
  userId: string,
  restaurantName: string | undefined,
  rawText: string,
  results: MenuItemResult[]
) {
  const { data, error } = await supabase
    .from('scan_history')
    .insert({
      user_id: userId,
      restaurant_name: restaurantName || 'Unknown Restaurant',
      raw_ocr_text: rawText,
      results_json: results,
    })
    .select('id')
    .single();

  if (error) console.error('Failed to save scan:', error);
  return data?.id;
}

export async function analyzeMenu(
  imageUri: string,
  userProfile: UserProfile
) {
  const imageBase64 = await imageUriToBase64(imageUri);

  const response = await fetch(`${API_URL}/api/scan/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64,
      userProfile: {
        allergens: userProfile.allergens,
        dietary_flags: userProfile.dietary_flags,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Analysis failed');
  }

  return response.json();
}