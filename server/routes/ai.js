const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Initialize Gemini Client
// In a real hackathon, they'd provide process.env.GEMINI_API_KEY
// The SDK automatically picks up GEMINI_API_KEY from the environment
const ai = new GoogleGenAI({});

router.post('/scan', upload.single('image'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    // If the API key is not set, we use a smart fallback mock
    // This allows the app to run without errors for demonstration
    if (!process.env.GEMINI_API_KEY) {
      console.log('[AI Service] No GEMINI_API_KEY found. Using mock response for demonstration.');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.json({
        success: true,
        data: {
          title: "Scanned Field Report (Mock Gemini Output)",
          description: "This is a simulated AI extraction because the GEMINI_API_KEY is not set. The system detected signs of water shortage and health concerns in the uploaded image.",
          problem_type: "water",
          severity: 5,
          confidence: 0.92
        }
      });
    }

    // --- Real Google Gemini Integration ---
    console.log('[AI Service] Calling Google Gemini API...');
    
    // Read the image file to base64
    const imageData = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype || 'image/jpeg';
    
    const prompt = `
      You are an expert crisis response data extractor. Analyze this image of a field report or survey.
      Extract the core problem and output ONLY a JSON object with these exact keys:
      - title (string: a short 3-5 word summary)
      - description (string: the raw extracted text or a detailed summary)
      - problem_type (string: strictly one of "water", "education", "health", "food", or "shelter")
      - severity (number: 1 to 5, where 5 is life-threatening/urgent)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: imageData.toString('base64'), mimeType } }
          ]
        }
      ]
    });

    const responseText = response.text;
    
    // Try to parse the JSON output from Gemini
    // We strip out markdown code blocks if Gemini added them
    let jsonStr = responseText;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    
    const extractedData = JSON.parse(jsonStr);

    // Clean up
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: extractedData
    });

  } catch (err) {
    console.error('[AI Error]', err);
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err); // Pass to global error handler
  }
});

module.exports = router;
