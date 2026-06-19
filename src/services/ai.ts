interface UserProfile {
  allergens: string[];
  dietary_flags: string[];
}

interface MenuItemResult {
  item: string;
  description?: string;
  status: 'red' | 'orange' | 'green' | 'asterisk';
  confidence: number;
  reasoning: string;
  inference_used: boolean;
  allergens_found: string[];
}

const SYSTEM_PROMPT = `You are a precise food safety analyzer for people with dietary restrictions and allergies.

You will receive:
1. Raw text extracted from a restaurant menu (may have OCR artifacts/garbled text)
2. A user's dietary profile with allergens and lifestyle flags

Your task: For each distinct menu item found, classify its safety for this specific user.

## Classification Rules

**RED** (status: "red"): Item definitively contains one or more of the user's allergens.
  - Example: User has dairy allergy, item description says "cream sauce" or "parmesan"

**ORANGE** (status: "orange"): Allergen presence is uncertain or inferred.
  - Use when: cross-contamination risk exists, allergen is implied but not stated, or you're inferring from the dish type
  - Example: "Fried chicken" when user has wheat allergy (likely breaded, but not stated)

**GREEN** (status: "green"): Item appears safe based on available information.
  - Only use green when you have reasonable confidence the item doesn't contain the user's allergens
  - When in doubt, use orange not green

**ASTERISK** (status: "asterisk"): Item is typically unsafe but this instance is safe, OR typically safe but this instance is unsafe.
  - Example: "Caesar salad (vegan, no anchovies)" for a fish-allergic user — normally would be orange/red, but stated as fish-free
  - Example: "Fruit bowl (may contain nuts)" for a nut-allergic user — normally green, but this instance has a cross-contamination warning

## Confidence Scoring

Return a confidence value from 0.0 to 1.0:
- 0.9–1.0: Allergen explicitly listed in item description
- 0.7–0.89: Strong inference from dish type (e.g., carbonara → dairy)
- 0.5–0.69: Moderate inference (e.g., "stir fry" → possibly soy)
- 0.3–0.49: Weak inference, many possible interpretations
- Set inference_used: true whenever confidence < 0.9

## Output Format

Return ONLY a valid JSON object. No markdown, no preamble, no explanation outside the JSON.

{
  "items": [
    {
      "item": "Name of the menu item",
      "description": "Brief description if available from menu",
      "status": "red" | "orange" | "green" | "asterisk",
      "confidence": 0.85,
      "reasoning": "One sentence explaining the classification",
      "inference_used": false,
      "allergens_found": ["dairy", "wheat"]
    }
  ],
  "scan_quality": "good" | "partial" | "poor",
  "scan_notes": "Any notes about text quality or incomplete extraction"
}

## Important Notes

- If OCR text is garbled, do your best to identify menu items from context
- Ignore prices, category headers, and restaurant descriptions
- For dietary flags (vegan, halal, kosher): treat them with the same rigor as allergens
- Do NOT hallucinate menu items not present in the text
- Always include reasoning so users can make informed decisions`;

export async function analyzeMenuWithAI(
  menuText: string,
  userProfile: UserProfile
): Promise<{ items: MenuItemResult[]; scan_quality: string; scan_notes: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const userMessage = `
## User Dietary Profile
Allergens: ${userProfile.allergens.length > 0 ? userProfile.allergens.join(', ') : 'None specified'}
Dietary Flags: ${userProfile.dietary_flags.length > 0 ? userProfile.dietary_flags.join(', ') : 'None specified'}

## Extracted Menu Text
\`\`\`
${menuText}
\`\`\`

Analyze this menu for the user's dietary needs and return the JSON response.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text;

  if (!rawText) throw new Error('Empty response from Claude');

  return parseAIResponse(rawText);
}

function parseAIResponse(rawText: string): {
  items: MenuItemResult[];
  scan_quality: string;
  scan_notes: string;
} {
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.items)) {
      throw new Error('Response missing items array');
    }

    parsed.items = parsed.items.filter((item: any) => {
      return (
        typeof item.item === 'string' &&
        ['red', 'orange', 'green', 'asterisk'].includes(item.status) &&
        typeof item.confidence === 'number'
      );
    });

    return {
      items: parsed.items,
      scan_quality: parsed.scan_quality || 'unknown',
      scan_notes: parsed.scan_notes || '',
    };

  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw response:', rawText);

    return {
      items: [],
      scan_quality: 'poor',
      scan_notes: 'Analysis failed — please try again with a clearer photo',
    };
  }
}