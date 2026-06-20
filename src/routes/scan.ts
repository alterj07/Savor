import { Router, Request, Response } from 'express';
import { extractTextFromImage } from '../services/ocr';
import { analyzeMenuWithAI } from '../services/ai';

const router = Router();

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, userProfile } = req.body;

    if (!imageBase64 || !userProfile) {
      return res.status(400).json({ error: 'Missing imageBase64 or userProfile' });
    }

    // Step 1: OCR
    const menuText = await extractTextFromImage(imageBase64);

    if (!menuText || menuText.trim().length < 10) {
      return res.status(422).json({
        error: 'Could not extract text from image',
        details: 'Image may be blurry or not contain menu text'
      });
    }

    // Step 2: AI Analysis
    const results = await analyzeMenuWithAI(menuText, userProfile);

    return res.json({ success: true, results, rawText: menuText });

  } catch (error) {
    console.error('Scan analysis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;