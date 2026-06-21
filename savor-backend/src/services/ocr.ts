export async function extractTextFromImage(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Extract all text from this image exactly as it appears, preserving line breaks and reading order. Return ONLY the raw extracted text with no commentary, preamble, or explanation.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Savor] Anthropic API error body:', errorBody);
    throw new Error(`Anthropic API error: ${response.status} — ${errorBody}`);
  }

  interface AnthropicApiResponse {
    content?: Array<{ type: string; text?: string }>;
  }

  const data = (await response.json()) as AnthropicApiResponse;
  const fullText = data.content
    ?.filter((block) => block.type === 'text')
    .map((block) => block.text || '')
    .join('');

  return fullText || '';
}