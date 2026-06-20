export async function extractTextFromImage(base64Image: string): Promise<string> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;

  if (!apiKey) throw new Error('GOOGLE_VISION_API_KEY not set');

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();

  const fullText = data.responses?.[0]?.fullTextAnnotation?.text;

  return fullText || '';
}